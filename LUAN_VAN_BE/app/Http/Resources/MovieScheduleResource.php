<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovieScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'movie_schedule_id' => $this->movie_schedule_id,
            'movie_id' => $this->movie_id,
            'cinema_id' => $this->cinema_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date
        ];
    }
}
