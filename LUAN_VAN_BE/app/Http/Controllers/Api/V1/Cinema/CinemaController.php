<?php

namespace App\Http\Controllers\Api\V1\Cinema;

use App\Http\Controllers\Controller;
use App\Http\Requests\CinemaRequest;
use App\Http\Requests\UpdateCinemaRequest;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\Cinema\CinemaServiceInterface as CinemaService;
use App\Services\Interfaces\User\UserServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\Cinemas; // Import Model Cinema


class CinemaController extends Controller
{
    protected $cinemaService;
    protected $userService;

    public function __construct(CinemaService $cinemaService, UserServiceInterface $userService)
    {
        $this->cinemaService = $cinemaService;
        $this->userService = $userService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $cinemas = [];

        if ($user->hasRole('admin')) {
            $cinemas = $this->cinemaService->getAll($request->all());
        } elseif ($user->hasRole('district_manager')) {

            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrictIds)) {
                return ApiResource::ok([], 'Bạn không quản lý rạp chiếu phim nào.');
            }
            $cinemas = $this->cinemaService->getCinemasByDistrictIds($managedDistrictIds, $request->all());
        } else {
            $cinemas = $this->cinemaService->getAll($request->all());
        }

        return ApiResource::ok($cinemas, 'Lấy danh sách rạp chiếu phim thành công');
    }



    public function store(CinemaRequest $request)
    {
        $user = Auth::user();


        if ($user->hasRole('admin')) {
            $response = $this->cinemaService->insert($request);
            return ApiResource::ok($response, 'Thêm rạp chiếu phim thành công');
        } else if ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $requestDistrictId = $request->input('district_id');
            if (!in_array($requestDistrictId, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyên thêm rạp vào quận này vì bạn không quản lý quận này.', Response::HTTP_FORBIDDEN);
            }
            $response = $this->cinemaService->insert($request);
            return ApiResource::ok($response, 'Thêm rạp chiếu phim thành công');

        } else {
            return ApiResource::message('Bạn không có quyền thêm rạp chiếu phim.', Response::HTTP_FORBIDDEN);
        }
    }


    public function show(string $id)
    {
        $user = Auth::user();

        $formattedCinema = $this->cinemaService->getCinema($id);

        if ($user->hasRole('admin')) {
            return ApiResource::ok($formattedCinema, 'Lấy thông tin rạp chiếu phim thành công');
        } elseif ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (!isset($formattedCinema['district_id']) || !in_array($formattedCinema['district_id'], $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền xem rạp này.', Response::HTTP_FORBIDDEN);
            }
            return ApiResource::ok($formattedCinema, 'Lấy thông tin rạp chiếu phim thành công');
        } else {
            return ApiResource::ok($formattedCinema, 'Lấy thông tin rạp chiếu phim thành công');
        }
    }



    public function update(UpdateCinemaRequest $request, string $id)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            $response = $this->cinemaService->update($request, $id);
            return ApiResource::ok($response, 'Sửa rạp chiếu phim thành công');
        } elseif ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            $cinemaToUpdate = Cinemas::find($id);
            if (!$cinemaToUpdate) {
                return ApiResource::message('Rạp chiếu phim không tồn tại.', Response::HTTP_NOT_FOUND);
            }
            if (!in_array($cinemaToUpdate->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền sửa rạp này vì bạn không quản lý quận này.', Response::HTTP_FORBIDDEN);
            }


            if ($request->has('district_id')) {
                $newDistrictId = $request->input('district_id');
                if (!in_array($newDistrictId, $managedDistrictIds)) {
                    return ApiResource::message('Bạn không thể chuyển rạp đến một quận không được quản lý.', Response::HTTP_FORBIDDEN);
                }
            }

            $response = $this->cinemaService->update($request, $id);
            return ApiResource::ok($response, 'Sửa rạp chiếu phim thành công');
        } else {
            return ApiResource::message('Bạn không có quyền sửa rạp chiếu phim.', Response::HTTP_FORBIDDEN);
        }
    }


    public function destroy(string $id)
    {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            $response = $this->cinemaService->delete($id);
            return ApiResource::ok($response, 'Xóa rạp chiếu phim thành công');
        } elseif ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();
            $cinema = Cinemas::find($id);
            if (!$cinema) {
                return ApiResource::message('Rạp không tồn tại.', Response::HTTP_FORBIDDEN);
            }

            if (!isset($cinema->district_id) || !in_array($cinema->district_id, $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền xóa rạp này.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->cinemaService->delete($id);
            return ApiResource::ok($response, 'Xóa rạp chiếu phim thành công');
        } else {
            return ApiResource::message('Bạn không có quyền xóa rạp chiếu phim.', Response::HTTP_FORBIDDEN);
        }
    }

    public function restore(string $id)
    {
        $user = Auth::user();

        $cinemaData = $this->cinemaService->getRestoreById($id);

        if ($user->hasRole('admin')) {
            $response = $this->cinemaService->restore($id);
            return ApiResource::ok($response, 'Thêm lại rạp chiếu phim vào hệ thống thành công');
        } elseif ($user->hasRole('district_manager')) {
            $managedDistrictIds = $user->managedDistricts->pluck('district_id')->toArray();

            if (!isset($cinemaData['district_id']) || !in_array($cinemaData['district_id'], $managedDistrictIds)) {
                return ApiResource::message('Bạn không có quyền khôi phục rạp này.', Response::HTTP_FORBIDDEN);
            }

            $response = $this->cinemaService->restore($id);
            return ApiResource::ok($response, 'Thêm lại rạp chiếu phim vào hệ thống thành công');
        } else {
            return ApiResource::message('Bạn không có quyền khôi phục rạp chiếu phim.', Response::HTTP_FORBIDDEN);
        }
    }

    public function getListRestore()
    {
        $user = Auth::user();
        $listCinemasRestore = [];
        if ($user->hasRole('admin')) {
            $listCinemasRestore = $this->cinemaService->getListRestore();
        } else if ($user->hasRole('district_manager')) {
            $managedDistrict = $user->managedDistricts->pluck('district_id')->toArray();

            if (empty($managedDistrict)) {
                return ApiResource::ok([], "Bạn không quản lý rạp phim nào.");
            }
            $listCinemasRestore = $this->cinemaService->getListRestoreByDistrict($managedDistrict);
        }

        return ApiResource::ok($listCinemasRestore, 'lay danh sach rap da xoa thanh cong');
    }

}



