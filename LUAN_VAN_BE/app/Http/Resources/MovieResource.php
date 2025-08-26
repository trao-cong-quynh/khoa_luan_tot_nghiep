<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovieResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'movie_id' => $this->movie_id,
            'movie_name' => $this->movie_name,
            'description' => $this->description, // Ví dụ: thêm mô tả
            'duration' => $this->duration_minutes, // Ví dụ: thêm thời lượng
            'release_date' => $this->release_date, // Ví dụ: ngày phát hành
            'poster_url' => $this->poster_url, // Ví dụ: URL poster
            'trailer_url' => $this->trailer_url, // Ví dụ: URL trailer
            'age_rating' => $this->age_rating,
            'derector' => $this->director,
            'actor' => $this->cast,
            'status' => $this->status,
            'country' => $this->country,
        ];
    }
}
