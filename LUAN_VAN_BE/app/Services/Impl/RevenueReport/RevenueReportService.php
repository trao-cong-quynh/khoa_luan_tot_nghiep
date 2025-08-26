<?php

namespace App\Services\Impl\RevenueReport;

use App\Constants\BookingStatus;
use App\Models\Bookings;
use App\Models\Cinemas;
use App\Models\Movies;
use App\Services\Interfaces\RevenueReport\RevenueReportServiceInterface;
use Carbon\Carbon;
use DB;
use Exception;
use InvalidArgumentException;

class RevenueReportService implements RevenueReportServiceInterface
{
    public function getTotalRevenueByPeriod(string $period, ?string $date_str = null): array
    {
        $startDate = null;
        $endDate = null;
        $format = '';
        $now = Carbon::now();
        switch ($period) {
            case 'day':
                $date = $date_str ? Carbon::parse($date_str) : Carbon::now();
                $startDate = $date->copy()->startOfDay();
                $calculatedEndDate = $date->copy()->endOfDay();
                $format = 'Y-m-d';
                break;
            case 'week':
                $date = $date_str ? Carbon::parse($date_str)->startOfWeek() : Carbon::now()->startOfWeek();
                $startDate = $date->copy()->startOfDay();
                $calculatedEndDate = $date->copy()->endOfWeek()->endOfDay();
                break;
            case 'month':
                $date = $date_str ? Carbon::parse($date_str)->startOfMonth() : Carbon::now()->startOfMonth();
                $startDate = $date->copy()->startOfDay();
                $calculatedEndDate = $date->copy()->endOfMonth()->endOfDay();
                break;
            case 'year':
                $date = $date_str ? Carbon::parse($date_str)->startOfYear() : Carbon::now()->startOfYear();
                $startDate = $date->copy()->startOfDay();
                $calculatedEndDate = $date->copy()->endOfYear()->endOfDay();
                break;
            default:
                return $this->getTotalRevenueByPeriod('day', $date_str);
        }

        $endDate = $calculatedEndDate->lessThan($now) ? $calculatedEndDate : $now;
        $totalRevenue = Bookings::whereBetween('booking_date', [$startDate->format('Y-m-d H:i:s'), $endDate->format('Y-m-d H:i:s')])
            ->where('status', BookingStatus::PAID->value)->sum('total_price');
        $bookingCount = Bookings::whereBetween('booking_date', [$startDate->format('Y-m-d H:i:s'), $endDate->format('Y-m-d H:i:s')])
            ->where('status', BookingStatus::PAID->value)->count();
        return [
            'period' => $period,
            'date_range_start' => $startDate->format('Y-m-d H:i:s'),
            'date_range_end' => $endDate->format('Y-m-d H:i:s'),
            'display_period' => $date->format($format),
            'total_revenue' => $totalRevenue ?? 0,
            'bookings_count' => $bookingCount,
            'currency' => 'VND'
        ];
    }

    public function getMovieRevenue(int $movieId, string $groupByPeriod, ?string $startDate_str = null, ?string $endDate_str = null)
    {
        list($startDate, $endDate) = $this->resolveDateRange($groupByPeriod, $startDate_str, $endDate_str);
        $now = Carbon::now();

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate, $startDate];
        }

        $movie = Movies::withTrashed()->find($movieId);
        if (!$movie) {
            throw new Exception('Phim không tồn tại trong hệ thống.');
        }
        $config = $this->getGroupByConfig($groupByPeriod);
        $startDateFormatted = $startDate->format('Y-m-d H:i:s');
        $endDateFormatted = $endDate->format('Y-m-d H:i:s');
        $query = Bookings::query()->with(['show_times', 'show_times.movies'])->
            where('status', '=', BookingStatus::PAID->value)
            ->whereBetween('booking_date', [$startDateFormatted, $endDateFormatted])
            ->whereHas('show_times', function ($q) use ($movieId) {
                $q->where('movie_id', $movieId);

            });


        $results = $query->select(
            DB::raw($config['select']),
            DB::raw('SUM(total_price) as total_revenue'),
            DB::raw('COUNT(booking_id) as booking_count')
        )
            ->groupBy(DB::raw($config['group']))
            ->orderByRaw($config['order'], )
            ->get();
        $formattedResults = $results->map(function ($item) {
            return [
                'period_key' => $item->period_key,
                'total_revenue' => $item->total_revenue,
                'booking_count' => $item->booking_count,

            ];
        })->toArray();

        $fullPeriodData = $this->fillMissingPeriods($formattedResults, $startDate, $endDate, $groupByPeriod, $config['format']);


        return [
            'movie_id' => $movie->movie_id,
            'movie_name' => $movie->movie_name,
            'group_by' => $groupByPeriod,
            'date_range_start' => $startDateFormatted,
            'date_range_end' => $endDateFormatted,
            'data' => $fullPeriodData,
            'currency' => 'VND',

        ];
    }

    public function getAllMovieRevenue(?string $startDate_str = null, ?string $endDate_str = null, int $limit = 0)
    {
        $bookingQuery = Bookings::query();
        $now = Carbon::now();
        $startDate = $startDate_str ? Carbon::parse($startDate_str) : null;
        $endDate = $endDate_str ? Carbon::parse($endDate_str) : null;

        if (!$startDate || !$endDate) {
            $endDate = $endDate ?? $now;
            $startDate = $startDate ?? $endDate->copy()->subDays(29)->startOfDay();
        }

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate, $startDate];
        }
        $startDateFormatted = $startDate->format('Y-m-d H:i:s');
        $endDateFormatted = $endDate->format('Y-m-d H:i:s');
        $query = DB::table('movies')
            ->leftJoin('show_times', 'movies.movie_id', '=', 'show_times.movie_id')
            ->leftJoin('bookings', function ($join) use ($startDateFormatted, $endDateFormatted) {
                $join->on('bookings.showtime_id', '=', 'show_times.showtime_id')
                    ->where('bookings.status', '=', BookingStatus::PAID->value)
                    ->whereBetween('bookings.booking_date', [$startDateFormatted, $endDateFormatted]);
            })
            ->select(
                'movies.movie_id',
                'movies.movie_name',
                DB::raw('COALESCE(SUM(bookings.total_price),0) as total_revenue'),
                DB::raw('COALESCE(COUNT(bookings.booking_id),0) as total_count')
            )
            ->groupBy('movies.movie_id', 'movies.movie_name')
            ->orderBy('total_revenue', 'desc')
        ;

        if ($limit > 0) {
            $query->limit($limit);
        }
        $formatted = collect($query->get())->map(function ($item) {
            return [
                'movie_id' => $item->movie_id,
                'movie_name' => $item->movie_name,
                'total_revenue' => (float) $item->total_revenue == (int) $item->total_revenue
                    ? (int) $item->total_revenue : (float) $item->total_revenue,
                'book_count' => $item->total_count
            ];
        });
        return [
            'all movies revenue' => $formatted,
            'date_range_start' => $startDate->format('Y-m-d H:i:s'),
            'date_range_end' => $endDate->format('Y-m-d H:i:s'),
        ];
    }
    public function getAllCinemaRevenue(?string $startDate_str, ?string $endDate_str, int $limit = 0)
    {
        $startDate = $startDate_str ? Carbon::parse($startDate_str) : null;
        $endDate = $endDate_str ? Carbon::parse($endDate_str) : null;
        $now = Carbon::now();
        if (!$startDate && !$endDate) {
            $endDate = $endDate ?? $now;
            $startDate = $startDate ?? $endDate->copy()->subDays(29)->startOfDay();
        }

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate, $startDate];
        }

        $startDateFormatted = $startDate->format('Y-m-d H:i:s');
        $endDateFormatted = $endDate->format('Y-m-d H:i:s');

        $query = Cinemas::query()
            ->select([
                'cinemas.cinema_id',
                'cinemas.cinema_name',
                DB::raw('COALESCE(SUM(bookings.total_price), 0) as total_revenue'),
                DB::raw('COALESCE(COUNT(bookings.booking_id),0) as booking_count')
            ])->leftJoin('theater_rooms', 'theater_rooms.cinema_id', '=', 'cinemas.cinema_id')
            ->leftJoin('show_times', 'show_times.room_id', '=', 'theater_rooms.room_id')
            ->leftJoin('bookings', function ($join) use ($startDateFormatted, $endDateFormatted) {
                $join->on('bookings.showtime_id', '=', 'show_times.showtime_id')
                    ->where('bookings.status', '=', BookingStatus::PAID->value)
                    ->whereBetween('booking_date', [$startDateFormatted, $endDateFormatted]);
            })
            ->groupBy('cinemas.cinema_id', 'cinemas.cinema_name')
            ->orderBy('total_revenue', 'desc');

        if ($limit > 0) {
            $query->limit($limit);
        }
        $results = $query->get()->map(function ($item) {
            return [
                'cinema_id' => $item->cinema_id,
                'cinema_name' => $item->cinema_name,
                'total_revenue' => (float) $item->total_revenue == (int) $item->total_revenue
                    ? (int) $item->total_revenue : (float) $item->total_revenu,
                'booking_count' => $item->booking_count
            ];
        });
        return [
            'all cinema revenue' => $results,
            'date_range_start' => $startDateFormatted,
            'date_range_end' => $endDateFormatted,
        ];
    }

    public function getCinemaRevenue(int $cinemaId, string $groupByPeriod, ?string $startDate_str = null, ?string $endDate_str = null)
    {
        list($startDate, $endDate) = $this->resolveDateRange($groupByPeriod, $startDate_str, $endDate_str);

        if ($startDate->greaterThan($endDate)) {
            [$startDate, $endDate] = [$endDate, $startDate];
        }

        $cinema = Cinemas::withTrashed()->find($cinemaId);

        if (!$cinema) {
            throw new Exception('Rạp chiếu phim không tồn tại.');
        }
        $config = $this->getGroupByConfig($groupByPeriod);
        $startDateFormatted = $startDate->format('Y-m-d H:i:s');
        $endDateFormatted = $endDate->format('Y-m-d H:i:s');

        $query = Bookings::query()->select([
            DB::raw($config['select']),
            DB::raw('SUM(total_price) as total_revenue'),
            DB::raw('COUNT(booking_id) as booking_count')
        ])
            ->where('status', '=', BookingStatus::PAID->value)
            ->whereBetween('booking_date', [$startDateFormatted, $endDateFormatted])
            ->whereHas('show_times', function ($query) use ($cinemaId) {
                $query->whereHas('theater_rooms', function ($q) use ($cinemaId) {
                    $q->whereHas('cinemas', function ($q) use ($cinemaId) {
                        $q->where('cinema_id', $cinemaId);
                    });
                });
            })
            ->groupBy(DB::raw($config['group']))
            ->orderByRaw($config['order'])
            ->get();
        $results = $query->map(function ($item) {
            return [
                'period_key' => $item->period_key,
                'total_revenue' => $item->total_revenue,
                'booking_count' => $item->booking_count
            ];
        })->toArray();

        $fullPeriodData = $this->fillMissingPeriods($results, $startDate, $endDate, $groupByPeriod, $config['format']);
        return [
            'cinema_id' => $cinema->cinema_id,
            'cinema_name' => $cinema->cinema_name,
            'date_range_start' => $startDateFormatted,
            'date_range_end' => $endDateFormatted,
            'data' => $fullPeriodData
        ];
    }

    public function getRevenueTimeSeries(string $groupByPeriod, ?string $startDate_str = null, ?string $endDate_str = null): array
    {
        list($startDateCarbon, $endDateCarbon) = $this->resolveDateRange($groupByPeriod, $startDate_str, $endDate_str);
        if ($startDateCarbon->greaterThan($endDateCarbon)) {
            [$startDateCarbon, $endDateCarbon] = [$endDateCarbon, $startDateCarbon];
        }

        $config = $this->getGroupByConfig($groupByPeriod);
        $query = Bookings::query()
            ->where('status', BookingStatus::PAID->value)
            ->whereBetween('booking_date', [
                $startDateCarbon->format('Y-m-d H:i:s'),
                $endDateCarbon->format('Y-m-d H:i:s')
            ]);
        $a = BookingStatus::PAID->value;

        $results = $query->select(
            DB::raw($config['select']),
            DB::raw('SUM(total_price) as total_revenue'),
            DB::raw('COUNT(booking_id) as booking_count')
        )
            ->groupBy(DB::raw($config['group']))

            ->orderByRaw($config['order'])
            ->get();
        $formattedResult = $results->map(function ($item) {
            return [
                'period_key' => $item->period_key,
                'total_revenue' => (float) $item->total_revenue,
                'booking_count' => (int) $item->booking_count,
                'currency' => 'VND',
            ];
        })->toArray();

        $fullPeriodData = $this->fillMissingPeriods($formattedResult, $startDateCarbon, $endDateCarbon, $groupByPeriod, $config['format']);
        return [
            'group_by' => $groupByPeriod,
            'date_range_start' => $startDateCarbon->format(format: 'Y-m-d H:i:s'),
            'date_range_and' => $endDateCarbon->format(format: 'Y-m-d H:i:s'),
            'data' => $fullPeriodData,
            'currency' => 'VND',
        ];
    }

    protected function fillMissingPeriods(array $existingData, Carbon $startDate, Carbon $endDate, string $groupByPeriod, string $dateFormat): array
    {
        $filledData = [];
        $currentDate = $startDate->copy();
        $existingDataMap = collect($existingData)->keyBy('period_key');
        $increment = match ($groupByPeriod) {
            'day' => fn($date) => $date->addDay(),
            'week' => fn($date) => $date->addWeek(),
            'month' => fn($date) => $date->addMonth(),
            'year' => fn($date) => $date->addYear(),
            default => fn($date) => $date->addDay(),
        };
        while ($currentDate->lessThanOrEqualTo($endDate)) {
            $periodKey = $currentDate->format($dateFormat);
            $filledData[] = $existingDataMap->get($periodKey) ?? [
                'period_key' => $periodKey,
                'total_revenue' => 0,
                'booking_count' => 0,
            ];

            $currentDate = $increment($currentDate);
        }

        usort($filledData, function ($a, $b) use ($groupByPeriod) {
            if ($groupByPeriod === 'week') {
                $now = Carbon::now();

                [$yearA, $weekA] = explode('-W', $a['period_key']);
                [$yearB, $weekB] = explode('-W', $b['period_key']);

                return [$yearA, $weekA] <=> [$yearB, $weekB];
            }
            return $a['period_key'] <=> $b['period_key'];
        });
        return $filledData;
    }

    protected function resolveDateRange(string $groupByPeriod, ?string $startDate_str, ?string $endDate_str)
    {
        $startDateCarbon = $startDate_str ? Carbon::parse($startDate_str)->startOfDay() : null;
        $endDateCarbon = $endDate_str ? Carbon::parse($endDate_str)->endOfDay() : null;
        $now = Carbon::now();
        if ($endDateCarbon && $endDateCarbon->greaterThan($now)) {
            $endDateCarbon = $now->copy()->endOfDay();
        }
        if (!$startDateCarbon && !$endDateCarbon) {
            switch ($groupByPeriod) {
                case 'day':
                    $endDateCarbon = $now->copy()->subDay()->endOfDay();
                    $startDateCarbon = $endDateCarbon->copy()->subDays(29)->startOfDay();
                    break;
                case 'week':
                    $endDateCarbon = $now->copy()->startOfWeek()->subSecond();
                    $startDateCarbon = $endDateCarbon->copy()->subWeeks(3)->startOfWeek()->startOfDay();
                    break;
                case 'month':
                    $endDateCarbon = $now->copy()->startOfMonth()->subSecond();
                    $startDateCarbon = $endDateCarbon->copy()->subMonths(11)->startOfMonth()->startOfDay();
                    break;
                case 'year':
                    $endDateCarbon = $now->copy()->startOfYear()->subSecond();
                    $startDateCarbon = $endDateCarbon->copy()->subYears(3)->startOfYear()->startOfDay();
                    break;
                default:
                    $endDateCarbon = $now->copy()->endOfDay();
                    $startDateCarbon = $endDateCarbon->copy()->subDays(29)->startOfDay();
                    break;
            }
        } else if (!$startDateCarbon && $endDateCarbon) {
            switch ($groupByPeriod) {
                case 'day':
                    $startDateCarbon = $endDateCarbon->copy()->subDays(29)->startOfDay();
                    break;
                case 'week':
                    $startDateCarbon = $endDateCarbon->copy()->subWeeks(3)->startOfWeek()->startOfDay();
                    break;
                case 'month':
                    $startDateCarbon = $endDateCarbon->copy()->subMonths(11)->startOfMonth()->startOfDay();
                    break;
                case 'year':
                    $startDateCarbon = $endDateCarbon->copy()->subYears(3)->startOfYear()->startOfDay();
                default:
                    $startDateCarbon = $endDateCarbon->copy()->subDays(29)->startOfDay();
                    break;
            }
        } else if ($startDateCarbon && !$endDateCarbon) {
            switch ($groupByPeriod) {
                case 'day':
                    $calculatedEndDate = $startDateCarbon->copy()->addDays(29)->endOfDay();
                    break;
                case 'week':
                    $calculatedEndDate = $startDateCarbon->copy()->addWeeks(3)->endOfWeek()->startOfDay();
                    break;
                case 'month':
                    $calculatedEndDate = $startDateCarbon->copy()->addMonths(11)->endOfMonth()->endOfDay();
                    break;
                case 'year':
                    $calculatedEndDate = $startDateCarbon->copy()->addYears(3)->endOfYear()->endOfDay();
                    break;
                default:
                    $calculatedEndDate = $startDateCarbon->copy()->addDays(29)->endOfDay();
                    break;
            }
            $endDateCarbon = $calculatedEndDate->lessThan($now) ? $calculatedEndDate : $now;
        }

        return [$startDateCarbon, $endDateCarbon];
    }


    public function getGroupByConfig(string $groupByPeriod): array
    {
        return match ($groupByPeriod) {
            'day' => [
                'select' => "DATE(booking_date) as period_key",
                'group' => "DATE(booking_date)",
                'order' => "DATE(booking_date) DESC",
                'format' => 'Y-m-d'
            ],
            'week' => [
                'select' => "CONCAT(YEAR(booking_date), '-W', WEEK(booking_date, 1)) as period_key",
                'group' => "CONCAT(YEAR(booking_date), '-W', WEEK(booking_date, 1))",
                'order' => "CONCAT(YEAR(booking_date), '-W', WEEK(booking_date, 1)) DESC",
                'format' => 'Y-\WW',
            ],
            'month' => [
                'select' => "DATE_FORMAT(booking_date, '%Y-%m') as period_key",
                'group' => "DATE_FORMAT(booking_date, '%Y-%m') ",
                'order' => "DATE_FORMAT(booking_date, '%Y-%m')  DESC",
                'format' => 'Y-m',
            ],
            'year' => [
                'select' => "YEAR(booking_date) as period_key",
                'group' => "YEAR(booking_date)",
                'order' => "YEAR(booking_date) DESC",
                'format' => 'Y',
            ],
            default => throw new InvalidArgumentException("Invalid groupByPeriod: $groupByPeriod")
        };
    }
}
