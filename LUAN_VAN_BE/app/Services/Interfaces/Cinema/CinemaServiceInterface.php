<?php

namespace App\Services\Interfaces\Cinema;

use App\Http\Requests\CinemaRequest;
use App\Http\Requests\UpdateCinemaRequest;
use Illuminate\Http\Request;

interface CinemaServiceInterface
{
    // Cập nhật chữ ký để nhận mảng filters, và trả về array
    public function getAll(array $filters = []): array;
    public function getCinema(string $id): ?array; // Trả về array hoặc null

    // Thêm phương thức mới để lọc theo quận
    public function getCinemasByDistrictIds(array $districtIds, array $filters = []): array;

    public function insert(CinemaRequest $request): array;
    public function update(UpdateCinemaRequest $request, string $id): array;
    public function delete(string $id): bool; // Trả về boolean
    public function restore(string $id);// Trả về array
    public function getListRestore(): array; // Trả về array
    public function getRestoreById(string $id); // Trả về array

    public function getListRestoreByDistrict(array $districtIds): array;

}
