<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConcessionItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'concession_id' => $this->concession_id,
            'concession_name' => $this->whenLoaded('concessions', function () {
                return $this->concessions ? $this->concessions->concession_name : null;
            }),
            'quantity' => $this->quantity,
            'total_price' => (float) $this->total_price,
        ];
    }
}
