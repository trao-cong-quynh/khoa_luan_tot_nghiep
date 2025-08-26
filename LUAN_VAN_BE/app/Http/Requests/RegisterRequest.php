<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
        return [
            'full_name' => 'required|string|min:2|max:255|regex:/^[\pL\s]+$/u',
            'email' => 'required|email|string|unique:users,email',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/',
            'phone' => 'required|string|regex:/^(\+?\d{9,15})$/',
            'birth_date' => 'required|date|date_format:Y-m-d|before:today',
            'gender' => 'required|in:Nam,Nữ,Khác'
        ];
    }
    public function messages()
    {
        return [
            //name
            'full_name.required' => 'Tên không được để trống',
            'full_name.min' => 'Tên phải có ít nhất :min ký tự',
            'full_name.max' => 'Tên không được quá  :max ký tự',
            'full_name.regex' => 'Tên chỉ được chứa chữ cái và khoảng trắng',
            'full_name.string' => 'Tên phải là dạng chuỗi',

            //email
            'email.required' => 'Email bắt buộc phải nhâp',
            'email.email' => 'Email không hợp lệ, ví dụ: abc@gmail.com',
            'email.unique' => 'Email đã được sử dụng',
            'email.string' => 'Email phải là dạng chuỗi',

            //password
            'password.required' => 'Mật khẩu bắt buộc phải nhập',
            'password.string' => 'Email phải là dạng chuỗi',
            'password.min' => 'Mật khẩu tối thiểu :min kí tư',
            'password.confirmed' => 'Mật khẩu xác nhận không đúng',
            'password.regex' => 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt',

            //phone
            'phone.required' => 'Số điện thoại là bắt buộc',
            'phone.string' => 'Số điện thoại phải là chuỗi',
            'phone.regex' => 'Số điện thoại không hợp lệ. Chỉ được chứa số và có thể bắt đầu bằng dấu +',

            //bith_date

            'birth_date.required' => 'Ngày sinh là bắt buộc',
            'birth_date.date' => 'Ngày sinh không đúng định dạng ngày tháng',
            'birth_date.before' => 'Ngày sinh không được ở tương lai',
            'birth_date.date_format' => 'Ngày sinh không đúng định dạng . vd : 2003-09-15 ',

            //gender

            'gender.required' => 'Giới tính bắt buộc phải nhâp',
            'gender.in' => 'Giới tính phải là Nam hoặc Nữ hoặc Khác',
        ];
    }

    public function validated($key = null, $default = null)
    {
        $data = parent::validated();
        unset($data['role']);
        return $data;
    }
}
