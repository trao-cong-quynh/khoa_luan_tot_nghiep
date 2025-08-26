<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMovieRequest extends FormRequest
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
        $movieId = $this->route('id');
        return [
            'movie_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('movies', 'movie_name')
                    ->ignore($movieId, 'movie_id')
                    ->whereNull('deleted_at'),
            ],
            'description' => 'sometimes|required|string',
            'duration' => 'sometimes|required|integer|min:1',
            'release_date' => 'sometimes|required|date',
            'poster' => 'sometimes|image|mimes:png,jpg,webp,jpeg|max:2048',
            'trailer_url' => 'sometimes|nullable|url|max:255',
            'derector' => 'sometimes|required|string',
            'actor' => 'sometimes|string',
            'status' => 'sometimes|required|in:Đang chiếu,Sắp chiếu',
            'age_rating' => 'sometimes|required|integer|min:12',
            'country' => 'sometimes|required|string|max:100',
            'genres_ids' => 'sometimes|required|array',
            'genres_ids.*' => 'integer|exists:genres,genre_id',
            'screenin_type_ids' => 'sometimes|required|array',
            'screenin_type_ids.*' => 'integer|exists:screening_type,screening_type_id',
        ];
    }

    public function messages(): array
    {

        return [
            'movie_name.sometimes' => 'Tên phim không được bỏ trống nếu có thay đổi.',
            'movie_name.required' => 'Tên phim là bắt buộc.',
            'movie_name.string' => 'Tên phim phải là chuỗi ký tự.',
            'movie_name.max' => 'Tên phim không được dài quá :max ký tự.',
            'movie_name.unique' => 'Tên phim đã tồn tại trong hệ thống. Vui lòng nhập tên khác.',

            'description.sometimes' => 'Mô tả không được bỏ trống nếu có thay đổi.',
            'description.required' => 'Mô tả là bắt buộc.',
            'description.string' => 'Mô tả phim phải là chuỗi ký tự.',

            'duration.sometimes' => 'Thời lượng phim không được bỏ trống nếu có thay đổi.',
            'duration.required' => 'Thời lượng phim là bắt buộc.',
            'duration.integer' => 'Thời lượng phim phải là số nguyên.',
            'duration.min' => 'Thời lượng phim phải lớn hơn hoặc bằng :min phút.',

            'release_date.sometimes' => 'Ngày phát hành không được bỏ trống nếu có thay đổi.',
            'release_date.required' => 'Ngày phát hành là bắt buộc.',
            'release_date.date' => 'Ngày phát hành không đúng định dạng.',


            'poster.sometimes' => 'Ảnh poster không được bỏ trống nếu có thay đổi.',
            'poster.image' => 'File tải lên phải là định dạng ảnh.',
            'poster.mimes' => 'Ảnh poster phải có định dạng: :values (png, jpg, webp, jpeg).',
            'poster.max' => 'Kích thước ảnh poster không được vượt quá :max KB.',

            'trailer_url.url' => 'URL trailer không hợp lệ.',
            'trailer_url.max' => 'URL trailer không được vượt quá :max ký tự.',

            'derector.sometimes' => 'Tên đạo diễn không được bỏ trống nếu có thay đổi.',
            'derector.required' => 'Tên đạo diễn là bắt buộc.',
            'derector.string' => 'Tên đạo diễn phải là chuỗi ký tự.',

            'actor.string' => 'Tên diễn viên phải là chuỗi ký tự.',

            'status.sometimes' => 'Trạng thái phim không được bỏ trống nếu có thay đổi.',
            'status.required' => 'Trạng thái phim là bắt buộc.',
            'status.in' => 'Trạng thái phim không hợp lệ. Vui lòng chọn "Đang chiếu" hoặc "Sắp chiếu".',

            'age_rating.sometimes' => 'Độ tuổi giới hạn không được bỏ trống nếu có thay đổi.',
            'age_rating.required' => 'Độ tuổi giới hạn là bắt buộc.',
            'age_rating.integer' => 'Độ tuổi giới hạn phải là số nguyên.',
            'age_rating.min' => 'Độ tuổi giới hạn phải lớn hơn hoặc bằng :min tuổi.',

            'country.sometimes' => 'Quốc gia không được bỏ trống nếu có thay đổi.',
            'country.required' => 'Quốc gia là bắt buộc.',
            'country.string' => 'Quốc gia phải là chuỗi ký tự.',
            'country.max' => 'Quốc gia không được dài quá :max ký tự.',

            'genres_ids.sometimes' => 'Thể loại phim không được bỏ trống nếu có thay đổi.',
            'genres_ids.required' => 'Thể loại phim là bắt buộc.',
            'genres_ids.array' => 'Thể loại phim phải là một danh sách.',
            'genres_ids.*.integer' => 'ID thể loại phải là số nguyên.',
            'genres_ids.*.exists' => 'Một trong các ID thể loại được chọn không tồn tại.',

            'screenin_type_ids.sometimes' => 'Hình thức chiếu không được bỏ trống nếu có thay đổi.',
            'screenin_type_ids.required' => 'Hình thức chiếu là bắt buộc.',
            'screenin_type_ids.array' => 'Hình thức chiếu  là một danh sách.',
            'screenin_type_ids.*.integer' => 'ID hình thức chiếu  phải là số nguyên.',
            'screenin_type_ids.*.exists' => 'Một trong các ID hình thức chiếu  được chọn không tồn tại.',
        ];
    }
}
