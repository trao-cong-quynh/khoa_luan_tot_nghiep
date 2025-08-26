<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MovieRequest extends FormRequest
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
            'movie_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('movies', 'movie_name')->whereNull('deleted_at'),
            ],
            'description' => 'required|string',
            'duration' => 'required|integer|min:1',
            'release_date' => 'required|date',
            'poster' => 'required|image|mimes:png,jpg,webp,jpeg|max:2048',
            'trailer_url' => 'nullable|url|max:255',
            'derector' => 'required|string',
            'actor' => 'string',
            'status' => 'required|in:Đang chiếu,Sắp chiếu',
            'age_rating' => 'required|integer|min:12',
            'country' => 'required|string|max:100',
            'genres_ids' => 'required|array',
            'genres_ids.*' => 'integer|exists:genres,genre_id',
            'screening_type_ids' => 'required|array',
            'screening_type_ids.*' => 'integer|exists:screening_type,screening_type_id',
        ];
    }

    public function messages()
    {
        return [
            //movie_name
            'movie_name.required' => 'Tên phim là bắt buộc.',
            'movie_name.string' => 'Tên phim phải là chuỗi ký tự.',
            'movie_name.max' => 'Tên phim không được dài quá :max ký tự.',
            'movie_name.unique' => 'Tên phim đã tồn tại trong hệ thống. Vui lòng nhập tên khác.',

            //description
            'description.required' => 'Mô tả là bắt buộc.',
            'description.string' => 'Mô tả phim phải là chuỗi ký tự.',

            //duration
            'duration.required' => 'Thời lượng phim là bắt buộc.',
            'duration.integer' => 'Thời lượng phim phải là số nguyên.',
            'duration.min' => 'Thời lượng phim phải lớn hơn hoặc bằng :min phút.',

            //release_date
            'release_date.required' => 'Ngày phát hành là bắt buộc.',
            'release_date.date' => 'Ngày phát hành không đúng định dạng.',

            //poster
            'poster.required' => 'Ảnh poster là bắt buộc.',
            'poster.image' => 'File tải lên phải là định dạng ảnh.',
            'poster.mimes' => 'Ảnh poster phải có định dạng: :values (png, jpg, webp, jpeg).',
            'poster.max' => 'Kích thước ảnh poster không được vượt quá :max KB.',

            'trailer_url.url' => 'URL trailer không hợp lệ.',
            'trailer_url.max' => 'URL trailer không được vượt quá :max ký tự.',
            //director
            'derector.required' => 'Tên đạo diễn là bắt buộc.',
            'derector.string' => 'Tên đạo diễn phải là chuỗi ký tự.',

            //actor
            'actor.string' => 'Tên diễn viên phải là chuỗi ký tự.',

            //status
            'status.required' => 'Trạng thái phim là bắt buộc.',
            'status.in' => 'Trạng thái phim không hợp lệ. Vui lòng chọn "Đang chiếu" hoặc "Sắp chiếu".',

            //age_rating
            'age_rating.required' => 'Độ tuổi giới hạn là bắt buộc.',
            'age_rating.integer' => 'Độ tuổi giới hạn phải là số nguyên.',
            'age_rating.min' => 'Độ tuổi giới hạn phải lớn hơn hoặc bằng :min tuổi.',

            //country
            'country.required' => 'Quốc gia là bắt buộc.',
            'country.string' => 'Quốc gia phải là chuỗi ký tự.',
            'country.max' => 'Quốc gia không được dài quá :max ký tự.',

            //genres_ids
            'genres_ids.required' => 'Thể loại phim là bắt buộc.',
            'genres_ids.array' => 'Thể loại phim phải là một danh sách.',
            'genres_ids.*.integer' => 'ID thể loại phải là số nguyên.',
            'genres_ids.*.exists' => 'Một trong các ID thể loại được chọn không tồn tại.',

            //screening_type
            'screening_type_ids.required' => 'Hình thức chiếu phim là bắt buộc.',
            'screening_type_ids.array' => 'Hình thức chiếu phải là một danh sách.',
            'screening_type_ids.*.integer' => 'ID Hình thức chiếu là số nguyên.',
            'screening_type_ids.*.exists' => 'Một trong các ID hình thức chiếu được chọn không tồn tại.',
        ];
    }
}
