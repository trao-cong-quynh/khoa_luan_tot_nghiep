<?php

namespace App\Services\Impl\TheaterRoom;

use App\Constants\ShowTimeStatus;
use App\Http\Requests\TheaterRoomRequest;
use App\Http\Requests\UpdateTheaterRoomRequest;
use App\Models\Bookings;
use App\Models\Seats;
use App\Models\ShowTimes;
use App\Models\TheaterRooms;
use App\Services\Interfaces\TheaterRoom\TheaterRoomServiceInterface;
use Carbon\Carbon;
use DB;
use Exception;
use Illuminate\Auth\AuthenticationException;
use Log;

class TheaterRoomService implements TheaterRoomServiceInterface
{
    public function getAll(string $id)
    {
        $rooms = TheaterRooms::where('cinema_id', $id);
        return $rooms;
    }


    public function insert(TheaterRoomRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {


                $roomData = [
                    'cinema_id' => $request->cinema_id,
                    'room_name' => $request->room_name,
                    'room_type' => $request->room_type,
                    'total_columns' => $request->total_columns,
                    'total_rows' => $request->total_rows,
                ];

                $room = TheaterRooms::create($roomData);

                $seatToCreate = [];
                for ($row = 1; $row <= $room->total_rows; $row++) {
                    for ($column = 1; $column <= $room->total_columns; $column++) {
                        $seatToCreate[] = [
                            'room_id' => $room->room_id,
                            'seat_row' => chr(64 + $row),
                            'seat_column' => $column,
                            'seat_status' => 'available',
                        ];
                    }
                }
                Seats::insert($seatToCreate);

                return $room->load('seats');
            });

        } catch (\Throwable $e) {
            Log::error('Tạo phòngchiếu thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }

    }

    public function update(UpdateTheaterRoomRequest $request, string $id)
    {
        try {
            return DB::transaction(function () use ($request, $id) {
                $room = TheaterRooms::find($id);

                if (!$room) {
                    throw new AuthenticationException('Phòng chiếu khôn có trong hệ thống');
                }

                $roomData = $request->validated();

                $room->update($roomData);
                return $room;
            });

        } catch (\Throwable $e) {
            Log::error('Sửa thông tin phòng chiếu' . $id . ' phim thất bại: ' . $e->getMessage(), [
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
                $room = TheaterRooms::find($id);
                if (!$room) {
                    throw new AuthenticationException('Phòng chiếu không có trong hệ thống');
                }
                $room->delete();

                $currentTime = Carbon::now();
                $upcomingActiveShowTimes = ShowTimes::where('room_id', $room->room_id)
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
                        $booking->status = 'cancelled_by_room';
                        $booking->save();
                    }
                }
                return true;
            });
        } catch (\Throwable $e) {
            Log::error('Xóa phòng chiếu thất bại: ' . $e->getMessage(), ['room_id' => $id, 'ex']);
            throw $e;
        }
    }

    public function restore(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $room = TheaterRooms::withTrashed()->find($id);

                if (!$room) {
                    throw new AuthenticationException('Phòng chiếu không có trong hệ thống');
                }

                if (!$room->trashed()) {
                    throw new AuthenticationException('Phòng chiếu này chưa bị xóa mềm');
                }

                $duplicate = TheaterRooms::where('cinema_id', $room->cinema_id)
                    ->where('room_name', $room->room_name)
                    ->whereNull('deleted_at')
                    ->exists();
                if ($duplicate) {
                    throw new \Exception("Không thể khôi phục vì đã tồn tại phòng chiếu tên '{$room->room_name}' trong rạp này.");
                }

                $room->restore();

                return $room;

            });
        } catch (\Throwable $e) {
            Log::error('Khôi phục phim thất bại: ' . $e->getMessage(), ['room_id' => $id, 'exception' => $e]);
            throw $e;
        }
    }

    public function getListSeatInRoom(string $id)
    {
        $seats = Seats::where('room_id', $id)->get();


        if ($seats->isEmpty()) {

            throw new \Exception('Phòng chiếu không tồn tại');
        }

        $seatData = [];
        foreach ($seats as $seat) {
            $row = $seat->seat_row;
            $column = $seat->seat_column;
            $seatData[] = [
                'seat_id' => $seat->seat_id,
                'seat_display_name' => $row . $column,
            ];
        }
        return $seatData;
    }

    public function getListWithCinemaId(string $id)
    {
        $rooms = TheaterRooms::where('cinema_id', $id)->get();
        return $rooms->toArray();
    }
}
