<?php

namespace App\Services\Interfaces\Promotion;

use App\Models\Promotions;

interface PromotionServiceInterface
{
    public function getAvailablePromotions(array $params = []);
    public function calculateDiscount(Promotions $promotion, float $totalPrice);

    // public function calculateDiscount(Promotions $promotion, float $totalPrice, float $ticketPrice = 0, float $comboPrice = 0);

    public function recordPromotionUsage(int $promotionId, string $orderId, float $appliedAmount, ?int $userId = null);

    public function getAll(array $filters = []);

    public function getPromotionById(string $id);


    public function insert(array $data, $image = null);

    public function update(string $id, array $data, $image = null);

    public function delete(string $id);

    public function getPromotionUsages(string $id);

    public function getPromotionByCodeOrId(string|int $identifier);

    public function isPromotionApplicable(Promotions $promotion, float $totalPrice, ?int $userId, string $productType = 'ALL');

    // public function isPromotionApplicable(Promotions $promotion, float $totalPrice, ?int $userId, float $ticketPrice = 0, float $comboPrice = 0);
}
