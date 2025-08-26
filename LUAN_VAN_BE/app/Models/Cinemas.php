<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cinemas extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'cinemas';

    public $timestamps = false;

    protected $primaryKey = 'cinema_id';

    protected $fillable = [
        'cinema_name',
        'address',
        'map_address',
        'district_id',


    ];

    public function theater_rooms()
    {
        return $this->hasMany(TheaterRooms::class, 'cinema_id', 'cinema_id');
    }

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id', 'district_id');
    }

    public function movie_schedule()
    {
        return $this->hasMany(MovieSchedules::class, 'cinema_id', 'cinema_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'cinema_id', 'cinema_id');
    }
}
