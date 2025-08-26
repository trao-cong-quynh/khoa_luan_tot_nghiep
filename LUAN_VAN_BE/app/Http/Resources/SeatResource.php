<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SeatResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'seat_id' => $this->seat_id,
            'room_id' => $this->room_id, // Giữ lại room_id nếu cần
            'seat_row' => $this->seat_row, // Giữ lại hàng riêng nếu cần
            'seat_column' => $this->seat_column, // Giữ lại cột riêng nếu cần
            'seat_display_name' => $this->seat_row . $this->seat_column, // Đây là trường mới bạn muốn!
            'seat_status' => $this->seat_status,
        ];
    }
}
