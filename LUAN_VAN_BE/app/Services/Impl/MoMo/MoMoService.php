<?php

namespace App\Services\Impl\MoMo;

use App\Jobs\SendOrderConfirmationEmailJob;
use App\Models\Bookings;
use App\Services\Interfaces\MoMo\MoMoServiceInterface;
use App\Services\Interfaces\Payment\BookingPaymentServiceInterface as BookingPaymentService;
use App\Services\Interfaces\QR\QrServiceInterface as QrSerVice;
use Exception;
use Illuminate\Support\Facades\Http;
use Log;
use Illuminate\Http\Request;

class MoMoService implements MoMoServiceInterface
{

    protected $endpoint;
    protected $accessKey;
    protected $secretKey;
    protected $partnerCode;
    protected $qrSerVice;
    protected $bookingPaymentService;
    public function __construct(QrSerVice $qrSerVice, BookingPaymentService $bookingPaymentService)
    {
        $this->endpoint = config('momo.endpoint');
        $this->accessKey = trim(config('momo.access_key'));
        $this->secretKey = trim(config('momo.secret_key'));
        $this->partnerCode = trim(config('momo.partner_code '));

        $this->bookingPaymentService = $bookingPaymentService;
    }
    public function createPaymentLink(string $bookingId, int $amount, string $redirectUrl, string $ipnUrl): array
    {
        $booking = Bookings::find($bookingId);
        if ($booking->status !== 'pending') {
            throw new \Exception('Đơn hàng không hợp lệ hoặc đã thanh toán');
        }

        $orderId = 'BOOKING_' . $bookingId;
        $requestId = uniqid();
        $orderInfo = "Thanh toán đơn hàng #$bookingId";
        // $redirectUrl = config('momo.api_handle_return_momo') . "?orderId=$orderId";
        // $ipnUrl = route('momo.ipn');
        // $ipnUrl = config('momo.api_ipn_momo') . '/api/payment/momo/ipn';
        $extraData = '';
        // dd($this->accessKey, $amount, $extraData, $ipnUrl, $orderId, $orderInfo, $this->partnerCode, $redirectUrl, $requestId);
        $rawHash = "accessKey={$this->accessKey}&amount={$amount}&extraData={$extraData}&ipnUrl={$ipnUrl}&orderId={$orderId}&orderInfo={$orderInfo}&partnerCode={$this->partnerCode}&redirectUrl={$redirectUrl}&requestId={$requestId}&requestType=payWithMethod";

        $signature = hash_hmac('sha256', $rawHash, $this->secretKey);

        $payload = [
            'partnerCode' => $this->partnerCode,
            'partnerName' => "MoMo",
            'storeId' => 'MomoTestStore',
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $orderId,
            'orderInfo' => $orderInfo,
            'ipnUrl' => $ipnUrl,
            'lang' => 'vi',
            'redirectUrl' => $redirectUrl,
            'extraData' => $extraData,
            'signature' => $signature,
            'requestType' => 'payWithMethod',
            'autoCapture' => true
        ];
        try {
            $response = Http::post($this->endpoint, $payload)->json();
        } catch (\Throwable $e) {
            Log::error('Gọi API MoMo thất bại: ' . $e->getMessage(), ['exception' => $e, 'payload' => $payload]);
            throw new Exception('Lỗi kết nối đến cổng thanh toán MoMo.');
        }

        if (!isset($response['payUrl'])) {
            // Log::error('MoMo response error', $response);
            throw new \Exception('Không thể tạo thanh toán với MoMo');
        }

        return $response;
    }

    public function handleWebhook(Request $request): array
    {
        // $orserId = $request->input('orderId');
        // $bookingId = str_replace('BOOKING_', '', $orserId);
        // $booking = Bookings::find($bookingId);

        // if (!$booking || $booking->status === 'paid')
        //     return;

        $rawHash = "accessKey={$this->accessKey}&amount={$request->amount}&extraData={$request->extraData}&message={$request->message}&orderId={$request->orderId}&orderInfo={$request->orderInfo}&orderType={$request->orderType}&partnerCode={$this->partnerCode}&payType={$request->payType}&requestId={$request->requestId}&responseTime={$request->responseTime}&resultCode={$request->resultCode}&transId={$request->transId}";

        $signature = hash_hmac('sha256', $rawHash, $this->secretKey);

        if ($signature !== $request->input('signature')) {
            Log::warning("Chữ ký IPN MoMo không khớp. Dự kiến: {$signature}, Nhận được: {$request->input('signature')}. Dữ liệu IPN: " . json_encode($request->all()));
            throw new Exception('Chữ ký IPN MoMo không khớp');
        }

        // if ($request->resultCode == 0) {

        //     $this->bookingPaymentService->handleSuccessfulPayment($booking);
        // } else {
        //     $this->bookingPaymentService->handleFailedPayment($booking);

        // }
        return [
            'transId' => $request->transId,
            'orderId' => $request->orderId,
            'amount' => $request->amount,
            'resultCode' => $request->resultCode,
            'message' => $request->message,
            'payType' => $request->payType,
            'responseTime' => $request->responseTime,
            'payment_method' => 'momo',
            'raw_ipn_data' => $request->all(), 
        ];

    }

    public function queryTransactionStatus(string $orderId): array
    {
        $requestId = uniqid();
        $rawHash = "accessKey={$this->accessKey}&orderId={$orderId}&partnerCode={$this->partnerCode}&requestId={$requestId}";
        $signature = hash_hmac('sha256', $rawHash, $this->secretKey);

        $payload = [
            'partnerCode' => $this->partnerCode,
            'requestId' => $requestId,
            'orderId' => $orderId,
            'requestType' => 'transactionStatus',
            'signature' => $signature,
            'lang' => 'vi'
        ];

        try {
            $response = Http::post('https://test-payment.momo.vn/v2/gateway/api/query', $payload)->json();
        } catch (\Throwable $e) {
            Log::error('Gọi API truy vấn MoMo thất bại: ' . $e->getMessage(), ['exception' => $e, 'payload' => $payload]);
            throw new Exception('Lỗi kết nối khi truy vấn trạng thái MoMo.');
        }
        if (!isset($response['resultCode'])) {
            Log::error('Lỗi truy vấn trạng thái MoMo: thiếu resultCode', $response);
            throw new Exception('Không thể truy vấn trạng thái giao dịch MoMo: ' . ($response['message'] ?? 'Lỗi không xác định'));
        }

        return $response;
    }

}
