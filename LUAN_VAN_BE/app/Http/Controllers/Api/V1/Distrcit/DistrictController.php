<?php

namespace App\Http\Controllers\Api\V1\Distrcit;

use App\Http\Controllers\Controller;
use App\Http\Requests\DistrictRequest;
use App\Http\Requests\UpdateDistrictRequest;
use App\Http\Resources\ApiResource;
use App\Http\Resources\DistrictResource;
use App\Services\Interfaces\District\DistrictServiceInterface as DistrictService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class DistrictController extends Controller
{
    protected $districtService;
    public function __construct(DistrictService $districtService)
    {
        $this->districtService = $districtService;
    }
    public function index()
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->districtService->getAll();
            return ApiResource::ok(DistrictResource::collection($response), 'Lấy danh sách quận thành công');

        } else {
            return ApiResource::message('Bạn không có quyền xem danh sách quận.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(DistrictRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->districtService->insert($requestData);
            return ApiResource::ok(new DistrictResource($response), 'Tạo quận thành công');

        } else {
            return ApiResource::message('Bạn không có quyền tạo quận.', Response::HTTP_FORBIDDEN);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDistrictRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->districtService->upadate($id, $requestData);
            return ApiResource::ok(new DistrictResource($response), 'Cập nhật thông tin quận thành công');

        } else {
            return ApiResource::message('Bạn không có quyền cập nhật thông tin quận.', Response::HTTP_FORBIDDEN);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {

            $response = $this->districtService->delete($id);
            return ApiResource::ok($response, 'Xóa quận thành công');

        } else {
            return ApiResource::message('Bạn không có quyền xóa quận.', Response::HTTP_FORBIDDEN);
        }
    }

    public function restore(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->districtService->restore($id);
            return ApiResource::ok(new DistrictResource($response), 'Thêm lại quận thành công');

        } else {
            return ApiResource::message('Bạn không có quyền thêm lại quận.', Response::HTTP_FORBIDDEN);
        }
    }

    public function getListRestore()
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->districtService->getlistRestore();
            return ApiResource::ok(DistrictResource::collection($response), 'Lấy danh sách quận đã xóa thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền lấy dánh quận đã xóa.', Response::HTTP_FORBIDDEN);
        }
    }
}
