<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TheaterRooms extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'theater_rooms';

    public $timestamps = false;

    protected $primaryKey = 'room_id';

    protected $fillable = [
        'cinema_id',
        'room_name',
        'room_type',
        'total_columns',
        'total_rows',
    ];

    public function show_times()
    {
        return $this->hasMany(ShowTimes::class, 'room_id', 'room_id');
    }

    public function cinemas()
    {
        return $this->belongsTo(Cinemas::class, 'cinema_id', 'cinema_id');

    }

    public function seats()
    {
        return $this->hasMany(Seats::class, 'room_id', 'room_id');
    }
}
