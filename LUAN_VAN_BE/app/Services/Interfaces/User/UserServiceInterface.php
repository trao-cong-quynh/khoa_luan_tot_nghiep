<?php

namespace App\Services\Interfaces\User;

use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UserRequest;

interface UserServiceInterface
{

    public function getAll();
    public function insert(UserRequest $request);

    public function update(UpdateUserRequest $request, string $id);
    public function getUser(string $id);
    public function delete(string $id);

    public function getAllEmployees(array $districtIds);

    public function getEmployeeByCinemaId(string $id, string $userId);
}
