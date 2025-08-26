<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seats extends Model
{
    use HasFactory;
    protected $table = 'seats';

    public $timestamps = false;

    protected $primaryKey = 'seat_id';

    protected $fillable = [
        'room_id',
        'seat_row',
        'seat_column',
        'seat_status'
    ];

    public function theater_rooms()
    {
        return $this->belongsTo(TheaterRooms::class, 'room_id');

    }

    public function booked_tickets()
    {
        return $this->hasMany(BookedTickets::class, 'seat_id', 'seat_id');
    }
}
