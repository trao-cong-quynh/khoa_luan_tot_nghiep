<?php

namespace App\Http\Controllers\Api\V1\TicketType;

use App\Http\Controllers\Controller;
use App\Http\Requests\TicketTypeRequest;
use App\Http\Requests\UpdateTicketTypeRequest;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\Tickettype\TicketTypeServiceInterface as TicketTypeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class TicketTypeController extends Controller
{

    protected $tickettypeService;
    public function __construct(TicketTypeService $ticketTypeService)
    {
        $this->tickettypeService = $ticketTypeService;
    }

    public function index()
    {
        $response = $this->tickettypeService->getAll();
        return ApiResource::ok($response, 'Lấy danh sách lloại vé thành công');
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
    public function store(TicketTypeRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->tickettypeService->insert($requestData);
            return ApiResource::ok($response, 'Tạo loại vé thành công.');
        }
        return ApiResource::message('Bạn không có quyền tạo loại vé.', Response::HTTP_FORBIDDEN);


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
    public function update(UpdateTicketTypeRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->tickettypeService->update($id, $requestData);
            return ApiResource::ok($response, 'Sửa thông tin loại vé  thành công.');
        }
        return ApiResource::message('Bạn không có quyền sửa loại vé.', Response::HTTP_FORBIDDEN);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {

        $user = Auth::user();

        if ($user->hasRole('admin')) {
            $response = $this->tickettypeService->delete($id);
            return ApiResource::ok($response, 'Xóa loại vé  thành công');
        }
        return ApiResource::message('Bạn không có quyền xóa loại vé.', Response::HTTP_FORBIDDEN);
    }


    public function restore(string $id)
    {

        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->tickettypeService->restore($id);
            return ApiResource::ok($response, 'Thêm lại loại vé  thành công');
        }
        return ApiResource::message('Bạn không có quyền thêm lại loại vé.', Response::HTTP_FORBIDDEN);
    }


    public function getAllRestore()
    {

        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->tickettypeService->getlistRestore();
            return ApiResource::ok($response, 'Lấy danh sách lại loại vé đã xóa thành công');
        }
        return ApiResource::message('Bạn không có quyền lấy danh sách loại vé đã xóa.', Response::HTTP_FORBIDDEN);
    }
}
