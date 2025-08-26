<?php

namespace App\Services\Impl\ScreenType;

use App\Models\ScreeningType;
use App\Services\Interfaces\ScreenType\ScreenTypeServiceInterface;

class ScreenTypeService implements ScreenTypeServiceInterface
{
    public function getAll()
    {
        $screentype = ScreeningType::all();
        return [
            'screentype' => $screentype
        ];
    }
}
