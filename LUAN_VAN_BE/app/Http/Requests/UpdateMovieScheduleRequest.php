<?php

namespace App\Http\Requests;

use App\Models\MovieSchedules;
use Illuminate\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class UpdateMovieScheduleRequest extends FormRequest
{

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
            'movie_id' => 'sometimes|required|integer|exists:movies,movie_id',
            'cinema_id' => 'sometimes|required|integer|exists:cinemas,cinema_id',
            'start_date' => 'sometimes|required|date_format:Y-m-d H:i',
            'end_date' => 'sometimes|required|date_format:Y-m-d H:i|after:start_date',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $movieScheduleId = $this->route('id');
            $movieSchedule = MovieSchedules::find($movieScheduleId);


            // Lấy ngày bắt đầu hiệu quả (effective start_date):
            // Ưu tiên giá trị mới từ request, nếu không có thì lấy từ database
            $effectiveStartDate = null;
            if ($this->has('start_date')) {
                $effectiveStartDate = Carbon::parse($this->input('start_date'));
            } elseif ($movieSchedule && $movieSchedule->start_date) {
                $effectiveStartDate = Carbon::parse($movieSchedule->start_date);
            }

            // Lấy ngày kết thúc hiệu quả (effective end_date):
            // Ưu tiên giá trị mới từ request, nếu không có thì lấy từ database
            $effectiveEndDate = null;
            if ($this->has('end_date')) {
                $effectiveEndDate = Carbon::parse($this->input('end_date'));
            } elseif ($movieSchedule && $movieSchedule->end_date) {
                $effectiveEndDate = Carbon::parse($movieSchedule->end_date);
            }

            $effectiveMovieId = null;
            if ($this->has('movie_id')) {
                $effectiveMovieId = $this->input('movie_id');
            } elseif ($movieSchedule && $movieSchedule->movie_id) {
                $effectiveMovieId = $movieSchedule->movie_id;
            }

            $effectiveCinemaId = null;
            if ($this->has('movie_id')) {
                $effectiveCinemaId = $this->input('movie_id');
            } elseif ($movieSchedule && $movieSchedule->cinema_id) {
                $effectiveCinemaId = $movieSchedule->cinema_id;
            }

            if ($effectiveStartDate && $effectiveEndDate) {
                if ($effectiveEndDate->lte($effectiveStartDate)) {
                    $validator->errors()->add('end_time', 'Ngày kết thúc phải sau thời gian bắt đầu.');
                }
            }
        });
    }

    public function messages()
    {
        return [
            'movie_id.sometimes' => 'Id phim không được bỏ trống nếu có thay đổi.',
            'movie_id.required' => 'Mã phim là bắt buộc.',
            'movie_id.integer' => 'Mã phim phải là số nguyên.',
            'movie_id.exists' => 'ID phim chọn không tồn tại',

            'cinema_id.sometimes' => 'Id  rạp không được bỏ trống nếu có thay đổi.',
            'cinema_id.required' => 'Mã rạp là bắt buộc.',
            'cinema_id.integer' => 'Mã rạp phải là số nguyên.',
            'cinema_id.exists' => 'ID rạp chọn không tồn tại',

            'start_date.sometimes' => 'Ngày bắt đầu không được bỏ trống nếu có thay đổi.',
            'start_date.required' => 'Vui lòng chọn ngày bắt đầu lịch chiếu.',
            'start_date.date_format' => 'Ngày gian bắt đầu phải đúng định dạng: YYYY-MM-DD.',

            'end_date.sometimes' => 'Ngày kết thúc không được bỏ trống nếu có thay đổi.',
            'end_date.required' => 'Vui lòng chọn ngày kết thúc lịch chiếu.',
            'end_date.date_format' => 'Ngày kết thúc phải đúng định dạng: YYYY-MM-DD HH:MM.',
            'end_date.after' => 'Ngày kết thúc phải sau ngày bắt đầu.',
        ];
    }
}
