import React, { useState } from "react";
import {
  useGetTheaterRoomsByCinemaUS,
  useGetSeatMapByRoomIdUS,
} from "../../../api/homePage/queries";
import {
  FaEdit,
  FaTrash,
  FaRedo,
  FaChair,
  FaCouch,
  FaRegSquare,
  FaTh,
  FaTable,
} from "react-icons/fa";
import Seat from "./Seat";

const RoomTable = ({
  cinemaId,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onRestoreRoom,
}) => {
  const [showDeleted, setShowDeleted] = useState(false);
  const [showSeatMapModal, setShowSeatMapModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const {
    data: theaterRoomsData,
    isLoading,
    isError,
    error,
  } = useGetTheaterRoomsByCinemaUS(cinemaId);

  const handleViewSeats = (roomId) => {
    setSelectedRoomId(roomId);
    setShowSeatMapModal(true);
  };

  const handleCloseSeatMap = () => {
    setShowSeatMapModal(false);
    setSelectedRoomId(null);
  };

  const {
    data: seatMapData,
    isLoading: isLoadingSeatMap,
    isError: isErrorSeatMap,
    error: errorSeatMap,
  } = useGetSeatMapByRoomIdUS(selectedRoomId, {
    enabled: showSeatMapModal && !!selectedRoomId,
  });
  const seat = Array.isArray(seatMapData?.data) ? seatMapData.data : [];
  if (isLoading) {
    return <div>Đang tải dữ liệu phòng chiếu...</div>;
  }

  if (isError) {
    return <div>Lỗi: {error.message}</div>;
  }

  const activeRooms = theaterRoomsData?.data?.theater_rooms || [];
  const deletedRooms = theaterRoomsData?.data?.deleted_rooms || [];
  const rooms = showDeleted ? deletedRooms : activeRooms;
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">Danh sách phòng chiếu</h2>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              showDeleted
                ? "bg-green-100 text-green-700 hover:bg-green-500"
                : "bg-red-100 text-gray-700 hover:bg-red-500"
            }`}
          >
            {showDeleted ? "Đang hoạt động" : "Đã xóa"}
          </button>
        </div>
        {!showDeleted && (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            onClick={onAddRoom}
          >
            + Tạo phòng chiếu
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Tên phòng chiếu</th>
              <th className="py-2 px-4 border-b">Loại phòng chiếu</th>
              <th className="py-2 px-4 border-b">Số lượng ghế (tối đa)</th>
              <th className="py-2 px-4 border-b">Số hàng</th>
              <th className="py-2 px-4 border-b">Số cột</th>
              <th className="py-2 px-4 border-b">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <tr key={room.room_id}>
                  <td className="py-2 px-4 border-b">{room.room_name}</td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded ${
                        room.room_type === "thường"
                          ? "bg-gray-200 text-gray-800"
                          : room.room_type === "vip"
                          ? "bg-yellow-200 text-yellow-800"
                          : ""
                      }`}
                    >
                      {room.room_type === "thường"
                        ? "Phòng thường"
                        : "Phòng VIP"}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {room.total_rows * room.total_columns}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {`${room.total_rows} (A -> ${String.fromCharCode(
                      64 + room.total_rows
                    )})`}
                  </td>
                  <td className="py-2 px-4 border-b">{room.total_columns}</td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      {!showDeleted ? (
                        <>
                          <button
                            onClick={() => onEditRoom(room)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors 
                            rounded-lg hover:bg-blue-100 cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => onDeleteRoom(room.room_id)}
                            className="p-2 text-red-600 hover:text-red-800 transition-colors 
                            rounded-lg hover:bg-red-100 cursor-pointer"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => handleViewSeats(room.room_id)}
                            className="p-2 text-green-600 hover:text-green-800 transition-colors 
                            rounded-lg hover:bg-green-100 cursor-pointer"
                            title="Xem ghế"
                          >
                            <FaTable />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onRestoreRoom(room.room_id)}
                          className="p-2 text-green-600 hover:text-green-800 transition-colors 
                          rounded-lg hover:bg-green-100 cursor-pointer"
                          title="Khôi phục"
                        >
                          <FaRedo />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-2 px-4 text-center">
                  {showDeleted
                    ? "Không có phòng chiếu nào đã xóa"
                    : "Không có phòng chiếu nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal hiển thị sơ đồ ghế */}
      {showSeatMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 
              text-xl font-bold cursor-pointer"
              onClick={handleCloseSeatMap}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4 text-center">
              Cập nhật ghế phòng chiếu
            </h3>
            {isLoadingSeatMap ? (
              <div>Đang tải sơ đồ ghế...</div>
            ) : isErrorSeatMap ? (
              <div className="text-red-500">
                Lỗi: {errorSeatMap?.message || "Không thể tải sơ đồ ghế"}
              </div>
            ) : seatMapData?.data ? (
              <>
                <div className="w-full bg-gray-800 text-white text-center py-2 rounded mb-4">
                  MÀN HÌNH
                </div>
                {(() => {
                  let seats = seatMapData.data || [];
                  // Group seats by row letter
                  const seatRowsObj = {};
                  seats.forEach((seat) => {
                    const match = seat.seat_display_name.match(/^([A-Za-z]+)/);
                    if (!match) return;
                    const row = match[1];
                    if (!seatRowsObj[row]) seatRowsObj[row] = [];
                    seatRowsObj[row].push(seat);
                  });
                  // Sort each row by seat number
                  Object.values(seatRowsObj).forEach((rowArr) => {
                    rowArr.sort((a, b) => {
                      const numA = parseInt(
                        a.seat_display_name.replace(/^[A-Za-z]+/, ""),
                        10
                      );
                      const numB = parseInt(
                        b.seat_display_name.replace(/^[A-Za-z]+/, ""),
                        10
                      );
                      return numA - numB;
                    });
                  });
                  // Convert to array of rows, sorted by row letter
                  const seatRows = Object.keys(seatRowsObj)
                    .sort()
                    .map((row) => seatRowsObj[row]);
                  return (
                    <div className="flex flex-col items-center overflow-x-auto">
                      {seatRows.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex items-center">
                          {row.map((seat) => (
                            <Seat
                              key={seat.seat_id}
                              label={seat.seat_display_name}
                              type={
                                seat.status === "unavailable"
                                  ? "unavailable"
                                  : "normal"
                              }
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {/* Chú thích */}
                <div className="flex justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" />{" "}
                    <span>Số ghế: {seat.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-600" />{" "}
                    <span>Ghế thường</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-500" />{" "}
                    <span>Ghế VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-pink-500" />{" "}
                    <span>Ghế COUPLE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-400" />{" "}
                    <span>Không khả dụng</span>
                  </div>
                </div>
              </>
            ) : (
              <div>Không có dữ liệu ghế.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTable;
