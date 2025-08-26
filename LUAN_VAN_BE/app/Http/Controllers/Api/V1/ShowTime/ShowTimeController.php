<?php

namespace App\Http\Controllers\Api\V1\ShowTime;

use App\Http\Controllers\Controller;
use App\Http\Requests\ShowTimeRequest;
use App\Http\Requests\updateShowTimeRequest;
use App\Http\Resources\ApiResource;
use App\Models\Cinemas;
use App\Models\ShowTimes;
use App\Models\TheaterRooms;
use App\Services\Interfaces\ShowTime\ShowTimeServiceInterface as ShowTimeService;
use Auth;
use Illuminate\Http\Response;
use Illuminate\Http\Request;

class ShowTimeController extends Controller
{
    protected $showTimeService;

    public function __construct(ShowTimeService $showTimeService)
    {
        $this->showTimeService = $showTimeService;
    }
    public function index()
    {
        // $response = $this->showTimeService->getAll();
        // return ApiResource::ok($response, 'Lấy danh sách suất chiếu thành công');
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
    public function store(ShowTimeRequest $request)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {

            $response = $this->showTimeService->insert($request);
            return ApiResource::ok($response, 'Tạo suất chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            $room = TheaterRooms::find($request->room_id);

            if (!$room) {
                return ApiResource::message('Phòng chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (!$room->cinemas) {
                return ApiResource::message('Rạp chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }
            if (!isset($room->cinemas->district_id) || !in_array($room->cinemas->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền tạo suất chiếu vì phòng chiếu thuộc rạp không thuộc phạm vi quận quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->showTimeService->insert($request);
            return ApiResource::ok($response, 'Tạo suất chiếu thành công');
        } else if ($user->hasRole('showtime_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $room = TheaterRooms::with([
                'cinemas' => function ($query) {
                    $query->withTrashed();
                }
            ])->find($request->room_id);
            if (!$room) {
                return ApiResource::message('Phòng chiếu chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }
            if (
                !$room->cinemas ||
                $room->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền tạo suất chiếu vì phòng chiếu thuộc rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->showTimeService->insert($request);
            return ApiResource::ok($response, 'Tạo suất chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $requestRoomId = $request->input('room_id');
            if (!$requestRoomId) {
                return ApiResource::message('Suất chiếu phải thuộc một phòng.', Response::HTTP_NOT_FOUND);
            }
            $room = TheaterRooms::with('cinemas')->find($requestRoomId);
            if (!$room) {
                return ApiResource::message('Phòng chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            if ($user->cinema_id != $room->cinemas->cinema_id) {
                return ApiResource::message('Bạn không thể tạo suất chiếu vì phòng chiếu thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->showTimeService->insert($request);
            return ApiResource::ok($response, 'Tạo suất chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền tạo suất chiếu.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {

            $response = $this->showTimeService->getShowTime($id);
            return ApiResource::ok($response, 'Lấy thông tin chi tiết suất chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                !in_array($showtime->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {

                return ApiResource::message('Bạn không có quyền xem thông tin suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->showTimeService->getShowTime($id);
            return ApiResource::ok($response, 'Lấy thông tin chi tiết suất chiếu thành công');
        } else if ($user->hasRole('showtime_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }
            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền xem thông tin suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);

            }

            $response = $this->showTimeService->getShowTime($id);
            return ApiResource::ok($response, 'Lấy thông tin chi tiết suất chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (!$showtime->theater_rooms || !$showtime->theater_rooms->cinemas || $showtime->theater_rooms->cinemas->cinema_id !== $user->cinema_id) {
                return ApiResource::message('Bạn không có quyền xem thông tin suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->showTimeService->getShowTime($id);
            return ApiResource::ok($response, 'Lấy thông tin chi tiết suất chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách suất chiếu', Response::HTTP_FORBIDDEN);
        }

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
    public function update(updateShowTimeRequest $request, string $id)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {

            $response = $this->showTimeService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin chi tiết suất chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                !in_array($showtime->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {

                return ApiResource::message('Bạn không có quyền sửa thông tin suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->showTimeService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin chi tiết suất chiếu thành công');
        } else if ($user->hasRole('showtime_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }


            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền sửa thông tin suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->showTimeService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin chi tiết suất chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }


            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $user->cinema_id
            ) {
                return ApiResource::message('Bạn không có quyền sửa thông tin suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->showTimeService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thông tin chi tiết suất chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách suất chiếu', Response::HTTP_FORBIDDEN);
        }


    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->showTimeService->cancelShowtime($id);
            return ApiResource::ok($response, 'Hủy suất chiếu thành công');
        } else if ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);

            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                !in_array($showtime->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {

                return ApiResource::message('Bạn không có quyền hủy suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->showTimeService->cancelShowtime($id);
            return ApiResource::ok($response, 'Hủy suất chiếu thành công');
        } else if ($user->hasRole('showtime_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }
            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền hủy suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->showTimeService->cancelShowtime($id);
            return ApiResource::ok($response, 'Hủy suất chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }
            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền hủy suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->showTimeService->cancelShowtime($id);
            return ApiResource::ok($response, 'Hủy suất chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền hủy suất chiếu', Response::HTTP_FORBIDDEN);
        }
    }

    public function reactivate(string $id)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {

            $response = $this->showTimeService->reactivateShowtime($id);
            return ApiResource::ok($response, 'Kích hoạt lại suất chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                !in_array($showtime->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {

                return ApiResource::message('Bạn không có quyền kích hoạt lại suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->showTimeService->reactivateShowtime($id);
            return ApiResource::ok($response, 'Kích hoạt lại suất chiếu thành công');
        } else if ($user->hasRole('showtime_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }
            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền kích hoạt lại suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);

            }
            $response = $this->showTimeService->reactivateShowtime($id);
            return ApiResource::ok($response, 'Kích hoạt lại suất chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }
            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message('Bạn không có quyền kích hoạt lại suất chiếu này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);

            }
            $response = $this->showTimeService->reactivateShowtime($id);
            return ApiResource::ok($response, 'Kích hoạt lại suất chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách suất chiếu', Response::HTTP_FORBIDDEN);
        }
    }

    public function getListShowTime(Request $request)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            $filters = $request->only(['cinema_id', 'room_id', 'date', 'status']);

            $response = $this->showTimeService->getFilteredShowtimes($filters);
            return ApiResource::ok($response, 'Lấy danh sách suất chiếu thành công');
        } else if ($user->hasRole('district_manager')) {
            $filters = $request->only(['cinema_id', 'room_id', 'date', 'status']);
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $cinema = Cinemas::withTrashed()->find($filters['cinema_id']);

            if (
                !$cinema ||
                !isset($cinema->district_id) ||
                !in_array($cinema->district_id, $managedDistrictIds)
            ) {

                return ApiResource::message("Bạn không có quyền xem danh sách suất chiếu của phòng chiếu {$request->room_id} vì rạp {$request->cinema_id} không thuộc các quận bạn quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }

            $response = $this->showTimeService->getFilteredShowtimes($filters);
            return ApiResource::ok($response, 'Lấy danh sách suất chiếu thành công');

        } else if ($user->hasRole('showtime_manager')) {
            $filters = $request->only(['cinema_id', 'room_id', 'date', 'status']);
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý suất chiếu cho rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $cinema = Cinemas::withTrashed()->find($filters['cinema_id']);

            if (
                !$cinema ||
                !isset($cinema->cinema_id) ||
                $request->cinema_id !== $cinemaId
            ) {

                return ApiResource::message("Bạn không có quyền xem danh sách suất chiếu của phòng chiếu {$request->room_id} vì rạp {$request->cinema_id} không thuộc quyền quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }

            $response = $this->showTimeService->getFilteredShowtimes($filters);
            return ApiResource::ok($response, 'Lấy danh sách suất chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $filters = $request->only(['cinema_id', 'room_id', 'date', 'status']);
            $cinemaId = $user->cinema_id;
            if (!$cinemaId) {
                return ApiResource::message('Người dùng không có quản lý rạp nào cả.', Response::HTTP_FORBIDDEN);
            }
            $cinema = Cinemas::withTrashed()->find($filters['cinema_id']);

            if (
                !$cinema ||
                !isset($cinema->cinema_id) ||
                $request->cinema_id !== $cinemaId
            ) {

                return ApiResource::message("Bạn không có quyền xem danh sách suất chiếu của phòng chiếu {$request->room_id} vì rạp {$request->cinema_id} không thuộc quyền quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }

            $response = $this->showTimeService->getFilteredShowtimes($filters);
            return ApiResource::ok($response, 'Lấy danh sách suất chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách suất chiếu', Response::HTTP_FORBIDDEN);
        }

    }
}
