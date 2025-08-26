<?php

namespace App\Services\PaymentGateway;

use App\Services\Interfaces\PaymentGateway\PaymentGatewayInterface;
use App\Services\Interfaces\MoMo\MoMoServiceInterface;
use App\Services\Interfaces\Onepay\OnepayServiceInterface;
use Exception;
class PaymentGatewayFactory
{
    public function getGateway(string $method): PaymentGatewayInterface
    {
        switch (strtolower($method)) {
            case 'momo':
                return app(MoMoServiceInterface::class);
            case 'onepay': // Thêm case cho OnePAY
                return app(OnepayServiceInterface::class);
            default:
                throw new Exception("Phương thức thanh toán '{$method}' không được hỗ trợ.");
        }
    }
}
