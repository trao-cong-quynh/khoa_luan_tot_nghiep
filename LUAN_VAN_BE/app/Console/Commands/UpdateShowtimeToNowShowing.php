<?php

namespace App\Console\Commands;

use App\Constants\ShowTimeStatus;
use App\Models\ShowTimes;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateShowtimeToNowShowing extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'showtimes:update-to-now-showing {--chunk=100}';

    /**
     * The console command description.
     */
    protected $description = 'Cập nhật trạng thái các suất chiếu từ UPCOMING sang NOW_SHOWING khi đến giờ chiếu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info("Bắt đầu cập nhật trạng thái suất chiếu sang NOW_SHOWING...");

        $now = Carbon::now();
        $chunkSize = (int) $this->option('chunk');
        $chunkSize = max($chunkSize, 100);

        $query = ShowTimes::where('status', ShowTimeStatus::UPCOMING->value)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now);

        $countToUpdate = $query->count();
        $this->info("Tìm thấy {$countToUpdate} suất chiếu cần chuyển sang NOW_SHOWING.");
        Log::info("Tìm thấy {$countToUpdate} suất chiếu cần cập nhật sang NOW_SHOWING.");

        if ($countToUpdate === 0) {
            return Command::SUCCESS;
        }

        $totalUpdated = 0;

        $query->chunkById($chunkSize, function ($showtimes) use (&$totalUpdated) {
            foreach ($showtimes as $showtime) {
                $currentStatus = ShowTimeStatus::from($showtime->status);
                $targetStatus = ShowTimeStatus::NOW_SHOWING;

                if (ShowTimeStatus::canTransition($currentStatus, $targetStatus)) {
                    $showtime->status = $targetStatus->value;
                    $showtime->save();
                    $totalUpdated++;
                    Log::info("Cập nhật suất chiếu #{$showtime->showtime_id} sang NOW_SHOWING.");
                } else {
                    Log::warning("Không thể chuyển trạng thái suất chiếu #{$showtime->showtime_id} từ {$currentStatus->value} sang NOW_SHOWING.");
                }
            }
            $this->info("Đã xử lý xong một lô. Tổng đã cập nhật: {$totalUpdated}");
        });

        $this->info("Đã hoàn tất cập nhật. Tổng cộng {$totalUpdated} suất chiếu chuyển sang NOW_SHOWING.");

        return Command::SUCCESS;
    }
}
