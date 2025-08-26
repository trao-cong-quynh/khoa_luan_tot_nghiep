<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PromotionRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('promotions', 'code')->whereNull('deleted_at')
            ],
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' =>
                [
                    'required',
                    Rule::in(['FIXED_DISCOUNT', 'PERCENT_DISCOUNT']),
                ],
            'discount_value' => 'required|numeric|min:0',
            'max_discount_amount' => 'nullable|nullable|min:0|required_if:type,PERCENT_DISCOUNT',
            'min_order_amount' => 'nullable|numeric|min:0',
            'usage_limit_per_user' => 'nullable|integer|min:0',
            'total_usage_limit' => 'nullable|integer|min:0',
            'apply_to_product_type' =>
                [
                    'nullable',
                    Rule::in(['TICKET', 'COMBO', 'ALL'])
                ],
            'status' =>
                [
                    'required',
                    Rule::in(['active', 'inactive'])
                ],

        ];
    }


    public function messages(): array
    {
        return [
            'name.required' => 'Tên khuyến mãi là bắt buộc.',
            'name.max' => 'Tên khuyến mãi không được vượt quá :max ký tự.',
            'code.required' => 'Mã khuyến mãi là bắt buộc.',
            'code.unique' => 'Mã khuyến mãi đã tồn tại.',
            'code.max' => 'Mã khuyến mãi không được vượt quá :max ký tự.',
            'start_date.required' => 'Ngày bắt đầu là bắt buộc.',
            'start_date.date' => 'Ngày bắt đầu không đúng định dạng ngày tháng.',
            'start_date.after_or_equal' => 'Ngày bắt đầu phải sau hoặc bằng ngày hiện tại.',
            'end_date.required' => 'Ngày kết thúc là bắt buộc.',
            'end_date.date' => 'Ngày kết thúc không đúng định dạng ngày tháng.',
            'end_date.after_or_equal' => 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.',
            'type.required' => 'Loại khuyến mãi là bắt buộc.',
            'type.in' => 'Loại khuyến mãi không hợp lệ.',
            'discount_value.required' => 'Giá trị giảm giá là bắt buộc.',
            'discount_value.numeric' => 'Giá trị giảm giá phải là số.',
            'discount_value.min' => 'Giá trị giảm giá phải lớn hơn 0.',
            'max_discount_amount.required_if' => 'Giới hạn giảm giá tối đa là bắt buộc khi loại khuyến mãi là phần trăm.',
            'max_discount_amount.numeric' => 'Giới hạn giảm giá tối đa phải là số.',
            'min_order_amount.numeric' => 'Giá trị đơn hàng tối thiểu phải là số.',
            'usage_limit_per_user.integer' => 'Giới hạn sử dụng mỗi người dùng phải là số nguyên.',
            'total_usage_limit.integer' => 'Tổng giới hạn sử dụng phải là số nguyên.',
            'apply_to_product_type.in' => 'Loại sản phẩm áp dụng không hợp lệ.',
            'status.required' => 'Trạng thái khuyến mãi là bắt buộc.',
            'status.in' => 'Trạng thái khuyến mãi không hợp lệ.',
        ];
    }
}
