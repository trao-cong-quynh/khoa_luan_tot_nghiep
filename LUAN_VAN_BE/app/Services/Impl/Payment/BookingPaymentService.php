<?php

namespace App\Services\Impl\Payment;

use App\Constants\BookingStatus;
use App\Jobs\SendOrderConfirmationEmailJob;
use App\Models\Bookings;
use App\Models\Payment;
use App\Services\Impl\QR\QRService;
use App\Services\Interfaces\Payment\BookingPaymentServiceInterface;
use Carbon\Carbon;
use Exception;
use Log;

class BookingPaymentService implements BookingPaymentServiceInterface
{

    protected $qrSerVice;
    public function __construct(QRService $qrSerVice)
    {
        $this->qrSerVice = $qrSerVice;
    }
    public function handleSuccessfulPayment(Bookings $booking, array $paymentDetails, Payment $paymentRecord): bool
    {
        try {
            $paymentRecord->update([
                'transaction_id' => $paymentDetails['transId'] ?? $paymentRecord->transaction_id,
                'gateway_transaction_status_coode' => $paymentDetails['resultCode'] ?? $paymentRecord->gateway_transaction_status_code,
                'gateway_transaction_message' => $paymentDetails['message'] ?? 'Thành công',
                'internal_status' => BookingStatus::PAYMENT_SUCCESS,
                'amount' => $paymentDetails['amount'] ?? $paymentRecord->amount,
                'currency' => $paymentDetails['currency'] ?? $paymentRecord->currency,
                'gateway_response_data' => array_merge($paymentRecord->gateway_response_data ?? [], $paymentDetails),
                'payment_completed_at' => Carbon::now(),
            ]);
            Log::info('da set lai trang thai payment thanh trang thai cua giao dich thanh cong');
            if ($booking->status !== BookingStatus::PAID) {
                $booking->status = BookingStatus::PAID;
                if (empty($booking->qr_code_path)) {
                    $qrCodeData = json_encode([
                        'type' => 'booking',
                        'booking_id' => $booking->booking_id,
                    ]);

                    $fileName = 'qrcodes/booking_' . $booking->booking_id . '.png';
                    $qrCodePath = $this->qrSerVice->createAndSaveQrCode($qrCodeData, $fileName);
                    if ($qrCodePath) {
                        $booking->qr_code_path = $qrCodePath;
                    } else {
                        Log::error("Không thể tạo QR code cho booking từ MoMo return: {$booking->booking_id}");
                        throw new Exception("Không thể tạo QR code cho booking từ MoMo return: {$booking->booking_id}");
                    }
                }
                $booking->save();
                dispatch(new SendOrderConfirmationEmailJob($booking->booking_id));
                Log::info("Booking {$booking->booking_id} update to Paid from MoMo return.");

            } else {
                Log::info("Booking {$booking->booking_id} đã PAID, chỉ có Payment {$paymentRecord->payment_id} được cập nhật.");
            }
            return true;

        } catch (\Throwable $e) {
            Log::error("Lỗi xử lý thanh toán thành công cho Booking {$booking->booking_id}, Payment {$paymentRecord->payment_id}: " . $e->getMessage(), ['exception' => $e, 'payment_details' => $paymentDetails]);
            // Có thể cập nhật bản ghi thanh toán sang trạng thái 'error' nếu dịch vụ này thất bại
            $paymentRecord->update(['internal_status' => 'processing_error']);
            return false;
        }

    }

    public function handleFailedPayment(Bookings $booking, array $paymentDetails, Payment $paymentRecord): bool
    {

        try {
            $paymentRecord->update([
                'transaction_id' => $paymentDetails['transId'] ?? $paymentRecord->transaction_id,
                'gateway_transaction_status_coode' => $paymentDetails['resultCode'] ?? $paymentRecord->gateway_transaction_status_code,
                'gateway_transaction_message' => $paymentDetails['message'] ?? 'Thất bại',
                'internal_status' => BookingStatus::PAYMENT_FAILED,
                'amount' => $paymentDetails['amount'] ?? $paymentRecord->amount,
                'currency' => $paymentDetails['currency'] ?? $paymentRecord->currency,
                'gateway_response_data' => array_merge($paymentRecord->gateway_response_data ?? [], $paymentDetails),
                'payment_completed_at' => Carbon::now(),
            ]);
            Log::info('da set lai trang thai payment thanh trang thai cua giao dich khong thanh cong');

            if ($booking->status === BookingStatus::PENDING) {
                $booking->status = BookingStatus::FAILED;
                $booking->save();
                Log::warning("Booking {$booking->booking_id} successfully updated to FAILED.");
            } else {
                Log::info("Trạng thái Booking {$booking->booking_id} là '{$booking->status}', không thay đổi thành FAILED. Payment {$paymentRecord->payment_id} được ghi là FAILED.");
            }

            return true;

        } catch (\Throwable $e) {
            Log::error("Lỗi xử lý thanh toán thất bại cho Booking {$booking->booking_id}, Payment {$paymentRecord->payment_id}: " . $e->getMessage(), ['exception' => $e, 'payment_details' => $paymentDetails]);
            // Có thể cập nhật bản ghi thanh toán sang trạng thái 'error' nếu dịch vụ này thất bại
            $paymentRecord->update(['internal_status' => 'processing_error']);
            return false;
        }

    }
}
