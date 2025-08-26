<?php

namespace App\Services\Impl\Cinema;

use App\Constants\BookingStatus;
use App\Constants\ShowTimeStatus;
use App\Http\Requests\CinemaRequest;
use App\Http\Requests\UpdateCinemaRequest;

use App\Models\Bookings;
use App\Models\Cinemas;
use App\Models\ShowTimes;
use App\Models\TheaterRooms;
use App\Services\Interfaces\Cinema\CinemaServiceInterface;
use Carbon\Carbon;
use DB;
use Exception;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage; // Import Storage facade
use Throwable;

class CinemaService implements CinemaServiceInterface
{

    // private function formatCinemaData(Cinemas $cinema): array
    // {
    //     $cinemaArray = $cinema->toArray();


    //     return $cinemaArray;
    // }

    public function getAll(array $filters = []): array
    {
        $query = Cinemas::query()->with('district');

        // Áp dụng bộ lọc tìm kiếm nếu có
        if (isset($filters['search']) && !empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('cinema_name', 'like', $searchTerm)
                    ->orWhere('address', 'like', $searchTerm);
            });
        }


        $cinemas = $query->get();

        if ($cinemas->isEmpty()) {
            throw new Exception('Hệ thống không có rạp chiếu phim nào cả.');
        }

        $cinemaData = $cinemas->map(function ($cinema) {
            $cinemaArray = $cinema->toArray();

            return $cinemaArray;
        })->toArray();


        return $cinemaData;
    }

    public function getCinema(string $id): ?array
    {
        $cinema = Cinemas::with('district', 'theater_rooms')->find($id); // Tải cả district và theater_rooms
        if (!$cinema) {
            throw new Exception('Rạp chiếu phim không có trong hệ thống');
        }

        $formattedCinema = $cinema->toArray();


        // $activeRooms = $cinema->theater_rooms->map(function ($room) {
        //     return $room->toArray();
        // })->toArray();


        $deletedRooms = TheaterRooms::onlyTrashed()->where('cinema_id', $id)->get()->map(function ($room) {
            return $room->toArray();
        })->toArray();

        // $formattedCinema['active_rooms'] = $activeRooms;
        $formattedCinema['deleted_rooms'] = $deletedRooms;

        return $formattedCinema;
    }


    public function getCinemasByDistrictIds(array $districtIds, array $filters = []): array
    {
        $query = Cinemas::query()->whereIn('district_id', $districtIds)->with('district');


        if (isset($filters['search']) && !empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('cinema_name', 'like', $searchTerm)
                    ->orWhere('address', 'like', $searchTerm);
            });
        }


        $cinemas = $query->get();
        $cinemaData = $cinemas->map(function ($cinema) {
            $cinemaArray = $cinema->toArray();

            return $cinemaArray;
        })->toArray();
        return $cinemaData;
    }


    public function insert(CinemaRequest $request): array
    {
        try {
            return DB::transaction(function () use ($request) {
                $cinemaData = $request->validated();

                $cinema = Cinemas::create($cinemaData);
                $cinema->load('district');
                return $cinema->toArray();
            });
        } catch (Throwable $e) {
            Log::error('Tạo rạp chiếu phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }

    public function update(UpdateCinemaRequest $request, string $id): array
    {
        try {
            return DB::transaction(function () use ($request, $id) {
                $cinema = Cinemas::find($id);
                if (!$cinema) {
                    throw new \Exception('Rạp chiếu phim không có trong hệ thống');
                }
                $cinemaData = $request->validated();

                $cinema->update($cinemaData);

                return $cinema->fresh(['district'])->toArray();
            });
        } catch (Throwable $e) {
            Log::error('Sửa thông tin rạp chiếu ' . $id . ' phim thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }

    public function delete(string $id): bool
    {
        try {
            return DB::transaction(function () use ($id) {
                $cinema = Cinemas::find($id);
                if (!$cinema) {
                    throw new \Exception('Rạp chiếu phim không có trong hệ thống');
                }
                $theaterRooms = TheaterRooms::where('cinema_id', $cinema->cinema_id)->get();
                $hasNowShowing = ShowTimes::whereIn('room_id', $theaterRooms->pluck('room_id'))
                    ->where('status', ShowTimeStatus::NOW_SHOWING->value)
                    ->exists();

                if ($hasNowShowing) {
                    throw new \Exception('Không thể xóa rạp vì có suất chiếu đang diễn ra.');
                }

                $cinema->delete();

                foreach ($theaterRooms as $room) {
                    $room->delete();

                    $upcomingActiveShowTime = ShowTimes::where('room_id', $room->room_id)
                        ->where('status', ShowTimeStatus::UPCOMING->value)
                        ->where('start_time', '>', Carbon::now())
                        ->get();

                    foreach ($upcomingActiveShowTime as $showtime) {
                        $showtime->status = ShowTimeStatus::CANCELLED->value;
                        $showtime->save();


                        $affectedBookings = Bookings::where('showtime_id', $showtime->showtime_id)
                            ->whereIn('status', [BookingStatus::PAID->value, BookingStatus::PENDING->value])
                            ->get();

                        foreach ($affectedBookings as $booking) {
                            $booking->status = 'cancelled_by_cinema';
                            $booking->save();
                        }
                    }
                }
                return true;
            });
        } catch (Throwable $e) {
            Log::error('Xóa rạp phim ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    // app/Services/Impl/Cinema/CinemaService.php

    public function restore(string $id): array
    {
        try {
            return DB::transaction(function () use ($id) {
                $cinema = Cinemas::onlyTrashed()->find($id);
                if (!$cinema) {

                    throw new Exception('Rạp chiếu phim không có trong hệ thống để khôi phục');
                }
                if (!$cinema->trashed()) {
                    throw new Exception('Rạp chiếu phim chưa có bị xóa');
                }
                $existsName = Cinemas::where('cinema_name', $cinema->cinema_name)
                    ->whereNull('deleted_at')
                    ->exists();

                if ($existsName) {
                    throw new Exception('Không thể khôi phục. Tên rạp "' . $cinema->cinema_name . '" đã tồn tại trong hệ thống.');
                }

                // Kiểm tra địa chỉ đã tồn tại ở rạp đang hoạt động chưa
                $existsAddress = Cinemas::where('address', $cinema->address)
                    ->whereNull('deleted_at')
                    ->exists();

                if ($existsAddress) {
                    throw new Exception('Không thể khôi phục. Địa chỉ "' . $cinema->address . '" đã được sử dụng bởi một rạp khác.');
                }

                $cinema->restore();
                $cinema->load('theater_rooms.show_times');
                return $cinema->toArray();
            });
        } catch (Throwable $e) {
            Log::error('Khôi phục rạp ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    public function getListRestore(): array
    {
        $cinemas = Cinemas::onlyTrashed()->with('district')->get(); // Tải district
        if ($cinemas->isEmpty()) {
            throw new Exception('Hệ thống không có rạp chiếu phim đã xóa mềm nào cả.');
        }



        $cinemaData = $cinemas->map(function ($cinema) {
            $cinemaArray = $cinema->toArray();

            return $cinemaArray;
        })->toArray();

        return $cinemaData;
    }


    public function getRestoreById(string $id)
    {
        $cinema = Cinemas::onlyTrashed()->with('district', 'theater_rooms')->find($id);
        if (!$cinema) {
            throw new Exception('Rạp chiếu phim không có trong hệ thống để khôi phục');
        }
        return $cinema->toArray();
    }

    public function getListRestoreByDistrict(array $districtIds): array
    {

        $cinemas = Cinemas::onlyTrashed()->whereIn('district_id', $districtIds)->with('district')->get(); // Tải district

        if ($cinemas->isEmpty()) {
            throw new Exception('Hệ thống không có rạp chiếu phim đã xóa mềm nào cả.');
        }

        $cinemaData = $cinemas->map(function ($cinema) {
            $cinemaArray = $cinema->toArray();

            return $cinemaArray;
        })->toArray();
        return $cinemaData;
    }
}
