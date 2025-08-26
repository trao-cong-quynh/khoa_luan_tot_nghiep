<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TheaterRoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'room_id' => $this->room_id,
            'room_name' => $this->room_name,
            'room_type' => $this->room_type,
            'total_columns' => $this->total_columns,
            'total_rows' => $this->total_rows,
            'cinema' => CinemaResource::make($this->whenLoaded('cinemas')),
        ];
    }
}
