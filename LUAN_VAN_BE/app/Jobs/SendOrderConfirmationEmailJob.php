<?php

namespace App\Jobs;

use App\Mail\OrderConfirmationMail;
use App\Models\Bookings;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Log;
use Mail;

class SendOrderConfirmationEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $bookingId;

    /**
     * Create a new job instance.
     */
    public function __construct(string $bookingId)
    {
        $this->bookingId = $bookingId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $booking = Bookings::with('users')->find($this->bookingId);
            if (!$booking) {
                Log::warning("Booking ID {$this->bookingId} not found for email sending.");
                return;
            }
            // Kiểm tra xem mối quan hệ 'users' có null không
            if (!$booking->users) {
                Log::error("User not found for Booking ID: {$this->bookingId}. Cannot send email.");
                return;
            }

            if ($booking->status !== 'paid') {
                Log::warning("Booking ID {$this->bookingId} is not in 'paid' status, skipping email sending.");
                return;
            }
            Log::info("Order confirmation email sent for booking ID: {$this->bookingId} to {$booking->users->email}");
            Mail::to($booking->users->email)->send(new OrderConfirmationMail($booking));


        } catch (\Throwable $e) {
            Log::error("Không gửi được email xác nhận đơn hàng cho ID: {$this->bookingId}. Error: {$e->getMessage()}", [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
