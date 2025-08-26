import React from "react";
import { format } from "date-fns";
const TicketDetail = ({ bookingDetail, isLoading }) => {
  if (isLoading) {
    return <p className="text-gray-400 text-center">Đang tải chi tiết vé...</p>;
  }

  if (!bookingDetail) {
    return <p className="text-gray-400 text-center">Không có thông tin vé.</p>;
  }

  const {
    booking_id,
    total_price,
    booking_date,
    status,
    showtime,
    tickets,
    qr_code_url,
  } = bookingDetail;

  const movie = showtime?.movie;
  const room = showtime?.room;
  const cinema = room?.cinema;

  const formattedShowtimeStart = showtime?.start_time
    ? format(new Date(showtime.start_time), "HH:mm dd/MM/yyyy")
    : "Không có dữ liệu";

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "pending":
        return "Chờ thanh toán";
      default:
        return status;
    }
  };

  return (
    <div className="w-full p-4 md:p-5 bg-[var(--color-header-bg)] rounded-none text-gray-100">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
        Chi tiết vé
      </h3>
      <div className="md:grid-cols-2 md:grid">
        <div className="space-y-6 grid grid-cols-2">
          <div>
            <p className="font-semibold text-white">Phim:</p>
            <p className="text-lg">{movie?.movie_name || "Không xác định"}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Rạp:</p>
            <p>{cinema?.cinema_name || "Không xác định"}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Phòng chiếu:</p>
            <p>{room?.room_name || "Không xác định"}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Suất chiếu:</p>
            <p>{formattedShowtimeStart}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Ghế đã đặt:</p>
            <p>
              {tickets?.map((ticket) => ticket.seat_display_name).join(", ") ||
                "Không có dữ liệu"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Tổng cộng:</p>
            <p className="text-green-400 font-bold text-xl">
              {total_price.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Trạng thái:</p>
            <p
              className={`font-bold ${
                status === "paid" ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {getStatusText(status)}
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Mã đặt vé:</p>
            <p className="text-sm text-gray-400 break-all">{booking_id}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center border-l-2 border-gray-700 pl-4">
          <h4 className="text-xl font-bold text-white mb-4">Mã QR Vé</h4>
          {qr_code_url ? (
            <img
              src={qr_code_url} // Sử dụng base URL và đường dẫn QR code
              alt="Mã QR"
              className="w-48 h-48 object-cover p-2"
            />
          ) : (
            <p className="text-gray-400">Không có mã QR cho vé này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
