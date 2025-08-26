<?php

namespace App\Services\Interfaces\District;

interface DistrictServiceInterface
{
    public function getALl();

    public function insert(array $request);

    public function upadate(string $id, array $request);

    public function delete(string $id);

    public function restore(string $id);

    public function getlistRestore();
}
