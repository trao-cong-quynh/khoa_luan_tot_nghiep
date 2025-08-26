<?php

return [
    'partner_code ' => env('MOMO_PARTNER_CODE'),
    'access_key' => env('MOMO_ACCESS_KEY'),
    'secret_key' => env('MOMO_SECRET_KEY'),
    'endpoint' => env('MOMO_ENDPOINT'),
    'frontend_redirect_url' => env('MOMO_FRONTEND_REDIRECT_URL'),
    'api_handle_return_momo' => env('MOMO_API_HANDLE_RETURN', 'http://127.0.0.1:8000/api/payment/momo/return'),
    'api_ipn_momo' => env('MOMO_API_IPN'),
];
