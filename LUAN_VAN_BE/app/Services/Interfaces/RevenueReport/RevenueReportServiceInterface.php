<?php

namespace App\Services\Interfaces\RevenueReport;

interface RevenueReportServiceInterface
{
    public function getTotalRevenueByPeriod(string $period, ?string $date_str = null): array;

    public function getMovieRevenue(int $movieId, string $groupByPeriod, ?string $startDate_str = null, ?string $endDate_str = null);
    public function getAllMovieRevenue(?string $startDate_str = null, ?string $endDate_str = null, int $limit = 0);

    public function getRevenueTimeSeries(string $groupByPeriod, ?string $startDate_str = null, ?string $endDate_str = null): array;

    public function getAllCinemaRevenue(?string $startDate_str, ?string $endDate_str, int $limit = 0);

    public function getCinemaRevenue(int $cinemaId, string $groupByPeriod, ?string $startDate_str = null, ?string $endDate_str = null);

}

