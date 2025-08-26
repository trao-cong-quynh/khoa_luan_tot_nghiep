<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movies extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'movies';

    protected $primaryKey = 'movie_id';

    public $timestamps = false;

    //Nếu mã khôn tăng thì sài
    //   public $incrementing = true;

    protected $fillable = [
        'movie_name',
        'description',
        'duration',
        'release_date',
        'poster_url',
        'trailer_url',
        'derector',
        'actor',
        'status',
        'age_rating',
        'country',
        'created_at',
        'deleted_at'
    ];




    public function genres()
    {
        return $this->belongsToMany(Genres::class, 'movie_genres', 'movie_id', 'genre_id');

    }

    public function screening_types()
    {
        return $this->belongsToMany(ScreeningType::class, 'movie_screening_type', 'movie_id', 'screening_type_id');

    }


    public function show_times()
    {
        return $this->hasMany(ShowTimes::class, 'movie_id', 'movie_id');
    }

    public function movie_schedule()
    {
        return $this->hasMany(MovieSchedules::class, 'movie_id', 'movie_id');
    }


}
