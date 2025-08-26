<?php

namespace App\Console\Commands;

use App\Constants\ShowTimeStatus;
use App\Models\ShowTimes;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Log;

class UpdateShowtimeStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'showtimes:updatte-status {--chunk=100}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật trạng thái các suất chiếu đã kết thúc, tối ưu theo số lượng bản ghi.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::info("Bắt đầu cập nhật trạng thái suất chiếu (an toàn có kiểm tra canTransition).");

        $now = Carbon::now();
        $chunkSize = (int) $this->option('chunk');
        $chunkSize = max($chunkSize, 100); // đảm bảo chunk >= 100
        $totalUpdate = 0;

        try {
            $query = ShowTimes::whereIn('status', [
                ShowTimeStatus::UPCOMING->value,
                ShowTimeStatus::NOW_SHOWING->value,
            ])
                ->where('end_time', '<', $now);

            $countToUpdate = $query->count();
            $this->info("Tìm thấy {$countToUpdate} suất chiếu cần cập nhật.");
            Log::info("Tìm thấy {$countToUpdate} suất chiếu cần cập nhật.");

            if ($countToUpdate === 0) {
                return Command::SUCCESS;
            }

            $query->chunkById($chunkSize, function ($showtimes) use (&$totalUpdate) {
                foreach ($showtimes as $showtime) {
                    $currentStatus = ShowTimeStatus::from($showtime->status);
                    $targetStatus = ShowTimeStatus::FINISHED;

                    if (ShowTimeStatus::canTransition($currentStatus, $targetStatus)) {
                        $showtime->status = $targetStatus->value;
                        $showtime->save();
                        $totalUpdate++;
                        Log::info("Cập nhật suất chiếu #{$showtime->showtime_id} sang FINISHED.");
                    } else {
                        Log::warning("Không thể chuyển trạng thái suất chiếu #{$showtime->showtime_id} từ {$currentStatus->value} sang FINISHED.");
                    }
                }

                $this->info("Xử lý xong một lô. Tổng đã cập nhật: {$totalUpdate}");
            });

            $this->info("Đã cập nhật {$totalUpdate} suất chiếu sang trạng thái FINISHED.");
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            Log::error("Lỗi cập nhật trạng thái suất chiếu: " . $e->getMessage(), [
                'exception' => $e,
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);
            $this->error('Lỗi khi chạy lệnh: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }

}
