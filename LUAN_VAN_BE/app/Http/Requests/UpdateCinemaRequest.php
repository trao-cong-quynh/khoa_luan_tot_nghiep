<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCinemaRequest extends FormRequest
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
        $cinemaId = $this->route('id');
        return [
            'cinema_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('cinemas', 'cinema_name')
                    ->ignore($cinemaId, 'cinema_id')
                    ->whereNull('deleted_at')
            ],
            'address' => [
                'sometimes',
                'required',
                'string',
                'max:500',
                Rule::unique('cinemas', 'address')
                    ->ignore($cinemaId, 'cinema_id')
                    ->whereNull('deleted_at')
            ],
            'map_address' => 'nullable|string|url|max:2048',
        ];
    }


    public function messages()
    {
        return [
            'cinema_name.sometimes' => 'Tên rạp chiếu phim không được để trống nếu có thay đổi.',
            'cinema_name.required' => 'Tên rạp chiếu phim không được để trống.',
            'cinema_name.string' => 'Tên rạp chiếu phim phải là một chuỗi văn bản.',
            'cinema_name.max' => 'Tên rạp chiếu phim không được vượt quá :max ký tự.',
            'cinema_name.unique' => 'Tên rạp chiếu phim này đã tồn tại trong hệ thống.',

            'address.sometimes' => 'Địa chỉ rạp chiếu phim không được để trống nếu có thay đổi.',
            'address.required' => 'Địa chỉ rạp chiếu phim không được để trống.',
            'address.string' => 'Địa chỉ rạp chiếu phim phải là một chuỗi văn bản.',
            'address.max' => 'Địa chỉ rạp chiếu phim không được vượt quá :max ký tự.',
            'address.unique' => 'Đã có rạp ở địa chỉ bạn nhập.',

            'map_address.string' => 'Liên kết bản đồ phải là một chuỗi văn bản.',
            'map_address.url' => 'Liên kết bản đồ không đúng định dạng URL hợp lệ. Vui lòng kiểm tra lại',
            'map_address.max' => 'Liên kết bản đồ không được vượt quá :max ký tự.',
            'map_address.nullable' => 'Liên kết bản đồ có thể được để trống.',

        ];
        ;
    }
}
