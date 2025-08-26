<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserRequest;
use App\Http\Resources\ApiResource;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\UserResource;
use App\Models\Cinemas;
use App\Models\User;
use App\Services\Interfaces\User\UserServiceInterface as UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->userService->getAll();
            return ApiResource::ok(EmployeeResource::collection($response), 'Lấy danh sách người dùng thành công');
        } else if ($user->hasRole('district_manager')) {
            $districtIds = $user->managedDistricts->pluck('district_id')->toArray();
            if (empty($districtIds)) {
                return ApiResource::ok([], 'Bạn không có quản lý rạp chiếu phim nào.');
            }
            $response = $this->userService->getAllEmployees($districtIds);
            return ApiResource::ok(EmployeeResource::collection($response), 'Lấy danh sách nhân viên thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $userId = $user->user_id;
            $cinemaId = $user->cinema_id;

            if (!$cinemaId) {
                return ApiResource::OK([], 'Bạn không quản lý rạp nào.');
            }
            $response = $this->userService->getEmployeeByCinemaId($cinemaId, $userId);
            return ApiResource::ok(EmployeeResource::collection($response), 'Lấy danh sách nhân viên thành công.');
        }

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->userService->insert($request);
            return ApiResource::ok($response, 'Tạo người dùng thành công');
        } else if ($user->hasRole('district_manager')) {
            $employeeConfig = config('roles.employee_roles');
            $districtIds = $user->managedDistricts->pluck('district_id')->toArray();

            $requestRole = $request->input('role');
            if (!$requestRole || !in_array($requestRole, $employeeConfig)) {
                return ApiResource::message('Bạn không được quyền tạo tài khoản người dùng.', Response::HTTP_FORBIDDEN);
            }
            $requestCinemaId = $request->input('cinema_id');
            $cinema = Cinemas::find($requestCinemaId);
            if (!$requestCinemaId || !($cinema = Cinemas::find($requestCinemaId))) {
                return ApiResource::message('Rạp chiếu không hợp lệ hoặc không tồn tại.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            if (!in_array($cinema->district_id, $districtIds)) {
                return ApiResource::message('Bạn không có quyền tạo tài khoàn cho nhân viên. Thông tin rạp không thuộc quận bạn đang quản lý.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->userService->insert($request);
            return ApiResource::ok($response, 'Tạo người dùng thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $employeeConfig = config('roles.employee_roles');

            $requestRole = $request->input('role');
            if (!$requestRole || !in_array($requestRole, $employeeConfig)) {
                return ApiResource::message('Bạn không được quyền tạo tài khoản người dùng.', Response::HTTP_FORBIDDEN);
            }
            $requestCinemaId = $request->input('cinema_id');
            $cinema = Cinemas::find($requestCinemaId);
            if (!$requestCinemaId || !($cinema = Cinemas::find($requestCinemaId))) {
                return ApiResource::message('Rạp chiếu không hợp lệ hoặc không tồn tại.', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            if ($user->cinema_id !== $cinema->cinema_id) {
                return ApiResource::message('Bạn không có quyền tạo tài khoàn cho nhân viên. Thông tin rạp không thuộc rạp bạn đang quản lý.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->userService->insert($request);
            return ApiResource::ok($response, 'Tạo người dùng thành công');
        } else {
            return ApiResource::message('Bạn không được phép xem tạo người dùng.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        $response = $this->userService->getUser($id);
        if ($user->hasRole('admin')) {
            return ApiResource::ok(new UserResource($response), 'Lấy thông tin người dùng thành công');
        } else if ($user->hasRole('district_manager')) {
            $districtIds = $user->managedDistricts->pluck('district_id')->toArray();
            if (!isset($response['cinema']) || !in_array($response['cinema']['district_id'], $districtIds)) {
                return ApiResource::message('Bạn không có quyền xem thông tin người dùng này vì không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            return ApiResource::ok(new UserResource($response), 'Lấy thông tin người dùng thành công');
        } else if ($user->hasRole('user')) {
            if ($user->user_id != $id) {
                return ApiResource::message('Bạn không được phép xem thông tin người khác.', Response::HTTP_FORBIDDEN);
            }
            return ApiResource::ok(new UserResource($response), 'Lấy thông tin người dùng thành công');
        } else if ($user->hasRole('cinema_manager')) {
            if ($user->cinema_id !== $response->cinema_id) {
                return ApiResource::message('Nhân viên không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            return ApiResource::ok(new UserResource($response), 'Lấy thông tin người dùng thành công');
        } else {
            return ApiResource::message('Bạn không được phép xem thông tin người khác.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->userService->update($request, $id);
            return ApiResource::ok(new UserResource($response), 'Sửa thông tin người dùng thành công');
        } else if ($user->hasRole('district_manager')) {
            if ($user->user_id == $id) {
                // Cho phép district_manager sửa chính họ
                $response = $this->userService->update($request, $id);
                return ApiResource::ok(new UserResource($response), 'Sửa thông tin của bạn thành công');
            }
            $districtIds = $user->managedDistricts->pluck('district_id')->toArray();
            $userUpdate = User::with('cinema')->find($id);
            // dd($userUpdate->cinema->district_id);
            if (!$userUpdate) {
                return ApiResource::message('Người dùng không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            if ($userUpdate->cinema_id === null || !in_array($userUpdate->cinema->district_id, $districtIds)) {
                return ApiResource::message('Bạn không có quyền sửa thông tin người dùng này vì không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->userService->update($request, $id);
            return ApiResource::ok(new UserResource($response), 'Sửa thông tin người dùng thành công');
        } else if ($user->hasRole('user')) {
            if ($user->user_id != $id) {
                return ApiResource::message('Bạn không được phép sửa thông tin người khác.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->userService->update($request, $id);
            return ApiResource::ok(new UserResource($response), 'Sửa thông tin người dùng thành công');
        } else if ($user->hasRole('cinema_manager')) {
            if ($user->user_id == $id) {
                // Cho phép district_manager sửa chính họ
                $response = $this->userService->update($request, $id);
                return ApiResource::ok(new UserResource($response), 'Sửa thông tin của bạn thành công');
            }
            $userUpdate = User::with('cinema')->find($id);
            if (!$userUpdate) {
                return ApiResource::message('Nhân viên không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            if ($user->cinema_id !== $userUpdate->cinema_id) {
                return ApiResource::message('Nhân viên không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->userService->update($request, $id);
            return ApiResource::ok(new UserResource($response), 'Sửa thông tin nhân viên thành công');
        } else if ($user->hasRole('showtime_manager')) {
            if ($user->user_id == $id) {
                // Cho phép district_manager sửa chính họ
                $response = $this->userService->update($request, $id);
                return ApiResource::ok(new UserResource($response), 'Sửa thông tin của bạn thành công');
            }

            return ApiResource::message('Bạn chỉ được phép sửa thông tin của bạn.', Response::HTTP_FORBIDDEN);
        } else if ($user->hasRole('booking_manager')) {
            if ($user->user_id == $id) {
                // Cho phép district_manager sửa chính họ
                $response = $this->userService->update($request, $id);
                return ApiResource::ok(new UserResource($response), 'Sửa thông tin của bạn thành công');
            }

            return ApiResource::message('Bạn chỉ được phép sửa thông tin của bạn.', Response::HTTP_FORBIDDEN);
        } else {
            return ApiResource::message('Bạn không được phép sửa thông tin người khác.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->userService->delete($id);
            return ApiResource::ok($response, 'Xóa người dùng thành công');
        } else if ($user->hasRole('district_manager')) {
            $districtIds = $user->managedDistricts->pluck('district_id')->toArray();
            $userDelete = User::with('cinema')->find($id);
            if (!$userDelete) {
                return ApiResource::message('Nhân viên không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            if ($userDelete->cinema_id === null || !in_array($userDelete->cinema->district_id, $districtIds)) {
                return ApiResource::message('Bạn không có quyền xóa nhân viên này vì không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->userService->delete($id);
            return ApiResource::ok($response, 'Xóa nhân viên thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $userUpdate = User::with('cinema')->find($id);
            if (!$userUpdate) {
                return ApiResource::message('Nhân viên không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            if ($user->cinema_id !== $userUpdate->cinema_id) {
                return ApiResource::message('Nhân viên không thuộc quyền quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->userService->delete($id);
            return ApiResource::ok($response, 'Xóa nhân viên thành công');
        } else {
            return ApiResource::message('Bạn không có quyền xóa người dùng.', Response::HTTP_FORBIDDEN);
        }

    }
}
