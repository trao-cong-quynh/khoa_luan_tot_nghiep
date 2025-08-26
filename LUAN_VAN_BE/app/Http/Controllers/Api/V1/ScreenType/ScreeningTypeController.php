<?php

namespace App\Http\Controllers\Api\V1\ScreenType;

use App\Http\Controllers\Controller;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\ScreenType\ScreenTypeServiceInterface as ScreenTypeService;
use Illuminate\Http\Request;

class ScreeningTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    private $screenTypeService;
    public function __construct(ScreenTypeService $screenTypeService)
    {
        $this->screenTypeService = $screenTypeService;
    }
    public function index()
    {
        $response = $this->screenTypeService->getAll();
        return ApiResource::ok($response, 'Lấy danh sách hình thức chiếu thành công');
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
    public function store(Request $request)
    {
        //
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
