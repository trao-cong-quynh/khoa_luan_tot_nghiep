<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PromotionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'promotion_id' => $this->promotion_id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'image_url' => $this->image_url ? Storage::url($this->image_url) : null,
            'start_date' => optional($this->start_date)->format('d-m-Y H:i'),
            'end_date' => optional($this->end_date)->format('d-m-Y H:i'),
            'type' => $this->type,
            'discount_value' => $this->discount_value,
            'max_discount_amount' => $this->max_discount_amount,
            'min_order_amount' => $this->min_order_amount,
            'usage_limit_per_user' => $this->usage_limit_per_user,
            'total_usage_limit' => $this->total_usage_limit,
            'apply_to_product_type' => $this->apply_to_product_type,
            'status' => $this->status,

        ];
    }
}
