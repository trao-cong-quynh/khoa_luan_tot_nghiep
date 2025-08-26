<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Xác nhận Đặt Vé Xem Phim</title>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Xác nhận đặt vé thành công</h1>
            <p>Cảm ơn bạn đã đặt vé tại {{config('app.name')}}</p>
        </div>

        <div class="section">
            <h3>Thông tin đơn hàng</h3>
            <div class="details">
                <p><strong>Mã đơn hàng:</strong> {{ $booking->booking_id }}</p>

                <p><strong>Ngày đặt:</strong> {{ $booking->booking_date->format('H:i d/m/Y') }}</p>
                <p><strong>Trạng thái:</strong> Đã thanh toán</p>

                <p><strong>Tổng tiền:</strong> {{ number_format($booking->total_price) }} VNĐ</p>
            </div>
        </div>

        @if ($booking->qr_code_path)
            <div class="section qr-code">
                <h3>Mã QR đặt vé</h3>
                <img src="{{ $message->embed($qrCodeFullPath) }}" alt="Mã QR Đặt vé" width="200" height="200">
                <p style="font-size: 0.9em; color: #555; margin-top: 10px;">Vui lòng xuất trình mã QR này tại quầy giao dịch hoặc nhân viên soát vé để nhận vé/kiểm soát vào phòng chiếu.</p>
            </div>
        @endif


        <div class="section">
            <h3>Thông tin Phim & Suất chiếu</h3>
            <div class="details">

                <p><strong>Phim:</strong> {{ $booking->show_times->movies->movie_name }}</p>
                <p><strong>Rạp:</strong> {{ $booking->show_times->theater_rooms->cinemas->cinema_name }}</p>
                <p><strong>Phòng:</strong> {{ $booking->show_times->theater_rooms->room_name }}</p>
                <p><strong>Thời gian:</strong> {{ $booking->show_times->start_time->format('H:i') }} - {{ $booking->show_times->end_time->format('H:i, d/m/Y') }} </p>
                <p><strong>Thời lượng:</strong> {{ $booking->show_times->movies->duration }} phút</p>
            </div>
        </div>

        <div class="section">
            <h3>Chi tiết Vé đã Đặt</h3>
            @php
                $totalTickets = 0;
                $seatNumbers = [];
                foreach($booking->booked_tickets as $ticket){
                    $totalTickets++;

                    if ($ticket->seats) {
                        $seatNumbers[] = $ticket->seats->seat_row . $ticket->seats->seat_column;
                    }
                }
            @endphp

            <div class="details">
                <p><strong>Số lượng vé:</strong> {{ $totalTickets }}</p>
                <p><strong>Số ghế:</strong> {{ implode(', ', $seatNumbers) }}</p>
                <ul>
                    @foreach ($booking->booked_tickets->groupBy('ticket_type_id') as $ticketTypeId => $ticketsOfType )

                        @if ($ticketsOfType->first()->ticket_types)
                            <li>{{ count($ticketsOfType) }} x {{ $ticketsOfType->first()->ticket_types->ticket_type_name }}</li>
                        @endif
                    @endforeach
                </ul>
            </div>
        </div>

        @if ($booking->booking_concessions->isNotEmpty())

            <div class="section">
                <h3>Bắp & Nước</h3>
                <div class="details">
                    @foreach ($booking->booking_concessions as $concessionItem)

                        @if ($concessionItem->concessions)
                            <p>{{ $concessionItem->concessions->concession_name }} (x{{ $concessionItem->quantity }}) - {{ number_format($concessionItem->total_price) }} VNĐ</p>
                        @endif
                    @endforeach
                </div>
            </div>
        @endif


        <div class="section">
            <h3>Thông tin người đặt</h3>
            <div class="details">
                <p><strong>Họ và tên:</strong> {{ $booking->users->full_name }}</p>
                <p><strong>Email:</strong> {{ $booking->users->email }}</p>
                <p><strong>Số điện thoại:</strong> {{ $booking->users->phone ?? 'N/A' }}</p>
            </div>
        </div>

        <div class="footer">
            <p>Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
