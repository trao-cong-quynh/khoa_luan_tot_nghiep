<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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

            'email' => 'required|email|string',
            'password' => 'required|string|min:8',
        ];
    }
    public function messages()
    {
        return [
            // Email
            'email.required' => 'Email bắt buộc phải nhập',
            'email.email' => 'Email không hợp lệ, ví dụ: abc@gmail.com',
            'email.string' => 'Email phải là dạng chuỗi',

            // Password
            'password.required' => 'Mật khẩu bắt buộc phải nhập',
            'password.string' => 'Mật khẩu phải là chuỗi',
            'password.min' => 'Mật khẩu tối thiểu :min ký tự',
        ];
    }
}
