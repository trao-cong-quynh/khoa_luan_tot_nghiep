<?php

namespace App\Http\Controllers\Api\V1\RevenueReport;

use App\Http\Controllers\Controller;
use App\Http\Requests\MovieAllRevenueRequest;
use App\Http\Requests\RevenueMovieRequest;
use App\Http\Requests\RevenueReportRequest;
use App\Http\Requests\RevenueTimeSeriesRequest;
use App\Http\Resources\ApiResource;
use App\Services\Interfaces\RevenueReport\RevenueReportServiceInterface as RevenueReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RevenueReportController extends Controller
{
    protected $revenueReportService;

    public function __construct(RevenueReportService $revenueReportService)
    {
        $this->revenueReportService = $revenueReportService;
    }
    public function index()
    {
        //
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

    public function getTotalRevenue(RevenueReportRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestDate = $request->validated();
            $period = $requestDate['period'] ?? 'day';
            $date_str = $requestDate['date'];
            $response = $this->revenueReportService->getTotalRevenueByPeriod($period, $date_str);
            return ApiResource::ok($response, 'Lấy báo cáo doanh thu thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xem báo cáo doanh thu.');
        }

    }

    public function getRevenueMovie(int $movieId, RevenueMovieRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();

            $startDate_str = $requestData['start_date'] ?? null;
            $endDate_str = $requestData['end_date'] ?? null;
            $groupBy = $requestData['group_by'] ?? 'day';

            $response = $this->revenueReportService->getMovieRevenue($movieId, $groupBy, $startDate_str, $endDate_str);
            return ApiResource::ok($response, 'Lấy báo cáo doanh thu cho phim thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xem báo cáo doanh thu cho phim.');
        }

    }

    public function getMovieAllRevenue(MovieAllRevenueRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $startDate_str = $requestData['start_date'] ?? null;
            $endDate_str = $requestData['end_date'] ?? null;
            $limit = $requestData['limit'] ?? 0;
            $response = $this->revenueReportService->getAllMovieRevenue($startDate_str, $endDate_str, $limit);
            return ApiResource::ok($response, 'Lấy báo cáo doanh thu cho tất cả phim thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xem báo cáo doanh thu cho tất cả phim.');
        }

    }

    public function getAllCinemaRevenue(MovieAllRevenueRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $startDate_str = $requestData['start_date'] ?? null;
            $endDate_str = $requestData['end_date'] ?? null;
            $limit = $requestData['limit'] ?? 0;
            $response = $this->revenueReportService->getAllCinemaRevenue($startDate_str, $endDate_str, $limit);
            return ApiResource::ok($response, 'Lấy báo cáo doanh thu cho tất cả phim thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xem báo cáo doanh thu cho tất cả phim.');
        }

    }

    public function getCinemaRevenue(int $id, RevenueMovieRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();

            $startDate_str = $requestData['start_date'] ?? null;
            $endDate_str = $requestData['end_date'] ?? null;
            $groupBy = $requestData['group_by'] ?? 'day';
            $response = $this->revenueReportService->getCinemaRevenue($id, $groupBy, $startDate_str, $endDate_str);
            return ApiResource::ok($response, 'Lấy báo cáo doanh thu cho phim thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xem báo cáo doanh thu cho phim.');
        }

    }

    public function getRevenueTimeSeries(RevenueTimeSeriesRequest $request)
    {
        $user = Auth::user();
        if ($user->hasRole('admin')) {
            $requestData = $request->validated();
            $groupByPeriod = $requestData['group_by'] ?? 'day';
            $startDate_str = $requestData['start_date'] ?? null;
            $endDate_str = $requestData['end_date'] ?? null;
            $response = $this->revenueReportService->getRevenueTimeSeries($groupByPeriod, $startDate_str, $endDate_str);
            return ApiResource::ok($response, 'Lấy báo cáo doanh thu thành công.');
        } else {
            return ApiResource::message('Bạn không có quyền xem báo cáo doanh thu.');
        }

    }


}
