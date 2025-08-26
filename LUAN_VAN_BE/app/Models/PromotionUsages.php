<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PromotionUsages extends Model
{
    use HasFactory;

    protected $table = 'promotion_usages';

    protected $primaryKey = 'usage_id';
    protected $fillable = [
        'promotion_id',
        'user_id',
        'booking_id',
        'applied_amount',
        'usage_date',
    ];

    protected $casts = [
        'usage_date' => 'datetime',
        'applied_amount' => 'decimal:2'
    ];

    public function promotion()
    {
        return $this->belongsTo(Promotions::class, 'promotion_id', 'promotion_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id', 'booking_id');
    }

}
