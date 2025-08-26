<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckSeatRequest extends FormRequest
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
            'seat_ids' => 'required|array|min:1',
            'seat_ids.*' => 'integer|distinct|exists:seats,seat_id'
        ];
    }


    public function messages(): array
    {
        return [
            'seat_ids.required' => 'Danh sách mã ghế không được để trống.',
            'seat_ids.array' => 'Dữ liệu mã ghế phải là dạng mảng.',
            'seat_ids.*.integer' => 'Mỗi mã ghế phải là một số nguyên.',
            'seat_ids.*.exists' => 'Một mã ghế không tồn tại trong hệ thống.',
        ];
    }
}
