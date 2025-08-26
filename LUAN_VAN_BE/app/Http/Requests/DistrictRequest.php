<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DistrictRequest extends FormRequest
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
            'district_name' => [
                'required',
                'string',
                'max:250',
                Rule::unique('districts', 'district_name')->whereNull('deleted_at')
            ],
            'district_code' => [
                'required',
                'string',
                'max:250',
                Rule::unique('districts', 'district_code')->whereNull('deleted_at')
            ],
        ];
    }

    public function messages()
    {
        return [
            'district_name.required' => 'Tên quận là bắt buộc.',
            'district_name.string' => 'Tên quận là một chuỗi.',
            'district_name.max' => 'Tên quận có độ dài lớn nhất là :max kí tự.',
            'district_name.unique' => 'Tên quận đã tồn tại.',

            'district_code.required' => 'Mã quận là bắt buộc.',
            'district_code.string' => 'Mã quận là một chuỗi.',
            'district_code.max' => 'Mã quận có độ dài lớn nhất là :max kí tự.',
            'district_code.unique' => 'Mã quận đã tồn tại.',

        ];
    }
}
