<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingConcessions extends Model
{
    use HasFactory;
    protected $table = 'booking_concessions';

    public $timestamps = false;


    protected $primaryKey = 'id';

    protected $fillable = [
        'booking_id',
        'concession_id',
        'quantity',
        'total_price',

    ];

    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id');

    }

    public function concessions()
    {
        return $this->belongsTo(Concessions::class, 'concession_id');

    }
}
