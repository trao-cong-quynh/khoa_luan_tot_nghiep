<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Str;

class Bookings extends Model
{
    use HasFactory;
    protected $table = 'bookings';

    public $timestamps = false;


    protected $primaryKey = 'booking_id';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'showtime_id',
        'original_price',
        'discount_amount',
        'total_price',
        'total_tickets',
        'promotion_id',
        'status',
        'booking_date'
    ];
    protected $casts = [
        'booking_date' => 'datetime',
        // Nếu bạn có các cột ngày/giờ khác như 'start_time', 'end_time' trong show_times,
        // bạn cũng cần cast chúng trong Model tương ứng (ShowTimes.php)
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function show_times()
    {
        return $this->belongsTo(ShowTimes::class, 'showtime_id');

    }

    public function booked_tickets()
    {
        return $this->hasMany(BookedTickets::class, 'booking_id', 'booking_id');
    }

    public function users()
    {
        return $this->belongsTo(User::class, 'user_id');

    }

    public function booking_concessions()
    {
        return $this->hasMany(BookingConcessions::class, 'booking_id', 'booking_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'booking_id', 'booking_id');
    }


    public function usages()
    {
        return $this->hasMany(PromotionUsages::class, 'user_id', 'user_id');
    }

}
