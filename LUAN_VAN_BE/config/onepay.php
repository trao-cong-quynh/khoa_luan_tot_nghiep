<?php

return [
    'secure_secret' => env('ONEPAY_SECURE_SECRET', 'A3EFDFABA8653DF2342E8DAC29B51AF0'),
    'merchant_id_domestic' => env('ONEPAY_MERCHANT_ID_DOMESTIC', 'ONEPAY'),
    'access_code_domestic' => env('ONEPAY_ACCESS_CODE_DOMESTIC', 'D67342C2'),

    // CẬP NHẬT CÁC URL SAU ĐÂY DỰA TRÊN TÀI LIỆU MỚI BẠN CUNG CẤP
    'payment_url_domestic_test' => env('PAYMENT_URL_DOMESTIC_TEST','https://mtf.onepay.vn/paygate/vpcpay.op'),
    'query_url_domestic_test' => env('QUERY_URL_DOMESTIC_TEST','https://mtf.onepay.vn/msp/api/v1/vpc/invoices/queries'),

    'payment_url_domestic_production' => env('ONEPAY_PAYMENT_URL_DOMESTIC_PROD', 'https://onepay.vn/paygate/vpcpay.op'),
    'query_url_domestic_production' => env('ONEPAY_QUERY_URL_DOMESTIC_PROD', 'https://onepay.vn/msp/api/v1/vpc/invoices/queries'),

    // Cấu hình chung
    'locale' => 'vn',
    'currency' => 'VND',
    'version' => '2',
    'command_pay' => 'pay',
    'command_query' => 'queryDR',
    'query_user' => 'op01',
    'query_password' => 'op123456',
];
