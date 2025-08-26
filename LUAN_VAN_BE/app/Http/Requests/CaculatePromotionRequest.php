<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CaculatePromotionRequest extends FormRequest
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
            'promotion_code' => 'sometimes|nullable|string',
            'promotion_id' => 'sometimes|nullable|integer',
            'total_price' => 'required|numeric|min:0',
            'order_product_type' =>
                [
                    'sometimes',
                    'nullable',
                    Rule::in(['TICKET', 'COMBO', 'ALL'])
                ],
        ];
    }

    public function messages()
    {
        return [
            'promotion_code.string' => 'Mã khuyễn mãi phải là một chuỗi.',
            'promotion_id.integer' => 'Id khuyễn mãi phải là một số nguyên.',
            'total_price.required' => 'Tổng tiền là bắt buộc.',
            'total_price.numeric' => 'Tổng tiền phải là một số.',
            'total_price.min' => 'Tổng tiền phải lớn hơn hoặc bằng :min.',

            'order_product_type.in' => 'Loại sản phẩm áp dụng không hợp lệ.'
        ];
    }
}
