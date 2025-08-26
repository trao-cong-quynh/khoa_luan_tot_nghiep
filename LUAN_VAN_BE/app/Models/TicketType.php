<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketType extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'ticket_types';

    public $timestamps = false;

    protected $primaryKey = 'ticket_type_id';

    protected $fillable = [
        'ticket_type_name',
        'ticket_price',
        'deleted_at'
    ];

    public function booked_tickets()
    {
        return $this->hasMany(BookedTickets::class, 'ticket_type_id', 'ticket_type_id');
    }
}
