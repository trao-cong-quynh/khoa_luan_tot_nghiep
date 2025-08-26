<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promotions extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'promotions';

    protected $primaryKey = 'promotion_id';
    protected $fillable = [
        'name',
        'code',
        'description',
        'image_url',
        'start_date',
        'end_date',
        'type',
        'discount_value',
        'max_discount_amount',
        'min_order_amount',
        'usage_limit_per_user',
        'total_usage_limit',
        'apply_to_product_type',
        'status',
        'deleted_at'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'discount_value' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'min_order_amount' => 'decimal:2'
    ];

    public function usages()
    {
        return $this->hasMany(PromotionUsages::class, 'promotion_id', 'promotion_id');
    }

}
