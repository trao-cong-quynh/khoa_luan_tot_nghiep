<?php

namespace App\Http\Controllers\Api\V1\Promotion;

use App\Http\Controllers\Controller;
use App\Http\Requests\CaculatePromotion;
use App\Http\Requests\CaculatePromotionRequest;
use App\Http\Requests\PromotionRequest;
use App\Http\Requests\UpdatePromotionRequest;
use App\Http\Resources\ApiResource;
use App\Http\Resources\PromotionResource;
use App\Services\Interfaces\Promotion\PromotionServiceInterface as PromotionService;
use Illuminate\Http\Request;
use Auth;
use Illuminate\Http\Response;
use Log;
use Throwable;

class PromotionController extends Controller
{
    protected $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;

    }

    public function index()
    {


        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->promotionService->getAll();
            return ApiResource::ok(PromotionResource::collection($response), 'Lây khuyến mãi thành công.');
        } else {
            $response = $this->promotionService->getAvailablePromotions();
            return ApiResource::ok(PromotionResource::collection($response), 'Lây khuyến mãi thành công.');
        }

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PromotionRequest $request)
    {
        $user = Auth::user();
        if (!$user->hasRole('admin')) {
            return ApiResource::message('Bạn không có quyền tạo khuyến mãi.', Response::HTTP_FORBIDDEN);
        }

        $data = $request->validated();
        $image = $request->file('image');

        $response = $this->promotionService->insert($data, $image);

        return ApiResource::ok(new PromotionResource($response), 'Tạo khuyến mãi thành công.');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePromotionRequest $request, string $id)
    {
        $user = Auth::user();
        $data = $request->validated();
        $image = $request->file('image');

        if ($user->hasRole('admin')) {
            $response = $this->promotionService->update($id, $data, $image);
            return ApiResource::ok(new PromotionResource($response), 'Cập nhật khuyến mãi thành công.');
        }

        return ApiResource::message('Bạn không có quyền cập nhật khuyến mãi.', Response::HTTP_FORBIDDEN);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->promotionService->delete($id);
            return ApiResource::ok($response, 'Xóa khuyến mãi thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xóa khuyến mãi.', Response::HTTP_FORBIDDEN);
        }
    }

    public function indexPublic()
    {

        $response = $this->promotionService->getAvailablePromotions();
        return ApiResource::ok(PromotionResource::collection($response), 'Lây khuyến mãi thành công.');


    }


    public function calculatePromotion(CaculatePromotionRequest $request)
    {
        if (!$request->has('promotion_code') && !$request->has('promotion_id')) {
            return ApiResource::message('Vui lòng nhập mã khuyến mãi', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $requestData = $request->validated();
        $totalAmount = $requestData['total_price'] ?? 0;
        $ticketPrice = $requestData['ticket_price'] ?? 0;
        $comboPrice = $requestData['combo_price'] ?? 0;
        $userId = auth()->id();
        $productType = $requestData['order_product_type'] ?? 'ALL';

        try {
            $promotionIdentifier = $requestData['promotion_code'] ?? $requestData['promotion_id'];
            $promotion = $this->promotionService->getPromotionByCodeOrId($promotionIdentifier);

            if (!$promotion) {
                return ApiResource::message('Mã hoặc ID khuyến mãi không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            $applicableResult = $this->promotionService->isPromotionApplicable($promotion, $totalAmount, $userId, $ticketPrice, $comboPrice);

            if (!$applicableResult['ok']) {
                return ApiResource::message($applicableResult['reason'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $discountAmount = $this->promotionService->calculateDiscount($promotion, $totalAmount, $ticketPrice, $comboPrice);
            $finalTotalPrice = max(0, $totalAmount - $discountAmount);

            return ApiResource::ok([
                'promotion_code' => $promotion->code,
                'original_amount' => $totalAmount,
                'discount_amount' => round($discountAmount, 2),
                'final_amount' => round($finalTotalPrice, 2),
            ], 'Khuyến mãi đã được áp dụng.');
        } catch (Throwable $e) {
            Log::error('Lỗi khi tính khuyến mãi: ' . $e->getMessage(), [
                'request_data' => $requestData,
                'user_id' => $userId,
                'exception' => $e,
            ]);

            return ApiResource::message('Có lỗi xảy ra trong quá trình tính toán khuyến mãi. Vui lòng thử lại.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getPromotionClient(Request $request)
    {
        $params = [
            'user_id' => $request->query('user_id'),
            'total_price' => $request->query('total_price'),
            'product_type' => $request->query('product_type'),
            'code' => $request->query('code'),
        ];
        $response = $this->promotionService->getAvailablePromotions($params);
        return ApiResource::ok(PromotionResource::collection($response), 'Lây khuyến mãi thành công.');

    }

}
