<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Symfony\Component\HttpFoundation\Response;

class CustomThrottleMiddware extends ThrottleRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    protected function buildException($request, $key, $maxAttempts, $responseCallback = null)
    {
        throw new ThrottleRequestsException(
            'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 1 phút.'
        );
    }
}
