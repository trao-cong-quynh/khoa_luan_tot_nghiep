<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovieGenres extends Model
{
    use HasFactory;
    protected $table = 'movie_genres';

    public $timestamps = false;

    protected $primaryKey = 'id';

    protected $fillable = [
        'movie_id',
        'genre_id',

    ];

    public function genres()
    {
        return $this->belongsTo(Genres::class, 'genre_id');
    }

    public function movies()
    {
        return $this->belongsTo(Movies::class, 'movie_id');
    }
}
