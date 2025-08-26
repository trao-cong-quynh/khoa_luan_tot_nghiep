<?php

namespace App\Services\Impl\Onepay;

use App\Services\Interfaces\Onepay\OnepayServiceInterface;
use Http;
use Illuminate\Http\Request;
use Log;

class OnepayService implements OnepayServiceInterface
{
    protected $config;
    protected $isProduction;

    public function __construct()
    {
        $this->config = config('onepay');
        $this->isProduction = (env('APP_ENV') === 'production');
    }


    protected function generateHash(array $params): string
    {
        $stringHashData = "";
        ksort($params); // Sắp xếp theo thứ tự alphabet

        foreach ($params as $key => $value) {

            if ((strlen($value) > 0) && ((substr($key, 0, 4) == "vpc_") || (substr($key, 0, 5) == "user_"))) {
                $stringHashData .= $key . "=" . $value . "&";
            }
        }
        $stringHashData = rtrim($stringHashData, "&");
        return strtoupper(hash_hmac('SHA256', $stringHashData, pack('H*', $this->config['secure_secret'])));
    }


    protected function formatAmount(float $amount): int
    {
        return (int) ($amount * 100);
    }


    protected function parseAmount(int $amount): float
    {
        return (float) ($amount / 100);
    }

    public function createPaymentLink(string $orderId, int $amount, string $returnUrl, string $ipnUrl): array
    {
        $paymentUrl = $this->isProduction
            ? $this->config['payment_url_domestic_production']
            : $this->config['payment_url_domestic_test'];

        $pureOrderId = str_starts_with($orderId, 'BOOKING_') ? substr($orderId, 8) : $orderId;

        $merchTxnRef = $pureOrderId;

        $orderInfo = 'ThanhToan_' . substr(str_replace('-', '', $pureOrderId), 0, 10);
        $orderInfo = substr($orderInfo, 0, 34);

        $params = [
            'vpc_Version' => $this->config['version'],
            'vpc_Command' => $this->config['command_pay'],
            'vpc_AccessCode' => $this->config['access_code_domestic'],
            'vpc_Merchant' => $this->config['merchant_id_domestic'],
            'vpc_Locale' => $this->config['locale'],
            'vpc_ReturnURL' => $returnUrl,
            'vpc_MerchTxnRef' => $merchTxnRef,
            'vpc_OrderInfo' => $orderInfo,
            'vpc_Amount' => $this->formatAmount($amount),
            'vpc_Currency' => $this->config['currency'],
        ];

        $params['vpc_SecureHash'] = $this->generateHash($params);

        $redirectUrl = $paymentUrl . '?' . http_build_query($params);

        Log::info("OnePAY Payment Request Params: ", $params);
        Log::info("OnePAY Payment Link Created: " . $redirectUrl);

        return [
            'payUrl' => $redirectUrl,
            'method' => 'onepay',
            'orderId' => $orderId,
            'amount' => $amount,
            'merchTxnRef' => $merchTxnRef,
            'orderInfo' => $orderInfo,
        ];
    }


    public function handleWebhook(Request $request): array
    {
        $ipnData = $request->all();
        Log::info("OnePAY IPN Raw Data: ", $ipnData);

        $vpc_Txn_Secure_Hash = $ipnData["vpc_SecureHash"] ?? null;
        unset($ipnData["vpc_SecureHash"]);

        $isValidHash = false;
        if (
            strlen($this->config['secure_secret']) > 0 && isset($ipnData["vpc_TxnResponseCode"]) &&
            $ipnData["vpc_TxnResponseCode"] != "7" && $ipnData["vpc_TxnResponseCode"] != "No Value Returned"
        ) {
            $calculatedHash = $this->generateHash($ipnData);

            if (strtoupper($vpc_Txn_Secure_Hash) == $calculatedHash) {
                $isValidHash = true;
            }
        }

        $resultCode = $ipnData['vpc_TxnResponseCode'] ?? 'UNKNOWN';
        $message = $this->getResponseDescription($resultCode);

        if (!$isValidHash) {
            Log::warning("OnePAY IPN Hash Validation Failed for Order: " . ($ipnData['vpc_MerchTxnRef'] ?? 'N/A') . ". Calculated: " . ($calculatedHash ?? 'N/A') . ", Received: " . ($vpc_Txn_Secure_Hash ?? 'N/A'));
        }

        return [
            'orderId' => $ipnData['vpc_MerchTxnRef'] ?? null,
            'transId' => $ipnData['vpc_TransactionNo'] ?? null,
            'resultCode' => $resultCode,
            'message' => $message,
            'amount' => $this->parseAmount($ipnData['vpc_Amount'] ?? 0),
            'currency' => $ipnData['vpc_Currency'] ?? $this->config['currency'],
            'raw_ipn_data' => $ipnData,
            'is_hash_valid' => $isValidHash,
        ];
    }

    public function queryTransactionStatus(string $orderId): array
    {
        $pureOrderId = str_starts_with($orderId, 'BOOKING_') ? substr($orderId, 8) : $orderId;

        $queryUrl = $this->isProduction ? $this->config['query_url_domestic_production'] : $this->config['query_url_domestic_test'];

        $params = [
            'vpc_Version' => $this->config['version'],
            'vpc_Command' => $this->config['command_query'],
            'vpc_AccessCode' => $this->config['access_code_domestic'],
            'vpc_Merchant' => $this->config['merchant_id_domestic'],
            'vpc_MerchTxnRef' => $pureOrderId,
            'vpc_User' => $this->config['query_user'],
            'vpc_Password' => $this->config['query_password'],
        ];

        $secureHash = $this->generateHash($params);
        $params['vpc_SecureHash'] = $secureHash;
        try {
            $response = Http::asForm()->post($queryUrl, $params); // asForm() tự động đặt header 'application/x-www-form-urlencoded'
            $responseData = $response->body();

            parse_str($responseData, $parsedResponse);

            Log::info("OnePAY Query Status Raw Response for {$orderId}: " . $responseData);
            Log::info("OnePAY Query Status Parsed Response for {$orderId}: ", $parsedResponse);

            $vpc_Txn_Secure_Hash = $parsedResponse["vpc_SecureHash"] ?? null;
            unset($parsedResponse["vpc_SecureHash"]);

            $isValidHash = false;
            if (
                strlen($this->config['secure_secret']) > 0 && isset($parsedResponse["vpc_TxnResponseCode"]) &&
                $parsedResponse["vpc_TxnResponseCode"] != "7" && $parsedResponse["vpc_TxnResponseCode"] != "No Value Returned"
            ) {
                $calculatedHash = $this->generateHash($parsedResponse);
                if (strtoupper($vpc_Txn_Secure_Hash) == $calculatedHash) {
                    $isValidHash = true;
                }
            }

            if (!$isValidHash) {
                Log::warning("OnePAY Query Hash Validation Failed for Order: " . $orderId . ". Calculated: " . ($calculatedHash ?? 'N/A') . ", Received: " . ($vpc_Txn_Secure_Hash ?? 'N/A'));
            }

            $resultCode = $parsedResponse['vpc_TxnResponseCode'] ?? 'UNKNOWN';
            $message = $this->getResponseDescription($resultCode);

            return [
                'orderId' => $parsedResponse['vpc_MerchTxnRef'] ?? $orderId,
                'transId' => $parsedResponse['vpc_TransactionNo'] ?? null,
                'resultCode' => $resultCode,
                'message' => $message,
                'amount' => $this->parseAmount($parsedResponse['vpc_Amount'] ?? 0),
                'currency' => $parsedResponse['vpc_Currency'] ?? $this->config['currency'],
                'raw_gateway_response' => $parsedResponse,
                'is_hash_valid' => $isValidHash,
            ];

        } catch (\Exception $e) {
            Log::error("Error querying OnePAY transaction status for {$orderId}: " . $e->getMessage(), ['exception' => $e]);
            return [
                'orderId' => $orderId,
                'transId' => null,
                'resultCode' => 'INTERNAL_ERROR',
                'message' => 'Lỗi truy vấn trạng thái: ' . $e->getMessage(),
                'amount' => 0,
                'currency' => $this->config['currency'],
                'raw_gateway_response' => [],
                'is_hash_valid' => false,
            ];
        }
    }

    protected function getResponseDescription(string $responseCode): string
    {
        switch ($responseCode) {
            case "0":
                return "Giao dịch thành công - Approved";
            case "1":
                return "Ngân hàng từ chối giao dịch - Bank Declined";
            case "3":
                return "Mã đơn vị không tồn tại - Merchant not exist";
            case "4":
                return "Không đúng access code - Invalid access code";
            case "5":
                return "Số tiền không hợp lệ - Invalid amount";
            case "6":
                return "Mã tiền tệ không tồn tại - Invalid currency code";
            case "7":
                return "Lỗi không xác định - Unspecified Failure";
            case "8":
                return "Số thẻ không đúng - Invalid card Number";
            case "9":
                return "Tên chủ thẻ không đúng - Invalid card name";
            case "10":
                return "Thẻ hết hạn/Thẻ bị khóa - Expired Card";
            case "11":
                return "Thẻ chưa đăng ký sử dụng dịch vụ - Card Not Registed Service(internet banking)";
            case "12":
                return "Ngày phát hành/Hết hạn không đúng - Invalid card date";
            case "13":
                return "Vượt quá hạn mức thanh toán - Exist Amount";
            case "21":
                return "Số tiền không đủ để thanh toán - Insufficient fund";
            case "99":
                return "Người sử dụng hủy giao dịch - User cancel";
            default:
                return "Giao dịch thất bại - Failured";
        }
    }
}
