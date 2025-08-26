<?php

namespace App\Services\Impl\Movie;

use App\Constants\BookingStatus;
use App\Constants\ShowTimeStatus;
use App\Http\Requests\MovieRequest;
use App\Http\Requests\UpdateMovieRequest;
use App\Http\Resources\MovieResource;
use App\Models\BookedTickets;
use App\Models\Bookings;
use App\Models\Movies;
use App\Models\MovieSchedules;
use App\Models\Seats;
use App\Models\ShowTimes;
use App\Models\User;
use App\Services\Interfaces\Movie\MovieServiceInterface;
use Carbon\Carbon;
use DB;
use Illuminate\Database\Eloquent\Builder;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Storage;
use Log;
use Str;
use Throwable;
use function Laravel\Prompts\select;

class MovieService implements MovieServiceInterface
{
    public function getAll()
    {
        $movies = Movies::with(['genres', 'screening_types'])->get();
        if ($movies->isEmpty()) {
            return ['movies' => []];
        }
        $formatData = $movies->map(function ($movie) {
            $movieArray = $movie->toArray();
            $movieArray['genres'] = $movie->genres->map(function ($genre) {
                return [
                    'genre_id' => $genre->genre_id,
                    'genre_name' => $genre->genre_name
                ];
            })->toArray();
            $movieArray['screening_types'] = $movie->screening_types->map(function ($screen_type) {
                return [
                    'screening_type_id ' => $screen_type->screening_type_id,
                    'screening_type_name' => $screen_type->screening_type_name
                ];
            })->toArray();
            if (isset($movieArray['poster_url']) && $movieArray['poster_url']) {
                $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
            }

            $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
            $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;
            return $movieArray;
        });
        return [
            'movies' => $formatData
        ];

    }

    public function getListMovieWithMovieSchedule(array $district)
    {
        $movieIdsInDistrict = MovieSchedules::whereHas('cinema', function ($query) use ($district) {
            $query->whereIn('district_id', $district);
        })
            ->select('movie_id')
            ->distinct()
            ->pluck('movie_id')
            ->toArray();

        $movies = Movies::whereIn('movie_id', $movieIdsInDistrict)->get();
        $formatData = $movies->map(function ($movie) {
            $movieArray = $movie->toArray();
            $movieArray['genres'] = $movie->genres->map(function ($genre) {
                return [
                    'genre_id' => $genre->genre_id,
                    'genre_name' => $genre->genre_name
                ];
            })->toArray();
            $movieArray['screening_types'] = $movie->screening_types->map(function ($screen_type) {
                return [
                    'screening_type_id ' => $screen_type->screening_type_id,
                    'screening_type_name' => $screen_type->screening_type_name
                ];
            })->toArray();
            if (isset($movieArray['poster_url']) && $movieArray['poster_url']) {
                $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
            }

            $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
            $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;

            return $movieArray;
        });
        return $formatData;
    }


    public function getListMovieToCinema(string $id)
    {
        $movieIdsInDistrict = MovieSchedules::where('cinema_id', $id)
            ->select('movie_id')
            ->distinct()
            ->pluck('movie_id')
            ->toArray();

        $movies = Movies::whereIn('movie_id', $movieIdsInDistrict)->get();

        $formatData = $movies->map(function ($movie) {
            $movieArray = $movie->toArray();
            $movieArray['genres'] = $movie->genres->map(function ($genre) {
                return [
                    'genre_id' => $genre->genre_id,
                    'genre_name' => $genre->genre_name
                ];
            })->toArray();
            $movieArray['screening_types'] = $movie->screening_types->map(function ($screen_type) {
                return [
                    'screening_type_id ' => $screen_type->screening_type_id,
                    'screening_type_name' => $screen_type->screening_type_name
                ];
            })->toArray();

            if (isset($movieArray['poster_url']) && $movieArray['poster_url']) {
                $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
            }

            $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
            $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;

            return $movieArray;
        });
        return [
            'movies' => $formatData
        ];
    }

    public function getMovieRetore()
    {
        try {
            $movies = Movies::onlyTrashed()->with(['genres', 'screening_types'])->get();

            if (!$movies) {
                throw new Exception('Hệ thống không có phim nào cả');
            }

            $formatData = $movies->map(function ($movie) {
                $movieArray = $movie->toArray();
                $movieArray['genres'] = $movie->genres->map(function ($genre) {
                    return [
                        'genre_id' => $genre->genre_id,
                        'genre_name' => $genre->genre_name
                    ];
                })->toArray();
                $movieArray['screening_types'] = $movie->screening_types->map(function ($screen_type) {
                    return [
                        'screening_type_id ' => $screen_type->screening_type_id,
                        'screening_type_name' => $screen_type->screening_type_name
                    ];
                })->toArray();
                $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
                $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;


                if (isset($movieArray['poster_url']) && $movieArray['poster_url']) {
                    $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
                }
                return $movieArray;
            });
            return [
                'movies' => $formatData
            ];
        } catch (\Throwable $e) {
            Log::error('Lấy danh sách phim đã xóa mềm thất bại: ' . $e->getMessage(), [
                'exception' => $e,

            ]);
            throw $e;
        }
    }

    public function getMovie(string $id)
    {
        try {
            $movie = Movies::with(['genres', 'screening_types'])->find($id);
            if (!$movie) {
                throw new \Exception('Phim không có trong hệ thống');
            }
            $movieArray = $movie->toArray();
            $movieArray['genres'] = $movie->genres->map(function ($genre) {
                return [
                    'genre_id' => $genre->genre_id,
                    'genre_name' => $genre->genre_name
                ];
            })->toArray();
            $movieArray['screening_types'] = $movie->screening_types->map(function ($screen_type) {
                return [
                    'screening_type_id ' => $screen_type->screening_type_id,
                    'screening_type_name' => $screen_type->screening_type_name
                ];
            })->toArray();
            $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
            $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;


            if (isset($movieArray['poster_url']) && $movieArray['poster_url']) {
                $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
            }
            return [
                'Movie' => $movieArray
            ];

        } catch (\Throwable $e) {
            Log::error('Lấy danh sách phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,

            ]);
            throw $e;
        }
    }



    public function uploadPoster($file)
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
        return $file->storeAs('posters', $fileName, 'public');
    }


    public function insert(MovieRequest $request)
    {

        try {
            return DB::transaction(function () use ($request) {
                $posterPath = null;
                if ($request->hasFile('poster')) {
                    $file = $request->file('poster');
                    $posterPath = $this->uploadPoster($file);
                }

                if ($request->has('trailer_url')) {
                    $trailerURL = $request->trailer_url;
                }
                $movieData = [
                    'movie_name' => $request->movie_name,
                    'description' => $request->description,
                    'duration' => $request->duration,
                    'release_date' => $request->release_date,
                    'poster_url' => $posterPath,
                    'trailer_url' => $request->trailer_url,
                    'derector' => $request->derector,
                    'actor' => $request->actor,
                    'status' => $request->status,
                    'age_rating' => $request->age_rating,
                    'country' => $request->country,
                    'created_at' => now(),
                ];

                $movie = Movies::create($movieData);
                if (!empty($request->genres_ids)) {
                    $movie->genres()->sync($request->genres_ids);
                }
                $movie->load('genres');
                if (!empty($request->screening_type_ids)) {
                    $movie->screening_types()->sync($request->screening_type_ids);
                }
                $movie->load('screening_types');
                $movieArray = $movie->toArray();

                $movieArray['genres'] = $movie->genres->map(function ($genre) {
                    return [
                        'genre_id' => $genre->genre_id,
                        'genre_name' => $genre->genre_name
                    ];
                })->toArray();

                $movieArray['screening_types'] = $movie->screening_types->map(function ($screening_type) {
                    return [
                        'screening_type_id' => $screening_type->screening_type_id,
                        'screening_type_name' => $screening_type->screening_type_name
                    ];
                })->toArray();

                if ($movieArray['poster_url']) {
                    $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
                }
                $trailerId = $this->extractYoutubeVideoId($movie->trailer_url);
                $movieArray['trailer_url'] = $trailerId ? "https://www.youtube.com/embed/{$trailerId}" : null;
                return $movieArray;
            });
        } catch (\Throwable $e) {
            Log::error('Thêm phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }

    public function update(UpdateMovieRequest $request, string $id)
    {

        try {
            return DB::transaction(function () use ($request, $id) {

                $movie = Movies::find($id);

                if (!$movie) {
                    throw new Exception('Phim không có trong hệ thống');
                }
                $posterPath = $movie->poster_url;

                if ($request->hasFile('poster')) {
                    if ($movie->poster_url && Storage::disk('public')->exists($movie->poster_url)) {
                        Storage::disk('public')->delete($movie->poster_url);
                    }
                    $file = $request->file('poster');
                    $posterPath = $this->uploadPoster($file);
                }

                $updateData = $request->validated();
                if ($request->hasFile('poster') || $posterPath !== $movie->poster_url) {
                    $updateData['poster_url'] = $posterPath;

                } else {
                    unset($updateData['poster']);
                    if (!isset($updateData['poster_url'])) {
                        $updateData['poster_url'] = $movie->poster_url;
                    }
                }

                if (isset($updateData['trailer_url'])) {
                    $movie->trailer_url = $updateData['trailer_url'];
                }

                $genreIds = $request->genres_ids;
                unset($updateData['genres_ids']);
                $screeningTypeIds = $request->screening_type_ids;
                unset($updateData['screenin_type_ids']);
                $movie->update($updateData);

                if (isset($genreIds) && is_array($genreIds)) {
                    $movie->genres()->sync($genreIds);
                }

                $movie->load('genres');
                $movieArray = $movie->toArray();
                $movieArray['genres'] = $movie->genres->map(function ($genre) {
                    return [
                        'genre_id' => $genre->genre_id,
                        'genre_name' => $genre->genre_name
                    ];
                })->toArray();

                if (isset($screeningTypeIds) && is_array($screeningTypeIds)) {
                    $movie->screening_types()->sync($screeningTypeIds);
                }

                $movie->load('screening_types');

                $movieArray['screening_types'] = $movie->screening_types->map(function ($screentype) {
                    return [
                        'screening_type_id ' => $screentype->screening_type_id,
                        'screening_type_name' => $screentype->screening_type_name
                    ];
                })->toArray();


                if ($movieArray['poster_url']) {
                    $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
                }

                $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
                $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;


                return $movieArray;
            });
        } catch (\Throwable $e) {
            Log::error('Cập nhật phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }

    }

    public function delete(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $movie = Movies::find($id);
                if (!$movie) {
                    throw new Exception('Phim không có trong hệ thống');
                }
                $movie->delete();

                $currentTime = Carbon::now();
                $upcomingActiveShowTimes = ShowTimes::where('movie_id', $movie->movie_id)
                    ->where('status', ShowTimeStatus::UPCOMING->value)
                    ->where('start_time', '>', $currentTime)
                    ->get();

                foreach ($upcomingActiveShowTimes as $showtime) {
                    $showtime->status = ShowTimeStatus::CANCELLED->value;
                    $showtime->save();

                    $affectedBookings = Bookings::where('showtime_id', $showtime->showtime_id)
                        ->whereIn('status', ['paid', 'pending', 'active'])
                        ->get();

                    foreach ($affectedBookings as $booking) {
                        $booking->status = 'cancelled_by_movie';
                        $booking->save();
                    }
                }
                return true;
            });
        } catch (\Throwable $e) {
            Log::error('Xóa phim thất bại: ' . $e->getMessage(), ['movie_id' => $id, 'ex']);
            throw $e;
        }
    }

    public function restore(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $movie = Movies::withTrashed()->find($id);

                if (!$movie) {
                    throw new Exception('Phim không có trong hệ thống');
                }

                if (!$movie->trashed()) {
                    throw new Exception('Phim này chưa bị xóa mềm');
                }
                $nameConflict = Movies::where('movie_name', $movie->movie_name)
                    ->whereNull('deleted_at')
                    ->exists();

                if ($nameConflict) {
                    throw new Exception('Tên phim "' . $movie->movie_name . '" đã tồn tại. Không thể khôi phục.');
                }

                $movie->restore();

                $movie->load(['genres', 'screening_types']);
                $movieArray = $movie->toArray();

                $movieArray['genres'] = $movie->genres->map(function ($genre) {
                    return [
                        'genre_id' => $genre->genre_id,
                        'genre_name' => $genre->genre_name
                    ];
                })->toArray();

                $movieArray['screening_types'] = $movie->screening_types->map(function ($screentype) {
                    return [
                        'screening_type_id ' => $screentype->screening_type_id,
                        'screening_type_name' => $screentype->screening_type_name
                    ];
                })->toArray();


                if ($movieArray['poster_url']) {
                    $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
                }

                return $movieArray;

            });
        } catch (\Throwable $e) {
            Log::error('Khôi phục phim thất bại: ' . $e->getMessage(), ['movie_id' => $id, 'exception' => $e]);
            throw $e;
        }
    }


    public function getMovieWithCinemasAndShowtimes(string $id)
    {
        try {
            $movie = Movies::find($id);

            if (!$movie) {
                throw new Exception('Phim không có trong hệ thống');
            }

            $bookingCutOffMinutes = config('cinema.showtime_booking_cutoff_minutes');
            $now = now();
            $showtimes = $movie->show_times()->
                where('start_time', '>=', $now)
                ->with('theater_rooms.cinemas')
                ->orderBy('start_time')->get();

            $cinemaWithShowtimes = [];

            foreach ($showtimes as $showtime) {
                if (!$showtime->theater_rooms || !$showtime->theater_rooms->cinemas) {
                    continue;
                }


                $cinema = $showtime->theater_rooms->cinemas;

                $formattedShowtimes = [
                    'show_time_id' => $showtime->showtime_id,
                    'start_time' => $showtime->start_time,
                    'end_time' => $showtime->end_time,

                ];

                if (!isset($cinemaWithShowtimes[$cinema->cinema_id])) {
                    $cinemaWithShowtimes[$cinema->cinema_id] = [
                        'cinema_id' => $cinema->cinema_id,
                        'cinema_name' => $cinema->cinema_name,
                        'address' => $cinema->address,
                        'rooms' => []
                    ];
                }

                if (!isset($cinemaWithShowtimes[$cinema->cinema_id]['rooms'][$showtime->theater_rooms->room_id])) {
                    $cinemaWithShowtimes[$cinema->cinema_id]['rooms'][$showtime->theater_rooms->room_id] = [
                        'room_id' => $showtime->theater_rooms->room_id,
                        'room_name' => $showtime->theater_rooms->room_name,
                        'room_type' => $showtime->theater_rooms->room_type,
                        'total_columns' => $showtime->theater_rooms->total_columns,
                        'total_rows' => $showtime->theater_rooms->total_rows,
                        'showtimes_for_this_movie' => [],
                    ];
                }
                $cinemaWithShowtimes[$cinema->cinema_id]['rooms'][$showtime->theater_rooms->room_id]['showtimes_for_this_movie'][] = $formattedShowtimes;
            }

            $finalCinema = array_values($cinemaWithShowtimes);
            foreach ($finalCinema as $key => $cinema) {
                $finalCinema[$key]['rooms'] = array_values($cinema['rooms']);
            }

            $movie->load(['genres', 'screening_types']);
            $movieArray = $movie->toArray();

            $movieArray['genres'] = $movie->genres->map(function ($genre) {
                return [
                    'genre_id' => $genre->genre_id,
                    'genre_name' => $genre->genre_name
                ];
            })->toArray();

            $movieArray['screening_types'] = $movie->screening_types->map(function ($screentype) {
                return [
                    'screening_type_id ' => $screentype->screening_type_id,
                    'screening_type_name' => $screentype->screening_type_name
                ];
            })->toArray();

            if ($movieArray['poster_url']) {
                $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
            }
            $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
            $movieArray['embed_trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;

            $movieArray['cinemas_with_showtimes'] = $finalCinema;
            return $movieArray;
        } catch (\Throwable $e) {
            Log::error('Lấy thông tin thất bại: ' . $e->getMessage(), ['movie_id' => $id, 'exception' => $e]);
            throw $e;
        }
    }


    public function getShowtimeSeatMap(string $id)
    {
        try {
            $showtime = ShowTimes::with(['theater_rooms.cinemas'])->find($id);

            if (!$showtime) {
                throw new Exception('Suất chiếu không tồn tại trong hệ thống');
            }

            if (!$showtime->theater_rooms) {
                throw new Exception('Không tìm thấy phòng chiếu cho suất chiếu này');
            }

            $room = $showtime->theater_rooms;
            $totalRows = $room->total_rows;
            $totalColumns = $room->total_columns;

            $allSeatRooms = Seats::where('room_id', $room->room_id)
                ->orderBy('seat_row')
                ->orderBy('seat_column')->get();

            $bookSeatIds = BookedTickets::select('booked_tickets.seat_id')
                ->join('bookings', 'booked_tickets.booking_id', 'bookings.booking_id')
                ->where('bookings.showtime_id', $id)
                ->whereIn('bookings.status', [BookingStatus::PAID->value, BookingStatus::PENDING_COUNTER_PAYMENT->value])
                ->pluck('booked_tickets.seat_id')
                ->toArray();
            $seatMaps = [];
            for ($i = 0; $i < $totalRows; $i++) {
                $seatMaps[$i] = array_fill(0, $totalColumns, null);
            }

            foreach ($allSeatRooms as $seat) {
                $seatRow = $seat->seat_row;
                $seatColumn = $seat->seat_column;

                $rowIndex = ord(strtoupper($seatRow)) - ord('A');

                $columnIndex = $seatColumn - 1;

                if ($rowIndex >= 0 && $rowIndex < $totalRows && $columnIndex >= 0 && $columnIndex < $totalColumns) {
                    $isBooked = in_array($seat->seat_id, $bookSeatIds);
                    $seatMaps[$rowIndex][$columnIndex] = [
                        'seat_id' => $seat->seat_id,
                        'seat_display_name' => $seatRow . $seatColumn,
                        'status' => $isBooked ? 'booked' : 'available',
                    ];
                } else {
                    Log::warning("Seat '{$seatRow}{$seatColumn}' (ID: {$seat->seat_id}) in room {$room->room_id} is out of grid bounds ({$totalRows}x{$totalColumns}).");
                }
            }

            $formattedShowtime = [
                'show_time_id' => $showtime->showtime_id,
                'start_time' => $showtime->start_time,
                'end_time' => $showtime->end_time,
            ];

            $formattedRoom = [
                'room_id' => $room->room_id,
                'room_name' => $room->room_name,
                'room_type' => $room->room_type,
                'total_columns' => $room->total_columns,
                'total_rows' => $room->total_rows,
            ];

            return [
                'showtimes' => $formattedShowtime,
                'room' => $formattedRoom,
                'seat_map' => $seatMaps
            ];

        } catch (\Throwable $e) {
            Log::error('Lấy sơ đồ ghế suất chiếu thất bại: ' . $e->getMessage(), ['show_time_id' => $id, 'exception' => $e]);

            throw $e;
        }
    }

    public function getShowtimeSeatMapCheck(string $id, array $seatBook)
    {
        $showtime = ShowTimes::with(['theater_rooms.cinemas'])->find($id);

        if (!$showtime) {
            throw new Exception('Suất chiếu không tồn tại trong hệ thống');
        }

        if (!$showtime->theater_rooms) {
            throw new Exception('Không tìm thấy phòng chiếu cho suất chiếu này');
        }

        $bookSeatIds = BookedTickets::select('booked_tickets.seat_id')
            ->join('bookings', 'booked_tickets.booking_id', 'bookings.booking_id')
            ->where('bookings.showtime_id', $id)
            ->whereIn('bookings.status', [BookingStatus::PAID->value, BookingStatus::PENDING->value, BookingStatus::PENDING_COUNTER_PAYMENT->value])
            ->pluck('booked_tickets.seat_id')
            ->toArray();
        $conflictedIds = array_values(array_intersect($seatBook['seat_ids'], $bookSeatIds));
        if (empty($conflictedIds)) {
            return [];
        }
        $seats = Seats::whereIn('seat_id', $conflictedIds)->get();

        return $seats->map(function ($seat) {
            return $seat->seat_row . $seat->seat_column;
        })->values()->toArray();
    }

    protected function extractYoutubeVideoId(?string $url): ?string
    {
        if (is_null($url) || trim($url) === '') {
            return null;
        }
        $videoId = null;
        // Xử lý các định dạng URL YouTube khác nhau
        // https://youtu.be/TcMBFSGVi1c?si=N461ZdQjy5fHoFD1 (short URL)
        if (preg_match('/youtu\.be\/([a-zA-Z0-9_-]{11})/', $url, $matches)) {
            $videoId = $matches[1];
        }
        // https://www.youtube.com/watch?v=TcMBFSGVi1c (long URL)
        // https://www.youtube.com/embed/TcMBFSGVi1c (embed URL)
        // https://www.youtube.com/v/TcMBFSGVi1c
        elseif (preg_match('/youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)([\w-]{11})/', $url, $matches)) {
            $videoId = $matches[1];
        }
        return $videoId;
    }


    public function searchMovies(array $filters = [])
    {
        $query = Movies::query();

        if (isset($filters['search']) && !empty($filters['search'])) {
            $query->where(function (Builder $q) use ($filters) {
                $q->where('movie_name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (isset($filters['genre']) && !empty($filters['genre'])) {
            $query->where('genre', $filters['genre']);
        }

        $userAge = 0;
        if (isset($filters['user']) && $filters['user'] instanceof User) {
            $user = $filters['user'];
            $userAge = $this->calculateUserAge($user);

            $query->where(function (Builder $q) use ($userAge) {

                $q->where('age_rating', '<=', $userAge)
                    ->orWhereNull('age_rating')
                    ->orWhere('age_rating', 0);
            });
        }
        $moviesCollection = $query->get();

        $processedMoviesArray = $moviesCollection->map(function ($movie) {
            $movieData = $movie->toArray();

            if (!empty($movieData['poster_url'])) {
                $movieData['poster_url'] = Storage::url($movieData['poster_url']);
            }

            return $movieData;
        })->all();

        return $processedMoviesArray;


    }


    protected function calculateUserAge(User $user): int
    {
        if (empty($user->birth_date)) {
            return 0;
        }
        return $user->birth_date->age;
    }


    // public function getMoviesClient(): array
    // {
    //     $movies = Movies::whereHas('movie_schedule')
    //         ->with(['genres', 'screening_types'])
    //         ->get();

    //     return $movies->map(function ($movie) {
    //         return [
    //             'movie_id' => $movie->movie_id,
    //             'movie_name' => $movie->movie_name,
    //             'poster_url' => $movie->poster_url ? Storage::url($movie->poster_url) : null,
    //             'status' => $movie->status,
    //             'duration' => $movie->duration,
    //             'release_date' => $movie->release_date,
    //             'genres' => $movie->genres->map(fn($g) => [
    //                 'genre_id' => $g->genre_id,
    //                 'genre_name' => $g->genre_name,
    //             ]),
    //             'screening_types' => $movie->screening_types->map(fn($s) => [
    //                 'screening_type_id' => $s->screening_type_id,
    //                 'screening_type_name' => $s->screening_type_name,
    //             ]),
    //         ];
    //     })->toArray();
    // }

    public function getMoviesClient(): array
    {
        $movies = Movies::whereHas('movie_schedule')
            ->with(['genres', 'screening_types'])
            ->get();

        if ($movies->isEmpty()) {
            return ['movies' => []];
        }

        $formatData = $movies->map(function ($movie) {
            $movieArray = $movie->toArray();

            // Format genres
            $movieArray['genres'] = $movie->genres->map(function ($genre) {
                return [
                    'genre_id' => $genre->genre_id,
                    'genre_name' => $genre->genre_name
                ];
            })->toArray();

            // Format screening types
            $movieArray['screening_types'] = $movie->screening_types->map(function ($screen_type) {
                return [
                    'screening_type_id' => $screen_type->screening_type_id,
                    'screening_type_name' => $screen_type->screening_type_name
                ];
            })->toArray();

            // Format poster_url
            if (isset($movieArray['poster_url']) && $movieArray['poster_url']) {
                $movieArray['poster_url'] = Storage::url($movieArray['poster_url']);
            }

            // Format trailer_url (YouTube embed)
            $trailerYoutubeId = $this->extractYoutubeVideoId($movie->trailer_url);
            $movieArray['trailer_url'] = $trailerYoutubeId ? "https://www.youtube.com/embed/{$trailerYoutubeId}" : null;

            return $movieArray;
        });

        return ['movies' => $formatData];
    }



}
