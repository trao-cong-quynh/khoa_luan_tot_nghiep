// (Đặt tên file này là PurchaseHistory.jsx để tương thích với AccountPage.js)
import React, { useState } from "react";
import { useGetAllBookingsUS, useGetBookingByIdUS } from "../../api/homePage";
import { getApiMessage } from "../../Utilities/apiMessage";
import { format } from "date-fns";
import Modal from "../ui/Modal"; // Import Modal (Giả sử Modal nằm trong cùng thư mục)
import TicketDetail from "./TicketDetail"; // Import TicketDetail

const PurchaseHistory = () => {
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Hook lấy danh sách đơn hàng
  const {
    data: allBookings,
    isLoading: isLoadingBookings,
    error: errorBookings,
  } = useGetAllBookingsUS();

  // Hook lấy chi tiết đơn hàng, chỉ chạy khi có vé được chọn
  const {
    data: bookingDetail,
    isLoading: isLoadingDetail,
    error: errorDetail,
  } = useGetBookingByIdUS(selectedBookingId, {
    enabled: !!selectedBookingId,
  });

  if (isLoadingBookings) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-white">Đang tải lịch sử mua hàng...</p>
      </div>
    );
  }

  if (errorBookings) {
    const errorMessage = getApiMessage(
      errorBookings,
      "Lỗi khi tải lịch sử mua hàng."
    );
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Lỗi!</strong>
        <span className="block sm:inline"> {errorMessage}</span>
      </div>
    );
  }

  const bookings = allBookings?.data || [];
  console.log("booking: ", bookings);

  if (bookings.length === 0) {
    return (
      <div className="text-center ">
        <p className="text-white">Bạn chưa có giao dịch nào.</p>
      </div>
    );
  }

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
        return (
          <p className="text-sm text-red-500 font-semibold">Đã thanh toán</p>
        );
      case "pending":
        return (
          <p className="text-sm text-yellow-400 font-semibold">
            Chờ thanh toán
          </p>
        );
      default:
        return <p className="text-sm text-white font-semibold">{status}</p>;
    }
  };

  const handleOpenModal = (bookingId) => {
    setSelectedBookingId(bookingId);
  };

  const handleCloseModal = () => {
    setSelectedBookingId(null);
  };

  return (
    <div className="bg-[var(--color-header-bg)] rounded-xl shadow-lg p-8 text-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
        LỊCH SỬ MUA VÉ
      </h2>
      <div className="space-y-6">
        {bookings.map((booking) => {
          const showtimeStart = booking.showtime_start_end.split(" - ")[0];
          const combinedDateTimeString = `${booking.showtime_date} ${showtimeStart}`;
          const showtimeDate = new Date(combinedDateTimeString);
          const formattedShowtime =
            showtimeDate && !isNaN(showtimeDate.getTime())
              ? format(showtimeDate, "HH:mm dd/MM/yyyy")
              : "Không có dữ liệu";

          return (
            <div
              key={booking.booking_id}
              className="hover:bg-[var(--color-button)] p-6 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer bg-gray-700 transition-colors"
              onClick={() => handleOpenModal(booking.booking_id)}
            >
              <div className="flex-1">
                <p className="text-xl font-semibold text-white mb-1">
                  {booking.movie_name || "Tên phim không xác định"}
                </p>
                <p className="text-white text-sm">
                  Ngày đặt vé: {booking.booking_date}
                </p>
                <p className="text-white text-sm">
                  Suất chiếu: {formattedShowtime}
                </p>
              </div>
              <div className="mt-4 md:mt-0 text-left md:text-right">
                <p className="text-lg font-bold text-white">
                  Tổng cộng:{" "}
                  {booking.total_price.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </p>
                {getStatusText(booking.status)}
                <p className="text-sm text-white">
                  Mã đặt vé: {booking.booking_id}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-50">
        <Modal
          open={!!selectedBookingId}
          onClose={handleCloseModal}
          widthClass="max-w-3xl"
          bgColorClass="bg-[var(--color-header-bg)]"
          marginTop="mt-20"
        >
          <TicketDetail
            bookingDetail={bookingDetail?.data}
            isLoading={isLoadingDetail}
          />
        </Modal>
      </div>
    </div>
  );
};

export default PurchaseHistory;
