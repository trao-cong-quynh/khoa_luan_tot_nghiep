<?php

namespace App\Services\Impl\Booking;

use App\Constants\BookingStatus;
use App\Constants\ShowTimeStatus;
use App\Http\Resources\BookingListItemResource;
use App\Http\Resources\BookingResource;
use App\Models\BookedTickets;
use App\Models\Bookings;
use App\Models\Concessions;
use App\Models\Payment;
use App\Models\Seats;
use App\Models\ShowTimes;
use App\Models\TicketType;
use App\Services\Impl\QR\QRService;
use App\Services\Interfaces\Booking\BookingServiceInterface;
use App\Services\Interfaces\Promotion\PromotionServiceInterface as PromotionService;
use Carbon\Carbon;
use DB;
use Exception;

use Illuminate\Auth\AuthenticationException;
use Log;
use Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BookingService implements BookingServiceInterface
{
    protected $qrSerVice;
    protected $promotionService;
    public function __construct(QRService $qrSerVice, PromotionService $promotionService)
    {
        $this->qrSerVice = $qrSerVice;
        $this->promotionService = $promotionService;
    }

    public function getAll()
    {
        $bookings = Bookings::with(['show_times.theater_rooms.cinemas', 'booked_tickets.seats', 'booked_tickets.ticket_types', 'users', 'booking_concessions.concessions'])->get();
        // return BookingListItemResource::collection($bookings);

        return $bookings->isEmpty() ? [] : $bookings;
    }


    public function getDetail(string $id)
    {
        $booking = Bookings::with(['show_times.theater_rooms.cinemas', 'booked_tickets.seats', 'booked_tickets.ticket_types', 'users', 'booking_concessions.concessions', 'show_times.movies'])->find($id);

        if (!$booking) {
            throw new Exception('Đơn hàng không tồn tại.');
        }
        return BookingResource::make($booking);
    }

    public function getListBookingwithDistrict(array $district)
    {
        $bookings = Bookings::whereHas('show_times', function ($query) use ($district) {
            $query->whereHas('theater_rooms', function ($query) use ($district) {
                $query->whereHas('cinemas', function ($query) use ($district) {
                    $query->whereIn('district_id', $district);
                });
            });
        })->with('show_times.movies')->get();
        // if ($bookings->isEmpty()) {
        //     return BookingListItemResource::collection($bookings);
        // }
        // return BookingListItemResource::collection($bookings);

        return $bookings->isEmpty() ? [] : $bookings;

    }

    public function getListBookingwithCinema(string $id)
    {

        $bookings = Bookings::whereHas('show_times', function ($query) use ($id) {
            $query->whereHas('theater_rooms', function ($query) use ($id) {
                $query->whereHas('cinemas', function ($query) use ($id) {
                    $query->where('cinema_id', $id);
                });
            });
        })->with('show_times.movies')->get();

        return $bookings->isEmpty() ? [] : $bookings;

    }

    public function createBooking(array $request, string $method)
    {

        try {
            return DB::transaction(function () use ($request, $method) {
                if (!auth()->check()) {
                    throw new AuthenticationException('Bạn phải đăn nhập để thực hiện đặt vé .');
                }

                $userId = auth()->id();

                $showtime = ShowTimes::where('status', ShowTimeStatus::UPCOMING->value)->find($request['showtime_id']);
                if (!$showtime) {
                    throw new NotFoundHttpException('Suất chiếu không tồn tại');
                }


                $currentTime = Carbon::now();
                $showtimeStartTine = Carbon::parse($showtime->start_time);

                if ($showtimeStartTine->isBefore($currentTime)) {
                    throw new Exception('Suất chiếu này đã bắt đầu hoặc đã kết thúc. Vui lòng chọn suất chiếu khác.');
                }
                $requestTickets = $request['tickets'];
                $seatIds = collect($requestTickets)->pluck('seat_id')->unique()->values()->toArray();
                $ticketIds = collect($requestTickets)->pluck('ticket_type_id')->unique()->values()->toArray();

                if (count($seatIds) !== count($requestTickets)) {
                    throw new Exception('Yêu cầu đặt vé chứa các ghế trùng lặp. Vui lòng kiểm tra lại.');
                }

                $selectedSeats = Seats::whereIn('seat_id', $seatIds)
                    ->where('room_id', $showtime->room_id)
                    ->get()
                    ->keyBy('seat_id');

                if ($selectedSeats->count() !== count($seatIds)) {
                    $invalidSeatIds = array_diff($seatIds, $selectedSeats->keys()->toArray());
                    throw new Exception('Một hoặc nhiều ghế đã chọn không hợp lệ hoặc không thuộc phòng chiếu của suất chiếu này: ' . implode(', ', $invalidSeatIds));
                }

                $bookedSeatIds = BookedTickets::select('seat_id')
                    ->join('bookings', 'booked_tickets.booking_id', '=', 'bookings.booking_id')
                    ->where('bookings.showtime_id', $showtime->showtime_id)
                    ->whereIn('bookings.status', BookingStatus::bookedStatus())
                    ->pluck('seat_id')
                    ->toArray();


                // $bookedSeatIds = BookedTickets::select('booked_tickets.seat_id')
                //     ->join('bookings', 'booked_tickets.booking_id', '=', 'bookings.booking_id')
                //     ->where('bookings.showtime_id', $showtime->showtime_id)
                //     ->whereIn('bookings.status', ['paid', 'pending'])
                //     ->pluck('seat_id')
                //     ->toArray();

                $conflictingSeatIts = array_intersect($seatIds, $bookedSeatIds);
                if (!empty($conflictingSeatIts)) {
                    $bookedSeatNames = Seats::whereIn('seat_id', $conflictingSeatIts)
                        ->pluck(DB::raw("CONCAT(seat_row,seat_column)"))
                        ->implode(',');
                    throw new Exception("Các ghế sau đã được đặt: {$bookedSeatNames}. Vui lòng chọn ghế khác.");
                }

                $ticketTypes = TicketType::whereIn('ticket_type_id', $ticketIds)->get()->keyBy('ticket_type_id');
                if ($ticketTypes->count() !== count($ticketIds)) {
                    $invalidTicketIds = array_diff($ticketIds, $ticketTypes->keys()->toArray());
                    throw new Exception('Một hoặc nhiều loại vé đã chọn không tồn tại: ' . implode(', ', $invalidTicketIds));
                }

                $totalTickets = count($requestTickets);
                $totalTicketPrice = 0;
                $ticketsToBook = [];

                foreach ($requestTickets as $ticket) {
                    $seatId = $ticket['seat_id'];
                    $ticketTypeId = $ticket['ticket_type_id'];
                    $ticketType = $ticketTypes->get($ticketTypeId);
                    if (!$ticketTypeId) {
                        throw new Exception("Loại vé với ID {$ticketTypeId} không hợp lệ cho ghế {$seatId}.");
                    }

                    $totalTicketPrice += $ticketType->ticket_price;
                    $ticketsToBook[] = [
                        'ticket_type_id' => $ticketTypeId,
                        'seat_id' => $seatId,
                        'unit_price' => $ticketType->ticket_price
                    ];
                }

                $totalConcessionPrice = 0;
                $concessionToBook = [];
                if (isset($request['concessions']) && is_array($request['concessions'])) {
                    $requestedConcessionIds = collect($request['concessions'])->pluck('concession_id')->unique()->toArray();
                    $availableConcessions = Concessions::whereIn('concession_id', $requestedConcessionIds)->get()->keyBy('concession_id');

                    if ($availableConcessions->count() !== count($requestedConcessionIds)) {
                        $invalidConcessionIds = array_diff($requestedConcessionIds, $availableConcessions->keys()->toArray());
                        throw new Exception('Một hoặc nhiều mặt hàng ăn uống không tồn tại: ' . implode(', ', $invalidConcessionIds));
                    }

                    foreach ($request['concessions'] as $item) {
                        $concession = $availableConcessions->get($item['concession_id']);
                        if (!$concession) {
                            throw new Exception("Mặt hàng ăn uống với ID {$item['concession_id']} không tồn tại.");
                        }
                        if ($item['quantity'] <= 0) {
                            throw new Exception("Số lượng mặt hàng ăn uống cho {$concession->concession_name} phải lớn hơn 0.");
                        }

                        $totalItemPrice = $concession->unit_price * $item['quantity'];
                        $totalConcessionPrice += $totalItemPrice;
                        $concessionToBook[] = [
                            'concession_id' => $concession->concession_id,
                            'quantity' => $item['quantity'],
                            'total_price' => $totalConcessionPrice
                        ];
                    }
                }

                $originaltotalPrice = $totalTicketPrice + $totalConcessionPrice;

                $finalPriceAfterDiscount = $originaltotalPrice;
                $appliedDiscountAmount = 0;
                $appliedPromotion = null;

                if (isset($request['promotion_code']) || isset($request['promotion_id'])) {

                    $promotionIdentifier = $request['promotion_code'] ?? $request['promotion_id'];
                    $productTypeForPromotion = $request['order_product_type'] ?? 'ALL';
                    $promotion = $this->promotionService->getPromotionByCodeOrId($promotionIdentifier);

                    if ($promotion) {
                        $invalidPromotion = $this->promotionService->isPromotionApplicable($promotion, $originaltotalPrice, $userId, $productTypeForPromotion);

                        if ($invalidPromotion) {
                            $appliedDiscountAmount = $this->promotionService->calculateDiscount($promotion, $originaltotalPrice);
                            $finalPriceAfterDiscount = $originaltotalPrice - $appliedDiscountAmount;

                            if ($finalPriceAfterDiscount < 0) {
                                $finalPriceAfterDiscount = 0;
                            }
                            $appliedPromotion = $promotion;
                        } else {
                            Log::info("Khuyến mãi không áp dụng được khi tạo booking cho user {$userId}. Code/ID: {$promotionIdentifier}");
                        }
                    } else {
                        Log::info("Mã khuyến mãi không tồn tại khi tạo booking cho user {$userId}. Code/ID: {$promotionIdentifier}");

                    }
                }
                $status = BookingStatus::PENDING->value;
                if ($method === 'counter_payment') {
                    $status = BookingStatus::PENDING_COUNTER_PAYMENT->value;
                }
                $booking = Bookings::create([
                    'user_id' => $userId,
                    'showtime_id' => $showtime->showtime_id,
                    'original_price' => $originaltotalPrice,
                    'discount_amount' => $appliedDiscountAmount,
                    'total_price' => $finalPriceAfterDiscount,
                    'total_tickets' => $totalTickets,
                    'promotion_id' => $appliedPromotion ? $appliedPromotion->promotion_id : null,
                    'status' => $status,
                    'booking_date' => Carbon::now()->format('Y-m-d H:i:s'),
                ]);

                foreach ($ticketsToBook as $ticket) {
                    BookedTickets::create(array_merge(['booking_id' => $booking->booking_id], $ticket));
                }

                foreach ($concessionToBook as $concession) {
                    $booking->booking_concessions()->create($concession);
                }

                if ($appliedPromotion) {
                    $this->promotionService->recordPromotionUsage($appliedPromotion->promotion_id, $booking->booking_id, $appliedDiscountAmount, $userId);
                }

                $booking->load([
                    'show_times.movies',
                    'show_times.theater_rooms.cinemas',
                    'booked_tickets.seats',
                    'booked_tickets.ticket_types',
                    'booking_concessions.concessions'
                ]);

                $formattedBooking = $booking->toArray();
                $formattedBooking['booking_date'] = Carbon::parse($booking->booking_date)->format('Y-m-y H:i');
                $formattedBooking['showtime'] = [
                    'showtime_id' => $booking->show_times->showtime_id,
                    'start_time' => Carbon::parse($booking->show_times->start_time)->format('Y-m-d H:i'),
                    'end_time' => Carbon::parse($booking->show_times->end_time)->format('Y-m-d H:i'),
                    'movie_name' => $booking->show_times->movies->movie_name,
                    'room_name' => $booking->show_times->theater_rooms->room_name,
                    'cinema_name' => $booking->show_times->theater_rooms->cinemas->cinema_name,
                    'cinema_address' => $booking->show_times->theater_rooms->cinemas->address
                ];

                $formattedBooking['tickets'] = $booking->booked_tickets->map(function ($bookedTicket) {
                    return [
                        'seat_id' => $bookedTicket->seat_id,
                        'seat_display_name' => $bookedTicket->seats->seat_row . $bookedTicket->seats->seat_column,
                        'ticket_type_id' => $bookedTicket->ticket_type_id,
                        'ticket_type_name' => $bookedTicket->ticket_types->ticket_type_name,
                        'unit_price' => $bookedTicket->unit_price,
                    ];
                })->toArray();

                $formattedBooking['concsessions'] = $booking->booking_concessions->map(function ($bookingConcession) {
                    return [
                        'concession_id' => $bookingConcession->concession_id,
                        'concession_name' => $bookingConcession->concessions->concession_name,
                        'quantity' => $bookingConcession->quantity,
                        'total_price' => $bookingConcession->total_price,

                    ];
                })->toArray();
                unset($formattedBooking['show_times']);
                unset($formattedBooking['booked_tickets']);
                unset($formattedBooking['booking_concessions']);

                return $formattedBooking;

            });
        } catch (\Throwable $e) {
            Log::error('Lấy sơ đồ ghế suất chiếu thất bại: ' . $e->getMessage());
            throw $e;
        }

    }


    public function update(string $id, array $request)
    {
        try {
            // Load booking với tất cả các mối quan hệ cần thiết
            // Đặc biệt là show_times.theater_rooms.cinemas để Controller có thể kiểm tra quyền
            $booking = Bookings::with([
                'show_times.movies',
                'show_times.theater_rooms.cinemas',
                'booked_tickets.seats',
                'booked_tickets.ticket_types',
                'booking_concessions.concessions',
                'users' // Thêm users nếu bạn muốn thông tin user trong mảng trả về
            ])->find($id);

            if (!$booking) {
                throw new \Exception('Đơn hàng không tồn tại.'); // Giữ nguyên Exception này nếu bạn muốn Service ném nó
            }

            $originalShowtimeId = $booking->showtime_id;
            $originalBookingStatus = $booking->status;
            // $currentSeatIds = $booking->booked_tickets->pluck('seat_id')->toArray(); // Không sử dụng
            // $currentConcessionItems = $booking->booking_concessions->keyBy('concession_id'); // Không sử dụng trực tiếp showtime_id từ đây

            $newShowtimeId = $request['showtime_id'] ?? $originalShowtimeId;

            // --- 1. Xử lý thay đổi suất chiếu (showtime_id) ---
            if (isset($request['showtime_id']) && $newShowtimeId !== $originalShowtimeId) {
                $newShowtime = ShowTimes::where('status', ShowTimeStatus::UPCOMING->value)->find($newShowtimeId);
                if (!$newShowtime) {
                    throw new \Exception('Suất chiếu mới không tồn tại hoặc không hoạt động.');
                }

                $newShowtimeStartTime = Carbon::parse($newShowtime->start_time); // Đã sửa chính tả

                if ($newShowtimeStartTime->isBefore(Carbon::now()->addMinutes(10))) {
                    throw new \Exception('Không thể chuyển sang suất chiếu đã bắt đầu hoặc gần giờ chiếu.');
                }

                if ($newShowtimeId !== $originalShowtimeId && !isset($request['tickets'])) {
                    throw new \Exception('Khi đổi suất chiếu, phải chọn lại ghế mới.');
                }

                $booking->showtime_id = $newShowtimeId;
            }

            // --- 2. Xử lý thay đổi vé (tickets) ---
            $newTotalTickets = $booking->total_tickets;
            $newTotalTicketPrice = 0;
            // $isTicketUpdate = false; // Không sử dụng

            if (isset($request['tickets'])) {
                // $isTicketUpdate = true; // Không sử dụng
                $requestTickets = $request['tickets'];

                $seatIds = collect($requestTickets)->pluck('seat_id')->unique()->values()->toArray();
                $ticketTypeIds = collect($requestTickets)->pluck('ticket_type_id')->unique()->values()->toArray();

                if (count($seatIds) !== count($requestTickets)) {
                    throw new \Exception('Yêu cầu cập nhật vé chứa các ghế trùng lặp. Vui lòng thử lại.');
                }

                $currentOperatingShowtime = $booking->show_times;
                if (isset($request['showtime_id'])) {
                    $currentOperatingShowtime = ShowTimes::find($newShowtimeId);
                }

                $selectedSeats = Seats::whereIn('seat_id', $seatIds)
                    ->where('room_id', $currentOperatingShowtime->room_id)
                    ->get()
                    ->keyBy('seat_id');

                if ($selectedSeats->count() !== count($seatIds)) {
                    $invalidSeats = array_diff($seatIds, $selectedSeats->keys()->toArray());
                    throw new \Exception('Một hoặc nhiều ghế đã chọn không hợp lệ hoặc không thuộc phòng chiếu của suất chiếu này: ' . implode(', ', $invalidSeats));
                }

                $bookedSeatIdForShowtime = BookedTickets::select('seat_id')
                    ->join('bookings', 'booked_tickets.booking_id', '=', 'bookings.booking_id')
                    ->where('bookings.showtime_id', $currentOperatingShowtime->showtime_id)
                    ->where('bookings.booking_id', '!=', $booking->booking_id)
                    ->whereIn('bookings.status', BookingStatus::bookedStatus())
                    ->pluck('seat_id')
                    ->toArray();

                $conflictingSeatIds = array_intersect($seatIds, $bookedSeatIdForShowtime);
                if (!empty($conflictingSeatIds)) {
                    $bookedSeatNames = Seats::whereIn('seat_id', $conflictingSeatIds)
                        ->pluck(DB::raw("CONCAT(seat_row,seat_column)"))
                        ->implode(',');
                    // Sửa lỗi ở đây: truy cập showtime_id từ $currentOperatingShowtime
                    throw new \Exception("Các ghế sau đã được đặt trong suất chiếu {$currentOperatingShowtime->showtime_id}: {$bookedSeatNames}. Vui lòng chọn ghế khác.");
                }

                $ticketTypes = TicketType::whereIn('ticket_type_id', $ticketTypeIds)->get()->keyBy('ticket_type_id');
                if ($ticketTypes->count() !== count($ticketTypeIds)) {
                    $invalidTicketTypes = array_diff($ticketTypeIds, $ticketTypes->keys()->toArray());
                    throw new \Exception('Một hoặc nhiều loại vé đã chọn không tồn tại: ' . implode(', ', $invalidTicketTypes));
                }

                $booking->booked_tickets()->delete();

                foreach ($requestTickets as $ticket) {
                    $ticketType = $ticketTypes->get($ticket['ticket_type_id']);
                    $newTotalTicketPrice += $ticketType->ticket_price;
                    BookedTickets::create([
                        'booking_id' => $booking->booking_id,
                        'ticket_type_id' => $ticket['ticket_type_id'],
                        'seat_id' => $ticket['seat_id'],
                        'unit_price' => $ticketType->ticket_price,
                    ]);
                }

                $newTotalTickets = count($requestTickets);
                $booking->total_tickets = $newTotalTickets;

            } else {
                $newTotalTicketPrice = $booking->booked_tickets->sum('unit_price');
            }

            // --- 3. Xử lý thay đổi đồ ăn/uống (concessions) ---
            $newTotalConcessionPrice = 0;
            // $isConcessionUpdate = false; // Không sử dụng

            if (isset($request['concessions'])) {
                // $isConcessionUpdate = true; // Không sử dụng
                $requestedConcessionIds = collect($request['concessions'])->pluck('concession_id')->unique()->toArray();
                $availableConcessions = Concessions::whereIn('concession_id', $requestedConcessionIds)->get()->keyBy('concession_id'); // Đã sửa chính tả

                if ($availableConcessions->count() !== count($requestedConcessionIds)) {
                    $invalidConcessionIds = array_diff($requestedConcessionIds, $availableConcessions->keys()->toArray());
                    throw new Exception('Một hoặc nhiều mặt hàng ăn uống không tồn tại: ' . implode(', ', $invalidConcessionIds));
                }
                $booking->booking_concessions()->delete();

                foreach ($request['concessions'] as $item) {
                    $concession = $availableConcessions->get($item['concession_id']);
                    if ($item['quantity'] <= 0) {
                        throw new Exception("Số lượng mặt hàng ăn uống cho {$concession->concession_name} phải lớn hơn 0.");
                    }

                    $itemTotalPrice = $concession->unit_price * $item['quantity'];
                    $newTotalConcessionPrice += $itemTotalPrice;
                    $booking->booking_concessions()->create([
                        'concession_id' => $item['concession_id'],
                        'quantity' => $item['quantity'],
                        'total_price' => $itemTotalPrice,
                    ]);
                }
            } else {
                $newTotalConcessionPrice = $booking->booking_concessions->sum('total_price');
            }

            // --- 4. Cập nhật tổng giá tiền (total_price) ---
            $booking->total_price = $newTotalTicketPrice + $newTotalConcessionPrice;

            // --- 5. Cập nhật trạng thái (status) VÀ TẠO QR CODE ---
            if (isset($request['status'])) {
                $newStatusValue = $request['status'];

                if (
                    $newStatusValue !== $originalBookingStatus &&
                    (BookingStatus::from($newStatusValue) === BookingStatus::PAID || BookingStatus::from($newStatusValue) === BookingStatus::CONFIRMED) &&
                    empty($booking->qr_code_path)
                ) {
                    $qrCodeData = json_encode([
                        'type' => 'booking',
                        'booking_id' => $booking->booking_id,
                    ]);

                    $fileName = 'qrcodes/booking_' . $booking->booking_id . '.svg';
                    $qrCodePath = $this->qrSerVice->createAndSaveQrCode($qrCodeData, $fileName);

                    if ($qrCodePath) {
                        $booking->qr_code_path = $qrCodePath;
                    } else {
                        Log::error("Không thể tạo QR code cho booking [{$booking->booking_id}]. Đường dẫn trả về rỗng.");
                        throw new Exception("Không thể tạo QR code cho booking [{$booking->booking_id}]. Vui lòng thử lại.");
                    }
                }

                $currentStatusEnum = BookingStatus::from($originalBookingStatus);
                $requestedNewStatusEnum = BookingStatus::from($newStatusValue);

                if (!$currentStatusEnum->canTransitionTo($requestedNewStatusEnum)) {
                    throw new Exception("Không thể chuyển trạng thái từ [{$currentStatusEnum->value}] sang [{$requestedNewStatusEnum->value}].");
                }
                $booking->status = $requestedNewStatusEnum->value;
            }

            $booking->save(); // Lưu tất cả các thay đổi vào database

            // Load lại các mối quan hệ cần thiết cho việc định dạng MẢNG trả về
            // Đảm bảo load cả 'users' nếu bạn muốn nó trong mảng trả về
            $booking->load([
                'show_times.movies',
                'show_times.theater_rooms.cinemas',
                'booked_tickets.seats',
                'booked_tickets.ticket_types',
                'users', // Đảm bảo 'users' được load ở đây
                'booking_concessions.concessions'
            ]);

            // Định dạng thủ công thành mảng để trả về
            $formattedBooking = $booking->toArray();
            $formattedBooking['booking_date'] = Carbon::parse($booking->booking_date)->format('Y-m-d H:i');
            $formattedBooking['showtime'] = [
                'showtime_id' => $booking->show_times->showtime_id,
                'start_time' => Carbon::parse($booking->show_times->start_time)->format('Y-m-d H:i'),
                'end_time' => Carbon::parse($booking->show_times->end_time)->format('Y-m-d H:i'),
                'movie_name' => $booking->show_times->movies->movie_name,
                'room_name' => $booking->show_times->theater_rooms->room_name,
                'cinema_name' => $booking->show_times->theater_rooms->cinemas->cinema_name,
                'cinema_address' => $booking->show_times->theater_rooms->cinemas->address
            ];

            $formattedBooking['tickets'] = $booking->booked_tickets->map(function ($bookedTicket) {
                return [
                    'seat_id' => $bookedTicket->seat_id,
                    'seat_display_name' => $bookedTicket->seats->seat_row . $bookedTicket->seats->seat_column,
                    'ticket_type_id' => $bookedTicket->ticket_type_id,
                    'ticket_type_name' => $bookedTicket->ticket_types->ticket_type_name,
                    'unit_price' => $bookedTicket->unit_price,
                ];
            })->toArray();
            $formattedBooking['concessions'] = $booking->booking_concessions->map(function ($bookingConcession) {
                return [
                    'concession_id' => $bookingConcession->concession_id,
                    'concession_name' => $bookingConcession->concessions->concession_name,
                    'quantity' => $bookingConcession->quantity,
                    'total_price' => $bookingConcession->total_price,
                ];
            })->toArray();

            // Thêm qr_code_url vào mảng trả về
            $formattedBooking['qr_code_url'] = $booking->qr_code_path ? asset($booking->qr_code_path) : null;


            unset($formattedBooking['show_times']);
            unset($formattedBooking['booked_tickets']);
            unset($formattedBooking['booking_concessions']);
            // unset($formattedBooking['users']); // Nếu bạn không muốn trả về users ở cấp root

            return $formattedBooking; // <-- Trả về MẢNG đã định dạng

        } catch (\Throwable $e) {
            Log::error('Cập nhật đơn hàng thất bại: ' . $e->getMessage(), [
                'booking_id' => $id,
                'request_data' => $request,
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }


    public function getListBookingwithUser(string $id)
    {
        $bookings = Bookings::where('user_id', $id)->with('show_times.movies')->get();

        return $bookings->isEmpty() ? [] : $bookings;
    }


    public function approveCounterBooking(string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $booking = Bookings::with(['show_times.theater_rooms.cinemas', 'booked_tickets.seats', 'booked_tickets.ticket_types', 'users', 'booking_concessions.concessions', 'show_times.movies'])->find($id);
                if (!$booking) {
                    throw new Exception("Không tìm thấy đơn hàng.");
                }
                if ($booking->status !== BookingStatus::PENDING_COUNTER_PAYMENT->value) {
                    throw new Exception("Đơn hàng không ở trạng thái chờ thanh toán tại quầy.");
                }
                if (!$booking->show_times) {
                    throw new Exception("Không tìm thấy suất chiếu liên quan đến đơn hàng.");
                }

                if (Carbon::now()->gt($booking->show_times->start_time)) {
                    throw new Exception("Suất chiếu đã bắt đầu. Không thể duyệt đơn hàng.");
                }
                $booking->status = BookingStatus::PAID->value;
                $booking->save();

                Payment::create([
                    'booking_id' => $booking->booking_id,
                    'transaction_id' => 'COUNTER-' . strtoupper(Str::random(10)),
                    'payment_method' => 'counter', // có thể là 'cash' nếu bạn muốn
                    'gateway_transaction_status_coode' => 'SUCCESS',
                    'gateway_transaction_message' => 'Thanh toán tại quầy',
                    'internal_status' => BookingStatus::PAYMENT_SUCCESS,
                    'amount' => $booking->total_price,
                    'currency' => 'VND',
                    'gateway_response_data' => null,
                    'ip_address' => request()->ip(),
                    'payment_initiated_at' => Carbon::now(),
                    'payment_completed_at' => Carbon::now(),
                ]);

                return $booking;
            });
        } catch (\Throwable $e) {
            Log::error('Duyệt đơn hàng thất bại: ' . $e->getMessage(), [
                'booking_id' => $id,
                'exception' => $e,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
