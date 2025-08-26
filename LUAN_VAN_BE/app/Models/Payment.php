<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    protected $table = 'payments';
    protected $primaryKey = 'payment_id';

    protected $fillable = [
        'booking_id',
        'transaction_id',
        'payment_method',
        'gateway_transaction_status_coode',
        'gateway_transaction_message',
        'internal_status',
        'amount',
        'currency',
        'gateway_response_data',
        'ip_address',
        'payment_initiated_at',
        'payment_completed_at'
    ];
    protected $casts = [
        'gateway_response_data' => 'array',
        'payment_initiated_at' => 'datetime',
        'payment_completed_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id', 'booking_id');
    }
}
