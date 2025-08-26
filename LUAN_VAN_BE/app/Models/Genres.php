<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Genres extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'genres';

    public $timestamps = false;

    protected $primaryKey = 'genre_id';
    protected $fillable = ['genre_name', 'deleted_at'];


    // public function movie_genres()
    // {
    //     return $this->hasMany(MovieGenres::class, 'genre_id', 'genre_id');
    // }

    public function movie()
    {
        return $this->belongsToMany(Movies::class, 'movie_genres', 'genre_id', 'movie_id');
    }

}


