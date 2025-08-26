<?php

namespace App\Services\Impl\Genre;

use App\Models\Genres;
use App\Services\Interfaces\Genre\GenreServiceInterface;
use DB;
use Exception;
use Log;
use Throwable;

class GenreService implements GenreServiceInterface
{
    public function getAll()
    {
        $genres = Genres::all();
        return $genres;
    }


    public function insert(array $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $genre = Genres::create($request);
                return $genre;
            });
        } catch (Throwable $e) {
            Log::error('Tạo thể loại thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request
            ]);
            throw $e;
        }
    }

    public function update(string $id, array $request)
    {

        try {
            return DB::transaction(function () use ($id, $request) {
                $genres = Genres::find($id);
                if (!$genres) {
                    throw new Exception('Thể loại không tồn tại.');
                }
                $genres->update($request);
                return $genres;
            });

        } catch (\Throwable $e) {
            Log::error('Sửa thông tin thể loại ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request
            ]);
            throw $e;
        }

    }
    public function delete(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $genres = Genres::find($id);
                if (!$genres) {
                    throw new Exception('Thể loại không tồn tại hoặc đã bị xóa');
                }

                $genres->delete();
                return true;
            });
        } catch (\Throwable $e) {
            Log::error('Xóa thể loại ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    public function restore(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $genres = Genres::withTrashed()->find($id);
                if (!$genres) {
                    throw new Exception('Thể loại không tồn tại');
                }
                if (!$genres->trashed()) {
                    throw new Exception('Thể loại chưa bị xóa');
                }

                $genres->restore();
            });
        } catch (\Throwable $e) {
            Log::error('Khôi phục thể loại' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }


    public function getlistRestore()
    {
        $genres = Genres::onlyTrashed()->get();

        return $genres;
    }
}
