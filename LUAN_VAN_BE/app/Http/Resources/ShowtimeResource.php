<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShowtimeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'status' => $this->status,
            'showtime_id' => $this->showtime_id,
            'start_time' => Carbon::parse($this->start_time)->format('Y-m-d H:i'),
            'end_time' => Carbon::parse($this->end_time)->format('Y-m-d H:i'),
            'movie' => MovieResource::make($this->whenLoaded('movies')),
            'room' => TheaterRoomResource::make($this->whenLoaded('theater_rooms')),
        ];
    }
}
