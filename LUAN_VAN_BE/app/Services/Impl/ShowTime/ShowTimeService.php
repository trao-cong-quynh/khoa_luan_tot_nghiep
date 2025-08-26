<?php

namespace App\Services\Impl\ShowTime;

use App\Constants\BookingStatus;
use App\Constants\ShowTimeStatus;
use App\Http\Requests\ShowTimeRequest;
use App\Http\Requests\updateShowTimeRequest;
use App\Http\Resources\ShowtimeResource;
use App\Models\Bookings;
use App\Models\Cinemas;
use App\Models\Movies;
use App\Models\MovieSchedules;
use App\Models\ShowTimes;
use App\Models\TheaterRooms;
use App\Services\Interfaces\ShowTime\ShowTimeServiceInterface;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Auth\AuthenticationException;
use InvalidArgumentException;
use Log;

class ShowTimeService implements ShowTimeServiceInterface
{

    public function reactivateShowtime(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $showtime = ShowTimes::find($id);

                if (!$showtime) {

                    throw new Exception('Suất chiếu không tồn tại trong hệ thống.');
                }

                if ($showtime->status !== ShowTimeStatus::CANCELLED->value) {
                    throw new Exception('Suất chiếu không ở trạng thái hủy.');
                }

                if ($showtime->start_time->isPast()) {
                    throw new Exception('Suất chiếu đã quá thời gian, không thể kích hoạt lại.');
                }

                $showtime->load([
                    'movies' => function ($query) {
                        $query->withTrashed();
                    },
                    'theater_rooms' => function ($query) {
                        $query->withTrashed()->with([
                            'cinemas' => function ($q) {
                                $q->withTrashed();
                            }
                        ]);
                    }
                ]);

                if ($showtime->movies && $showtime->movies->deleted_at !== null) {
                    throw new \Exception('Phim của suất chiếu đã bị xóa mềm. Không thể kích hoạt lại.');
                }

                if (!$showtime->theater_rooms) {
                    throw new \Exception('Không tìm thấy phòng chiếu cho suất chiếu này. Không thể kích hoạt lại.');
                }
                if ($showtime->theater_rooms->deleted_at !== null) {
                    throw new \Exception('Phòng chiếu của suất chiếu đã bị xóa mềm. Không thể kích hoạt lại.');
                }
                if ($showtime->theater_rooms->cinemas && $showtime->theater_rooms->cinemas->deleted_at !== null) {
                    throw new \Exception('Rạp chiếu phim của suất chiếu đã bị xóa mềm. Không thể kích hoạt lại.');
                }


                $hasConflict = ShowTimes::where('room_id', $showtime->room_id)
                    ->whereIn('status', [ShowTimeStatus::UPCOMING->value, ShowTimeStatus::NOW_SHOWING])
                    ->where('showtime_id', '!=', $showtime->showtime_id)
                    ->where(function ($query) use ($showtime) {
                        $query->whereBetween('start_time', [$showtime->start_time, $showtime->end_time])
                            ->orWhereBetween('end_time', [$showtime->start_time, $showtime->end_time]) // SỬA Ở ĐÂY
                            ->orWhere(function ($q) use ($showtime) {
                                $q->where('start_time', '<=', $showtime->start_time)
                                    ->where('end_time', '>=', $showtime->end_time);
                            });
                    })->exists();

                if ($hasConflict) {
                    throw new \Exception('Suất chiếu bị trùng lịch với suất chiếu khác trong phòng này. Không thể kích hoạt suất chiếu.');
                }

                $showtime->status = ShowTimeStatus::UPCOMING->value;
                $showtime->save();

                Log::info("Showtime ID: {$showtime->showtime_id} successfully reactivated to 'upcoming'.");
                return $showtime;
            });

        } catch (\Throwable $e) {
            Log::error("Failed to reactivate showtime ID: {$id}. Error: {$e->getMessage()}", [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getFilteredShowtimes(array $filters)
    {

        $query = ShowTimes::with([
            'movies',
            'theater_rooms' => function ($q) {
                $q->withTrashed();
            },
            'theater_rooms.cinemas' => function ($q) {
                $q->withTrashed();
            },
        ]);
        $now = Carbon::now();

        if (!empty($filters['cinema_id'])) {
            $query->whereHas('theater_rooms.cinemas', function ($q) use ($filters) {
                $q->withTrashed()->where('cinema_id', $filters['cinema_id']);
            });
        } else {
            throw new InvalidArgumentException('Thiếu thông tin rạp chiếu.');
        }
        if (!empty($filters['room_id'])) {
            $query->where('room_id', $filters['room_id']);
        } else {
            throw new InvalidArgumentException('Thiếu thông tin phòng chiếu.');
        }

        if (!empty($filters['date'])) {
            $date = Carbon::parse($filters['date'])->startOfDay();
            $query->where(function ($q) use ($date) {
                $q->whereDate('start_time', $date)
                    ->orWhereDate('end_time', $date);
            });
        } else {
            throw new InvalidArgumentException('Thiếu thông tin ngày chiếu.');
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            switch ($filters['status']) {
                case 'past':
                    $query->where('end_time', '<', $now)
                        ->whereIn('status', [ShowTimeStatus::FINISHED->value]);
                    break;
                case 'currently_showing':
                    $query->where('start_time', '<=', $now)
                        ->where('end_time', '>=', $now)
                        ->where('status', ShowTimeStatus::NOW_SHOWING->value);
                    break;
                case 'upcoming':
                    $query->where('start_time', '>', $now)
                        ->where('status', ShowTimeStatus::UPCOMING->value);
                    break;
                case 'cancelled':
                    $query->where('status', ShowTimeStatus::CANCELLED->value);
                    break;
                default:
                    break;


            }
        } else {

        }

        $query->orderBy('start_time', 'asc');
        $showtimes = $query->get();


        return ShowtimeResource::collection($showtimes);
    }

    public function getShowTime(string $id)
    {
        $showtime = ShowTimes::with([
            'movies' => function ($query) {
                $query->withTrashed();
            },
            'movies.genres',
            'movies.screening_types'
        ])->find($id);

        if (!$showtime) {
            throw new AuthenticationException('Không tìm thấy suất chiếu');
        }


        return [
            'showtime_id' => $showtime->showtime_id,
            'movie_id' => $showtime->movie_id,
            'room_id' => $showtime->room_id,
            'start_time' => $showtime->start_time->format('Y-m-d H:i'),
            'end_time' => $showtime->end_time->format('Y-m-d H:i'),
            'status' => $showtime->status,
            'movie' => [
                'movie_id' => $showtime->movies->movie_id,
                'movie_name' => $showtime->movies->movie_name,
                'description' => $showtime->movies->description,
                'duration' => $showtime->movies->duration,
                'release_date' => $showtime->movies->release_date,
                'poster_url' => $showtime->movies->poster_url,
                'director' => $showtime->movies->derector,
                'actor' => $showtime->movies->actor,
                'age_rating' => $showtime->movies->age_rating,
                'country' => $showtime->movies->country,
                'genres' => $showtime->movies->genres->pluck('genre_name'),
                'screening_types' => $showtime->movies->screening_types->pluck('screening_type_name'),
            ]
        ];
    }

    public function insert(ShowTimeRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {


                $movie = Movies::withTrashed()->find($request->movie_id);
                if (!$movie && $movie->deleted_at !== null) {
                    throw new \Exception('Phim của suất chiếu không tồn tại hoặc đã bị xóa mềm.');
                }
                $room = TheaterRooms::withTrashed()->find($request->room_id);
                if (!$room || $room->deleted_at !== null) {
                    throw new \Exception('Phòng chiếu không tồn tại hoặc đã bị xóa mềm.');
                }
                $cinema = $room->cinemas;

                if ($cinema && $cinema->deleted_at !== null) {
                    throw new \Exception('Rạp chiếu phim của phòng này không tồn tại hoặc đã bị xóa mềm.');
                }

                $showtimeStartDate = Carbon::parse($request->start_time)->toDateString();
                $isAvailable = MovieSchedules::where('movie_id', $movie->movie_id)
                    ->where('cinema_id', $cinema->cinema_id)
                    ->where('start_date', '<=', $showtimeStartDate)
                    ->where('end_date', '>=', $showtimeStartDate)->exists();

                if (!$isAvailable) {
                    throw new \Exception('Phim này không được phép chiếu tại rạp ' . $cinema->cinema_name . ' vào ngày ' . $showtimeStartDate . '.');
                }

                $hasConflict = ShowTimes::where('room_id', $request->room_id)
                    ->whereIn('status', [ShowTimeStatus::UPCOMING->value, ShowTimeStatus::NOW_SHOWING->value])
                    ->where(function ($query) use ($request) {
                        $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                            ->orWhereBetween('end_time', [$request->start_time, $request->end_time]) // SỬA Ở ĐÂY
                            ->orWhere(function ($q) use ($request) {
                                $q->where('start_time', '<=', $request->start_time)
                                    ->where('end_time', '>=', $request->end_time);
                            });
                    })->exists();

                if ($hasConflict) {
                    throw new \Exception('Suất chiếu bị trùng lịch với suất chiếu khác trong phòng này. Không thể tạo.');
                }
                $showtimedata = [
                    'movie_id' => $request->movie_id,
                    'room_id' => $request->room_id,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                    'status' => ShowTimeStatus::UPCOMING->value
                ];

                $showtime = ShowTimes::create($showtimedata);
                return $showtime;
            });

        } catch (\Throwable $e) {
            Log::error('Tạo suất chiếu thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }

    }

    public function update(UpdateShowTimeRequest $request, string $id)
    {
        try {
            return DB::transaction(function () use ($request, $id) {

                $showtime = ShowTimes::with(['movies', 'theater_rooms.cinemas'])->find($id);

                if (!$showtime) {
                    throw new AuthenticationException('Không tìm thấy suất chiếu');
                }

                $data = $request->validated();
                $currentStatus = ShowTimeStatus::from($showtime->status);
                $newStatus = isset($data['status']) ? ShowTimeStatus::from($data['status']) : $currentStatus;

                if ($currentStatus !== $newStatus) {
                    if (!ShowTimeStatus::canTransition($currentStatus, $newStatus)) {
                        throw new \Exception("Không thể chuyển trạng thái từ {$currentStatus->value} sang {$newStatus->value}");
                    }
                }

                $movieId = $data['movie_id'] ?? $showtime->movie_id;
                $movie = Movies::withTrashed()->find($movieId);
                if (!$movie || $movie->deleted_at !== null) {
                    throw new \Exception('Phim không tồn tại hoặc đã bị xóa mềm.');
                }


                $roomId = $data['room_id'] ?? $showtime->room_id;
                $room = TheaterRooms::withTrashed()->with('cinemas')->find($roomId);
                if (!$room || $room->deleted_at !== null) {
                    throw new \Exception('Phòng chiếu không tồn tại hoặc đã bị xóa mềm.');
                }

                $cinema = $room->cinemas;

                if (!$cinema || $cinema->deleted_at !== null) {
                    throw new \Exception('Rạp chứa phòng chiếu không tồn tại hoặc đã bị xóa mềm.');
                }


                $startTime = $data['start_time'] ?? $showtime->start_time;
                $endTime = $data['end_time'] ?? $showtime->end_time;
                $carbonStartTime = Carbon::parse($startTime);
                $showtimeStartDate = $carbonStartTime->toDateString();

                $isAvailable = MovieSchedules::where('movie_id', $movieId)
                    ->where('cinema_id', $cinema->cinema_id)
                    ->where('start_date', '<=', $showtimeStartDate)
                    ->where('end_date', '>=', $showtimeStartDate)
                    ->exists();
                if (!$isAvailable) {
                    throw new \Exception('Phim này không được phép chiếu tại rạp ' . $cinema->cinema_name . ' vào ngày ' . $showtimeStartDate . ' theo quy tắc phân phối.');

                }

                $hasConflict = ShowTimes::where('room_id', $roomId)
                    ->whereIn('status', [ShowTimeStatus::UPCOMING->value, ShowTimeStatus::NOW_SHOWING->value])
                    ->where('showtime_id', '!=', $showtime->showtime_id)
                    ->where(function ($query) use ($startTime, $endTime) {
                        $query->whereBetween('start_time', [$startTime, $endTime])
                            ->orWhereBetween('end_time', [$startTime, $endTime])
                            ->orWhere(function ($q) use ($startTime, $endTime) {
                                $q->where('start_time', '<=', $startTime)
                                    ->where('end_time', '>=', $endTime);
                            });
                    })->exists();

                if ($hasConflict) {
                    throw new \Exception('Suất chiếu bị trùng giờ với suất khác trong cùng phòng.');
                }


                $showtime->update($data);

                return $showtime;
            });

        } catch (\Throwable $e) {
            Log::error('Sửa suất chiếu thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }

    public function cancelShowtime(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $showtime = ShowTimes::find($id);

                if (!$showtime) {
                    throw new Exception('Suất chiếu không tồn tại');
                }

                if ($showtime->status === ShowTimeStatus::CANCELLED->value) {
                    throw new Exception('Suất chiếu đã bị hủy');
                }

                if ($showtime->status === ShowTimeStatus::FINISHED->value) {
                    throw new Exception('Suất chiếu đã kết thúc , không thể hủy');
                }

                if ($showtime->start_time->isPast()) {
                    throw new Exception('Suất chiếu đã bắt đầu hoặc đã quá thời gian , không thể hủy');
                }

                $currentStatus = ShowTimeStatus::from($showtime->status);
                $newStatus = ShowTimeStatus::CANCELLED;

                if (!ShowTimeStatus::canTransition($currentStatus, $newStatus)) {
                    throw new \Exception("Không thể chuyển trạng thái từ {$currentStatus->value} sang {$newStatus->value}");
                }

                $showtime->status = $newStatus->value;
                $showtime->save();
                Bookings::where('showtime_id', $showtime->showtime_id)
                    ->whereIn('status', [
                        BookingStatus::PENDING->value,
                        BookingStatus::PAID->value,
                        BookingStatus::ACTIVE->value,
                    ])->update(['status' => BookingStatus::CANCELLED->value]);

                // Còn phải xử lý hoàn tiền

                return $showtime;
            });

        } catch (\Throwable $e) {
            Log::error(
                "Hủy suất chiếu thất bại:{$id}. Error: {$e->getMessage()}",
                [
                    'exception' => $e,
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ]
            );
            throw $e;
        }


    }


}
