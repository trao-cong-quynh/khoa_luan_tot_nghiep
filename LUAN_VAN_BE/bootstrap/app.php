<?php

use App\Http\Resources\ApiResource;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Exceptions\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Carbon\Carbon;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        channels: null,
    )
    ->withSchedule(function (Schedule $schedule) {
        $chunkSize = config('cinema.chunk_size', 100);
        $schedule->command("showtimes:updatte-status --chunk={$chunkSize}")->everyTenMinutes();
        $schedule->command("booking:cancel-pending --chunk={$chunkSize}")->everyTenMinutes();
        $schedule->command("showtimes:update-to-now-showing --chunk={$chunkSize}")->everyTenMinutes();
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'throttle' => \App\Http\Middleware\CustomThrottleMiddware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // 401 Unauthorized
        $exceptions->render(function (AuthenticationException $th, Request $request) {
            return ApiResource::message(
                $th->getMessage() ?: 'Bạn không có quyền truy cập.',
                Response::HTTP_UNAUTHORIZED
            );
        });


        // 403 Forbidden
        $exceptions->render(function (UnauthorizedException $th, Request $request) {
            return ApiResource::message(
                'Bạn không có quyền thực hiện hành động này.',
                Response::HTTP_FORBIDDEN
            );
        });

        // 400 Bad Request
        $exceptions->render(function (InvalidArgumentException $th, Request $request) {
            return ApiResource::message(
                $th->getMessage() ?: 'Dữ liệu yêu cầu không hợp lệ.',
                Response::HTTP_BAD_REQUEST
            );
        });

        // 404 Not Found
        $exceptions->render(function (NotFoundHttpException $th, Request $request) {
            return ApiResource::message(
                $th->getMessage() ?: 'Không tìm thấy tài nguyên.',
                Response::HTTP_NOT_FOUND
            );
        });

        // 500 Internal Server Error
        $exceptions->render(function (Throwable $th, Request $request) {
            if (config('app.debug')) {
                return response()->json([
                    'status' => false,
                    'code' => method_exists($th, 'getStatusCode') ? $th->getStatusCode() : Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => $th->getMessage(),
                    'exception' => get_class($th),
                    'file' => $th->getFile(),
                    'line' => $th->getLine(),
                    'trace' => collect($th->getTrace())->map(function ($trace) {
                        return Arr::except($trace, ['args']);
                    })->all(),
                    'timestamp' => Carbon::now()->toIso8601String(),
                ]);
            }

            return ApiResource::message(
                'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        });
        $exceptions->render(function (ValidationException $th, Request $request) {
            return response()->json([
                'status' => false,
                'code' => 422,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $th->errors(),
            ], 422);
        });


        // $exceptions->render(function (ThrottleRequestsException $th, Request $request) {
        //     return ApiResource::message('Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút.', Response::HTTP_TOO_MANY_REQUESTS);
        // });

        $exceptions->report(function (Throwable $e) {
            // Có thể log hoặc gửi tới Sentry nếu cần
        });
    })->create();
