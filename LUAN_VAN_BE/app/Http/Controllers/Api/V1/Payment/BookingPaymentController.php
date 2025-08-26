<?php

namespace App\Http\Controllers\Api\V1\Payment;

use App\Constants\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Resources\ApiResource;
use App\Models\Bookings;
use App\Models\Payment;
use App\Services\Interfaces\Booking\BookingServiceInterface as BookingService;
use App\Services\Interfaces\MoMo\MoMoServiceInterface as MoMoService; // Có thể bỏ nếu không dùng trực tiếp
use App\Services\Interfaces\Payment\BookingPaymentServiceInterface as BookingPaymentService;
use App\Services\PaymentGateway\PaymentGatewayFactory;
use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Log;
use Throwable;

class BookingPaymentController extends Controller
{
    protected $bookingPaymentService;
    protected $paymentGatewayFactory;
    protected $bookingService;

    public function __construct(BookingService $bookingService, BookingPaymentService $bookingPaymentService, PaymentGatewayFactory $paymentGatewayFactory)
    {
        $this->bookingService = $bookingService;
        $this->bookingPaymentService = $bookingPaymentService;
        $this->paymentGatewayFactory = $paymentGatewayFactory;
    }

    public function createBookingAndInitiatePayment(BookingRequest $request)
    {


        $user = Auth::user();
        if (!$user || !$user->hasRole('user')) {
            return ApiResource::error('Bạn không có quyền thực hiện hành động này.', Response::HTTP_FORBIDDEN);
        }

        $bookingData = $request->validated();

        $paymentMethod = $request->input('payment_method');
        if (empty($paymentMethod)) {
            return ApiResource::error('Phương thức thanh toán không được cung cấp.', 400);
        }

        $bookingId = null;
        $paymentRecord = null;
        try {

            if ($paymentMethod === 'counter_payment') {
                $response = $this->bookingService->createBooking($bookingData, $paymentMethod);
                return ApiResource::ok($response, 'Đặt vé giữ chổ thành công.');
            }

            $bookingDetails = $this->bookingService->createBooking($bookingData, $paymentMethod);

            $bookingId = $bookingDetails['booking_id'];
            $amount = $bookingDetails['total_price'];
            // Khởi tạo bản ghi Payment với trạng thái pending_gateway
            $paymentRecord = Payment::create([
                'booking_id' => $bookingId,
                'payment_method' => $paymentMethod,
                'internal_status' => BookingStatus::PAYMENT_PENDING_GATEWAY,
                'amount' => $amount,
                'currency' => 'VND',
                'payment_initiated_at' => Carbon::now(),
                'ip_address' => $request->ip(),
            ]);

            $gateway = $this->paymentGatewayFactory->getGateway($paymentMethod);
            $redirectUrl = route('payment.return', ['method' => $paymentMethod, 'orderId' => 'BOOKING_' . $bookingId, 'paymentId' => $paymentRecord->payment_id]);
            $ipnUrl = route('payment.ipn', ['method' => $paymentMethod]);

            $paymentInitiationResponse = $gateway->createPaymentLink((string) $bookingId, $amount, $redirectUrl, $ipnUrl);

            $paymentRecord->update([
                'gateway_response_data' => array_merge($paymentRecord->gateway_response_data ?? [], $paymentInitiationResponse),
                'transaction_id' => $paymentInitiationResponse['transId'] ?? ($paymentInitiationResponse['partnerRefId'] ?? null),
                'transfer_content' => $paymentInitiationResponse['transfer_content'] ?? null,
                'pay_url' => $paymentInitiationResponse['payUrl'] ?? null,
            ]);
            return ApiResource::ok([
                'booking_id' => $bookingId,
                'payment_id' => $paymentRecord->payment_id,
                'total_price' => $amount,
                'payment_method' => $paymentMethod,
                'payment_details' => $paymentInitiationResponse, // Chứa payUrl cho MoMo
            ], 'Khởi tạo thanh toán thành công.');


        } catch (\Throwable $e) {
             Log::error("Lỗi khởi tạo thanh toán cho booking {$bookingId} ({$paymentMethod}): " . $e->getMessage(), ['exception' => $e, 'request' => $request->all()]);

            if ($paymentRecord) {
                $paymentRecord->update([
                    'internal_status' => BookingStatus::PAYMENT_FAILED,
                    'gateway_transaction_message' => 'Lỗi khởi tạo: ' . $e->getMessage(),
                    'payment_completed_at' => Carbon::now(),
                    'gateway_response_data' => array_merge($paymentRecord->gateway_response_data ?? [], ['error_on_init' => $e->getMessage()])
                ]);
            }
            if ($bookingId) {
                $booking = Bookings::find($bookingId);
                if ($booking && $booking->status === BookingStatus::PENDING) {
                    $booking->update(['status' => BookingStatus::FAILED]);
                }
            }
            return ApiResource::error('Không thể khởi tạo thanh toán: ' . $e->getMessage(), 500);
        }
    }

    public function handleReturn(Request $request, string $method)
    {

        $frontendSuccessUrl = config('momo.frontend_redirect_url');
        $orderId = $request->query('orderId');
        $paymentId = $request->query('paymentId');
        $bookingId = str_replace('BOOKING_', '', $orderId);
        $booking = Bookings::find($bookingId);
        $paymentRecord = Payment::find($paymentId);

        if (!$orderId || !$booking || !$paymentRecord || $paymentRecord->booking_id != $bookingId || $paymentRecord->payment_method !== $method) {
            // Log::warning("Callback trả về thanh toán cho {$method} thất bại: Dữ liệu không hợp lệ hoặc không khớp. OrderId: {$orderId}, PaymentId: {$paymentId}. Toàn bộ yêu cầu: " . json_encode($request->all()));
            return redirect($frontendSuccessUrl . "?error=invalid_callback&bookingId={$bookingId}&paymentId={$paymentId}");
        }

        try {
            $gateway = $this->paymentGatewayFactory->getGateway($method);
            $gatewayStatus = $gateway->queryTransactionStatus($orderId);

            $paymentDetails = [
                'transId' => $gatewayStatus['transId'] ?? null,
                'resultCode' => $gatewayStatus['resultCode'] ?? null,
                'message' => $gatewayStatus['message'] ?? 'Không có thông báo',
                'amount' => $gatewayStatus['amount'] ?? $booking->total_price,
                'payment_method' => $method,
                'payType' => $gatewayStatus['payType'] ?? null,
                'responseTime' => $gatewayStatus['responseTime'] ?? null,
                'currency' => $gatewayStatus['currency'] ?? 'VND',
                'raw_gateway_response' => $gatewayStatus,
                'callback_request' => $request->all(),
            ];

            if (isset($gatewayStatus['resultCode']) && $gatewayStatus['resultCode'] == 0) {
                $success = $this->bookingPaymentService->handleSuccessfulPayment($booking, $paymentDetails, $paymentRecord);
                if ($success) {
                    // Log::info("Booking {$bookingId} đã xác nhận PAID qua callback trả về {$method} cho Payment {$paymentRecord->payment_id}.");
                    return redirect($frontendSuccessUrl . "?bookingId={$bookingId}&status=success");
                } else {
                    // Log::error("BookingPaymentService không xử lý được thanh toán thành công cho booking {$bookingId} qua {$method}. Payment {$paymentRecord->payment_id}.");
                    return redirect($frontendSuccessUrl . "?bookingId={$bookingId}&status=error&message=" . urlencode('Đã xảy ra lỗi nội bộ khi xử lý thanh toán. Vui lòng liên hệ hỗ trợ.'));
                }

            } else {
                $this->bookingPaymentService->handleFailedPayment($booking, $paymentDetails, $paymentRecord);
                // Log::warning("Booking {$bookingId} đã cập nhật thành FAILED/PENDING_VERIFICATION qua callback trả về {$method} cho Payment {$paymentRecord->payment_id}. Kết quả: " . json_encode($gatewayStatus));
                $errorMessage = $gatewayStatus['message'] ?? 'Thanh toán không thành công.'; // Đã sửa $momoStatus thành $gatewayStatus
                return redirect($frontendSuccessUrl . "?bookingId={$bookingId}&status=failed&message=" . urlencode($errorMessage));
            }

        } catch (\Throwable $e) {
            // Log::error("Lỗi nghiêm trọng khi xử lý callback trả về cho booking {$bookingId} qua {$method}: " . $e->getMessage(), ['exception' => $e, 'request' => $request->all(), 'payment_id' => $paymentId]);
            if ($paymentRecord) {
                $paymentRecord->update([
                    'internal_status' => 'processing_error',
                    'gateway_transaction_message' => 'Lỗi xử lý callback: ' . $e->getMessage(),
                    'payment_completed_at' => Carbon::now(),
                    'gateway_response_data' => array_merge($paymentRecord->gateway_response_data ?? [], ['error_on_callback' => $e->getMessage()])
                ]);
            }
            return redirect($frontendSuccessUrl . "?bookingId={$bookingId}&status=error&message=" . urlencode('Đã xảy ra lỗi trong quá trình xử lý thanh toán.'));
        }
    }

    public function handleIpn(Request $request, string $method)
    {
        try {
            $gateway = $this->paymentGatewayFactory->getGateway($method); // Đã sửa 'geWateway' thành 'getGateway'
            $ipnData = $gateway->handleWebhook($request);
            // Log::info("IPN Data after webhook processing: ", $ipnData);

            $orderId = $ipnData['orderId'] ?? ($ipnData['order_id'] ?? null);

            $transId = $ipnData['transId'] ?? ($ipnData['reference_id'] ?? null);
            $bookingId = str_replace('BOOKING_', '', $orderId);
            $booking = Bookings::find($bookingId);

            if (!$booking) {
                // Log::warning("IPN đã nhận cho booking không tồn tại: {$bookingId} qua {$method}. Dữ liệu IPN đầy đủ: " . json_encode($ipnData));
                return response('OK', 200);
            }

            // Tìm kiếm bản ghi thanh toán. Quan trọng: Đối với Bank Transfer, transId có thể là null ban đầu.
            // Nên ưu tiên tìm bản ghi pending chưa có transId, hoặc bản ghi đã có transId khớp.
            $paymentRecord = Payment::where('booking_id', $bookingId)
                ->where('payment_method', $method)
                ->when($transId, function ($query) use ($transId) {
                    $query->where('transaction_id', $transId);
                }, function ($query) {
                    // Nếu transId là null (như Bank Transfer ban đầu), tìm bản ghi pending chưa có transId
                    $query->whereNull('transaction_id')
                        ->where('internal_status', BookingStatus::PAYMENT_PENDING_GATEWAY);
                })
                ->first();

            if (!$paymentRecord) {
                // Nếu không tìm thấy bản ghi payment nào khớp, có thể tạo mới nếu IPN đến trước
                // hoặc log cảnh báo nếu IPN đến cho một giao dịch không rõ.
                // Log::warning("Không tìm thấy bản ghi thanh toán hiện có cho booking {$bookingId} với transId {$transId}. Đang tạo bản ghi thanh toán mới được khởi tạo bởi IPN (nếu cần).");
                // Trong môi trường thực tế, bạn có thể cần tạo một bản ghi payment mới ở đây
                // nếu IPN là thông báo đầu tiên về giao dịch này.
                // Tuy nhiên, để đơn giản, hiện tại chúng ta sẽ coi đây là lỗi nếu không tìm thấy bản ghi pending.
                return response('OK', 200); // Trả về OK để không khiến webhook retry
            }

            if ($booking->status === BookingStatus::PAID && $paymentRecord->internal_status === BookingStatus::PAYMENT_SUCCESS) {
                // Log::info("IPN đã nhận cho booking đã PAID: {$bookingId} và thanh toán đã xử lý: {$paymentRecord->payment_id}. Bỏ qua.");
                return response('OK', 200);
            }

            $paymentDetails = [
                'transId' => $transId,
                'resultCode' => $ipnData['resultCode'] ?? null,
                'message' => $ipnData['message'] ?? null,
                'amount' => $ipnData['amount'] ?? $booking->total_price,
                'payment_method' => $method,
                'payType' => $ipnData['payType'] ?? null,
                'responseTime' => $ipnData['responseTime'] ?? null,
                'currency' => $ipnData['currency'] ?? 'VND',
                'raw_ipn_data' => $ipnData['raw_ipn_data'] ?? $ipnData,
            ];

            if (isset($paymentDetails['resultCode']) && $paymentDetails['resultCode'] == 0) {
                $this->bookingPaymentService->handleSuccessfulPayment($booking, $paymentDetails, $paymentRecord);
                // Log::info("Booking {$bookingId} đã được cập nhật thành PAID từ IPN qua {$method} cho Payment {$paymentRecord->payment_id}.");
            } else {
                $this->bookingPaymentService->handleFailedPayment($booking, $paymentDetails, $paymentRecord);
                // Log::warning("Booking {$bookingId} đã được cập nhật thành FAILED từ IPN qua {$method} cho Payment {$paymentRecord->payment_id}.");
            }

        } catch (\Throwable $e) {
            //  Log::error("Lỗi xử lý IPN cho booking {$bookingId} qua {$method}: " . $e->getMessage(), ['exception' => $e, 'ipn_data' => $request->all()]);
            return response('Lỗi xử lý IPN: ' . $e->getMessage(), 200);
        }
        return response('OK', 200);
    }

    public function checkTransactionSatus(Request $request)
    {
        $orderId = $request->input('order_id');
        $method = $request->input('payment_method');
        if (empty($orderId) || empty($method)) {
            return ApiResource::error('Thiếu order_id hoặc payment_method.', 400);
        }

        try {
            $gateway = $this->paymentGatewayFactory->getGateway($method);
            $status = $gateway->queryTransactionStatus($orderId);
            $bookingId = str_replace('BOOKING_', '', $orderId);
            $latestPayment = Payment::where('booking_id', $bookingId)
                ->where('payment_method', $method)
                ->latest('payment_completed_at')->first();

            return ApiResource::ok([
                'gateway_status' => $status,
                'internal_payment_record' => $latestPayment ? $latestPayment->toArray() : null,
            ], 'Truy vấn trạng thái giao dịch thành công.');
        } catch (\Throwable $e) {
            // Log::error("Lỗi khi kiểm tra trạng thái giao dịch cho {$orderId} qua {$method}: " . $e->getMessage(), ['exception' => $e]);
            return ApiResource::error('Không thể truy vấn trạng thái giao dịch: ' . $e->getMessage(), 500);
        }
    }
}
