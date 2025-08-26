<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListRoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'room_id' => $this->room_id,
            'cinema_id' => $this->cinema_id,
            'room_name' => $this->room_name,
            'room_type' => $this->room_type,
            'total_columns' => $this->total_columns,
            'total_rows' => $this->total_rows
        ];
    }
}
