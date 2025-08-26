<?php

namespace App\Http\Controllers\Api\V1\Booking;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Resources\ApiResource;
use App\Http\Resources\BookedTicketResource;
use App\Http\Resources\BookingListItemResource;
use App\Http\Resources\BookingResource;
use App\Models\Bookings;
use App\Models\ShowTimes;
use App\Services\Interfaces\Booking\BookingServiceInterface as BookingService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    protected $bookingService;
    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return ApiResource::unauthorized('Người dùng chưa được xác thực.');
        }
        $bookings = [];
        if ($user->hasRole('admin')) {
            $bookings = $this->bookingService->getAll();

        } else if ($user->hasRole('district_manager')) {


            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                return ApiResource::ok([], 'Bạn không quản lý rạp chiếu phim nào.');
            }
            $bookings = $this->bookingService->getListBookingwithDistrict($managedDistrictIds);
        } else if ($user->hasRole('booking_manager')) {
            $cinemaId = $user->cinema_id;
            if (is_null($cinemaId)) {
                return ApiResource::message('Bạn không phải là quản lý đơn hàng của một rạp nào.');
            }
            $bookings = $this->bookingService->getListBookingwithCinema($cinemaId);

        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            if (is_null($cinemaId)) {
                return ApiResource::message('Bạn không phải là quản lý đơn hàng của một rạp nào.', Response::HTTP_NOT_FOUND);
            }
            $bookings = $this->bookingService->getListBookingwithCinema($cinemaId);

        } else if ($user->hasRole('user')) {
            $bookings = $this->bookingService->getListBookingwithUser($user->user_id);

        } else {
            ApiResource::message('Bạn không có quyền lấy danh sách đơn hàng.', Response::HTTP_FORBIDDEN);
        }

        if (empty($bookings)) {
            return ApiResource::ok([], 'Danh sách đơn hàng rỗng');
        }
        return ApiResource::ok(BookingListItemResource::collection($bookings), 'Lấy danh sách đơn hàng thành công');

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(BookingRequest $request)
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BookingRequest $request)
    {
        $user = Auth::user();
        if (!$user) {
            return ApiResource::unauthorized('Người dùng chưa được xác thực.');
        }
        if ($user->hasRole('user')) {
            $bookingData = $request->validated();

            $response = $this->bookingService->createBooking($bookingData);
            return ApiResource::ok($response, 'Tạo đơn hàng thành công');
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
            ])->find($request->showtime_id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                !in_array($showtime->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {
                return ApiResource::message("Bạn không có quyên tạo đơn hàng với suất chiếu {$request->showtime_id} thuộc những rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);
            }

            $bookingData = $request->validated();
            $response = $this->bookingService->createBooking($bookingData);
            return ApiResource::ok($response, 'Tạo đơn hàng thành công');
        } else if ($user->hasRole('booking_manager')) {
            $cinemaId = $user->cinema_id;
            $showtime = ShowTimes::with([
                'theater_rooms' => function ($query) {
                    $query->withTrashed()->with([
                        'cinemas' => function ($q) {
                            $q->withTrashed();
                        }
                    ]);
                }
            ])->find($request->showtime_id);
            if (!$showtime) {
                return ApiResource::message('Suất chiếu không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$showtime->theater_rooms ||
                !$showtime->theater_rooms->cinemas ||
                $showtime->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message("Bạn không có quyền tạo đơn hàng với suất chiếu {$request->showtime_id} thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);
            }
            $bookingData = $request->validated();
            $response = $this->bookingService->createBooking($bookingData);
            return ApiResource::ok($response, 'Tạo đơn hàng thành công');
        } else if ($user->hasRole('admin')) {
            $bookingData = $request->validated();
            $response = $this->bookingService->createBooking($bookingData);
            return ApiResource::ok($response, 'Tạo đơn hàng thành công');
        } else {
            return ApiResource::message('Bạn không có quyền tạo đơn hàng.', Response::HTTP_FORBIDDEN);
        }
        // return ApiResource::error('Bạn không có quyền tạo đơn hàng', 403);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        if (!$user) {
            return ApiResource::unauthorized('Người dùng chưa được xác thực.');
        }
        if ($user->hasRole('admin')) {
            // Admin có quyền xem bất kỳ đơn hàng nào
            $bookingResource = $this->bookingService->getDetail($id);
            return ApiResource::ok($bookingResource, 'Lấy thông tin chi tiết đơn hàng thành công.');
        } elseif ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                // Nếu district_manager không quản lý quận nào
                return ApiResource::forbidden('Bạn không quản lý quận nào, không thể xem đơn hàng.');
            }

            $booking = Bookings::with([
                'show_times' => function ($query) {
                    $query->with([
                        'theater_rooms' => function ($query) {
                            $query->withTrashed()->with([
                                'cinemas' => function ($q) {
                                    $q->withTrashed();
                                }
                            ]);
                        }
                    ]);
                }
            ])->find($id);
            if (!$booking) {
                return ApiResource::message('Đơn hàng không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$booking->show_times ||
                !$booking->show_times->theater_rooms ||
                !$booking->show_times->theater_rooms->cinemas ||
                !in_array($booking->show_times->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {
                return ApiResource::message("Bạn không có quyền xem chi tiết đơn hàng {$id} vì nó thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);
            }


            $bookingResource = $this->bookingService->getDetail($id);
            return ApiResource::ok($bookingResource, 'Lấy thông tin chi tiết đơn hàng thành công.');

        } else if ($user->hasRole('booking_manager')) {
            $cinemaId = $user->cinema_id;
            $booking = Bookings::with([
                'show_times' => function ($query) {
                    $query->with([
                        'theater_rooms' => function ($query) {
                            $query->withTrashed()->with([
                                'cinemas' => function ($q) {
                                    $q->withTrashed();
                                }
                            ]);
                        }
                    ]);
                }
            ])->find($id);
            if (!$booking) {
                return ApiResource::message('Đơn hàng không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$booking->show_times ||
                !$booking->show_times->theater_rooms ||
                !$booking->show_times->theater_rooms->cinemas ||
                $booking->show_times->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message("Bạn không có quyền xem chi tiết đơn hàng {$id} vì nó thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }
            $bookingResource = $this->bookingService->getDetail($id);
            return ApiResource::ok($bookingResource, 'Lấy thông tin chi tiết đơn hàng thành công.');

        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            $booking = Bookings::with([
                'show_times' => function ($query) {
                    $query->with([
                        'theater_rooms' => function ($query) {
                            $query->withTrashed()->with([
                                'cinemas' => function ($q) {
                                    $q->withTrashed();
                                }
                            ]);
                        }
                    ]);
                }
            ])->find($id);
            if (!$booking) {
                return ApiResource::message('Đơn hàng không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$booking->show_times ||
                !$booking->show_times->theater_rooms ||
                !$booking->show_times->theater_rooms->cinemas ||
                $booking->show_times->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message("Bạn không có quyền xem chi tiết đơn hàng {$id} vì nó thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }
            $bookingResource = $this->bookingService->getDetail($id);
            return ApiResource::ok($bookingResource, 'Lấy thông tin chi tiết đơn hàng thành công.');

        } else if ($user->hasRole('user')) {
            $booking = Bookings::find($id);
            if (!$booking) {
                return ApiResource::message("Đơn hàng không tồn tại.", Response::HTTP_NOT_FOUND);
            }
            if ($user->user_id !== $booking->user_id) {
                return ApiResource::message("Bạn không quyền xem thông tin chi tiết đơn hàng này.", Response::HTTP_FORBIDDEN);
            }
            $bookingResource = $this->bookingService->getDetail($id);
            return ApiResource::ok($bookingResource, 'Lấy thông tin chi tiết đơn hàng thành công.');

        } else {

            return ApiResource::forbidden('Bạn không có quyền lấy thông tin chi tiết đơn hàng.', Response::HTTP_FORBIDDEN);
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
    public function update(UpdateBookingRequest $request, string $id)
    {
        $user = Auth::user();
        $originalBooking = Bookings::with([
            'show_times.theater_rooms.cinemas' // Cần eager load để lấy district_id
        ])->find($id);

        if (!$originalBooking) {
            return ApiResource::notFound('Đơn hàng không tồn tại.');
        }
        if ($user->hasRole('admin')) {
            $bookingData = $request->validated();
            $response = $this->bookingService->update($id, $bookingData);
            return ApiResource::ok($response, 'Sửa thông tin đơn hàng thành công');
        } elseif ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                return ApiResource::message('Bạn không quản lý quận nào, không thể sửa thông tin đơn hàng.');
            }


            $cinemaDistrictId = $originalBooking->show_times->theater_rooms->cinemas->district_id ?? null;

            // Kiểm tra xem district_id của rạp có nằm trong danh sách các quận quản lý không
            if (
                !$originalBooking->show_times ||
                !$originalBooking->show_times->theater_rooms ||
                !$originalBooking->show_times->theater_rooms->cinemas ||
                !in_array($cinemaDistrictId, $managedDistrictIds)
            ) {
                return ApiResource::message('Bạn không có quyền sửa đơn hàng này vì nó không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $bookingData = $request->validated();
            $response = $this->bookingService->update($id, $bookingData);
            return ApiResource::ok($response, 'Sửa thông tin đơn hàng thành công.');
        } else {
            // Các vai trò khác không có quyền sửa đơn hàng
            return ApiResource::error('Bạn không có quyền sửa thông tin đơn hàng', Response::HTTP_FORBIDDEN);

        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function approveCounterBooking(string $id)
    {
        $user = Auth::user();
        $originalBooking = Bookings::with([
            'show_times.theater_rooms.cinemas' // Cần eager load để lấy district_id
        ])->find($id);

        if (!$originalBooking) {
            return ApiResource::notFound('Đơn hàng không tồn tại.');
        }
        if ($user->hasRole('admin')) {
            $response = $this->bookingService->approveCounterBooking($id);
            return ApiResource::ok(new BookingResource($response), 'Duyệt đơn hàng thành công.');
        } else if ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                // Nếu district_manager không quản lý quận nào
                return ApiResource::forbidden('Bạn không quản lý quận nào, không thể duyệt đơn hàng.');
            }

            $booking = Bookings::with([
                'show_times' => function ($query) {
                    $query->with([
                        'theater_rooms' => function ($query) {
                            $query->withTrashed()->with([
                                'cinemas' => function ($q) {
                                    $q->withTrashed();
                                }
                            ]);
                        }
                    ]);
                }
            ])->find($id);
            if (!$booking) {
                return ApiResource::message('Đơn hàng không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$booking->show_times ||
                !$booking->show_times->theater_rooms ||
                !$booking->show_times->theater_rooms->cinemas ||
                !in_array($booking->show_times->theater_rooms->cinemas->district_id, $managedDistrictIds)
            ) {
                return ApiResource::message("Bạn không có quyền duyệt đơn hàng {$id} vì nó thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);
            }

            $response = $this->bookingService->approveCounterBooking($id);
            return ApiResource::ok(new BookingResource($response), 'Duyệt đơn hàng thành công.');
        } else if ($user->hasRole('booking_manager')) {
            $cinemaId = $user->cinema_id;
            $booking = Bookings::with([
                'show_times' => function ($query) {
                    $query->with([
                        'theater_rooms' => function ($query) {
                            $query->withTrashed()->with([
                                'cinemas' => function ($q) {
                                    $q->withTrashed();
                                }
                            ]);
                        }
                    ]);
                }
            ])->find($id);
            if (!$booking) {
                return ApiResource::message('Đơn hàng không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$booking->show_times ||
                !$booking->show_times->theater_rooms ||
                !$booking->show_times->theater_rooms->cinemas ||
                $booking->show_times->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message("Bạn không có quyền duyệt đơn hàng {$id} vì nó thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }
            $response = $this->bookingService->approveCounterBooking($id);
            return ApiResource::ok(new BookingResource($response), 'Duyệt đơn hàng thành công.');

        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            $booking = Bookings::with([
                'show_times' => function ($query) {
                    $query->with([
                        'theater_rooms' => function ($query) {
                            $query->withTrashed()->with([
                                'cinemas' => function ($q) {
                                    $q->withTrashed();
                                }
                            ]);
                        }
                    ]);
                }
            ])->find($id);
            if (!$booking) {
                return ApiResource::message('Đơn hàng không tồn tại ', Response::HTTP_NOT_FOUND);
            }

            if (
                !$booking->show_times ||
                !$booking->show_times->theater_rooms ||
                !$booking->show_times->theater_rooms->cinemas ||
                $booking->show_times->theater_rooms->cinemas->cinema_id !== $cinemaId
            ) {
                return ApiResource::message("Bạn không có quyền duyệt đơn hàng {$id} vì nó thuộc rạp không thuộc phạm vi quản lý của bạn.", Response::HTTP_FORBIDDEN);

            }
            $response = $this->bookingService->approveCounterBooking($id);
            return ApiResource::ok(new BookingResource($response), 'Duyệt đơn hàng thành công.');

        } else {

            return ApiResource::forbidden('Bạn không có quyền duyệt đơn hàng.', Response::HTTP_FORBIDDEN);
        }
    }

}
