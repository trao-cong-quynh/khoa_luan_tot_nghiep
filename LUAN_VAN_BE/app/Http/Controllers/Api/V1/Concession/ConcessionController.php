<?php

namespace App\Http\Controllers\Api\V1\Concession;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConcessionRequest;
use App\Http\Requests\UpdateConcessionRequest;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\Concession\ConcessionServiceInterface as ConcessionService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ConcessionController extends Controller
{
    protected $concessionService;

    public function __construct(ConcessionService $concessionService)
    {
        $this->concessionService = $concessionService;
    }
    public function index()
    {

        $response = $this->concessionService->getAll();
        return ApiResource::ok($response, 'Lấy danh sách dịch vụ ăn uống thành công');
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
    public function store(ConcessionRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('user')) {
            return ApiResource::message('Bạn không có quyền thêm các đồ ăn/uống.', Response::HTTP_FORBIDDEN);
        }
        $data = $request->validated();
        $image = $request->file('image');
        $response = $this->concessionService->insert($data, $image);
        return ApiResource::ok($response, 'Tạo đồ đồ ăn/uống thành công');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $response = $this->concessionService->getConcession($id);
        return ApiResource::ok($response, 'Lấy thông đồ ăn/uống thành công');
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
    public function update(UpdateConcessionRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('user')) {
            return ApiResource::message('Bạn không có quyền sửa thông các đồ ăn/uống.', Response::HTTP_FORBIDDEN);
        }
        $data = $request->validated();
        $image = $request->file('image');

        $response = $this->concessionService->update($id, $data, $image);
        return ApiResource::ok($response, 'Sửa thông tin đồ ăn/uống thành công');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('user')) {
            return ApiResource::message('Bạn không có quyền xóa các đồ ăn/uống.', Response::HTTP_FORBIDDEN);
        }

        $response = $this->concessionService->delete($id, );
        return ApiResource::ok($response, 'Xóa đồ ăn/uống thành công');
    }

    public function restore(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('user')) {
            return ApiResource::message('Bạn không có quyền thêm lại các đồ ăn/uống vào hệ thống.', Response::HTTP_FORBIDDEN);
        }

        $response = $this->concessionService->retore($id, );
        return ApiResource::ok($response, 'Thêm lại đồ ăn/uống vào hệ thống thành công');
    }


    public function getListConcessionRestore()
    {
        $user = Auth::user();
        if ($user->hasRole('user')) {
            return ApiResource::message('Bạn không có quyền lấy dánh sách đồ ăn/uống đã bị xóa.', Response::HTTP_FORBIDDEN);
        }

        $response = $this->concessionService->getListConcessionDeleted();
        return ApiResource::ok($response, 'Lấy danh sách dịch vụ ăn uống đã xóa thành công');
    }

}
