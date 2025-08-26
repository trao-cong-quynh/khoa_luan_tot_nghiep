<?php

namespace App\Constants;

enum BookingStatus: string
{
    case PENDING = 'pending'; // Chờ thanh toán
    case PAID = 'paid';       // Đã thanh toán
    case CANCELLED = 'cancelled'; // Đã hủy
    
    case ACTIVE = 'active';   // Đơn hàng đang diễn ra (suất chiếu đã bắt đầu)
    case COMPLETED = 'finished'; // Đơn hàng đã hoàn thành (suất chiếu đã kết thúc)
    case FAILED = 'failed';   // Thanh toán thất bại
    case REFUNDED = 'refunded'; // Đơn hàng đã được thanh toán, nhưng sau đó được hoàn tiền
    case PENDING_COUNTER_PAYMENT = 'pending_counter_payment';
    // Các trạng thái cho bản ghi 'payments' nội bộ
    case PAYMENT_PENDING_GATEWAY = 'pending_gateway'; // Yêu cầu thanh toán đã gửi đến cổng
    public const PAYMENT_SUCCESS = 'paid';                 // Cổng xác nhận thanh toán thành công
    public const PAYMENT_FAILED = 'failed';               // Cổng xác nhận thanh toán thất bại
    case PAYMENT_PENDING_VERIFICATION = 'pending_manual_verification'; // Đối với chuyển khoản ngân hàng, cần kiểm tra thủ công
    public const PAYMENT_REFUNDED = 'refunded';          // Thanh toán đã được hoàn tiền
    public static function bookedStatus(): array
    {

        return [
            self::PENDING->value,
            self::PAID->value,
            self::ACTIVE->value,
        ];
    }

    public static function permanentBookedStatus(): array
    {

        return [
            self::PAID->value,
            self::ACTIVE->value,
            self::COMPLETED->value,
        ];
    }

    public function canTransitionTo(self $target): bool
    {
        $transitions = match ($this) {
            self::PENDING => [self::PAID, self::CANCELLED, self::FAILED],
            self::PAID => [self::ACTIVE, self::REFUNDED, self::CANCELLED],
            self::ACTIVE => [self::COMPLETED, self::REFUNDED],
            self::COMPLETED => [],
            self::CANCELLED => [],
            self::FAILED => [],
            self::REFUNDED => [],

                // Trạng thái của payment không áp dụng cho booking
            self::PAYMENT_PENDING_GATEWAY,
            self::PAYMENT_PENDING_VERIFICATION => [], // Nếu dùng riêng cho bảng payments
        };

        return in_array($target, $transitions, strict: true);
    }

}
