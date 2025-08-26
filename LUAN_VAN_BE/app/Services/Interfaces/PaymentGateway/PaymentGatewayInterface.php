<?php

namespace App\Services\Interfaces\PaymentGateway;
use Illuminate\Http\Request;
interface PaymentGatewayInterface
{
    /**
     * Khởi tạo một thanh toán (ví dụ: tạo liên kết thanh toán, trả về hướng dẫn chuyển khoản ngân hàng).
     *
     * @param string $bookingId ID đơn hàng nội bộ.
     * @param int $amount Tổng số tiền thanh toán.
     * @param string $redirectUrl URL mà người dùng được chuyển hướng đến sau khi thanh toán.
     * @param string $ipnUrl URL cho Thông báo thanh toán tức thì/Webhook từ cổng thanh toán.
     * @return array Chi tiết khởi tạo thanh toán (ví dụ: URL thanh toán, hướng dẫn hoặc trạng thái trực tiếp).
     * @throws \Exception Nếu khởi tạo thanh toán thất bại.
     */

    public function createPaymentLink(string $bookingId, int $amount, string $redirectUrl, string $ipnUrl): array;

    /**
     * Truy vấn trạng thái của một giao dịch với cổng thanh toán.
     * Thường được sử dụng để kiểm tra đồng bộ sau khi người dùng chuyển hướng.
     *
     * @param string $orderId ID đơn hàng được sử dụng với cổng thanh toán (ví dụ: BOOKING_XYZ).
     * @return array Chi tiết trạng thái giao dịch (ví dụ: resultCode, message, transId, status).
     * @throws \Exception Nếu truy vấn thất bại hoặc vấn đề xác thực.
     */
    public function queryTransactionStatus(string $orderId): array;

    /**
     * Xử lý callback IPN/Webhook từ cổng thanh toán.
     * Phương thức này được Controller gọi trực tiếp cho IPN.
     * Nó nên xác minh chữ ký và trả về dữ liệu đã được phân tích cú pháp, xác thực.
     *
     * @param Request $request Yêu cầu IPN đến.
     * @return array Dữ liệu IPN đã xử lý (ví dụ: trạng thái giao dịch, orderId, transId, amount, resultCode).
     * @throws \Exception Nếu xác minh IPN thất bại hoặc dữ liệu không hợp lệ.
     */
    public function handleWebhook(Request $request): array;
}
