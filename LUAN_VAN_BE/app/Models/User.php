<?php

namespace App\Models;

use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
// use Log; // Không cần Log ở đây nữa nếu accessor bị xóa
// use Illuminate\Support\Facades\Storage; // Không cần Storage ở đây nữa nếu accessor bị xóa

class User extends Authenticatable implements CanResetPassword
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $table = 'users';
    protected $primaryKey = 'user_id';
    public $timestamps = false;
    protected $guard_name = 'api';
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'phone',
        'birth_date',
        'gender',
        'avatar_url', // Vẫn cần trong fillable để lưu vào DB
        'is_active',
        'cinema_id',
        'create_at',
        'deleted_at'
    ];

    protected $hidden = [
        'password',
    ];



    protected $casts = [
        'password' => 'hashed',
        'birth_date' => 'date',
    ];

    public function booking()
    {
        return $this->hasMany(Bookings::class, 'user_id', 'user_id');
    }

    public function managedDistricts()
    {
        return $this->belongsToMany(District::class, 'district_managers', 'user_id', 'district_id', 'user_id', 'district_id')
            ->withPivot('assigned_at', 'is_active_manager');
    }

    public function cinema()
    {
        return $this->belongsTo(Cinemas::class, 'cinema_id', 'cinema_id');
    }

    public function usages()
    {
        return $this->hasMany(PromotionUsages::class, 'user_id', 'user_id');
    }

    // ********************************************************************
    // XÓA accessor getAvatarUrlAttribute() hoàn toàn
    // ********************************************************************

    /**
     * The accessors to append to the model's array form.
     * XÓA 'avatar_url' khỏi $appends
     *
     * @var array
     */
    protected $appends = []; // Mảng $appends trống nếu không có gì cần append tự động
}
