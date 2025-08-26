<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UserRequest extends FormRequest
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
        $userId = $this->route('id') ? $this->route('id')->user_id : null;

        return [
            'full_name' => 'required|string|min:2|max:255|regex:/^[\pL\s]+$/u',
            'email' => [
                'required',
                'email',
                'string',
                Rule::unique('users', 'email')->ignore($userId, 'user_id'),
            ],
            'password' => [
                $this->isMethod('post') ? 'required' : 'sometimes',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            ],
            'phone' => 'required|string|regex:/^(\+?\d{9,15})$/',
            'birth_date' => 'required|date|date_format:Y-m-d|before:today',
            'gender' => 'required|in:Nam,Nữ,Khác',
            'role' => [
                'required',
                Rule::exists('roles', 'name')->where('guard_name', 'api')
            ],
            'avatar' => 'sometimes|image|mimes:png,jpg,webp,jpeg|max:2048',

            // --- Quy tắc Validation cho cinema_id và district_ids dựa trên vai trò ---

            // cinema_id: Bắt buộc nếu vai trò là 'booking_manager' HOẶC 'showtime_manager'
            'cinema_id' => [
                'nullable',
                'integer',
                Rule::exists('cinemas', 'cinema_id'),
            ],

            // district_ids: Bắt buộc là mảng nếu vai trò là 'district_manager'
            'district_ids' => [
                'nullable',
                'array',
                'min:1',
            ],
            'district_ids.*' => 'integer|exists:districts,district_id',
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
            $role = $this->input('role');
            $employeeConfig = config('roles.employee_roles');
            if (in_array($role, $employeeConfig) && !$this->filled('cinema_id')) {
                $validator->errors()->add('cinema_id', 'Người dùng có vai trò "' . $role . '" bắt buộc phải thuộc một rạp chiếu.');
            }

            // Nếu vai trò là booking_manager HOẶC showtime_manager nhưng lại có district_ids
            if (in_array($role, $employeeConfig) && $this->has('district_ids') && !empty($this->input('district_ids'))) {
                $validator->errors()->add('district_ids', 'Người dùng với vai trò "' . $role . '" không thể quản lý quận.');
            }

            // Nếu vai trò là 'district_manager' nhưng lại có cinema_id
            if ($role === 'district_manager' && $this->has('cinema_id') && !is_null($this->input('cinema_id'))) {
                $validator->errors()->add('cinema_id', 'Người dùng có vai trò "district_manager" không thể quản lý một rạp cụ thể.');
            }

            if (
                $role === 'district_manager' && (!$this->has('district_ids') || empty($this->input('district_ids')))
            ) {
                $validator->errors()->add('district_ids', 'Người dùng có vai trò "district_manager" bắt buộc phải quản lý ít nhất một quận.');
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
            'full_name.required' => 'Tên không được để trống',
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

            'role.required' => 'Quyền là bắt buộc',
            'role.exists' => 'Quyền không nằm trong phạm vi hệ thống',

            // cinema_id

            'cinema_id.integer' => 'Mã rạp phải là số nguyên',
            'cinema_id.exists' => 'Rạp chiếu không tồn tại',

            // district_ids

            'district_ids.array' => 'Mã quận phải là một mảng.',
            'district_ids.min' => 'Người dùng có vai trò "district_manager" phải quản lý ít nhất :min quận.',
            'district_ids.*.integer' => 'Mỗi mã quận phải là số nguyên.',
            'district_ids.*.exists' => 'Một hoặc nhiều mã quận không tồn tại.',

            'avatar.image' => 'File tải lên phải là định dạng ảnh.',
            'avatar.mimes' => 'Ảnh đại diện phải có định dạng: :values (png, jpg, webp, jpeg).',
            'avatar.max' => 'Kích thước ảnh đại diện không được vượt quá :max KB.',
        ];
    }
}
