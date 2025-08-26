<?php

namespace App\Providers;

use App\Services\Impl\Auth\AuthService;
use App\Services\Impl\BankTransfer\BankTransferService;
use App\Services\Impl\Booking\BookingService;
use App\Services\Impl\Cinema\CinemaService;
use App\Services\Impl\Concession\ConcessionService;
use App\Services\Impl\District\DistrictService;
use App\Services\Impl\Genre\GenreService;
use App\Services\Impl\MoMo\MoMoService;
use App\Services\Impl\Movie\MovieService;
use App\Services\Impl\MovieSchedule\MovieScheduleService;
use App\Services\Impl\Onepay\OnepayService;
use App\Services\Impl\Payment\BookingPaymentService;
use App\Services\Impl\Promotion\PromotionService;
use App\Services\Impl\QR\QRService;
use App\Services\Impl\RevenueReport\RevenueReportService;
use App\Services\Impl\ScreenType\ScreenTypeService;
use App\Services\Impl\Seat\SeatService;
use App\Services\Impl\ShowTime\ShowTimeService;
use App\Services\Impl\TheaterRoom\TheaterRoomService;
use App\Services\Impl\Tickettype\TicketTypeService;
use App\Services\Impl\User\UserService;
use App\Services\Interfaces\Auth\AuthServiceInterface;
use App\Services\Interfaces\Booking\BookingServiceInterface;
use App\Services\Interfaces\Cinema\CinemaServiceInterface;
use App\Services\Interfaces\Concession\ConcessionServiceInterface;
use App\Services\Interfaces\District\DistrictServiceInterface;
use App\Services\Interfaces\Genre\GenreServiceInterface;
use App\Services\Interfaces\MoMo\MoMoServiceInterface;
use App\Services\Interfaces\Movie\MovieServiceInterface;
use App\Services\Interfaces\MovieSchedule\MovieScheduleServiceInterface;
use App\Services\Interfaces\Onepay\OnepayServiceInterface;
use App\Services\Interfaces\Payment\BookingPaymentServiceInterface;
use App\Services\Interfaces\Promotion\PromotionServiceInterface;
use App\Services\Interfaces\QR\QrServiceInterface;
use App\Services\Interfaces\RevenueReport\RevenueReportServiceInterface;
use App\Services\Interfaces\ScreenType\ScreenTypeServiceInterface;
use App\Services\Interfaces\Seat\SeatServiceInterFace;
use App\Services\Interfaces\ShowTime\ShowTimeServiceInterface;
use App\Services\Interfaces\TheaterRoom\TheaterRoomServiceInterface;
use App\Services\Interfaces\Tickettype\TicketTypeServiceInterface;
use App\Services\Interfaces\User\UserServiceInterface;
use App\Services\PaymentGateway\PaymentGatewayFactory;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\Image\SvgRenderer;
use BaconQrCode\Renderer\Image\GdImageBackEnd;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ImageManager::class, function () {
            return new ImageManager(new Driver());
        });
        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(MovieServiceInterface::class, MovieService::class);
        $this->app->bind(GenreServiceInterface::class, GenreService::class);
        $this->app->bind(ScreenTypeServiceInterface::class, ScreenTypeService::class);
        $this->app->bind(TicketTypeServiceInterface::class, TicketTypeService::class);
        $this->app->bind(ConcessionServiceInterface::class, ConcessionService::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(CinemaServiceInterface::class, CinemaService::class);
        $this->app->bind(TheaterRoomServiceInterface::class, TheaterRoomService::class);
        $this->app->bind(ShowTimeServiceInterface::class, ShowTimeService::class);
        $this->app->bind(SeatServiceInterFace::class, SeatService::class);
        $this->app->bind(BookingServiceInterface::class, BookingService::class);
        $this->app->bind(MoMoServiceInterface::class, MoMoService::class);
        $this->app->bind(QrServiceInterface::class, QRService::class);
        $this->app->bind(BookingPaymentServiceInterface::class, BookingPaymentService::class);
        $this->app->singleton(PaymentGatewayFactory::class, function ($app) {
            return new PaymentGatewayFactory();
        });

        $this->app->bind(OnepayServiceInterface::class, OnepayService::class);
        $this->app->bind(MovieScheduleServiceInterface::class, MovieScheduleService::class);
        $this->app->bind(PromotionServiceInterface::class, PromotionService::class);
        $this->app->bind(RevenueReportServiceInterface::class, RevenueReportService::class);
        $this->app->bind(DistrictServiceInterface::class, DistrictService::class);


    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        Schema::defaultStringLength(191);

        RateLimiter::for('login', function ($request) {
            $email = (string) $request->email;
            return Limit::perMinute(5)->by($email . $request->ip());
        });

       
    }
}
