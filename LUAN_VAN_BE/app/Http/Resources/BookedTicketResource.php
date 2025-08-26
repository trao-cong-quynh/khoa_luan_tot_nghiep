<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookedTicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // Các trường của BookedTicket
            'id' => $this->id, // ID của bản ghi booked_tickets
            'booking_id' => $this->booking_id,
            'unit_price' => (float) $this->unit_price, // Giá của vé này

            // Ghép thông tin ghế trực tiếp vào đây
            'seat_id' => $this->seat_id, // ID ghế
            'seat_display_name' => $this->whenLoaded('seats', function () {
                return $this->seats ? $this->seats->seat_row . $this->seats->seat_column : null;
            }),

            // Ghép thông tin loại vé trực tiếp vào đây
            'ticket_type_id' => $this->ticket_type_id, // ID loại vé
            'ticket_type_name' => $this->whenLoaded('ticket_types', function () {
                return $this->ticket_types ? $this->ticket_types->ticket_type_name : null;
            }),
        ];
    }
}
