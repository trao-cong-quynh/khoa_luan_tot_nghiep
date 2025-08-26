<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;

use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\Auth\AuthServiceInterface as AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    private $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;

    }

    public function authenticate(LoginRequest $request)
    {
        $resquestData = $request->validated();
        $response = $this->authService->login($resquestData);
        return ApiResource::ok($response, 'Đăng nhập thành công');

    }

    public function register(RegisterRequest $request)
    {
        $requestData = $request->validated();

        $response = $this->authService->register($requestData);
        return ApiResource::ok($response, 'Đăng ký thành công');
    }

    public function user(Request $request)
    {
        $response = $this->authService->user($request);
        return ApiResource::ok($response);
        // return $request->user();
    }


    public function logout(Request $request)
    {
        $response = $this->authService->logout();
        return ApiResource::message('Dăng xuất thành công');
    }


    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $email = $request->email;
        if ($this->authService->sendPasswordResetLink($email)) {
            return ApiResource::message('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
        }
        return ApiResource::message('Không thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại sau.', Response::HTTP_INTERNAL_SERVER_ERROR);
    }


    public function requestPassword(ResetPasswordRequest $request)
    {
        $email = $request->email;
        $password = $request->password;
        $token = $request->token;

        if ($this->authService->resetPassword($email, $token, $password)) {
            return ApiResource::message('Mật khẩu đã được đặt lại thành công.');
        }

        return ApiResource::message('Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', Response::HTTP_BAD_REQUEST);
    }

}
