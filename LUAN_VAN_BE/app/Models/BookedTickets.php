<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookedTickets extends Model
{
    use HasFactory;
    protected $table = 'booked_tickets';

    public $timestamps = false;


    protected $primaryKey = 'id';


    protected $fillable = [
        'booking_id',
        'ticket_type_id',
        'seat_id',
        'unit_price'
    ];

    public function seats()
    {
        return $this->belongsTo(Seats::class, 'seat_id');

    }

    public function booking()
    {
        return $this->belongsTo(Bookings::class, 'booking_id');

    }

    public function ticket_types()
    {
        return $this->belongsTo(TicketType::class, 'ticket_type_id');

    }


}
