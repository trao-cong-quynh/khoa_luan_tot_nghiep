<?php

namespace App\Console\Commands;

use App\Constants\BookingStatus;
use App\Models\Bookings;
use Carbon\Carbon;
use DB;
use Illuminate\Console\Command;
use Log;

class CancelPendingBooking extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'booking:cancel-pending {--chunk=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hủy các đơn hàng đang chờ thanh toán quá hạn và giải phóng ghế.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info('Bắt đầu chạy lệnh huy đơn hàng chờ thanh toán quá hạn.');
        $now = Carbon::now();
        $cancellationMinutes = config('cinema.pending_booking_cancellation_minutes');
        $cutoffTime = $now->subMinutes($cancellationMinutes);
        $chunkSize = (int) $this->option('chunk');
        if ($chunkSize < 0) {
            $chunkSize = 100;
        }

        $batchThreshold = config('cinema.showtime_update_batch_threshold', 500);
        $totalCancelledBooking = 0;

        try {
            $query = Bookings::where('status', BookingStatus::PENDING->value)
                ->where('booking_date', '<', $cutoffTime);

            $countTotalCancel = $query->count();
            $this->info("Tìm thấy {$countTotalCancel} đơn hàng chờ thanh toán quá hạn.");
            Log::info("Tìm thấy {$countTotalCancel} đơn hàng chờ thanh toán quá hạn.");

            if ($countTotalCancel === 0) {
                $this->info("Không có đơn hàng chờ thanh toán nào cần hủy.");
                Log::info("Không có đơn hàng chờ thanh toán nào cần hủy.");
                return Command::SUCCESS;
            }


            if ($countTotalCancel < $batchThreshold) {
                $totalCancelledBooking = $query->update(['status' => BookingStatus::CANCELLED]);
                $this->info("Đã hủy {$totalCancelledBooking} đơn hàng bằng phương pháp hàng loạt.");
                Log::info("Đã hủy {$totalCancelledBooking} đơn hàng bằng phương pháp hàng loạt.");

            } else {
                $this->info("Số lượng bản ghi lớn {$countTotalCancel} > {$batchThreshold}. Sử dụng phương pháp cập nhật theo lô (chunk size: {$chunkSize}).");
                Log::info("Số lượng bản ghi lớn. Sử dụng phương pháp cập nhật theo lô (chunk size: {$chunkSize}).");

                $query->chunkById($chunkSize, function ($bookings) use (&$totalCancelledBooking) {
                    foreach ($bookings as $booking) {
                        $booking->status = BookingStatus::CANCELLED->value;
                        $booking->save();
                        $totalCancelledBooking++;
                    }
                    $this->info("Đã xử lý xong một lô {$bookings->count()} đơn hàng. Tổng đơn hàng hủy: {$totalCancelledBooking}");
                    Log::info("Đã xử lý xong một lô {$bookings->count()} đơn hàng. Tổng đơn hàng hủy: {$totalCancelledBooking}");

                });
                $this->info("Hoàn tất hủy đơn hàng. Tổng số đơn hàng được hủy: {$totalCancelledBooking}.");
                Log::info("Hoàn tất lệnh hủy đơn hàng. Tổng số đơn hàng được hủy: {$totalCancelledBooking}.");
                return Command::SUCCESS;
            }
        } catch (\Exception $e) {
            $this->error('Đã xảy ra lỗi khi hủy đơn hàng. ' . $e->getMessage());
            Log::error('Lỗi khi chạy lệnh hủy đơn hàng: ' . $e->getMessage(), [
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return Command::FAILURE;
        }
    }
}
