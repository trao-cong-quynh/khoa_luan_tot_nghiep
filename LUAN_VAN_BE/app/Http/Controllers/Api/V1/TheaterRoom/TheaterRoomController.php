<?php

namespace App\Http\Controllers\Api\V1\TheaterRoom;

use App\Http\Controllers\Controller;
use App\Http\Requests\TheaterRoomRequest;
use App\Http\Requests\UpdateTheaterRoomRequest;
use App\Http\Resources\ApiResource;
use App\Models\Cinemas;
use App\Models\TheaterRooms;
use App\Services\Interfaces\TheaterRoom\TheaterRoomServiceInterface as TheaterRoomService;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
class TheaterRoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    protected $theaterRoomService;
    public function __construct(TheaterRoomService $theaterRoomService)
    {
        $this->theaterRoomService = $theaterRoomService;
    }
    public function index()
    {

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TheaterRoomRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->theaterRoomService->insert($request);
            return ApiResource::ok($response, 'Thêm phòng chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrict = $user->managedDistricts->pluck('district_id')->toArray();

            $room = TheaterRooms::find($request->cinema_id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            $room->load('cinemas');

            if (!$room->cinemas || !isset($room->cinemas->district_id) || !in_array($room->cinemas->district_id, $managedDistrict)) {
                return ApiResource::message('Bạn không có quyền thêm phòng chiếu vào rạp này vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->insert($request);
            return ApiResource::ok($response, 'Thêm phòng chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $requestCinemaId = $request->input('cinema_id');
            if (!$requestCinemaId) {
                return ApiResource::message('Phòng chiếu phải thuộc một rạp.', Response::HTTP_NOT_FOUND);
            }
            if ($user->cinema_id != $requestCinemaId) {
                return ApiResource::message('Bạn không thể tạo phòng chiếu vì rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->theaterRoomService->insert($request);
            return ApiResource::ok($response, 'Thêm phòng chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền thêm phòng chiếu phim.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTheaterRoomRequest $request, string $id)
    {


        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->theaterRoomService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin phòng chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrict = $user->managedDistricts->pluck('district_id')->toArray();

            $room = TheaterRooms::find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            $room->load('cinemas');

            if (!$room->cinemas || !isset($room->cinemas->district_id) || !in_array($room->cinemas->district_id, $managedDistrict)) {
                return ApiResource::message('Bạn không có quyền sửa phòng chiếu này vì phòng chiếu thuộc rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin phòng chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $room = TheaterRooms::find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id != $room->cinema_id) {
                return ApiResource::message('Bạn không thể sửa thông tin phòng chiếu vì rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            if ($request->has('cinema_id')) {
                $requestCinemaId = $request->input('cinema_id');
                if (!$requestCinemaId) {
                    return ApiResource::message('Phòng chiếu phải thuộc một rạp.', Response::HTTP_NOT_FOUND);
                }
                if ($user->cinema_id != $requestCinemaId) {
                    return ApiResource::message('Bạn không thể tạo phòng chiếu vì rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
                }
            }
            $response = $this->theaterRoomService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin phòng chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền sửa phòng chiếu phim.', Response::HTTP_FORBIDDEN);
        }



    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->theaterRoomService->delete($id);
            return ApiResource::ok($response, 'Xóa phòng chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrict = $user->managedDistricts->pluck('district_id')->toArray();

            $room = TheaterRooms::find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            $room->load('cinemas');

            if (!$room->cinemas || !isset($room->cinemas->district_id) || !in_array($room->cinemas->district_id, $managedDistrict)) {
                return ApiResource::message('Bạn không có quyền xóa phòng chiếu này vì phòng chiếu thuộc rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->delete($id);
            return ApiResource::ok($response, 'Xóa phòng chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $room = TheaterRooms::find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id != $room->cinema_id) {
                return ApiResource::message('Bạn không thể xóa phòng chiếu vì phòng chiếu thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->delete($id);
            return ApiResource::ok($response, 'Xóa phòng chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền xóa phòng chiếu phim.', Response::HTTP_FORBIDDEN);
        }


    }

    public function restore(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->theaterRoomService->restore($id);
            return ApiResource::ok($response, 'Thêm lại phòng chiếu vào hệ thống thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrict = $user->managedDistricts->pluck('district_id')->toArray();

            $room = TheaterRooms::withTrashed()->find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            $room->load('cinemas');

            if (!$room->cinemas || !isset($room->cinemas->district_id) || !in_array($room->cinemas->district_id, $managedDistrict)) {
                return ApiResource::message('Bạn không có quyền thêm lại phòng chiếu này vì phòng chiếu thuộc rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->restore($id);
            return ApiResource::ok($response, 'Thêm lại phòng chiếu vào hệ thống thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $room = TheaterRooms::withTrashed()->find($id);

            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id != $room->cinema_id) {
                return ApiResource::message('Bạn không thể thêm lại phòng chiếu vì phòng chiếu thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->restore($id);
            return ApiResource::ok($response, 'Thêm lại phòng chiếu vào hệ thống thành công');
        } else {
            return ApiResource::message('Bạn không có quyền thêm lại phòng chiếu phim.', Response::HTTP_FORBIDDEN);
        }

    }

    public function getListSeat(string $id)
    {
        $user = Auth::user();

        if ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $room = TheaterRooms::find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            $room->load('cinemas');


            if (
                !$room->cinemas ||
                !isset($room->cinemas->district_id) ||
                !in_array($room->cinemas->district_id, $managedDistrictIds)
            ) {

                return ApiResource::message('Bạn không có quyền xem thông tin ghế của phòng chiếu này.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->theaterRoomService->getListSeatInRoom($id);
            return ApiResource::ok($response, 'Lấy danh sách ghế của phòng thành công');
        } else if ($user->hasRole('admin')) {
            $response = $this->theaterRoomService->getListSeatInRoom($id);
            return ApiResource::ok($response, 'Lấy danh sách ghế của phòng thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $room = TheaterRooms::find($id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id != $room->cinema_id) {
                return ApiResource::message('Bạn không thể xem danh sách ghể của phòng chiếu vì phòng chiếu thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->getListSeatInRoom($id);
            return ApiResource::ok($response, 'Lấy danh sách ghế của phòng thành công');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách ghế cho phòng.', Response::HTTP_FORBIDDEN);
        }

    }

    public function getListRommWithCinemaId(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->theaterRoomService->getListWithCinemaId($id);
            return ApiResource::ok($response, 'Lấy danh sách phòng chiếu thành công.');
        } else if ($user->hasRole('district_manager')) {
            $districtIds = $user->managedDistricts->pluck('district_id')->toArray();
            $cinema = Cinemas::find($id);
            if (!$cinema) {
                return ApiResource::message('Rạp chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (!in_array($cinema->district_id, $districtIds)) {
                return ApiResource::message('Bạn không có quyền xem danh sách phòng chiếu của rạp có ID: ' . $id . ' vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->getListWithCinemaId($id);
            return ApiResource::ok($response, 'Lấy danh sách phòng chiếu thành công.');
        } else if ($user->hasRole('cinema_manager')) {
            if ($user->cinema_id != $id) {
                return ApiResource::message('Bạn không có quyền xem danh sách phòng chiếu của rạp có ID: ' . $id . ' vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->theaterRoomService->getListWithCinemaId($id);
            return ApiResource::ok($response, 'Lấy danh sách phòng chiếu thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh phòng chiếu.', Response::HTTP_FORBIDDEN);
        }

    }
}
