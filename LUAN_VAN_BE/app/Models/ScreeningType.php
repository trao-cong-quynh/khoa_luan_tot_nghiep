<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScreeningType extends Model
{
    use HasFactory;

    protected $table = 'screening_type';

    public $timestamps = false;

    protected $primaryKey = 'screening_type_id';
    protected $fillable = ['screening_type_name'];


    // public function movie_screening_type()
    // {
    //     return $this->hasMany(MovieScreeningType::class, 'screening_type_id', 'screening_type_id');
    // }

    public function movie()
    {
        return $this->belongsToMany(Movies::class, 'movie_screening_type', 'screening_type_id', 'movie_id');
    }
}
