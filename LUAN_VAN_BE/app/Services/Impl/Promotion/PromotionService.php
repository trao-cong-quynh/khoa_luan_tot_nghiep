<?php

namespace App\Services\Impl\Promotion;

use App\Models\Promotions;
use App\Models\PromotionUsages;
use App\Services\Interfaces\Promotion\PromotionServiceInterface;
use Carbon\Carbon;
use DB;
use Exception;
use Log;
use Str;

class PromotionService implements PromotionServiceInterface
{
    public function getAvailablePromotions(array $params = [])
    {
        $query = Promotions::where('status', 'active')
            ->where('start_date', '<=', Carbon::now())
            ->where('end_date', '>=', Carbon::now());

        if (isset($params['total_price'])) {
            $query->where('min_order_amount', '<=', $params['total_price']);
        }

        if (isset($params['product_type']) && $params['product_type'] !== 'ALL') {
            $query->where(function ($q) use ($params) {
                $q->where('apply_to_product_type', $params['product_type'])
                    ->orWhere('apply_to_product_type', 'ALL');
            });
        }

        if (isset($params['code'])) {
            $query->where('code ', $params['code']);
        }

        $promotions = $query->get();

        $promotions = $promotions->filter(function ($promotion) use ($params) {
            // Kiểm tra tổng số lượt đã dùng
            if ($promotion->total_usage_limit > 0) {
                $usedCount = PromotionUsages::where('promotion_id', $promotion->promotion_id)->count();
                if ($usedCount >= $promotion->total_usage_limit) {
                    return false;
                }
            }

            // Kiểm tra số lượt người dùng cụ thể nếu có truyền user_id
            if ($promotion->usage_limit_per_user > 0) {

                if (!empty($params['user_id'])) {

                    $userUsedCount = PromotionUsages::where('promotion_id', $promotion->promotion_id)
                        ->where('user_id', $params['user_id'])
                        ->count();

                    if ($userUsedCount >= $promotion->usage_limit_per_user) {
                        return false;
                    }
                }
                // Nếu không có user_id thì cho qua (chưa đăng nhập)
            }

            return true;
        });


        return $promotions;
    }

    public function calculateDiscount(Promotions $promotion, float $totalPrice)
    {
        $discountAmount = 0;

        if ($totalPrice < $promotion->min_order_amount) {
            return 0;
        }

        if ($promotion->type === 'FIXED_DISCOUNT') {
            $discountAmount = $promotion->discount_value;
        } else if ($promotion->type === 'PERCENT_DISCOUNT') {
            $caculatedDiscount = $totalPrice * ($promotion->discount_value / 100);
            $discountAmount = min($caculatedDiscount, $promotion->max_discount_amount ?? $caculatedDiscount);
        }

        return round($discountAmount, 2);
    }
    // public function calculateDiscount(Promotions $promotion, float $totalPrice, float $ticketPrice = 0, float $comboPrice = 0): float
    // {
    //     $discountAmount = 0;

    //     // Xác định phần tiền cần áp dụng khuyến mãi dựa vào loại sản phẩm
    //     $applicableAmount = match ($promotion->apply_to_product_type) {
    //         'TICKET' => $ticketPrice,
    //         'COMBO' => $comboPrice,
    //         default => $totalPrice, // 'ALL' hoặc không xác định
    //     };

    //     // Nếu phần tiền áp dụng < min_order_amount thì không giảm
    //     if ($applicableAmount < $promotion->min_order_amount) {
    //         return 0;
    //     }

    //     if ($promotion->type === 'FIXED_DISCOUNT') {
    //         // Giảm cố định không vượt quá phần tiền áp dụng
    //         $discountAmount = min($promotion->discount_value, $applicableAmount);
    //     } elseif ($promotion->type === 'PERCENT_DISCOUNT') {
    //         $calculated = ($applicableAmount * $promotion->discount_value) / 100;

    //         // Nếu có giới hạn giảm tối đa
    //         $discountAmount = min($calculated, $promotion->max_discount_amount ?? $calculated);
    //     }

    //     return round($discountAmount, 2);
    // }

    public function recordPromotionUsage(int $promotionId, string $bookingId, float $appliedAmount, ?int $userId = null)
    {
        return PromotionUsages::create([
            'promotion_id' => $promotionId,
            'booking_id' => $bookingId,
            'user_id' => $userId,
            'applied_amount' => $appliedAmount,
            'usage_date' => Carbon::now(),
        ]);
    }




    public function getAll(array $filters = [])
    {
        $query = Promotions::query();

        if (!empty($filters['search'])) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                ->orWhere('code', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        $promotions = $query->get();
        if ($promotions->isEmpty()) {
            throw new Exception('Hệ thống không có khuyến mãi nào cả nào cả.');
        }
        return $promotions;
    }

    public function getPromotionById(string $id)
    {
        $promotion = Promotions::find($id);
        if (!$promotion) {
            throw new Exception('Khuyến mãi không tồn tại trong hệ thống.');
        }
        return $promotion;

    }

    public function uploadPromotionImage($file)
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension = $file->getClientOriginalExtension();
        $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;

        // Lưu file vào storage/app/public/promotions/
        return $file->storeAs('promotions', $fileName, 'public');
    }
    public function insert(array $data, $image = null)
    {
        try {
            return DB::transaction(function () use ($data, $image) {

                if ($image) {
                    $data['image_url'] = $this->uploadPromotionImage($image);
                }

                $promotion = Promotions::create($data);
                return $promotion;
            });
        } catch (\Throwable $e) {
            Log::error('Tạo khuyến mãi thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $data,
            ]);
            throw $e;
        }
    }

    public function update(string $id, array $data, $image = null)
    {
        try {
            return DB::transaction(function () use ($id, $data, $image) {

                $promotion = Promotions::find($id);

                if (!$promotion) {
                    throw new \Exception('Khuyến mãi không tồn tại.');
                }

                $imagePath = $promotion->image_url;


                if ($image) {
                    if ($promotion->image_url && \Storage::disk('public')->exists($promotion->image_url)) {
                        \Storage::disk('public')->delete($promotion->image_url);
                    }

                    $imagePath = $this->uploadPromotionImage($image);
                }


                if ($image || $imagePath !== $promotion->image_url) {
                    $data['image_url'] = $imagePath;
                } else {

                    unset($data['image']);
                    if (!isset($data['image_url'])) {
                        $data['image_url'] = $promotion->image_url;
                    }
                }

                $promotion->update($data);




                return $promotion;
            });
        } catch (\Throwable $e) {
            \Log::error("Sửa khuyến mãi {$id} thất bại: " . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $data
            ]);
            throw $e;
        }
    }


    public function delete(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {

                $promotion = Promotions::find($id);
                if (!$promotion) {
                    throw new Exception('Khuyến mãi không tại.');
                }
                $promotion->delete();
                return true;
            });

        } catch (\Throwable $e) {
            Log::error('Xóa khuyến mãi' . $id . 'thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    public function getPromotionUsages(string $id)
    {
        $promotion = Promotions::with(['usages.user', 'usages.booking'])->find($id);
        if (!$promotion) {
            throw new Exception('Khuyến mãi không tìm thấy.');
        }
        return $promotion->usages;
    }


    public function getPromotionByCodeOrId(string|int $identifier)
    {
        if (is_numeric($identifier)) {
            return Promotions::find($identifier);
        } else {
            return Promotions::where('code', $identifier)->first();
        }
    }

    public function isPromotionApplicable(Promotions $promotion, float $totalPrice, ?int $userId, string $productType = 'ALL'): array
    {
        if (
            $promotion->status !== 'active' ||
            Carbon::now()->isBefore($promotion->start_date) ||
            Carbon::now()->isAfter($promotion->end_date)
        ) {
            return ['ok' => false, 'reason' => 'Khuyến mãi đã hết hạn hoặc chưa bắt đầu.'];
        }

        if ($promotion->apply_to_product_type !== 'ALL' && $promotion->apply_to_product_type !== $productType) {
            return ['ok' => false, 'reason' => 'Khuyến mãi không áp dụng cho loại sản phẩm này.'];
        }

        if ($totalPrice < $promotion->min_order_amount) {
            return ['ok' => false, 'reason' => 'Giá trị đơn hàng không đủ điều kiện áp dụng khuyến mãi.'];
        }

        if (!is_null($promotion->usage_limit_per_user) && $userId !== null) {
            $userUsageCount = PromotionUsages::where('promotion_id', $promotion->promotion_id)
                ->where('user_id', $userId)
                ->count();

            if ($userUsageCount >= $promotion->usage_limit_per_user) {
                return ['ok' => false, 'reason' => 'Bạn đã sử dụng mã khuyến mãi này quá số lần cho phép.'];
            }
        }

        if (!is_null($promotion->total_usage_limit)) {
            $totalUsageCount = PromotionUsages::where('promotion_id', $promotion->promotion_id)->count();
            if ($totalUsageCount >= $promotion->total_usage_limit) {
                return ['ok' => false, 'reason' => 'Khuyến mãi đã hết lượt sử dụng.'];
            }
        }

        return ['ok' => true];
    }


    // public function isPromotionApplicable(
    //     Promotions $promotion,
    //     float $totalPrice,
    //     ?int $userId,
    //     float $ticketPrice = 0,
    //     float $comboPrice = 0
    // ): array {
    //     if (
    //         $promotion->status !== 'active' ||
    //         Carbon::now()->isBefore($promotion->start_date) ||
    //         Carbon::now()->isAfter($promotion->end_date)
    //     ) {
    //         return ['ok' => false, 'reason' => 'Khuyến mãi đã hết hạn hoặc chưa bắt đầu.'];
    //     }

    //     // Lấy phần giá trị đơn hàng đúng để áp dụng khuyến mãi
    //     $applicableAmount = match ($promotion->apply_to_product_type) {
    //         'TICKET' => $ticketPrice,
    //         'COMBO' => $comboPrice,
    //         default => $totalPrice,
    //     };

    //     if ($applicableAmount < $promotion->min_order_amount) {
    //         return ['ok' => false, 'reason' => 'Giá trị đơn hàng không đủ điều kiện áp dụng khuyến mãi.'];
    //     }

    //     if (!is_null($promotion->usage_limit_per_user) && $userId !== null) {
    //         $userUsageCount = PromotionUsages::where('promotion_id', $promotion->promotion_id)
    //             ->where('user_id', $userId)
    //             ->count();

    //         if ($userUsageCount >= $promotion->usage_limit_per_user) {
    //             return ['ok' => false, 'reason' => 'Bạn đã sử dụng mã khuyến mãi này quá số lần cho phép.'];
    //         }
    //     }

    //     if (!is_null($promotion->total_usage_limit)) {
    //         $totalUsageCount = PromotionUsages::where('promotion_id', $promotion->promotion_id)->count();
    //         if ($totalUsageCount >= $promotion->total_usage_limit) {
    //             return ['ok' => false, 'reason' => 'Khuyến mãi đã hết lượt sử dụng.'];
    //         }
    //     }

    //     return ['ok' => true];
    // }


}
