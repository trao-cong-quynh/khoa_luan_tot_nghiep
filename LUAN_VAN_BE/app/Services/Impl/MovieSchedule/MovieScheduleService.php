<?php

namespace App\Services\Impl\MovieSchedule;

use App\Models\Cinemas;
use App\Models\Movies;
use App\Models\MovieSchedules;
use App\Services\Interfaces\MovieSchedule\MovieScheduleServiceInterface;
use Carbon\Carbon;
use DB;
use Log;

class MovieScheduleService implements MovieScheduleServiceInterface
{
    public function getAll()
    {
        $movieSchedules = MovieSchedules::all();
        return $movieSchedules;
    }


    public function insert(array $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $movie = Movies::withTrashed()->find($request['movie_id']);
                if (!$movie || $movie->deleted_at !== null) {
                    throw new \Exception('Phim không tôn tại hoặc đã bị xóa nên không thể tạo lịch chiếu được');
                }

                $cinema = Cinemas::withTrashed()->find($request['cinema_id']);
                if (!$cinema || $cinema->deleted_at !== null) {
                    throw new \Exception('Rạp không tôn tại hoặc đã bị xóa nên không thể tạo lịch chiếu được');
                }
                $startDate = $request['start_date'];
                $endDate = $request['end_date'];

                $hasConFlict = MovieSchedules::where('movie_id', $request['movie_id'])
                    ->where("cinema_id", $request['cinema_id'])
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    })->exists();

                if ($hasConFlict) {
                    throw new \Exception("Lịch chiếu bị trùng.");
                }

                $movieScheduleData = [
                    'movie_id' => $request['movie_id'],
                    'cinema_id' => $request['cinema_id'],
                    'start_date' => $request['start_date'],
                    'end_date' => $request['end_date'],
                ];

                $movieSchedule = MovieSchedules::create($movieScheduleData);
                return $movieSchedule;
            });

        } catch (\Throwable $e) {
            Log::error('Tạo lịch chiếu phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request
            ]);
            throw $e;
        }

    }


    public function delete(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $movieSchedule = MovieSchedules::find($id);

                if (!$movieSchedule) {
                    throw new \Exception('Lịch chiếu không tồn tại hoặc đã bị xóa.');
                }
                $movieSchedule->delete();
                return true;
            });

        } catch (\Throwable $e) {
            Log::error('Xóa lịch chiếu ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }

    }

    public function update(string $id, array $request)
    {
        try {
            return Db::transaction(function () use ($id, $request) {
                $movieSchedule = MovieSchedules::withTrashed()->find($id);
                if (!$movieSchedule) {
                    throw new \Exception('Lịch chiếu không tồn tại hoặc đã bị xóa');
                }
                $movieId = $request['movie_id'] ?? $movieSchedule->movie_id;
                $movie = Movies::withTrashed()->find($movieId);
                if (!$movie || $movie->deleted_at !== null) {
                    throw new \Exception('Phim không tồn tại hoặc đã bị xóa.');
                }

                $cinemaId = $request['cinema_id'] ?? $movieSchedule->cinema_id;

                $cinema = Cinemas::withTrashed()->find($cinemaId);

                if (!$cinema || $cinema->deleted_at !== null) {
                    throw new \Exception('Rạp chứa phòng chiếu không tồn tại hoặc đã bị xóa mềm.');
                }

                $startDate = $request['start_date'] ?? $movieSchedule->start_date;
                $endDate = $request['end_date'] ?? $movieSchedule->end_date;

                $hasConFlict = MovieSchedules::where('movie_id', $movieId)
                    ->where("cinema_id", $cinemaId)
                    ->where('movie_schedule_id', '!=', $movieSchedule->movie_schedule_id)
                    ->where(function ($query) use ($startDate, $endDate) {
                        $query->whereBetween('start_date', [$startDate, $endDate])
                            ->orWhereBetween('end_date', [$startDate, $endDate])
                            ->orWhere(function ($q) use ($startDate, $endDate) {
                                $q->where('start_date', '<=', $startDate)
                                    ->where('end_date', '>=', $endDate);
                            });
                    })->exists();

                if ($hasConFlict) {
                    throw new \Exception('Lịch chiếu phim bị đã tồn tại.');
                }

                $movieSchedule->update($request);
                return $movieSchedule;
            });

        } catch (\Throwable $e) {
            Log::error('Sửa thông tin rạp chiếu ' . $id . ' phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request
            ]);
            throw $e;
        }

    }


    public function getListWithDistrict(array $districtArr, array $filters = [])
    {
        $cienmas = Cinemas::whereIn('district_id', $districtArr)
            ->pluck('cinema_id')
            ->toArray();


        if (!$cienmas) {
            throw new \Exception('Bạn không có quản lý rạp nào cả.');
        }

        $movieSchesule = MovieSchedules::whereIn('cinema_id', $cienmas)->get();

        if (isset($filters['movie_id']) && !empty($filters['movie_id'])) {
            $movieSchesule->where('movie_id', $filters['movie_id']);
        }

        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $movieSchesule->where('start_date', $filters['start_date']);
        }


        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $movieSchesule->where('end_date', $filters['end_date']);
        }

        return $movieSchesule;

    }

    public function restore(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $movieSchedule = MovieSchedules::onlyTrashed()->find($id);
                if (!$movieSchedule) {
                    throw new \Exception('Lịch chiếu không tồn tại.');
                }

                $start_date = $movieSchedule->start_date;
                $end_date = $movieSchedule->end_date;

                $exists = MovieSchedules::where('movie_id', $movieSchedule->movie_id)
                    ->where('cinema_id', $movieSchedule->cinema_id)
                    ->whereNull('deleted_at')
                    ->where(function ($query) use ($start_date, $end_date) {
                        $query->whereBetween('start_date', [$start_date, $end_date])
                            ->orwhereBetween('end_date', [$start_date, $end_date])
                            ->orWhere(function ($q) use ($start_date, $end_date) {
                                $q->where('start_date', '<=', $start_date)
                                    ->where('end_date', '>=', $end_date);
                            });
                    })->exists();

                if ($exists) {
                    throw new \Exception('Lịch chiếu bị trùng không thể kích hoạt lại.');
                }

                if ($movieSchedule->deleted_at === null) {
                    return $movieSchedule;
                }

                $movieSchedule->restore();
                return $movieSchedule;
            });
        } catch (\Throwable $e) {
            Log::error('Khôi phục rạp ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }

    }

    public function getListMovieSheduleWithCinemaId(string $id)
    {
        $query = MovieSchedules::where('cinema_id', $id)->get();
        return $query;
    }


    public function getListRestore()
    {
        $movies = MovieSchedules::onlyTrashed()->get();
        if (!$movies) {
            throw new \Exception('Không có lịch chiếu nào bị xóa.');
        }
        return $movies;
    }

    public function getListRestoreWithCinemaId(string $id)
    {
        $query = MovieSchedules::onlyTrashed()->where('cinema_id', $id)->get();
        return $query;
    }


    public function getListRestoreWithDistrict(array $districtArr, array $filters = [])
    {
        $cienmas = Cinemas::withTrashed()->whereIn('district_id', $districtArr)
            ->pluck('cinema_id')
            ->toArray();


        if (!$cienmas) {
            throw new \Exception('Bạn không có quản lý rạp nào cả.');
        }

        $movieSchesule = MovieSchedules::onlyTrashed()->whereIn('cinema_id', $cienmas)->get();

        if (isset($filters['movie_id']) && !empty($filters['movie_id'])) {
            $movieSchesule->where('movie_id', $filters['movie_id']);
        }

        if (isset($filters['start_date']) && !empty($filters['start_date'])) {
            $movieSchesule->where('start_date', $filters['start_date']);
        }


        if (isset($filters['end_date']) && !empty($filters['end_date'])) {
            $movieSchesule->where('end_date', $filters['end_date']);
        }

        return $movieSchesule;

    }

}
