<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenresRequest extends FormRequest
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
            'genre_name' => 'required|string|max:255|unique:genres,genre_name'
        ];
    }

    public function messages()
    {
        return [
            'genre_name.required' => 'Tên thể loại là bắt buộc.',
            'genre_name.string' => 'Tên thể loại phải là chuỗi ký tự.',
            'genre_name.max' => 'Tên thể loại không được dài quá :max ký tự.',
            'genre_name.unique' => 'Tên thể loại đã tồn tại trong hệ thống. Vui lòng nhập tên khác.',
        ];
    }
}
