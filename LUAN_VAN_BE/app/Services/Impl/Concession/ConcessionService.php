<?php

namespace App\Services\Impl\Concession;

use App\Models\Concessions;
use App\Services\Interfaces\Concession\ConcessionServiceInterface;
use DB;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Storage;
use Log;
use Str;

class ConcessionService implements ConcessionServiceInterface
{
    public function getAll()
    {

        $concessions = Concessions::all();
        if (!$concessions) {
            throw new Exception('Không có đô ăn/uống nào.');
        }
        $formattedConcesstion = $concessions->map(function ($concession) {
            $concessionsArray = $concession->toArray();

            if (isset($concessionsArray['image_url']) && $concessionsArray['image_url']) {
                $concessionsArray['image_url'] = Storage::url($concessionsArray['image_url']);
            }
            return $concessionsArray;
        });


        return [
            'concessions' => $formattedConcesstion,
        ];
    }
    public function getConcession(string $id)
    {

        $concessions = Concessions::find($id);
        if (!$concessions) {
            throw new Exception('Đồ ăn/uống không tồn tại.');
        }

        $concessionsArray = $concessions->toArray();

        if (isset($concessionsArray['image_url']) && $concessionsArray['image_url']) {
            $concessionsArray['image_url'] = Storage::url($concessionsArray['image_url']);
        }
        return [
            'concessions' => $concessionsArray,
        ];
    }

    public function insert(array $request, ?UploadedFile $image = null)
    {
        try {
            return DB::transaction(function () use ($request, $image) {
                $imagepath = null;
                if ($image) {
                    $originalName = pathinfo($image->getClientOriginalName(), flags: PATHINFO_FILENAME);
                    $extension = $image->getClientOriginalExtension();
                    $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                    $imagepath = $image->storeAs('concessions', $fileName, 'public');
                }

                $concessionData = [
                    'concession_name' => $request['concession_name'],
                    'description' => $request['description'],
                    'unit_price' => $request['unit_price'],
                    'category' => $request['category'],
                    'image_url' => $imagepath
                ];

                $concession = Concessions::create($concessionData);
                $concessionArray = $concession->toArray();
                if ($concessionArray['image_url']) {
                    $concessionArray['image_url'] = Storage::url($concessionArray['image_url']);
                }
                return [
                    'concession' => $concessionArray
                ];
            });

        } catch (\Throwable $e) {
            Log::error('Tạo đồ ằn/uống thất bại: ' . $e->getMessage(), [
                'exception' => $e,
                'request_data' => $request
            ]);
            throw $e;
        }

    }

    public function update(string $id, array $request, ?UploadedFile $image = null)
    {
        try {
            return DB::transaction(function () use ($id, $request, $image) {
                $concession = Concessions::find($id);
                if (!$concession) {
                    throw new Exception('Đồ ăn/uống không tồn tại');
                }
                $imagePath = $concession['image_url'];

                if ($image) {
                    if ($concession['image_url'] && Storage::disk('public')->exists($concession['image_url'])) {
                        Storage::disk('public')->delete($concession['image_url']);
                    }

                    $originalName = pathinfo($image->getClientOriginalName(), flags: PATHINFO_FILENAME);
                    $extension = $image->getClientOriginalExtension();
                    $fileName = time() . '_' . Str::slug($originalName) . '.' . $extension;
                    $imagePath = $image->storeAs('concessions', $fileName, 'public');

                }
                $request['image_url'] = $imagePath;
                $concession->update($request);

                $concessionArray = $concession->toArray();
                if ($concessionArray['image_url']) {
                    $concessionArray['image_url'] = Storage::url($concessionArray['image_url']);
                }
                return [
                    'concession' => $concessionArray
                ];
            });

        } catch (\Throwable $e) {
            Log::error('Sửa thông tin đồ ằn/uống thất bại: ' . $e->getMessage(), [
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
                $concession = Concessions::find($id);
                if (!$concession) {
                    throw new Exception('Đồ ăn/uống không tồn tại trong hệ thống');
                }

                $concession->delete();
                return true;
            });

        } catch (\Throwable $e) {
            Log::error('Xóa đồ ằn/uống thất bại: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }

    }

    public function retore(string $id)
    {
        $concession = Concessions::withTrashed()->find($id);
        if (!$concession) {
            throw new Exception('Đồ ăn/uống không có trong hệ thống');
        }

        if (!$concession->trashed()) {
            throw new Exception('Đồ ăn/uống chưa bị xóa');
        }
        $concession->restore();
        $concessionArray = $concession->toArray();
        if ($concessionArray['image_url']) {
            $concessionArray['image_url'] = Storage::url($concessionArray['image_url']);
        }
        return [
            'concession' => $concessionArray
        ];

    }


    public function getListConcessionDeleted()
    {

        $concessions = Concessions::onlyTrashed()->get();

        $formattedConcesstion = $concessions->map(function ($concession) {
            $concessionsArray = $concession->toArray();

            if (isset($concessionsArray['image_url']) && $concessionsArray['image_url']) {
                $concessionsArray['image_url'] = Storage::url($concessionsArray['image_url']);
            }
            return $concessionsArray;
        });


        return [
            'concessions' => $formattedConcesstion,
        ];

    }


}
