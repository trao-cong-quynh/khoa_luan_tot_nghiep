import React, { forwardRef, useImperativeHandle } from "react";
import { useGetSeatMapUS } from "../../../api/homePage/queries";

const BookingSummary = forwardRef(
  ({ bookingDetails, bookingData, timeLeft }, ref) => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");

    // Fetch seat map để kiểm tra trạng thái ghế
    const { refetch: refreshSeatMap } = useGetSeatMapUS(
      bookingData?.showtime?.show_time_id
    );
    useImperativeHandle(ref, () => ({
      refreshSeatMap,
    }));

    return (
      <div
        className="w-full lg:basis-1/2 text-white p-4 rounded-md space-y-3 text-sm leading-relaxed"
        style={{ backgroundColor: "var(--color-showtime-bg)" }}
      >
        <h3 className="text-lg font-bold mb-2">{bookingDetails.movieTitle}</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">THỜI GIAN GIỮ VÉ :</span>
          <span
            className="px-2 py-1 rounded text-lg font-bold"
            style={{ backgroundColor: "var(--color-white)", color: "black" }}
          >
            {mm}:{ss}
          </span>
        </div>
        <div>
          <strong>Độ tuổi:</strong> {bookingDetails.age_rating}
        </div>
        <p className="font-semibold">{bookingDetails.cinemaName}</p>
        <p className="text-xs">{bookingDetails.cinemaAddress}</p>

        <div className="pt-3 border-t border-white">
          <p className="font-semibold mb-1">Thời gian:</p>
          <p>{bookingDetails.showtime}</p>
        </div>

        <div className="pt-3 border-t border-white grid grid-cols-2 gap-2">
          <div className="font-semibold">Phòng chiếu:</div>
          <div>{bookingDetails.room}</div>
          <div className="font-semibold">Số vé:</div>
          <div>{bookingDetails.ticketCount}</div>
          <div className="font-semibold">Loại vé:</div>
          <div>{bookingDetails.ticketType}</div>
          <div className="font-semibold">Loại ghế:</div>
          <div>{bookingDetails.seatType}</div>
          <div className="font-semibold">Số ghế:</div>
          <div>{bookingDetails.seatNumber}</div>
        </div>

        <div className="pt-3 border-t border-white">
          <p className="font-semibold mb-1">Bắp nước:</p>
          <p>{bookingDetails.combo}</p>
        </div>

        <div className="pt-3 border-t-2 border-dashed border-white text-white text-lg font-bold flex flex-col gap-1 justify-between items-end">
          <div className="flex justify-between w-full items-center">
            <span style={{ color: "var(--color-text-white)" }}>
              SỐ TIỀN CẦN THANH TOÁN
            </span>
            <span>{bookingDetails.total.toLocaleString()} VND</span>
          </div>
          {bookingDetails.discountAmount > 0 && (
            <div className="flex justify-between w-full items-center text-green-400 text-base font-semibold">
              <span>Khuyến mãi ({bookingDetails.appliedPromotion?.name}):</span>
              <span style={{ color: "#fff" }}>
                - {bookingDetails.discountAmount.toLocaleString()} VND
              </span>
            </div>
          )}
          <div className="flex justify-between w-full items-center text-xl font-bold">
            <span>TỔNG THANH TOÁN</span>
            <span style={{ color: "#fff" }}>
              {(
                bookingDetails.finalTotal || bookingDetails.total
              ).toLocaleString()}{" "}
              VND
            </span>
          </div>
        </div>
      </div>
    );
  }
);

export default BookingSummary;
