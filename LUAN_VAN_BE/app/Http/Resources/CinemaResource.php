<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CinemaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'cinema_id' => $this->cinema_id,
            'cinema_name' => $this->cinema_name,
            'address' => $this->address,
            'map_address' => $this->map_address,
            'district_id' => $this->district_id,
        ];
    }
}
