<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingRequest extends FormRequest
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

            'showtime_id' => 'required|integer|exists:show_times,showtime_id',

            'tickets' => 'required|array|min:1',
            'tickets.*.seat_id' => 'required|integer|exists:seats,seat_id',
            'tickets.*.ticket_type_id' => 'required|integer|exists:ticket_types,ticket_type_id',
            'concessions' => 'nullable|array',
            'concessions.*.concession_id' => 'required_with:concessions|integer|exists:concessions,concession_id',
            'concessions.*.quantity' => 'required_with:concessions|integer|min:1',
            'promotion_id' => 'sometimes|integer|exists:promotions,promotion_id',
            'promotion_code' => 'sometimes|string|max:50',
            'order_product_type' => [
                'sometimes',
                Rule::in(['TICKET', 'COMBO', 'ALL'])
            ],


        ];
    }


    public function messages(): array
    {
        return [

            'showtime_id.required' => 'Mã suất chiếu là bắt buộc.',
            'showtime_id.integer' => 'Mã suất chiếu phải là số nguyên.',
            'showtime_id.exists' => 'Mã suất chiếu không tồn tại.',



            'tickets.required' => 'Phải có thông tin vé được chọn.',
            'tickets.array' => 'Thông tin vé phải là một mảng.',
            'tickets.min' => 'Phải chọn ít nhất một vé.',

            'tickets.*.seat_id.required' => 'Mã ghế là bắt buộc cho mỗi vé.',
            'tickets.*.seat_id.integer' => 'Mã ghế phải là số nguyên.',
            'tickets.*.seat_id.exists' => 'Mã ghế :input không tồn tại.',

            'tickets.*.ticket_type_id.required' => 'Loại vé là bắt buộc cho mỗi vé.',
            'tickets.*.ticket_type_id.integer' => 'Loại vé phải là số nguyên.',
            'tickets.*.ticket_type_id.exists' => 'Loại vé :input không tồn tại.',

            'concessions.array' => 'Thông tin mặt hàng ăn uống phải là một mảng.',
            'concessions.*.concession_id.required_with' => 'Mã mặt hàng ăn uống là bắt buộc nếu có mặt hàng ăn uống.',
            'concessions.*.concession_id.integer' => 'Mã mặt hàng ăn uống phải là số nguyên.',
            'concessions.*.concession_id.exists' => 'Mã mặt hàng ăn uống :input không tồn tại.',
            'concessions.*.quantity.required_with' => 'Số lượng mặt hàng ăn uống là bắt buộc nếu có mặt hàng ăn uống.',
            'concessions.*.quantity.integer' => 'Số lượng mặt hàng ăn uống phải là số nguyên.',
            'concessions.*.quantity.min' => 'Số lượng mặt hàng ăn uống phải lớn hơn 0.',

            'promotion_id.integer' => 'Mã khuyến mãi phải là số nguyên.',
            'promotion_id.exists' => 'Mã khuyến mãi không tồn tại.',

            'promotion_code.string' => 'Mã khuyến mãi phải là chuỗi ký tự.',
            'promotion_code.max' => 'Mã khuyến mãi không được vượt quá :max ký tự.',

            'order_product_type.string' => 'Loại sản phẩm đặt phải là chuỗi ký tự.',
            'order_product_type.in' => 'Loại sản phẩm đặt chỉ chấp nhận giá trị: TICKET, COMBO hoặc ALL.',

        ];
    }
}
