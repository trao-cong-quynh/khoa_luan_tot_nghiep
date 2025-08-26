<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TicketTypeRequest extends FormRequest
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
            'ticket_type_name' => 'required|string|max:255|unique:ticket_types,ticket_type_name',
            'ticket_price' => 'required|numeric|min:0',
        ];
    }

    public function messages()
    {
        return [
            'ticket_type_name.required' => 'Tên loại vé là bắt buộc.',
            'ticket_type_name.string' => 'Tên loại vé phải là chuỗi ký tự.',
            'ticket_type_name.max' => 'Tên loại vé không được dài quá :max ký tự.',
            'ticket_type_name.unique' => 'Tên loại vé đã tồn tại trong hệ thống. Vui lòng nhập tên khác.',


            'ticket_price.required' => 'Giá tiền không được để trống.',
            'ticket_price.numeric' => 'Giá tiền phải là kiểu số.',
            'ticket_price.min' => 'Giá tiền không được nhỏ hơn không.',
        ];
    }
}
