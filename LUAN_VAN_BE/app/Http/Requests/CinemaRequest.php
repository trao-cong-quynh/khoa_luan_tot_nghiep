<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CinemaRequest extends FormRequest
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
            'cinema_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cinemas', 'cinema_name')->whereNull('deleted_at')
            ],
            'address' => [
                'required',
                'string',
                'max:500',
                Rule::unique('cinemas', 'address')->whereNull('deleted_at')
            ],
            'map_address' => 'nullable|string|url||max:2048',
            'district_id' => 'required|integer|exists:districts,district_id',
        ];
    }

    public function messages()
    {
        return [
            'cinema_name.required' => 'Tên rạp chiếu phim không được để trống.',
            'cinema_name.string' => 'Tên rạp chiếu phim phải là một chuỗi văn bản.',
            'cinema_name.max' => 'Tên rạp chiếu phim không được vượt quá :max ký tự.',
            'cinema_name.unique' => 'Tên rạp chiếu phim này đã tồn tại trong hệ thống.',


            'address.required' => 'Địa chỉ rạp chiếu phim không được để trống.',
            'address.string' => 'Địa chỉ rạp chiếu phim phải là một chuỗi văn bản.',
            'address.max' => 'Địa chỉ rạp chiếu phim không được vượt quá :max ký tự.',
            'address.unique' => 'Đã có rạp ở địa chỉ bạn nhập.',

            'map_address.string' => 'Liên kết bản đồ phải là một chuỗi văn bản.',
            'map_address.url' => 'Liên kết bản đồ không đúng định dạng URL hợp lệ. Vui lòng kiểm tra lại',
            'map_address.max' => 'Liên kết bản đồ không được vượt quá :max ký tự.',
            'map_address.nullable' => 'Liên kết bản đồ có thể được để trống.',

            'district_id.required' => 'Quận không được để trống.',
            'district_id.integer' => 'Quận phải là một số nguyên.',
            'district_id.exists' => 'Quận đã chọn không tồn tại.',

        ];
        ;
    }
}
