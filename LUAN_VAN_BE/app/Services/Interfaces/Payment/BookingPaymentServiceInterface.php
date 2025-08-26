<?php

namespace App\Services\Interfaces\Payment;

use App\Models\Bookings;
use App\Models\Payment;

interface BookingPaymentServiceInterface
{
    public function handleSuccessfulPayment(Bookings $booking, array $paymentDetails, Payment $paymentRecord): bool;

    public function handleFailedPayment(Bookings $booking, array $paymentDetails, Payment $paymentRecord): bool;
}
