<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RevenueTimeSeriesRequest extends FormRequest
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
            'group_by' => 'required|in:day,week,month,year',
            'start_date' => 'sometimes|required_with:end_date|date_format:Y-m-d',
            'end_date' => 'sometimes|date_format:Y-m-d|after_or_equal:start_date',
             
        ];
    }

    public function messages()
    {
        return [
            'group_by.required' => 'Trường phân nhóm theo thời gian là bắt buộc.',
            'group_by.in' => 'Giá trị phân nhóm phải là một trong các lựa chọn: day, week, month, year.',
            'start_date.required_with' => 'Ngày bắt đầu là bắt buộc khi có ngày kết thúc.',
            'start_date.date_format' => 'Ngày bắt đầu không đúng định dạng. Định dạng đúng là Y-m-d (VD: 2025-07-21).',
            'end_date.date_format' => 'Ngày kết thúc không đúng định dạng. Định dạng đúng là Y-m-d (VD: 2025-07-21).',
            'end_date.after_or_equal' => 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.',
        ];
    }

}
