<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateConcessionRequest extends FormRequest
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
        $concessionId = $this->route('id');
        return [
            'concession_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('concessions', 'concession_name')->ignore($concessionId, 'concession_id'),

            ],
            'description' => 'sometimes|nullable|string',
            'unit_price' => 'sometimes|required|numeric|min:0',
            'category' => 'sometimes|required|string|in:Food,Drink,Snack,Combo,Other',
            'image' => 'sometimes|required|image|mimes:png,jpg,webp,jpeg|max:2048'
        ];
    }


    public function messages()
    {
        return [
            'concession_name.sometimes' => 'Tên đồ ăn uống không được bỏ trống nếu có thay đổi.',
            'concession_name.required' => 'Tên đồ ăn/uống không được để trống.',
            'concession_name.string' => 'Tên đồ ăn/uống phải là chuỗi ký tự.',
            'concession_name.max' => 'Tên đồ ăn/uống không được dài quá :max ký tự.',
            'movie_name.unique' => 'Tên phim đã tồn tại trong hệ thống. Vui lòng nhập tên khác.',

            'description.sometimes' => 'Mô tả đồ ăn uống không được bỏ trống nếu có thay đổi.',
            'description.string' => 'Mô tả đồ ăn/uống phải là chuỗi ký tự.',

            'unit_price.sometimes' => 'Giá tiền không được bỏ trống nếu có thay đổi.',
            'unit_price.required' => 'Giá tiền không được để trống.',
            'unit_price.numeric' => 'Giá tiền phải là kiểu số.',
            'unit_price.min' => 'Giá tiền không được nhỏ hơn không.',

            'category.sometimes' => 'Thể loại của đồ ăn/uống không được bỏ trống nếu có thay đổi.',
            'category.required' => 'Thể loại của đồ ăn/uống không được để trống.',
            'category.string' => 'Thể loại của đồ ăn/uống phải là chuỗi ký tự.',
            'category.in' => 'Thể loại của đồ ăn/uống không hợp lệ. Vui lòng chọn một trong các giá trị cho phép (Food, Drink, Snack, Other).',

            'image.sometimes' => 'Ảnh của đồ ăn/uống không được bỏ trống nếu có thay đổi.',
            'image.required' => 'Ảnh của đồ ăn/uống là bắt buộc.',
            'image.image' => 'File tải lên phải là định dạng ảnh.',
            'image.mimes' => 'Ảnh của đồ ăn/uống phải có định dạng: :values (png, jpg, webp, jpeg).',
            'image.max' => 'Kích thước ảnh của đồ ăn/uống không được vượt quá :max KB.',
        ];
    }
}
