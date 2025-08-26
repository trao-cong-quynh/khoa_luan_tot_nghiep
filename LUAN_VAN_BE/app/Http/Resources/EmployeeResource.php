<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class EmployeeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->user_id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'birth_date' => $this->birth_date,
            'gender' => $this->gender,
            'avatar_url' => $this->getAvataUrl(),
            'is_active' => $this->is_active,
            'cinema_id' => $this->cinema_id,
            'roles' => $this->getRoleNames(),
        ];
    }

    public function getAvataUrl()
    {
        if ($this->avatar_url) {
            return Storage::url($this->avatar_url);
        }
        return null;
    }
}
