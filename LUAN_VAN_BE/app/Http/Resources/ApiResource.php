<?php

namespace App\Http\Resources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Response;

class ApiResource extends JsonResource
{
    private const TIMESTAMP = 'Y-m-d\TH:i:s.v\Z';

    public static function ok(mixed $data = null, string $message = '', $httpStatus = Response::HTTP_OK): JsonResponse
    {
        return response()->json([
            'status' => true,
            'code' => $httpStatus,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->format(self::TIMESTAMP),
        ], $httpStatus);
    }

    public static function error(mixed $errors = null, string $message = '', $httpStatus = Response::HTTP_INTERNAL_SERVER_ERROR): JsonResponse
    {
        return response()->json([
            'status' => false,
            'code' => $httpStatus,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => now()->format(self::TIMESTAMP),
        ], $httpStatus);
    }

    public static function message(string $message = '', $httpStatus = Response::HTTP_OK): JsonResponse
    {
        return response()->json([
            'status' => $httpStatus === Response::HTTP_OK || $httpStatus === Response::HTTP_ACCEPTED || $httpStatus === Response::HTTP_CREATED,
            'code' => $httpStatus,
            'message' => $message,
            'timestamp' => now()->format(self::TIMESTAMP),
        ], $httpStatus);
    }

}
