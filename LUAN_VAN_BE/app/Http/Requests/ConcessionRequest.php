<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConcessionRequest extends FormRequest
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
            'concession_name' => 'required|string|max:255|unique:concessions,concession_name',
            'description' => 'nullable|string',
            'unit_price' => 'required|numeric|min:0',
            'category' => 'required|string|in:Food,Drink,Snack,Combo,Other',
            'image' => 'required|image|mimes:png,jpg,webp,jpeg|max:2048'
        ];
    }

    public function messages()
    {
        return [
            'concession_name.required' => 'Tên đồ ăn/uống không được để trống.',
            'concession_name.string' => 'Tên đồ ăn/uống phải là chuỗi ký tự.',
            'concession_name.max' => 'Tên đồ ăn/uống không được dài quá :max ký tự.',
            'concession_name.unique' => 'Tên đồ ăn/uống này đã tồn tại. Vui lòng chọn tên khác.', // Thêm thông báo này

            'description.string' => 'Mô tả đồ ăn/uống phải là chuỗi ký tự.',

            'unit_price.required' => 'Giá tiền không được để trống.',
            'unit_price.numeric' => 'Giá tiền phải là kiểu số.',
            'unit_price.min' => 'Giá tiền không được nhỏ hơn không.',

            'category.required' => 'Thể loại của đồ ăn/uống không được để trống.',
            'category.string' => 'Thể loại của đồ ăn/uống phải là chuỗi ký tự.',
            'category.in' => 'Thể loại của đồ ăn/uống không hợp lệ. Vui lòng chọn một trong các giá trị cho phép (Food, Drink, Snack, Other).',

            'image.required' => 'Ảnh của đồ ăn/u/uống là bắt buộc.',
            'image.image' => 'File tải lên phải là định dạng ảnh.',
            'image.mimes' => 'Ảnh của đồ ăn/uống phải có định dạng: :values (png, jpg, webp, jpeg).',
            'image.max' => 'Kích thước ảnh của đồ ăn/uống không được vượt quá :max KB.',
        ];
    }
}
