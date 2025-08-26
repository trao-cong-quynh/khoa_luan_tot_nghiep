<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MovieScheduleRequest extends FormRequest
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
            'movie_id' => 'required|integer|exists:movies,movie_id',
            'cinema_id' => 'required|integer|exists:cinemas,cinema_id',
            'start_date' => 'required|date_format:Y-m-d H:i',
            'end_date' => 'required|date_format:Y-m-d H:i|after:start_date',
        ];
    }


    public function messages()
    {
        return [
            'movie_id.required' => 'Mã phim là bắt buộc.',
            'movie_id.integer' => 'Mã phim phải là số nguyên.',
            'movie_id.exists' => 'ID phim chọn không tồn tại',

            'cinema_id.required' => 'Mã rạp là bắt buộc.',
            'cinema_id.integer' => 'Mã rạp phải là số nguyên.',
            'cinema_id.exists' => 'ID rạp chọn không tồn tại',

            'start_date.required' => 'Vui lòng chọn ngày bắt đầu lịch chiếu.',
            'start_date.date_format' => 'Ngày gian bắt đầu phải đúng định dạng: YYYY-MM-DD.',

            'end_date.required' => 'Vui lòng chọn ngày kết thúc lịch chiếu.',
            'end_date.date_format' => 'Ngày kết thúc phải đúng định dạng: YYYY-MM-DD HH:MM.',
            'end_date.after' => 'Ngày kết thúc phải sau ngày bắt đầu.',
        ];
    }
}
