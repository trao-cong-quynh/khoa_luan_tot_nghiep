<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Booking\BookingController;
use App\Http\Controllers\Api\V1\Cinema\CinemaController;
use App\Http\Controllers\Api\V1\Concession\ConcessionController;
use App\Http\Controllers\Api\V1\Distrcit\DistrictController;
use App\Http\Controllers\Api\V1\Genre\GenresController;
use App\Http\Controllers\Api\V1\MoMo\MoMoController;
use App\Http\Controllers\Api\V1\Movie\MovieController;
use App\Http\Controllers\Api\V1\MovieSchedule\MovieScheduleController;
use App\Http\Controllers\Api\V1\Payment\BookingPaymentController;
use App\Http\Controllers\Api\V1\Promotion\PromotionController;
use App\Http\Controllers\Api\V1\RevenueReport\RevenueReportController;
use App\Http\Controllers\Api\V1\ScreenType\ScreeningTypeController;
use App\Http\Controllers\Api\V1\ShowTime\ShowTimeController;
use App\Http\Controllers\Api\V1\TheaterRoom\TheaterRoomController;
use App\Http\Controllers\Api\V1\TicketType\TicketTypeController;
use App\Http\Controllers\Api\V1\User\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Public Routes (không yêu cầu xác thực) ---
Route::post('/login', [AuthController::class, 'authenticate'])->middleware('throttle:login');
Route::post('/register', [AuthController::class, 'register']);

// Quyền này có thể không cần middleware nếu là public info, hoặc là 'view movies'
Route::prefix('auth')->group(function () {
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

Route::prefix('movie')->group(function () {
    Route::get('', [MovieController::class, 'index']);
    Route::get('/movies/client', [MovieController::class, 'indexClinet']);
    Route::get('/cinema/{id}', [MovieController::class, 'getListMovieToCinema']);
    Route::get('/{id}/movieandshowtime', [MovieController::class, 'getMovieWithShowtimes']);
    Route::get('/{id}', [MovieController::class, 'show']);



});

Route::get('genre', [GenresController::class, 'index']);

Route::get('screentype', [ScreeningTypeController::class, 'index']);

Route::get('room/{id}/seatmap', [MovieController::class, 'getSeatMap']);
Route::post('room/{id}/check-seat', [MovieController::class, 'getSeatMapCheck']);
Route::get('ticket-type', [TicketTypeController::class, 'index']);

Route::get('concession', [ConcessionController::class, 'index']);
// Route::post('payment/momo/ipn', [MoMoController::class, 'ipn'])->name('momo.ipn');
// Route::get('payment/momo/return', [BookingPaymentController::class, 'handleReturnMoMo']);


Route::prefix('payment')->group(function () {

    Route::post('/initiate', [BookingPaymentController::class, 'createBookingAndInitiatePayment'])->middleware('auth:sanctum', 'permission:booking');
    Route::get('/{method}/return', [BookingPaymentController::class, 'handleReturn'])->name('payment.return');
    Route::post('/{method}/ipn', [BookingPaymentController::class, 'handleIpn'])->name('payment.ipn');

    // Route::get('/status', [BookingPaymentController::class, 'checkTransactionSatus'])->middleware('auth:sanctum', 'permission:booking');
});
Route::prefix('promotion')->group(function () {
    Route::get('/user', [PromotionController::class, 'indexPublic']);
    Route::post('/apply', [PromotionController::class, 'calculatePromotion']);
});

Route::get('movie/list/filter-public', [MovieController::class, 'filter']);

Route::get('promotion/cilent', [PromotionController::class, 'getPromotionClient']);
Route::middleware(['auth:sanctum'])->group(function () {
    // User profile and logout
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // --- Quản lý người dùng (Users) ---

    Route::get('users', [UserController::class, 'index'])->middleware('permission:view users');
    Route::get('users/{id}', [UserController::class, 'show'])->middleware('permission:view users');
    Route::post('users', [UserController::class, 'store'])->middleware('permission:create users');
    Route::match(['put', 'patch'], 'users/{id}', [UserController::class, 'update'])->middleware('permission:edit users');
    Route::delete('users/{id}', [UserController::class, 'destroy'])->middleware('permission:delete users');
    Route::get('movie/list/filter', [MovieController::class, 'filter']);
    // --- Quản lý phim (Movies) ---
    Route::prefix('movie')->group(function () {
        Route::get('/managed/list', [MovieController::class, 'getListMovieForDistrictManager'])->middleware('permission:view movies');
        Route::post('', [MovieController::class, 'store'])->middleware('permission:create movies');
        Route::match(['put', 'patch'], '{id}', [MovieController::class, 'update'])->middleware('permission:edit movies');
        Route::delete('{id}', [MovieController::class, 'destroy'])->middleware('permission:delete movies');

        Route::post('{id}/restore', [MovieController::class, 'restore'])->middleware('permission:restore movies'); // Thêm quyền 'restore movies' nếu có
        Route::get('/list/restore', [MovieController::class, 'getMoviesRetore'])->middleware('permission:view movies');
    });
    // Route::get('movie/list/filter', [MovieController::class, 'filter'])->middleware('permission:view movie');
    // --- Quản lý thể loại (Genres) ---
    // Route::get('genre', [GenresController::class, 'index'])->middleware('permission:view genres');

    //Chưa triển khai


    Route::prefix('genre')->group(function () {
        Route::get('/list-restore', [GenresController::class, 'getAllRestore'])->middleware('permission:view list restore genres');
        Route::post('', [GenresController::class, 'store'])->middleware('permission:create genres');
        Route::match(['put', 'patch'], '/{id}', [GenresController::class, 'update'])->middleware('permission:edit genres');
        Route::delete('/{id}', [GenresController::class, 'destroy'])->middleware('permission:delete genres');
        Route::post('{id}/restore', [GenresController::class, 'restore'])->middleware('permission:restore genres');


    });
    // --- Quản lý loại màn hình (Screen_type) ---
    // Route::get('screentype', [ScreeningTypeController::class, 'index'])->middleware('permission:view screen types');

    //Chưa triển khai
    // Route::get('screentype/{screentype}', [ScreeningTypeController::class, 'show'])->middleware('permission:view screen types');
    // Route::post('screentype', [ScreeningTypeController::class, 'store'])->middleware('permission:create screen types');
    // Route::match(['put', 'patch'], 'screentype/{screentype}', [ScreeningTypeController::class, 'update'])->middleware('permission:edit screen types');
    // Route::delete('screentype/{screentype}', [ScreeningTypeController::class, 'destroy'])->middleware('permission:delete screen types');


    // --- Quản lý loại vé (Ticket type) ---
    // Route::get('tickettype', [TicketTypeController::class, 'index'])->middleware('permission:view ticket types');


    Route::prefix('ticket-type')->group(function () {
        Route::get('/list-restore', [TicketTypeController::class, 'getAllRestore'])->middleware('permission:view list restore ticket types');
        Route::post('', [TicketTypeController::class, 'store'])->middleware('permission:create ticket types');
        Route::match(['put', 'patch'], '/{id}', [TicketTypeController::class, 'update'])->middleware('permission:edit ticket types');
        Route::delete('/{id}', [TicketTypeController::class, 'destroy'])->middleware('permission:delete ticket types');
        Route::post('{id}/restore', [TicketTypeController::class, 'restore'])->middleware('permission:restore ticket types');


    });
    // --- Quản lý đồ ăn/uống (Concession) ---
    // Route::get('concession', [ConcessionController::class, 'index'])->middleware('permission:view concessions');

    //Chưa triển khai

    Route::get('concession/{id}', [ConcessionController::class, 'show'])->middleware('permission:view concessions');
    Route::post('concession', [ConcessionController::class, 'store'])->middleware('permission:create concessions');
    Route::match(['put', 'patch'], 'concession/{id}', [ConcessionController::class, 'update'])->middleware('permission:edit concessions');
    Route::delete('concession/{id}', [ConcessionController::class, 'destroy'])->middleware('permission:delete concessions');

    Route::post('concession/{id}/restore', [ConcessionController::class, 'restore'])->middleware('permission:restore concessions');
    Route::get('concession/list/restore', [ConcessionController::class, 'getListConcessionRestore'])->middleware('permission:view concessions');

    Route::get('cinema', [CinemaController::class, 'index'])->middleware('permission:view cinemas');
    Route::get('cinema/{id}', [CinemaController::class, 'show'])->middleware('permission:view cinemas');
    Route::post('cinema', [CinemaController::class, 'store'])->middleware('permission:create cinemas');
    Route::match(['put', 'patch'], 'cinema/{id}', [CinemaController::class, 'update'])->middleware('permission:edit cinemas');
    Route::delete('cinema/{id}', [CinemaController::class, 'destroy'])->middleware('permission:delete cinemas');


    Route::post('cinema/{id}/restore', [CinemaController::class, 'restore'])->middleware('permission:restore cinemas');
    Route::get('cinema/list/restore', [CinemaController::class, 'getListRestore'])->middleware('permission:view cinemas');


    Route::get('/cinema/{id}/list-room', [TheaterRoomController::class, 'getListRommWithCinemaId'])->middleware('permission:view theater rooms');
    // --- Quản lý phòng chiếu (Theater Room) ---
    // Route::get('room', [TheaterRoomController::class, 'index'])->middleware('permission:view theater rooms');
    Route::get('room/{id}', [TheaterRoomController::class, 'show'])->middleware('permission:view theater rooms');
    Route::post('room', [TheaterRoomController::class, 'store'])->middleware('permission:create theater rooms');
    Route::match(['put', 'patch'], 'room/{id}', [TheaterRoomController::class, 'update'])->middleware('permission:edit theater rooms');
    Route::delete('room/{id}', [TheaterRoomController::class, 'destroy'])->middleware('permission:delete theater rooms');


    // Các route tùy chỉnh cho Theater Room - Sửa 'restrore' thành 'restore'
    Route::post('room/{id}/restore', [TheaterRoomController::class, 'restore'])->middleware('permission:restore theater rooms');
    Route::get('room/{id}/listSeat', [TheaterRoomController::class, 'getListSeat'])->middleware('permission:view theater rooms');


    // --- Quản lý suất chiếu (Show time) ---
    Route::get('showtime', [ShowTimeController::class, 'index'])->middleware('permission:view showtimes');
    Route::get('showtime/{id}', [ShowTimeController::class, 'show'])->middleware('permission:view showtimes');
    Route::post('showtime', [ShowTimeController::class, 'store'])->middleware('permission:create showtimes');
    Route::match(['put', 'patch'], 'showtime/{showtime}', [ShowTimeController::class, 'update'])->middleware('permission:edit showtimes');
    Route::delete('showtime/{id}', [ShowTimeController::class, 'destroy'])->middleware('permission:delete showtimes');

    // Các route tùy chỉnh cho Show Time
    Route::post('showtime/{id}/reactivate', [ShowTimeController::class, 'reactivate'])->middleware('permission:edit showtimes'); // Đã sửa từ {id} thành {showtime}, dùng POST cho reactivate nếu nó thay đổi trạng thái
    Route::post('showtime/getlistFilter', [ShowTimeController::class, 'getListShowTime'])->middleware('permission:view showtimes');


    Route::prefix('booking')->group(function () {
        Route::get('', [BookingController::class, 'index'])->middleware('permission:view bookings');
        Route::get('/{id}', [BookingController::class, 'show'])->middleware('permission:view bookings');
        Route::post('', [BookingController::class, 'store'])->middleware('permission:create bookings');
        Route::match(['put', 'patch'], '{id}', [BookingController::class, 'update'])->middleware('permission:edit bookings');
        Route::get('/{id}/approve-counter', [BookingController::class, 'approveCounterBooking'])->middleware('permission:approve counter booking');
        // Route::delete('/{id}', [MovieScheduleController::class, 'destroy'])->middleware('permission:delete movie schedule');
        // Route::post('/{id}/restore', [MovieScheduleController::class, 'restore'])->middleware('permission:restore movie schedule');


    });



    Route::prefix('movie-schedules')->group(function () {
        Route::get('', [MovieScheduleController::class, 'index'])->middleware('permission:view movie schedule');
        Route::post('', [MovieScheduleController::class, 'store'])->middleware('permission:create movie schedule');
        Route::match(['put', 'patch'], '/{id}', [MovieScheduleController::class, 'update'])->middleware('permission:edit movie schedule');
        Route::delete('/{id}', [MovieScheduleController::class, 'destroy'])->middleware('permission:delete movie schedule');
        Route::post('/{id}/restore', [MovieScheduleController::class, 'restore'])->middleware('permission:restore movie schedule');
        Route::get('/list-restore', [MovieScheduleController::class, 'getListRestore'])->middleware('permission:view movie schedule');

    });


    Route::prefix('promotion')->group(function () {
        Route::get('', [PromotionController::class, 'index'])->middleware('permission:view promotion');
        Route::post('', [PromotionController::class, 'store'])->middleware('permission:create promotion');
        Route::match(['put', 'patch'], '/{id}', [PromotionController::class, 'update'])->middleware('permission:edit promotion');
        Route::delete('/{id}', [PromotionController::class, 'destroy'])->middleware('permission:delete promotion');
        Route::post('/{id}/restore', [MovieScheduleController::class, 'restore'])->middleware('permission:restore movie schedule');
    });

    Route::prefix('report/')->group(function () {
        Route::get('/revenue/total', [RevenueReportController::class, 'getTotalRevenue'])->middleware('permission:view revenue');
        Route::get('/movie/{id}/revenue', [RevenueReportController::class, 'getRevenueMovie'])->middleware('permission:view revenue');
        Route::get('/revenue/movie/all', [RevenueReportController::class, 'getMovieAllRevenue'])->middleware('permission:view revenue');
        Route::get('/revenue/timeseries', [RevenueReportController::class, 'getRevenueTimeSeries'])->middleware('permission:view revenue');

        Route::get('/revenue/cinema/all', [RevenueReportController::class, 'getAllCinemaRevenue'])->middleware('permission:view revenue');
        Route::get('/cinema/{id}/revenue', [RevenueReportController::class, 'getCinemaRevenue'])->middleware('permission:view revenue');

    });

    Route::prefix('district')->group(function () {
        Route::get('', [DistrictController::class, 'index'])->middleware('permission:view district');
        Route::post('', [DistrictController::class, 'store'])->middleware('permission:create district');
        Route::match(['put', 'patch'], '/{id}', [DistrictController::class, 'update'])->middleware('permission:edit district');
        Route::delete('/{id}', [DistrictController::class, 'destroy'])->middleware('permission:delete movie schedule');
        Route::get('/{id}/restore', [DistrictController::class, 'restore'])->middleware('permission:restore district');
        Route::get('/list-restore', [DistrictController::class, 'getListRestore'])->middleware('permission:view district');


    });
});
