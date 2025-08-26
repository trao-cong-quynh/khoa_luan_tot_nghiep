<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGenresRequest extends FormRequest
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
        $genreId = $this->route('id');
        return [
            'genre_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('genres', 'genre_name')->ignore($genreId, 'genre_id'),
            ],
        ];
    }

    public function messages()
    {
        return [
            'genre_name.sometimes' => 'Tên thể loại không được bỏ trống nếu có thay đổi.',
            'genre_name.required' => 'Tên thể loại là bắt buộc.',
            'genre_name.string' => 'Tên thể loại phải là chuỗi ký tự.',
            'genre_name.max' => 'Tên thể loại không được dài quá :max ký tự.',
            'genre_name.unique' => 'Tên thể loại đã tồn tại trong hệ thống. Vui lòng nhập tên khác.',
        ];
    }
}
