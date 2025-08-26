<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTheaterRoomRequest extends FormRequest
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
        $roomId = $this->route('id');
        $cinemaId = $this->input('cinema_id') ?? $this->route('cinema_id');
        return [
            'cinema_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('cinemas', 'cinema_id')->whereNull('deleted_at')
            ],
            'room_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('theater_rooms', 'room_name')
                    ->ignore($roomId, 'room_id')
                    ->where(function ($query) use ($cinemaId) {
                        if ($cinemaId) {
                            $query->where('cinema_id', $cinemaId);
                        }
                    }),
            ],
            'room_type' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['thường', 'vip'])
            ],
            'total_columns' => 'sometimes|required|integer|min:1|max:50',
            'total_rows' => 'sometimes|required|integer|min:1|max:50'
        ];
    }

    public function messages(): array
    {
        return [
            'cinema_id.sometimes' => 'Id rạp chiếu phim không được để trống nếu có thay đổi.',
            'cinema_id.required' => 'Vui lòng chọn rạp chiếu phim.',
            'cinema_id.integer' => 'ID rạp chiếu phim phải là số nguyên.',
            'cinema_id.exists' => 'Rạp chiếu phim không tồn tại hoặc đã bị xóa.',

            'room_name.sometimes' => 'Tên phòng chiếu không được để trống nếu có thay đổi.',
            'room_name.required' => 'Vui lòng nhập tên phòng chiếu.',
            'room_name.string' => 'Tên phòng chiếu phải là chuỗi ký tự.',
            'room_name.max' => 'Tên phòng chiếu không được vượt quá 255 ký tự.',
            'room_name.unique' => 'Tên phòng chiếu đã tồn tại trong rạp này.',

            'room_type.sometimes' => 'Loại phòng chiếu không được để trống nếu có thay đổi.',
            'room_type.required' => 'Vui lòng chọn loại phòng chiếu.',
            'room_type.string' => 'Loại phòng chiếu phải là chuỗi ký tự.',
            'room_type.in' => 'Loại phòng chiếu chỉ được phép là "thường" hoặc "vip".',

            'total_columns.sometimes' => 'Số cột ghế củaphòng chiếu không được để trống nếu có thay đổi.',
            'total_columns.required' => 'Vui lòng nhập số cột ghế.',
            'total_columns.integer' => 'Số cột ghế phải là số nguyên.',
            'total_columns.min' => 'Số cột ghế tối thiểu là 1.',
            'total_columns.max' => 'Số cột ghế tối đa là 50.',

            'total_rows.sometimes' => 'Số hàng ghế củaphòng chiếu không được để trống nếu có thay đổi.',
            'total_rows.required' => 'Vui lòng nhập số hàng ghế.',
            'total_rows.integer' => 'Số hàng ghế phải là số nguyên.',
            'total_rows.min' => 'Số hàng ghế tối thiểu là 1.',
            'total_rows.max' => 'Số hàng ghế tối đa là 50.',
        ];
    }
}
