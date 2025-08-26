<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovieScreeningType extends Model
{
    use HasFactory;

    protected $table = 'movie_screening_type';

    public $timestamps = false;

    protected $primaryKey = 'id';
    protected $fillable = ['screening_type_id', 'movie_id'];


    public function screening_type()
    {
        return $this->belongsTo(ScreeningType::class, 'screening_type_id');
    }

    public function movies()
    {
        return $this->belongsTo(Movies::class, 'movie_id');
    }
}
