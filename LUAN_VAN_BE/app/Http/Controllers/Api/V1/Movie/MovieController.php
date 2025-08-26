<?php

namespace App\Http\Controllers\Api\V1\Movie;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckSeatRequest;
use App\Http\Requests\MovieRequest;
use App\Http\Requests\UpdateMovieRequest;
use App\Http\Resources\ApiResource;
use App\Http\Resources\MovieResource;
use App\Services\Interfaces\Movie\MovieServiceInterface as MovieService;

use Carbon\Carbon;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MovieController extends Controller
{
    private $movieService;
    public function __construct(MovieService $movieService)
    {
        $this->movieService = $movieService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $response = $this->movieService->getAll();
        return ApiResource::ok($response, 'Lấy danh sách phim thành công');
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
    public function store(MovieRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieService->insert($request);
            return ApiResource::ok($response, 'Thêm phim thành công');
        } else {
            return ApiResource::message('Bạn không có quyền thêm phim.', Response::HTTP_FORBIDDEN);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $response = $this->movieService->getMovie($id);
        return ApiResource::ok($response, 'Lấy thông tin phim thành công');
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
    public function update(UpdateMovieRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieService->update($request, $id);
            return ApiResource::ok($response, 'Sửa thành công');
        }
        return ApiResource::message('Bạn không có quyền cập nhật thông tin phim', Response::HTTP_FORBIDDEN);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieService->delete($id);
            return ApiResource::ok($response, 'Xóa phim thành công. ');
        }
        return ApiResource::message('Bạn không có quyền xóa phim.', Response::HTTP_FORBIDDEN);


    }


    public function restore(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieService->restore($id);
            return ApiResource::ok($response, 'Thêm phim vào lại hệ thống thành công');
        }
        return ApiResource::message('Bạn không có quyền thêm phim vào lại hệ thống');


    }

    public function getMoviesRetore()
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieService->getMovieRetore();
            return ApiResource::ok($response, 'Lấy danh sách phim đã xóa mềm thành công');
        }
        return ApiResource::message('Bạn không có quyền lấy danh sách phim đã xóa.', Response::HTTP_FORBIDDEN);

    }

    public function getMovieWithShowtimes(string $id)
    {
        $response = $this->movieService->getMovieWithCinemasAndShowtimes($id);
        return ApiResource::ok($response, 'Lấy thông tin và suất chiếu thành công');
    }

    public function getSeatMap(string $id)
    {
        $response = $this->movieService->getShowtimeSeatMap($id);
        return ApiResource::ok($response, 'Lấy danh sách ghế thành công');
    }

    public function getSeatMapCheck(string $id, CheckSeatRequest $request)
    {
        $requestData = $request->validated();

        $response = $this->movieService->getShowtimeSeatMapCheck($id, $requestData);
        if (!empty($response)) {
            return ApiResource::error($response, 'Một số ghế đã được đặt.', Response::HTTP_CONFLICT);
        }
        return ApiResource::ok([], 'Tất cả ghế đều hợp lệ.');
    }

    public function getListMovieToCinema(string $id)
    {
        $response = $this->movieService->getListMovieToCinema($id);
        return ApiResource::ok($response, 'Lấy danh sách phim cho rạp thành công');
    }

    public function getListMovieForDistrictManager()
    {
        $user = Auth::user();
        $movies = [];
        if ($user->hasRole('admin')) {
            $movies = $this->movieService->getAll();
            return ApiResource::ok($movies, 'Lấy danh sách phim thành công');
        } else if ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                return ApiResource::message('Bạn không quản lý quận nào.');
            }
            $movies = $this->movieService->getListMovieWithMovieSchedule($managedDistrictIds);
        } else {
            $movies = $this->movieService->getAll();
        }

        return ApiResource::ok($movies, 'Lấy danh sách phim thành công.');
    }


    public function filter(Request $request)
    {
        $filters = $request->only(['search', 'genre']);
        $user = Auth::user();
        if ($user) {
            $filters['user'] = $user->refresh();
        }
        $movies = $this->movieService->searchMovies($filters);
        return ApiResource::ok(['movies' => $movies,], 'Lấy danh sách phim thành công', );
    }


    public function indexClinet()
    {
        $response = $this->movieService->getMoviesClient();
        return ApiResource::ok($response, 'Lấy danh sách phim thành công');
    }

}
