<?php

namespace App\Services\Interfaces\QR;

interface QrServiceInterface
{
  public function createAndSaveQrCode(string $data, string $filename, int $size = 200);
}
