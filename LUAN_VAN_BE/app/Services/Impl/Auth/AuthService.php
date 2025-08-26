<?php

namespace App\Services\Impl\Auth;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Services\Interfaces\Auth\AuthServiceInterface;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Intervention\Image\Encoders\PngEncoder;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\ImageManager;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;
use Intervention\Image\Colors\Rgb\Color as RgbColor;


class AuthService implements AuthServiceInterface
{
    protected $imageManager;

    public function __construct(ImageManager $imageManager)
    {
        $this->imageManager = $imageManager;
    }

    private function addAvatarUrlToUserArray(array $userArray): array
    {
        // avatar_url trong userArray bây giờ là đường dẫn lưu trong DB
        if (isset($userArray['avatar_url']) && $userArray['avatar_url']) {
            $userArray['avatar_url'] = Storage::url($userArray['avatar_url']);
        }
        return $userArray;
    }

    public function login(array $request)
    {


        $user = User::where('email', $request['email'])->first();
        if (!$user || !Hash::check($request['password'], $user->password)) {

            throw new AuthenticationException('Thông tin đăng nhập không đúng');
        }

        if (isset($user->is_active) && !$user->is_active) {

            return new HttpResponseException(response()->json([
                'status' => false,
                'code' => Response::HTTP_FORBIDDEN,
                'message' => 'Tài khoản bị vô hiệu hóa.',
            ], Response::HTTP_FORBIDDEN));
        }

        $token = $user->createToken($user->full_name);

        $userArray = $user->toArray();

        // Thêm avatar_url
        $userArray = $this->addAvatarUrlToUserArray($userArray);

        // Lấy vai trò một cách thủ công và thêm vào mảng
        $userArray['roles'] = $user->getRoleNames()->toArray();


        if ($user->hasRole('district_manager')) {

            $user->load([
                'managedDistricts' => function ($query) {
                    $query->select('districts.district_id', 'districts.district_name');
                }
            ]);

            $managedDistrictsData = $user->managedDistricts->map(function ($district) {
                return [
                    'district_id' => $district->district_id,
                    'district_name' => $district->district_name,
                ];
            })->toArray();

            $userArray['district_manager'] = $managedDistrictsData;
        } else {
            $userArray['district_manager'] = [];
        }

        return [
            'user' => $userArray,
            'access_token' => $token->plainTextToken,
            'type_token' => 'Bearer'
        ];
    }



    public function register(array $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                //1. Lay chu cai dau voi in hoa full name
                $initial = strtoupper(mb_substr($request['full_name'], 0, 1));
                //2. tao anh
                $bgColor = new RgbColor(60, 60, 60);
                $image = $this->imageManager->create(config('avatar.size'), config('avatar.size'))->fill($bgColor);
                //3. ve chu len anh
                $image->text($initial, config('avatar.size') / 2, config('avatar.size') / 2, function ($font) {
                    $font->file(public_path('/fonts/Roboto-Italic-VariableFont_wdth,wght.ttf'));
                    $font->size(config('avatar.font_size'));
                    $font->color(config('avatar.fontColor'));
                    $font->align('center');
                    $font->valign('middle');
                });
                //4.tao file voi timestamp
                $fileName = 'avatar/' . time() . '_' . Str::slug($request['full_name']) . '.png';
                //5. luu anh vao thu muc avatar
                Storage::disk('public')->put($fileName, $image->encode(new PngEncoder()));
                //6. gan duong anh vao avarta_url
                $request['avatar_url'] = $fileName;
                // luu thoi gian tao user
                $request['create_at'] = now();
                // gan trang thai hoat dong
                $request['is_active'] = true;

                // tao user trong csdl
                $user = User::create($request);

                //gan quyen cho user
                $userRole = Role::where('name', 'user')->first();
                if ($userRole) {
                    $user->assignRole($userRole);
                } else {
                    Log::warning('Không tìm thấy vai trò của người dùng khi tạo người dùng ID:' . $user->user_id);
                }

                //tao token
                $token = $user->createToken($request['full_name']);
                // chuan hoa du lieu tra ve
                $useArray = $user->toArray();
                $useArray = $this->addAvatarUrlToUserArray($useArray);
                $useArray['roles'] = $user->getRoleNames()->toArray();
                $useArray['district_manager'] = [];
                return [
                    'user' => $useArray,
                    'token' => $token->plainTextToken,
                    'token_type' => 'Beaer',
                ];
            });

        } catch (\Throwable $e) {
            Log::error('Đăng ký thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request,
            ]);

            throw new AuthenticationException('Đăng ký không thành công. Vui lòng thử lại.');
        }
    }
    // Trong user()
    public function user(Request $request)
    {
        $user = $request->user();
        // Tải mối quan hệ managedDistricts
        $user->load([
            'managedDistricts' => function ($query) {
                $query->select('districts.district_id', 'districts.district_name');
            }
        ]);

        $userArray = $user->toArray();
        // Thêm avatar_url
        $userArray = $this->addAvatarUrlToUserArray($userArray); // Áp dụng hàm trợ giúp

        $userArray['roles'] = $user->getRoleNames()->toArray(); // Chắc chắn là array

        // managedDistricts sẽ tự động có trong $userArray nếu nó đã được load,
        // hoặc bạn có thể tùy chỉnh nó như trong hàm login.
        // Nếu bạn muốn hiển thị managedDistricts cho tất cả users, bạn cần một điều kiện.
        // Hiện tại chỉ District Manager mới có, nên có thể thêm điều kiện này:
        if ($user->hasRole('district_manager')) {
            $managedDistrictsData = $user->managedDistricts->map(function ($district) {
                return [
                    'district_id' => $district->district_id,
                    'district_name' => $district->district_name,
                ];
            })->toArray();
            $userArray['district_manager'] = $managedDistrictsData;
        } else {
            $userArray['district_manager'] = [];
        }

        return $userArray;
    }
    public function logout()
    {
        auth()->user()->tokens()->delete();
        return true;
    }


    public function sendPasswordResetLink(string $email)
    {
        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new Exception('Tài khoản không tồn tại.');
        }
        $tocken = Password::broker()->createToken($user);

        try {
            Mail::to($user->email)->send(new PasswordResetMail($user, $tocken));
            return true;
        } catch (\Exception $e) {
            Log::error("Không thể gửi mail đặt lại mật khẩu cho {$email}:" . $e->getMessage());
            return false;
        }
    }

    public function resetPassword(string $email, string $tocken, string $password)
    {
        $status = Password::broker()->reset(
            [
                'email' => $email,
                'password' => $password,
                'password_confirmtion' => $password,
                'token' => $tocken
            ],
            function (User $user) use ($password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));
                $user->save();
            }
        );
        return $status = Password::PASSWORD_RESET;
    }
}
