<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Spatie\Permission\Models\Role; // Đảm bảo Role được import nếu dùng trong validator

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userID = $this->route('id'); // Lấy ID từ route

        // Lấy vai trò hiện tại của người dùng từ DB để xác định context validation
        // Điều này rất quan trọng cho logic requiredIf khi vai trò không được thay đổi
        $currentUser = $this->route('user'); // Giả sử route model binding hoạt động, nếu không, dùng User::find($userID)
        $currentRole = $currentUser ? $currentUser->getRoleNames()->first() : null;

        // Vai trò sau khi cập nhật (nếu được gửi trong request thì dùng cái đó, nếu không thì dùng vai trò hiện tại)
        $targetRole = $this->input('role') ?? $currentRole;

        return [
            // Các trường thông tin cơ bản: chỉ required nếu có mặt trong request
            'full_name' => 'sometimes|string|min:2|max:255|regex:/^[\pL\s]+$/u',
            'email' => [
                'sometimes',
                'email',
                'string',
                Rule::unique('users', 'email')->ignore($userID, 'user_id')
            ],
            // Mật khẩu chỉ cần validate nếu có mặt
            'password' => 'sometimes|string|min:8|confirmed|regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            'phone' => 'sometimes|string|regex:/^(\+?\d{9,15})$/',
            'birth_date' => 'sometimes|date|date_format:Y-m-d|before:today',
            'gender' => 'sometimes|in:Nam,Nữ,Khác',

            // Role: nếu có mặt thì phải tồn tại
            'role' => [
                'sometimes',
                Rule::exists('roles', 'name')->where('guard_name', 'api')
            ],

            // Avatar: có thể là file ảnh hoặc cờ xóa
            'avatar' => 'sometimes|image|mimes:png,jpg,webp,jpeg|max:2048',
            'remove_avatar' => 'sometimes|boolean', // Quy tắc cho cờ xóa avatar

            // --- Quy tắc Validation cho cinema_id ---
            'cinema_id' => [
                'nullable', // Có thể là null nếu vai trò không yêu cầu
                'integer',
                Rule::exists('cinemas', 'cinema_id'),
                Rule::requiredIf(function () use ($targetRole) {
                    // Yêu cầu nếu vai trò TẮT CẢ CŨ VÀ MỚI là booking_manager HOẶC showtime_manager
                    return $targetRole === 'booking_manager' || $targetRole === 'showtime_manager';
                }),
            ],

            // --- Quy tắc Validation cho district_ids ---
            'district_ids' => [
                'nullable', // Có thể là null nếu vai trò không yêu cầu
                'array',
                Rule::requiredIf(function () use ($targetRole) {
                    // Yêu cầu nếu vai trò TẮT CẢ CŨ VÀ MỚI là district_manager
                    return $targetRole === 'district_manager';
                }),
                'min:1', // Yêu cầu ít nhất 1 ID nếu là mảng
            ],
            'district_ids.*' => 'integer|exists:districts,district_id', // Mỗi ID trong mảng phải là số nguyên và tồn tại
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            // Lấy vai trò sẽ được áp dụng (từ request hoặc vai trò hiện tại của user)
            $userId = $this->route('id');
            $userModel = User::find($userId);
            $currentRole = $userModel ? $userModel->getRoleNames()->first() : null;

            $targetRole = $this->input('role') ?? $currentRole;

            // Kiểm tra chéo: nếu là quản lý rạp thì không được có district_ids
            if (($targetRole === 'booking_manager' || $targetRole === 'showtime_manager') && $this->has('district_ids') && !empty($this->input('district_ids'))) {
                $validator->errors()->add('district_ids', 'Người dùng với vai trò quản lý rạp (booking_manager hoặc showtime_manager) không thể quản lý quận.');
            }

            // Kiểm tra chéo: nếu là quản lý quận thì không được có cinema_id
            if ($targetRole === 'district_manager' && $this->has('cinema_id') && !is_null($this->input('cinema_id'))) {
                $validator->errors()->add('cinema_id', 'Người dùng có vai trò "district_manager" không thể quản lý một rạp cụ thể.');
            }

            $allowedFields = [
                '_method',
                'full_name',
                'email',
                'password',
                'password_confirmation',
                'phone',
                'birth_date',
                'gender',
                'role',
                'avatar',
                'remove_avatar',
                'cinema_id',
                'district_ids',
            ];

            $invalidFields = collect($this->all())
                ->keys()
                ->diff($allowedFields);

            if ($invalidFields->isNotEmpty()) {
                foreach ($invalidFields as $field) {
                    $validator->errors()->add($field, 'Trường không hợp lệ và không được phép gửi lên hệ thống.');
                }
            }
        });
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Các message cho trường hợp "sometimes" không cần thiết vì `sometimes` không có nghĩa là `sometimes|required`.
            // 'full_name.sometimes' => 'Tên không được để trống nếu có thay đổi.', // Bỏ dòng này
            'full_name.required' => 'Tên không được để trống', // Chỉ dùng nếu không có sometimes
            'full_name.min' => 'Tên phải có ít nhất :min ký tự',
            'full_name.max' => 'Tên không được quá :max ký tự',
            'full_name.regex' => 'Tên chỉ được chứa chữ cái và khoảng trắng',
            'full_name.string' => 'Tên phải là dạng chuỗi',

            'email.required' => 'Email bắt buộc phải nhập',
            'email.email' => 'Email không hợp lệ, ví dụ: abc@gmail.com',
            'email.unique' => 'Email đã được sử dụng',
            'email.string' => 'Email phải là dạng chuỗi',

            'password.required' => 'Mật khẩu bắt buộc phải nhập',
            'password.string' => 'Mật khẩu phải là dạng chuỗi',
            'password.min' => 'Mật khẩu tối thiểu :min kí tự',
            'password.confirmed' => 'Mật khẩu xác nhận không đúng',
            'password.regex' => 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt',

            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.string' => 'Số điện thoại phải là chuỗi',
            'phone.regex' => 'Số điện thoại không hợp lệ. Chỉ được chứa số và có thể bắt đầu bằng dấu +',

            'birth_date.required' => 'Ngày sinh là bắt buộc',
            'birth_date.date' => 'Ngày sinh không đúng định dạng ngày tháng',
            'birth_date.before' => 'Ngày sinh không được ở tương lai',
            'birth_date.date_format' => 'Ngày sinh không đúng định dạng. Ví dụ: 2003-09-15',

            'gender.required' => 'Giới tính bắt buộc phải nhập',
            'gender.in' => 'Giới tính phải là Nam hoặc Nữ hoặc Khác',

            'role.required' => 'Quyền là bắt buộc', // Chỉ dùng nếu không có sometimes
            'role.exists' => 'Quyền không nằm trong phạm vi hệ thống',

            // cinema_id
            'cinema_id.required_if' => 'Người dùng có vai trò quản lý rạp (booking_manager hoặc showtime_manager) bắt buộc phải thuộc một rạp chiếu.',
            'cinema_id.integer' => 'Mã rạp phải là số nguyên',
            'cinema_id.exists' => 'Rạp chiếu không tồn tại',

            // district_ids
            'district_ids.required_if' => 'Người dùng có vai trò "district_manager" bắt buộc phải quản lý ít nhất một quận.',
            'district_ids.required' => 'Mã quận là bắt buộc khi vai trò là "district_manager".',
            'district_ids.array' => 'Mã quận phải là một mảng.',
            'district_ids.min' => 'Người dùng có vai trò "district_manager" phải quản lý ít nhất :min quận.',
            'district_ids.*.integer' => 'Mỗi mã quận phải là số nguyên.',
            'district_ids.*.exists' => 'Một hoặc nhiều mã quận không tồn tại.',

            'avatar.image' => 'File tải lên phải là định dạng ảnh.',
            'avatar.mimes' => 'Ảnh đại diện phải có định dạng: :values (png, jpg, webp, jpeg).',
            'avatar.max' => 'Kích thước ảnh đại diện không được vượt quá :max KB.',
            'remove_avatar.boolean' => 'Giá trị "remove_avatar" phải là đúng hoặc sai.',
        ];
    }
}
