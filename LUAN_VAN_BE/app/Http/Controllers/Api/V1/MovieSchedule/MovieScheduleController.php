<?php

namespace App\Http\Controllers\Api\V1\MovieSchedule;

use App\Http\Controllers\Controller;
use App\Http\Requests\MovieScheduleRequest;
use App\Http\Requests\UpdateMovieScheduleRequest;
use App\Http\Resources\ApiResource;
use App\Http\Resources\MovieScheduleResource;
use App\Models\Cinemas;
use App\Models\MovieSchedules;
use App\Services\Interfaces\MovieSchedule\MovieScheduleServiceInterface as MovieScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
class MovieScheduleController extends Controller
{
    protected $movieScheduleService;

    public function __construct(MovieScheduleService $movieScheduleService)
    {
        $this->movieScheduleService = $movieScheduleService;
    }



    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {

            $response = $this->movieScheduleService->getAll();
            return ApiResource::ok(MovieScheduleResource::collection($response), 'Lấy danh sách lịch chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                return ApiResource::ok([], 'Bạn không quản lý rạp chiếu phim nào.');
            }


            $response = $this->movieScheduleService->getListWithDistrict($managedDistrictIds, $request->all());
            return ApiResource::ok(MovieScheduleResource::collection($response), 'Lấy danh sách lịch chiếu theo phạm vi quản lý của quán lý quận thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            $response = $this->movieScheduleService->getListMovieSheduleWithCinemaId($cinemaId);
            return ApiResource::ok(MovieScheduleResource::collection($response), 'Lấy danh sách lịch chiếu thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách lịch chiếu');
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
    public function store(MovieScheduleRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->movieScheduleService->insert($requestData);
            return ApiResource::ok(new MovieScheduleResource($response), 'Tạo lịch chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            $cinema = Cinemas::find($request->cinema_id);

            if (!$cinema) {
                return ApiResource::message('Rạp chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }
            if (!isset($cinema->district_id) || !in_array($cinema->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền tạo lịch chiếu vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $requestData = $request->validated();
            $response = $this->movieScheduleService->insert($requestData);
            return ApiResource::ok(new MovieScheduleResource($response), 'Tạo lịch chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $requestCinemaId = $request->input('cinema_id');
            if (!$requestCinemaId) {
                return ApiResource::message('Lịch chiếu phải là lịch chiếu của rạp nào.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id !== $requestCinemaId) {
                return ApiResource::message('Không thể tạo lịch chiếu vì rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $requestData = $request->validated();
            $response = $this->movieScheduleService->insert($requestData);
            return ApiResource::ok(new MovieScheduleResource($response), 'Tạo lịch chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền tạo lịch chiếu');
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
    public function update(UpdateMovieScheduleRequest $request, string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $response = $this->movieScheduleService->update($id, $requestData);
            return ApiResource::ok(new MovieScheduleResource($response), 'Sửa lịch chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $movieSchedule = MovieSchedules::withTrashed()->find($id);
            if (!$movieSchedule) {
                return ApiResource::message('Lịch chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }
            $cinema = $movieSchedule->cinema;
            if (!$cinema) {
                return ApiResource::message('Rạp chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }
            if (!isset($cinema->district_id) || !in_array($cinema->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền sửa lịch chiếu vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }
            $requestData = $request->validated();
            $response = $this->movieScheduleService->update($id, $requestData);
            return ApiResource::ok(new MovieScheduleResource($response), 'Sửa lịch chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {

            $movieSchedule = MovieSchedules::withTrashed()->find($id);
            if (!$movieSchedule) {
                return ApiResource::message('Lịch chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id !== $movieSchedule->cinema_id) {
                return ApiResource::message('Bạn không thể sửa thông tin lịch chiếu vì nó thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            if ($request->has('cinema_id')) {
                $requestCinemaId = $request->input('cinema_id');
                if (!$requestCinemaId) {
                    return ApiResource::message('Lịch chiếu phải là lịch chiếu của rạp nào.', Response::HTTP_NOT_FOUND);
                }

                if ($user->cinema_id !== $requestCinemaId) {
                    return ApiResource::message('Không thể tạo lịch chiếu vì rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
                }
            }
            $requestData = $request->validated();
            $response = $this->movieScheduleService->update($id, $requestData);
            return ApiResource::ok(new MovieScheduleResource($response), 'Sửa lịch chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền sửa lịch chiếu');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieScheduleService->delete($id);
            return ApiResource::ok($response, 'Xóa lịch chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $movieSchedule = MovieSchedules::withTrashed()->find($id);
            if (!$movieSchedule) {
                return ApiResource::message('Lịch chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }

            $cinema = $movieSchedule->cinema;
            if (!$cinema) {
                return ApiResource::message('Rạp chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }
            if (!isset($cinema->district_id) || !in_array($cinema->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền xóa lịch chiếu vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->movieScheduleService->delete($id);
            return ApiResource::ok($response, 'Xóa lịch chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {

            $movieSchedule = MovieSchedules::withTrashed()->find($id);
            if (!$movieSchedule) {
                return ApiResource::message('Lịch chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id !== $movieSchedule->cinema_id) {
                return ApiResource::message('Bạn không thể sửa thông tin lịch chiếu vì nó thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }



            $response = $this->movieScheduleService->delete($id);
            return ApiResource::ok($response, 'Xóa lịch chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền xóa lịch chiếu', Response::HTTP_FORBIDDEN);
        }
    }


    public function restore(string $id)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $response = $this->movieScheduleService->restore($id);
            return ApiResource::ok($response, 'Thêm lại lịch chiếu thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $movieSchedule = MovieSchedules::withTrashed()->find($id);
            if (!$movieSchedule) {
                return ApiResource::message('Lịch chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }

            $cinema = $movieSchedule->cinema;
            if (!$cinema) {
                return ApiResource::message('Rạp chiếu không tồn tại.', Response::HTTP_FORBIDDEN);

            }
            if (!isset($cinema->district_id) || !in_array($cinema->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền thêm lại lịch chiếu vì rạp không thuộc phạm vi quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->movieScheduleService->restore($id);
            return ApiResource::ok($response, 'Thêm lại lịch chiếu thành công');
        } else if ($user->hasRole('cinema_manager')) {

            $movieSchedule = MovieSchedules::withTrashed()->find($id);
            if (!$movieSchedule) {
                return ApiResource::message('Lịch chiếu không tồn tại.', Response::HTTP_NOT_FOUND);
            }

            if ($user->cinema_id !== $movieSchedule->cinema_id) {
                return ApiResource::message('Bạn không thể sửa thông tin lịch chiếu vì nó thuộc rạp không thuộc quản lý của bạn.', Response::HTTP_FORBIDDEN);
            }



            $response = $this->movieScheduleService->restore($id);
            return ApiResource::ok(new MovieScheduleResource($response), 'Thêm lại lịch chiếu thành công');
        } else {
            return ApiResource::message('Bạn không có quyền thêm lại lịch chiếu.', Response::HTTP_FORBIDDEN);
        }
    }

    public function getListRestore(Request $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {

            $response = $this->movieScheduleService->getListRestore();
            return ApiResource::ok(MovieScheduleResource::collection($response), 'Lấy danh sách lịch chiếu đã xóa thành công');
        } else if ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                return ApiResource::ok([], 'Bạn không quản lý rạp chiếu phim nào.');
            }


            $response = $this->movieScheduleService->getListRestoreWithDistrict($managedDistrictIds, $request->all());
            return ApiResource::ok(MovieScheduleResource::collection($response), 'Lấy danh sách lịch chiếu đã xóa theo phạm vi quản lý của quán lý quận thành công');
        } else if ($user->hasRole('cinema_manager')) {
            $cinemaId = $user->cinema_id;
            $response = $this->movieScheduleService->getListRestoreWithCinemaId($cinemaId);
            return ApiResource::ok(MovieScheduleResource::collection($response), 'Lấy danh sách lịch chiếu đã xóa thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền lấy danh sách lịch chiếu');
        }
    }
}
