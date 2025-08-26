<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Concessions extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'concessions';

    public $timestamps = false;

    protected $primaryKey = 'concession_id';

    protected $fillable = [
        'concession_name',
        'description',
        'unit_price',
        'category',
        'image_url'

    ];

    public function booking_concessions()
    {
        return $this->hasMany(BookingConcessions::class, 'concession_id', 'concession_id');
    }
}
