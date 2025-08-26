<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MovieSchedules extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'movie_schedules';

    protected $primaryKey = 'movie_schedule_id';
    protected $fillable = [
        'movie_id',
        'cinema_id',
        'start_date',
        'end_date'
    ];

    protected $cast = [
        'start_date' => 'date',
        'end_date' => 'date'
    ];

    public function movie()
    {
        return $this->belongsTo(Movies::class, 'movie_id', 'movie_id');
    }

    public function cinema()
    {
        return $this->belongsTo(Cinemas::class, 'cinema_id', 'cinema_id');
    }
}
