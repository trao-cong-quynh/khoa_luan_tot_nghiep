<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class District extends Model
{
    use HasFactory, SoftDeletes;
    protected $primaryKey = 'district_id';
    protected $fillable = ['district_name', 'district_code', 'deleted_at'];


    public function managers()
    {
        return $this->belongsToMany(User::class, 'district_managers', 'district_id', 'user_id')
            ->withPivot('assigned_at', 'is_active_manager');
    }

    public function cinemas()
    {
        return $this->hasMany(Cinemas::class, 'district_id', 'district_id');
    }
}
