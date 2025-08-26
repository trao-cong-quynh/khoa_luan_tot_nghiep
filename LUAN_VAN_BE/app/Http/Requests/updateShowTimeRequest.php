<?php

namespace App\Http\Requests;

use App\Models\ShowTimes;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator; // Import class Validator

class updateShowTimeRequest extends FormRequest
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
        $movieScheduleId = $this->route('id');
        return [
            'movie_id' => 'sometimes|required|integer|exists:movies,movie_id',
            'room_id' => 'sometimes|required|integer|exists:theater_rooms,room_id',
            'start_time' => 'sometimes|required|date_format:Y-m-d H:i',
            'end_time' => 'sometimes|required|date_format:Y-m-d H:i', // Bỏ `after:start_time` ở đây
        ];
    }

    /**
     * Configure the validator instance.
     * Đây là nơi tốt nhất để xử lý các validation logic phức tạp
     * liên quan đến nhiều trường hoặc dữ liệu từ database.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $showtimeId = $this->route('showtime');
            $showtime = ShowTimes::find($showtimeId);

            // Lấy thời gian bắt đầu hiệu quả (effective start_time):
            // Ưu tiên giá trị mới từ request, nếu không có thì lấy từ database
            $effectiveStartTime = null;
            if ($this->has('start_time')) {
                $effectiveStartTime = Carbon::parse($this->input('start_time'));
            } elseif ($showtime && $showtime->start_time) {
                $effectiveStartTime = Carbon::parse($showtime->start_time);
            }

            // Lấy thời gian kết thúc hiệu quả (effective end_time):
            // Ưu tiên giá trị mới từ request, nếu không có thì lấy từ database
            $effectiveEndTime = null;
            if ($this->has('end_time')) {
                $effectiveEndTime = Carbon::parse($this->input('end_time'));
            } elseif ($showtime && $showtime->end_time) {
                $effectiveEndTime = Carbon::parse($showtime->end_time);
            }

            // Chỉ thực hiện so sánh nếu cả hai thời gian đều có giá trị
            if ($effectiveStartTime && $effectiveEndTime) {
                if ($effectiveEndTime->lte($effectiveStartTime)) {
                    $validator->errors()->add('end_time', 'Thời gian kết thúc phải sau thời gian bắt đầu.');
                }
            }
        });
    }


    /**
     * Get custom messages for validation errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'movie_id.sometimes' => 'Id phim không được bỏ trống nếu có thay đổi.',
            'movie_id.required' => 'Vui lòng chọn phim chiếu',
            'movie_id.integer' => 'ID phim là kiểu số nguyên',
            'movie_id.exists' => 'ID phim chọn không tồn tại',

            'room_id.sometimes' => 'Id phòng chiếu không được bỏ trống nếu có thay đổi.',
            'room_id.required' => 'Vui lòng chọn phòng chiếu',
            'room_id.integer' => 'ID phòng chiếu là kiểu số nguyên',
            'room_id.exists' => 'ID phòng chiếu chọn không tồn tại',

            'start_time.sometimes' => 'Thời gian bắt đầu không được bỏ trống nếu có thay đổi.',
            'start_time.required' => 'Vui lòng chọn thời gian bắt đầu suất chiếu.',
            'start_time.date_format' => 'Thời gian bắt đầu phải đúng định dạng: YYYY-MM-DD HH:MM.',

            'end_time.sometimes' => 'Thời gian kết thúc không được bỏ trống nếu có thay đổi.',
            'end_time.required' => 'Vui lòng chọn thời gian kết thúc suất chiếu.',
            'end_time.date_format' => 'Thời gian kết thúc phải đúng định dạng: YYYY-MM-DD HH:MM.',
            'end_time.after_or_equal' => 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.', // Giữ lại message này cho luật tùy chỉnh
        ];
    }
}
