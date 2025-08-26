<?php

namespace App\Http\Requests;

use App\Constants\BookingStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
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
            'showtime_id' => 'sometimes|required|integer|exists:show_times,showtime_id',
            'tickets' => 'sometimes|required|array|min:1',
            'tickets.*.seat_id' => [
                'required_with:tickets',
                'integer',
                'exists:seats,seat_id'
            ],
            'tickets.*.ticket_type_id' => 'required_with:tickets|integer|exists:ticket_types,ticket_type_id',
            'concessions' => 'sometimes|nullable|array',
            'concession.*.concession_id' => 'required_with:concessions|integer|exists:concessions,concession_id',
            'concession.*.quantity' => 'required_with:concessions|integer|min:1',

            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in([
                    BookingStatus::PENDING,
                    BookingStatus::ACTIVE,
                    BookingStatus::FAILED,
                    BookingStatus::CANCELLED,
                    BookingStatus::COMPLETED,
                    BookingStatus::REFUNDED,
                    BookingStatus::PAID
                ]),
            ]

        ];
    }


    public function messages(): array
    {
        return [
            'showtime_id.integer' => 'Mã suất chiếu phải là số nguyên.',
            'showtime_id.exists' => 'Mã suất chiếu không tồn tại.',

            'tickets.array' => 'Thông tin vé phải là một mảng.',
            'tickets.min' => 'Phải chọn ít nhất một vé.',

            'tickets.*.seat_id.required_with' => 'Mã ghế là bắt buộc cho mỗi vé.',
            'tickets.*.seat_id.integer' => 'Mã ghế phải là số nguyên.',
            'tickets.*.seat_id.exists' => 'Mã ghế :input không tồn tại.',

            'tickets.*.ticket_type_id.required_with' => 'Loại vé là bắt buộc cho mỗi vé.',
            'tickets.*.ticket_type_id.integer' => 'Loại vé phải là số nguyên.',
            'tickets.*.ticket_type_id.exists' => 'Loại vé :input không tồn tại.',

            'concessions.array' => 'Thông tin mặt hàng ăn uống phải là một mảng.',
            'concessions.*.concession_id.required_with' => 'Mã mặt hàng ăn uống là bắt buộc nếu có mặt hàng ăn uống.',
            'concessions.*.concession_id.integer' => 'Mã mặt hàng ăn uống phải là số nguyên.',
            'concessions.*.concession_id.exists' => 'Mã mặt hàng ăn uống :input không tồn tại.',
            'concessions.*.quantity.required_with' => 'Số lượng mặt hàng ăn uống là bắt buộc nếu có mặt hàng ăn uống.',
            'concessions.*.quantity.integer' => 'Số lượng mặt hàng ăn uống phải là số nguyên.',
            'concessions.*.quantity.min' => 'Số lượng mặt hàng ăn uống phải lớn hơn 0.',

            'status.required' => 'Trạng thái đơn hàng là bắt buộc khi cập nhật.',
            'status.string' => 'Trạng thái đơn hàng phải là chuỗi ký tự.',
            'status.in' => 'Trạng thái đơn hàng không hợp lệ.',
        ];
    }

}
