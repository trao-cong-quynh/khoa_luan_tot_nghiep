<?php

namespace App\Services\Interfaces\TheaterRoom;

use App\Http\Requests\TheaterRoomRequest;
use App\Http\Requests\UpdateTheaterRoomRequest;

interface TheaterRoomServiceInterface
{
    public function getAll(string $id);

    public function insert(TheaterRoomRequest $request);
    public function update(UpdateTheaterRoomRequest $request, string $id);

    public function delete(string $id);
    public function restore(string $id);
    public function getListSeatInRoom(string $id);

    public function getListWithCinemaId(string $id);
}
