import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { toast } from "react-toastify";
import { useGetSeatMapUS } from "../../api/homePage/queries";
import { FaSyncAlt } from "react-icons/fa";

const SeatSelector = forwardRef(
  (
    {
      onSeatSelect,
      selectedSeats: initialSelectedSeats,
      selectedShowtime,
      totalTicketsCount,
    },
    ref
  ) => {
    const [selectedSeats, setSelectedSeats] = useState(
      initialSelectedSeats || []
    );
    const [lastBookedSeats, setLastBookedSeats] = useState([]);

    // console.log(
    //   "SeatSelector - selectedShowtime prop received:",
    //   selectedShowtime
    // );
    // console.log("SeatSelector - initialSelectedSeats:", initialSelectedSeats);
    // console.log(
    //   "SeatSelector - totalTicketsCount received:",
    //   totalTicketsCount
    // );

    // Fetch seat map data from API
    const {
      data: seatMapData,
      isLoading,
      error,
      refetch: refreshSeatMap,
    } = useGetSeatMapUS(selectedShowtime?.show_time_id);

    useImperativeHandle(ref, () => ({
      refreshSeatMap,
    }));

    // Update parent component when seats change
    useEffect(() => {
      if (!seatMapData?.data?.seat_map) return; // Chỉ chạy khi đã có seat_map
      const seat_map = seatMapData.data.seat_map;
      onSeatSelect(selectedSeats, seat_map);
    }, [selectedSeats, onSeatSelect, seatMapData]);

    // Tự động loại bỏ ghế đã bị đặt khỏi selectedSeats khi seatMapData thay đổi
    useEffect(() => {
      if (!seatMapData?.data?.seat_map || selectedSeats.length === 0) return;

      const seat_map = seatMapData.data.seat_map;
      const bookedSeats = [];

      // Tìm tất cả ghế đã bị đặt trong selectedSeats
      selectedSeats.forEach((seatId) => {
        for (const row of seat_map) {
          const seat = row.find((s) => s && s.seat_id === seatId);
          if (seat && seat.status === "booked") {
            bookedSeats.push(seat);
          }
        }
      });

      // Nếu có ghế mới bị đặt mất, báo toast và loại bỏ khỏi selectedSeats
      if (
        bookedSeats.length > 0 &&
        JSON.stringify(bookedSeats) !== JSON.stringify(lastBookedSeats)
      ) {
        const bookedSeatNames = bookedSeats
          .map((seat) => seat.seat_display_name)
          .join(", ");
        toast.warning(
          `Ghế ${bookedSeatNames} đã được người khác đặt. Vui lòng chọn ghế khác.`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        setLastBookedSeats(bookedSeats);
        // Loại bỏ ghế đã bị đặt khỏi selectedSeats
        setSelectedSeats((prev) =>
          prev.filter((seatId) => {
            for (const row of seat_map) {
              const seat = row.find((s) => s && s.seat_id === seatId);
              if (seat && seat.status === "booked") {
                return false; // Loại bỏ ghế đã bị đặt
              }
            }
            return true; // Giữ lại ghế chưa bị đặt
          })
        );
      }
      // Nếu số ghế đã đặt vượt quá số vé, báo lỗi ngay
      if (selectedSeats.length > totalTicketsCount && totalTicketsCount > 0) {
        toast.error(`Bạn chỉ được chọn tối đa ${totalTicketsCount} ghế!`);
        setSelectedSeats((prev) => prev.slice(0, totalTicketsCount));
      }
    }, [seatMapData, selectedSeats, totalTicketsCount, lastBookedSeats]);

    // Hàm refresh danh sách ghế
    const handleRefreshSeats = () => {
      refreshSeatMap();
      toast.info("Đang cập nhật danh sách ghế...", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    const handleSeatClick = (seat) => {
      if (seat.status === "booked") {
        toast.warning("Ghế này đã được đặt");
        return;
      }

      setSelectedSeats((prev) => {
        const isCurrentlySelected = prev.includes(seat.seat_id);
        console.log(
          "handleSeatClick - Current selected seats count:",
          prev.length
        );
        console.log(
          "handleSeatClick - Total tickets count:",
          totalTicketsCount
        );

        if (isCurrentlySelected) {
          return prev.filter((id) => id !== seat.seat_id);
        } else {
          if (prev.length < totalTicketsCount) {
            return [...prev, seat.seat_id];
          } else {
            toast.error(`Bạn chỉ được chọn tối đa ${totalTicketsCount} ghế.`);
            return prev;
          }
        }
      });
    };

    if (isLoading) {
      return <div>Đang tải sơ đồ ghế...</div>;
    }

    if (error) {
      return (
        <div className="p-6 rounded-lg shadow-md flex flex-col items-center">
          <div className="text-red-500 mb-4">
            Lỗi khi tải sơ đồ ghế: {error.message}
          </div>
          <button
            onClick={handleRefreshSeats}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2"
          >
            <FaSyncAlt /> Thử lại
          </button>
        </div>
      );
    }

    if (!seatMapData?.data?.seat_map) {
      return <div>Không tìm thấy thông tin ghế</div>;
    }

    const seat_map = seatMapData.data.seat_map;

    return (
      <div className=" p-6 rounded-lg shadow-md flex flex-col items-center mx-auto">
        {/* Container bọc màn hình + ghế */}
        <div className="inline-block">
          {/* Màn hình */}
          <div className="w-full h-8 bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center">
            <span className="text-[var(--color-showtime-bg)] font-semibold">
              MÀN HÌNH
            </span>
          </div>
          {/* Ghế */}
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex flex-col items-center space-y-2">
              {seat_map.map((row, rowIdx) => {
                if (!row || row.every((seat) => !seat)) {
                  return null;
                }
                return (
                  <div key={rowIdx} className="flex items-center gap-2">
                    <span className="w-2 md:w-8 font-bold text-gray-600 select-none text-sm sm:text-base flex-shrink-0 text-center">
                      {String.fromCharCode(65 + rowIdx)}
                    </span>
                    <div
                      className="grid gap-x-2 gap-y-1"
                      style={{
                        gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {row.map((seat, colIdx) => {
                        if (!seat)
                          return (
                            <div
                              key={`empty-${rowIdx}-${colIdx}`}
                              className="w-10"
                            />
                          );

                        const isSelected = selectedSeats.includes(seat.seat_id);
                        const isBooked = seat.status === "booked";

                        let style =
                          "flex gap-2 md:ml-4 md:mb-2 w-4 w-6 sm:w-8 sm:h-6 md:w-10 md:h-8  rounded border text-xs font-bold flex items-center justify-center select-none transition-colors duration-150 flex-shrink-0 ";

                        if (isBooked) {
                          style +=
                            "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed";
                        } else if (isSelected) {
                          style +=
                            "bg-[var(--color-showtime-bg)] text-white border-[var(--color-showtime-bg)]";
                        } else {
                          style +=
                            "bg-white text-black border-[var(--color-showtime-bg)] hover:bg-[#e0e7ff] cursor-pointer";
                        }

                        return (
                          <button
                            key={seat.seat_id}
                            disabled={isBooked}
                            onClick={() => handleSeatClick(seat)}
                            className={style}
                          >
                            {seat.seat_display_name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Chú thích */}
        <div className="mt-8 flex justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-[var(--color-showtime-bg)] bg-white"></div>
            <span className="text-sm">Có thể chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-[var(--color-showtime-bg)] bg-[var(--color-showtime-bg)]"></div>
            <span className="text-sm">Đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-gray-200 bg-gray-200"></div>
            <span className="text-sm">Đã đặt</span>
          </div>
        </div>
      </div>
    );
  }
);

export default SeatSelector;
