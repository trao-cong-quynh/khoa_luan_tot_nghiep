<?php

namespace App\Services\Impl\Tickettype;

use App\Models\TicketType;
use App\Services\Interfaces\Tickettype\TicketTypeServiceInterface;
use DB;
use Exception;
use Log;
use Throwable;

class TicketTypeService implements TicketTypeServiceInterface
{
    public function getAll()
    {
        $tickettype = TicketType::all();

        return [
            'tickeType' => $tickettype
        ];
    }


    public function insert(array $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $ticketType = TicketType::create($request);
                return $ticketType;
            });
        } catch (Throwable $e) {
            Log::error('Tạo loại vé thất bại: ' . $e->getMessage(), [
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
                $ticketType = TicketType::find($id);
                if (!$ticketType) {
                    throw new Exception('Loại vé không tồn tại.');
                }
                $ticketType->update($request);
                return $ticketType;
            });

        } catch (\Throwable $e) {
            Log::error('Sửa thông tin loại vé' . $id . ' thất bại: ' . $e->getMessage(), [
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

                $ticketType = TicketType::find($id);
                if (!$ticketType) {
                    throw new Exception('Loại vé không tồn tại hoặc đã bị xóa');
                }

                $ticketType->delete();
                return true;
            });
        } catch (\Throwable $e) {
            Log::error('Xóa loại vé ' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }

    public function restore(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $ticketType = TicketType::withTrashed()->find($id);
                if (!$ticketType) {
                    throw new Exception('Loại vé không tồn tại');
                }
                if (!$ticketType->trashed()) {
                    throw new Exception('Thể loại chưa bị xóa');
                }

                $ticketType->restore();
            });
        } catch (\Throwable $e) {
            Log::error('Khôi phục loại vé' . $id . ' thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }


    public function getlistRestore()
    {
        $ticketTypes = TicketType::onlyTrashed()->get();

        return $ticketTypes;
    }
}
