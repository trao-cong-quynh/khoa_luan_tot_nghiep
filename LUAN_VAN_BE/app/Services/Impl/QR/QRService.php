<?php

namespace App\Services\Impl\QR;

use App\Services\Interfaces\QR\QrServiceInterface;
use Illuminate\Support\Facades\Storage;
use Log;
use SimpleSoftwareIO\QrCode\Facades\QrCode;


class QRService implements QrServiceInterface
{
    public function createAndSaveQrCode(string $data, string $filename, int $size = 200)
    {
        try {
            $directory = dirname($filename);
            if (!Storage::disk('public')->exists($directory)) {
                Storage::disk('public')->makeDirectory($directory);
            }

            $path = Storage::disk('public')->path($filename);
            QrCode::format('png')->size($size)->generate($data, $path);

            return Storage::url($filename);

        } catch (\Throwable $e) {
            Log::error("Tạo và lưu mã QR thất bại: {$e->getMessage()}", [
                'data' => $data,
                'fileName' => $filename,
                'exception' => $e,
            ]);
            return null;
        }
    }
}
