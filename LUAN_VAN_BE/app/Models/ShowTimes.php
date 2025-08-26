<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
/**
 * Class ShowTimes
 *
 * @property int $showtime_id
 * @property int $movie_id
 * @property int $room_id
 * @property Carbon $start_time  // <-- Thêm dòng này
 * @property Carbon $end_time    // <-- Và dòng này
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @package App\Models
 */

class ShowTimes extends Model
{
    use HasFactory;
    protected $table = 'show_times';
    protected $primaryKey = 'showtime_id';

    protected $fillable = [
        'movie_id',
        'room_id',
        'start_time',
        'end_time',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',

    ];

    public function movies()
    {
        return $this->belongsTo(Movies::class, 'movie_id');

    }

    public function theater_rooms()
    {
        return $this->belongsTo(TheaterRooms::class, 'room_id');

    }

    public function bookings()
    {
        return $this->hasMany(Bookings::class, 'showtime_id', 'showtime_id');
    }
}
