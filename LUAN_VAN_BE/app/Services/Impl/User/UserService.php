<?php

namespace App\Services\Impl\User;

use App\Constants\RoleTypes;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Services\Interfaces\User\UserServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\AuthenticationException;
use Intervention\Image\Drivers\Gd\Encoders\PngEncoder;
use Intervention\Image\ImageManager;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage; // Đảm bảo Storage được import
use Illuminate\Support\Str;
use Intervention\Image\Colors\Rgb\Color as RgbColor;
use Spatie\Permission\Models\Role;

class UserService implements UserServiceInterface
{
    protected $imageManager;

    public function __construct(ImageManager $imageManager)
    {
        $this->imageManager = $imageManager;
    }

    // Hàm trợ giúp để thêm avatar_url vào mảng user
    private function addAvatarUrlToUserArray(array $userArray): array
    {
        if (isset($userArray['avatar_url']) && $userArray['avatar_url']) {
            // Chỉ tạo URL nếu avatar_url không phải null
            $userArray['avatar_url'] = Storage::url($userArray['avatar_url']);
        }
        return $userArray;
    }

    public function getAll()
    {
        $users = User::with('roles')->get();
        return $users;

    }

    public function insert(UserRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $avatarPath = null;

                // Xử lý avatar từ file hoặc tạo avatar chữ cái đầu
                if ($request->hasFile('avatar')) {
                    $file = $request->file('avatar');
                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $file->getClientOriginalExtension();
                    $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                    $avatarPath = $file->storeAs('avatar', $fileName, 'public');
                } else {
                    $initial = strtoupper(mb_substr($request->full_name, 0, 1));
                    $size = 100;
                    $fontsize = 70;
                    $fontColor = '#FFFFFF';
                    $bgColor = new RgbColor(66, 66, 66);

                    $img = $this->imageManager->create($size, $size)->fill($bgColor);
                    $img->text($initial, $size / 2, $size / 2, function ($font) use ($fontsize, $fontColor) {
                        $font->file(public_path('fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'));
                        $font->size($fontsize);
                        $font->color($fontColor);
                        $font->align('center');
                        $font->valign('middle');
                    });
                    $avatarPath = 'avatar/' . time() . '_' . Str::slug($request->full_name) . '.png';
                    Storage::disk('public')->put($avatarPath, $img->encode(new PngEncoder()));
                }

                // Chuẩn bị dữ liệu người dùng
                $userData = $request->except(['role', 'avatar', 'district_ids', 'cinema_id']);
                $userData['avatar_url'] = $avatarPath;
                $userData['create_at'] = now();
                $userData['is_active'] = true;

                // --- Kiểm tra và xử lý cinema_id dựa trên vai trò ---
                $requestedRole = $request->input('role');
                if (in_array($requestedRole, RoleTypes::CINEMA_LEVEL_ROLES)) {
                    if ($request->has('cinema_id')) {
                        $userData['cinema_id'] = $request->input('cinema_id');
                    } else {
                        throw new \Exception('Vui lòng chọn rạp cho người dùng thuộc quyền quản lý rạp.');
                    }
                } else {
                    $userData['cinema_id'] = null;
                }

                // Tạo người dùng
                $user = User::create($userData);

                // Gán vai trò
                $assignedRole = null;
                if ($request->has('role') && !empty($request->role)) {
                    $role = Role::where('name', $request->role)->first();
                    if ($role) {
                        $user->assignRole($role);
                        $assignedRole = $role->name;
                    } else {
                        Log::warning('Không tìm thấy vai trò khi tạo người dùng: ' . $request->role . '. User ID: ' . $user->user_id);
                    }
                } else {
                    $defaultRole = Role::where('name', 'user')->first();
                    if ($defaultRole) {
                        $user->assignRole($defaultRole);
                        $assignedRole = $defaultRole->name;
                    } else {
                        Log::warning('Không tìm thấy vai trò mặc định "user" khi tạo người dùng. User ID: ' . $user->user_id);
                    }
                }

                // Gán quận nếu là district_manager
                if ($assignedRole === 'district_manager' && $request->has('district_ids')) {
                    $districtIds = is_array($request->input('district_ids'))
                        ? $request->input('district_ids')
                        : [$request->input('district_ids')];

                    $user->managedDistricts()->sync($districtIds);
                } elseif ($assignedRole !== 'district_manager') {
                    $user->managedDistricts()->detach();
                }

                // Nạp lại các mối quan hệ cần thiết
                $user->load('roles');

                if ($assignedRole === 'district_manager') {
                    $user->load('managedDistricts');
                }

                if (in_array($assignedRole, RoleTypes::CINEMA_LEVEL_ROLES)) {
                    $user->load('cinema');
                }

                // Chuẩn bị dữ liệu trả về
                $userArray = $user->toArray();
                $userArray['roles'] = $user->getRoleNames()->toArray();

                if ($assignedRole === 'district_manager') {
                    $userArray['managed_districts'] = $user->managedDistricts->pluck('district_name')->toArray();
                }

                if (in_array($assignedRole, RoleTypes::CINEMA_LEVEL_ROLES)) {
                    $userArray['managed_cinema'] = $user->cinema?->cinema_name;
                }

                return $this->addAvatarUrlToUserArray($userArray);
            });
        } catch (\Throwable $e) {
            Log::error('Tạo người dùng thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }



    public function update(UpdateUserRequest $request, string $id)
    {
        try {
            return DB::transaction(function () use ($request, $id) {
                $user = User::find($id);

                if (!$user) {
                    throw new AuthenticationException('Người dùng không có trong hệ thống');
                }

                $currentRoles = $user->getRoleNames()->toArray();
                $currentAssignedRole = !empty($currentRoles) ? $currentRoles[0] : null;


                $newRole = $request->input('role');
                $assignedRoleAfterUpdate = $newRole ?? $currentAssignedRole;


                $updateData = $request->except(['role', 'avatar', 'password', 'remove_avatar', 'district_ids', 'cinema_id']);

                if ($request->has('password') && !empty($request->password)) {
                    $updateData['password'] = $request->password;
                }

                $currentDbAvatarPath = $user->getRawOriginal('avatar_url');

                if ($request->hasFile('avatar')) {
                    Log::info('New avatar file detected.');
                    if ($currentDbAvatarPath && Storage::disk('public')->exists($currentDbAvatarPath)) {
                        Storage::disk('public')->delete($currentDbAvatarPath);
                        Log::info('Old avatar deleted: ' . $currentDbAvatarPath);
                    }

                    $file = $request->file('avatar');
                    $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                    $extension = $file->getClientOriginalExtension();
                    $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                    $avatarPath = $file->storeAs('avatar', $fileName, 'public');
                    Log::info('New avatar uploaded to: ' . $avatarPath);
                    $updateData['avatar_url'] = $avatarPath;
                } elseif ($request->boolean('remove_avatar')) {
                    Log::info('Remove avatar flag is true. Attempting to remove avatar.');
                    if ($currentDbAvatarPath && Storage::disk('public')->exists($currentDbAvatarPath)) {
                        Storage::disk('public')->delete($currentDbAvatarPath);
                        Log::info('Existing avatar deleted due to remove_avatar flag: ' . $currentDbAvatarPath);
                    }
                    $updateData['avatar_url'] = null;
                }

                if (in_array($assignedRoleAfterUpdate, RoleTypes::CINEMA_LEVEL_ROLES)) {
                    if (!in_array($currentAssignedRole, RoleTypes::CINEMA_LEVEL_ROLES)) {
                        if ($request->has('cinema_id')) {
                            $updateData['cinema_id'] = $request->input('cinema_id');
                        } else {
                            throw new \Exception('Cần cung cấp cinema_id cho các vai trò cấp rạp.');
                        }
                    } else {
                        unset($updateData['cinema_id']);
                    }

                } else {
                    $updateData['cinema_id'] = null;
                }

                $user->update($updateData);

                if ($newRole && $newRole !== $currentAssignedRole) {
                    $user->syncRoles($newRole);
                    Log::info('User roles synced to: ' . $newRole);
                }

                if ($assignedRoleAfterUpdate === 'district_manager') {
                    if ($request->has('district_ids')) {
                        $districtIds = is_array($request->input('district_ids'))
                            ? $request->input('district_ids')
                            : [$request->input('district_ids')];
                        $user->managedDistricts()->sync($districtIds);
                        Log::info('User managed districts synced: ' . implode(',', $districtIds));
                    } else {

                    }
                } elseif ($assignedRoleAfterUpdate !== 'district_manager' && $user->managedDistricts->isNotEmpty()) {

                    $user->managedDistricts()->detach();
                    Log::info('User detached from all managed districts.');
                }

                $user->refresh();

                $user->load('roles');

                if ($assignedRoleAfterUpdate === 'district_manager') {
                    $user->load('managedDistricts');
                }
                if ($assignedRoleAfterUpdate === 'booking_manager' || $assignedRoleAfterUpdate === 'showtime_manager') {
                    $user->load('cinema');
                }

                return $user;
            });
        } catch (\Throwable $e) {
            Log::error('Cập nhật thông tin người dùng thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }
    public function getUser(string $id)
    {

        $user = User::find($id);

        if (!$user) {
            throw new AuthenticationException('Người dùng không có trong hệ thống');
        }
        if ($user->cinema_id !== null) {
            $user->load('cinema');
        }

        $user->load('roles');

        if ($user->hasRole('district_manager')) {
            $user->load('managedDistricts');
        }

        return $user;
    }

    public function delete(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $user = User::find($id);

                if (!$user) {
                    throw new AuthenticationException('Người dùng không có trong hệ thống');
                }


                $user->delete();
                return true;
            });
        } catch (\Throwable $e) {
            Log::error('Xóa người dùng thất bại: ' . $e->getMessage(), ['user_id' => $id, 'exception' => $e]);
            throw $e;
        }
    }

    public function getAllEmployees(array $districtIds)
    {
        $employees = config('roles.employee_roles');
        $query = User::whereNotNull('cinema_id')
            ->whereHas('cinema', function ($query) use ($districtIds) {
                $query->whereIn('district_id', $districtIds);
            })
            ->whereHas('roles', function ($query) use ($employees) {
                $query->whereIn('name', $employees);
            })
            ->with([
                'roles' => function ($q) use ($employees) {
                    $q->whereIn('name', $employees);
                }
            ])->get();


        return $query;
    }

    public function getEmployeeByCinemaId(string $id, string $userId)
    {

        $query = User::with(['cinema', 'roles'])
            ->where('cinema_id', $id)
            ->where('user_id', '!=', $userId)
            ->get();

        return $query;
    }
}



