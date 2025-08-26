<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShowTimeRequest extends FormRequest
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
            'room_id' => 'required|integer|exists:theater_rooms,room_id',
            'start_time' => 'required|date_format:Y-m-d H:i',
            'end_time' => 'required|date_format:Y-m-d H:i|after:start_time',
        ];
    }

    public function messages ()
    {
        return [
            'movie_id.required' => 'Vui lòng chọn phim chiếu',
            'movie_id.integer' => 'ID phim là kiểu số nguyên',
            'movie_id.exists' => 'ID phim chọn không tồn tại',

            'room_id.required' => 'Vui lòng chọn phòng chiếu',
            'room_id.integer' => 'ID phòng chiếu là kiểu số nguyên',
            'room_id.exists' => 'ID phòng chiếu chọn không tồn tại',

            'start_time.required' => 'Vui lòng chọn thời gian bắt đầu suất chiếu.',
            'start_time.date_format' => 'Thời gian bắt đầu phải đúng định dạng: YYYY-MM-DD HH:MM.',

            'end_time.required' => 'Vui lòng chọn thời gian kết thúc suất chiếu.',
            'end_time.date_format' => 'Thời gian kết thúc phải đúng định dạng: YYYY-MM-DD HH:MM.',
            'end_time.after' => 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        ];
    }
}
