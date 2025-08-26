<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'booking_id' => $this->booking_id,

            'total_price' => (float) $this->total_price,
            'qr_code_url' => $this->qr_code_path ? asset($this->qr_code_path) : null,
            'total_tickets' => $this->total_tickets,
            'status' => $this->status,
            'booking_date' => Carbon::parse($this->booking_date)->format('Y-m-d H:i'),
            'showtime' => ShowtimeResource::make($this->whenLoaded('show_times')),
            'tickets' => BookedTicketResource::collection($this->whenLoaded('booked_tickets')),
            'user' => UserResource::make($this->whenLoaded('users')), // Giả sử user là một mối quan hệ (users)
            'concessions' => ConcessionItemResource::collection($this->whenLoaded('booking_concessions')),
        ];
    }
}
