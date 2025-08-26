import React, { useState } from "react";
import {
  useGetTheaterRoomsByCinemaUS,
  useGetAllCinemasUS,
} from "../../../api/homePage/queries";
import { FaRedo, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useRestoreTheaterRoomUS } from "../../../api/homePage/queries";
import Swal from "sweetalert2";

const DeleteRoom = () => {
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const queryClient = useQueryClient();
  const restoreRoom = useRestoreTheaterRoomUS();
  const { data: cinemasData } = useGetAllCinemasUS();

  const {
    data: theaterRoomsData,
    isLoading,
    isError,
    error,
  } = useGetTheaterRoomsByCinemaUS(selectedCinemaId);

  const handleRestoreRoom = (roomId) => {
    Swal.fire({
      title: "Xác nhận khôi phục phòng chiếu",
      text: "Bạn có chắc chắn muốn khôi phục phòng chiếu này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        restoreRoom.mutate(roomId, {
          onSuccess: () => {
            toast.success("Khôi phục phòng chiếu thành công!");
            queryClient.invalidateQueries({
              queryKey: ["GetTheaterRoomsByCinemaAPI", selectedCinemaId],
            });
          },
          onError: (error) => {
            toast.error("Khôi phục phòng chiếu thất bại: " + error.message);
          },
        });
      }
    });
  };

  const deletedRooms = theaterRoomsData?.data?.deleted_rooms || [];
  const cinemas = cinemasData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <FaBuilding className="text-white text-3xl" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Danh sách phòng chiếu đã xóa
                </h1>
              </div>
              <div className="w-full md:w-64">
                <select
                  value={selectedCinemaId || ""}
                  onChange={(e) => setSelectedCinemaId(e.target.value || null)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="" className="text-gray-900">
                    Chọn rạp chiếu
                  </option>
                  {cinemas.map((cinema) => (
                    <option
                      key={cinema.cinema_id}
                      value={cinema.cinema_id}
                      className="text-gray-900"
                    >
                      {cinema.cinema_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!selectedCinemaId ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <FaBuilding className="text-6xl mb-4 text-gray-300" />
                <p className="text-lg">
                  Vui lòng chọn rạp chiếu để xem danh sách phòng chiếu đã xóa
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <span className="ml-3 text-gray-600 text-lg">
                  Đang tải dữ liệu...
                </span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-lg">Lỗi: {error.message}</p>
              </div>
            ) : deletedRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-lg">Không có phòng chiếu nào đã xóa</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Tên phòng chiếu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Loại phòng chiếu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Số lượng ghế
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Số hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Số cột
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deletedRooms.map((room) => (
                      <tr
                        key={room.room_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {room.room_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              room.room_type === "thường"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {room.room_type === "thường"
                              ? "Phòng thường"
                              : "Phòng VIP"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.total_rows * room.total_columns}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {`${room.total_rows} (A -> ${String.fromCharCode(
                            64 + room.total_rows
                          )})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {room.total_columns}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleRestoreRoom(room.room_id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            title="Khôi phục"
                          >
                            <FaRedo className="mr-2" />
                            Khôi phục
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoom;
