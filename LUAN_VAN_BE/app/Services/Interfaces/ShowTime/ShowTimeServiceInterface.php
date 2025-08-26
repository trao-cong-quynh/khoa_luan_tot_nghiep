<?php

namespace App\Services\Interfaces\ShowTime;

use App\Http\Requests\ShowTimeRequest;
use App\Http\Requests\updateShowTimeRequest;

interface ShowTimeServiceInterface
{
    public function reactivateShowtime(string $id);
    public function getFilteredShowtimes(array $filters);
    public function getShowTime(string $id);

    public function insert(ShowTimeRequest $request);
    public function update(updateShowTimeRequest $request, string $id);
    public function cancelShowtime(string $id);

}
