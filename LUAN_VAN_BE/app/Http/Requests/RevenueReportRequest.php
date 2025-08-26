<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RevenueReportRequest extends FormRequest
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
            'period' => 'sometimes|in:day,week,month,year',
            'date' => 'sometimes|date_format:Y-m-d',
        ];
    }

    public function messages()
    {
        return [
            'period.in' => 'Thời gian xem báo cáo phải là : day,week,month,year',
            'date.date_format' => 'Ngày thang năm phải có định dạng : Y-m-d . Vd : 2025-10-9',
        ];
    }
}
