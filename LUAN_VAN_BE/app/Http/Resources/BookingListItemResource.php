<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingListItemResource extends JsonResource
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
            'movie_name' => $this->whenLoaded('show_times', function () {
                // Đảm bảo movie được load trong show_times
                return $this->show_times->movies->movie_name ?? null;
            }),
            'showtime_start_end' => $this->whenLoaded('show_times', function () {
                $start = Carbon::parse($this->show_times->start_time)->format('H:i');
                $end = Carbon::parse($this->show_times->end_time)->format('H:i');
                return "{$start} - {$end}";
            }),
            'showtime_date' => $this->whenLoaded('show_times', function () {
                return Carbon::parse($this->show_times->start_time)->format('Y-m-d');
            }),
            'status' => $this->status,
            'booking_date' => Carbon::parse($this->booking_date)->format('Y-m-d H:i'),
            'total_price' => (float) $this->total_price,
        ];
    }
}
