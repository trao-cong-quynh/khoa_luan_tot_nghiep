<?php

namespace App\Services\Interfaces\MoMo;

use App\Services\Interfaces\PaymentGateway\PaymentGatewayInterface;
use Illuminate\Http\Request;


interface MoMoServiceInterface extends PaymentGatewayInterface
{
    //     public function createpayment(string $bookingid, int $mount);
    // public function handleIpn(Request $request);



    // public function queryTransactionStatus(string $orderid);
}
