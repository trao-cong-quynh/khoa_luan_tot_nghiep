<?php

namespace App\Services\Impl\District;

use App\Models\District;
use App\Services\Interfaces\District\DistrictServiceInterface;
use DB;
use Exception;
use Log;
use Throwable;

class DistrictService implements DistrictServiceInterface
{
    public function getALl()
    {
        $district = District::all();
        return $district;
    }

    public function insert(array $request)
    {
        try {

            return DB::transaction(function () use ($request) {


                $district = District::create($request);

                return $district;
            });

        } catch (Throwable $e) {
            Log::error('Tạo quận thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_date' => $request
            ]);
            throw $e;
        }
    }

    public function upadate(string $id, array $request)
    {
        try {
            return DB::transaction(function () use ($id, $request) {
                $district = District::find($id);
                if (!$district) {
                    throw new Exception('Quận không tồn tại.');
                }
                $district->update($request);

                return $district;
            });

        } catch (Throwable $e) {
            Log::error('Cập nhật thôn tin quận thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_date' => $request
            ]);
            throw $e;
        }
    }

    public function delete(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $district = District::find($id);
                if (!$district) {
                    throw new Exception('Quận không tồn tại.');
                }
                $district->delete();
                return true;
            });

        } catch (Throwable $e) {
            Log::error('Cập nhật thôn tin quận thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    public function restore(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $district = District::withTrashed()->find($id);
                if (!$district) {
                    throw new Exception('Quận không tồn tại.');
                }
                if (!$district->trashed()) {
                    throw new Exception('Quận chưa xóa.');
                }
                $isActive = District::where('district_name', $district->district_name)->first();
                if ($isActive) {
                    throw new Exception('Quận này đang hoạt động.');
                }
                $district->restore();
                return $district;
            });

        } catch (Throwable $e) {
            Log::error('Cập nhật thôn tin quận thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    public function getlistRestore()
    {
        $districts = District::onlyTrashed()->get();
        return $districts;
    }

}
