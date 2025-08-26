<?php
namespace App\Services\Interfaces\Auth;


use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\Request;

interface AuthServiceInterface
{
    public function login(array $request);
    public function register(array $request);

    public function user(Request $request);
    public function logout();

    public function sendPasswordResetLink(string $email);

    public function resetPassword(string $email, string $tocken, string $password);
}


