<?php

namespace App\Http\Controllers\Api\V1\MoMo;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\Booking\BookingServiceInterface as BookingService;
use App\Services\Interfaces\MoMo\MoMoServiceInterface as MoMoService;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MoMoController extends Controller
{
    protected $bookingService;
    protected $moMoService;
    public function __construct(BookingService $bookingService, MoMoService $moMoService)
    {
        $this->bookingService = $bookingService;
        $this->moMoService = $moMoService;
    }

    public function bookAndPay(BookingRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('user')) {
            $bookingData = $request->validated();
            $booking = $this->bookingService->createBooking($bookingData);

            $response = $this->moMoService->createpayment($booking['booking_id'], $booking['total_price']);
            return ApiResource::ok($response);
        }
        return ApiResource::error('Bạn không có quyền tạo đơn hàng', Response::HTTP_FORBIDDEN);
    }
    public function ipn(Request $request)
    {
        $response = $this->moMoService->handleIpn($request);
        return ApiResource::ok($response);
    }

    public function checkStatus(Request $request)
    {
        $orderId = $request->get('order_id');

        $response = $this->moMoService->queryTransactionStatus($orderId);
        return ApiResource::ok($response);
    }



}
