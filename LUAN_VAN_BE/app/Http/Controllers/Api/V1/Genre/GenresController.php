<?php

namespace App\Http\Controllers\Api\V1\Genre;

use App\Http\Controllers\Controller;
use App\Http\Requests\GenresRequest;
use App\Http\Requests\UpdateGenresRequest;
use App\Http\Resources\ApiResource;
use App\Models\Genres;
use App\Services\Interfaces\Genre\GenreServiceInterface as GenreService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class GenresController extends Controller
{


    private $genreService;
    public function __construct(GenreService $genreService)
    {
        $this->genreService = $genreService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $response = $this->genreService->getAll();
        return ApiResource::ok($response, 'Lấy danh sách loại phim thành công');
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
    public function store(GenresRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->genreService->insert($requestData);
            return ApiResource::ok($response, 'Tạo thể loại phim thành công');
        }
        return ApiResource::message('Bạn không có quyền tạo thể loại');
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
    public function update(UpdateGenresRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->genreService->update($id, $requestData);
            return ApiResource::ok($response, 'Sửa thông tin thể loại phim thành công');
        }
        return ApiResource::message('Bạn không có quyền sửa thể loại');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {

        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->genreService->delete($id);
            return ApiResource::ok($response, 'Xóa thể loại phim thành công');
        }
        return ApiResource::message('Bạn không có quyền xóa thể loại');
    }

    public function restore(string $id)
    {

        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->genreService->restore($id);
            return ApiResource::ok($response, 'Thêm lại thể loại phim thành công');
        }
        return ApiResource::message('Bạn không có quyền thêm lại thể loại');
    }


    public function getAllRestore()
    {

        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->genreService->getlistRestore();
            return ApiResource::ok($response, 'Lấy danh sách thể loại phim đã xóa thành công');
        }
        return ApiResource::message('Bạn không có quyền lấy danh sách thể loại phim đã xóa.', Response::HTTP_FORBIDDEN);
    }
}
