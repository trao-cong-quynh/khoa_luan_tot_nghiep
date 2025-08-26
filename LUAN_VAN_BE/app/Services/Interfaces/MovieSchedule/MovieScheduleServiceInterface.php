<?php

namespace App\Services\Interfaces\MovieSchedule;

interface MovieScheduleServiceInterface
{
    public function insert(array $request);

    public function getAll();

    public function delete(string $id);

    public function update(string $id, array $request);

    public function getListWithDistrict(array $districtArr, array $filters = []);

    public function restore(string $id);

    public function getListMovieSheduleWithCinemaId(string $id);
    public function getListRestore();
    public function getListRestoreWithCinemaId(string $id);
    public function getListRestoreWithDistrict(array $districtArr, array $filters = []);

}
