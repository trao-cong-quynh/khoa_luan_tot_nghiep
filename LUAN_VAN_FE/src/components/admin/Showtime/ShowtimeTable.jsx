import React from "react";
import { FaEdit, FaTrash, FaCheck, FaTable, FaEyeSlash } from "react-icons/fa";

const ShowtimeTable = ({
  showtimes,
  onEdit,
  onDelete,
  onReactivate,
  loading,
  handleViewSeats,
}) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "now showing":
        return "bg-green-100 text-green-600";
      case "upcoming":
        return "bg-blue-100 text-blue-600";
      case "finished":
        return "bg-red-100 text-red-500";
      case "cancelled":
        return "bg-gray-100 text-gray-500 line-through";
      case "hidden":
        return "bg-gray-100 text-gray-500";
      case "full":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusDisplayName = (status) => {
    switch (status) {
      case "now showing":
        return "Đang chiếu";
      case "upcoming":
        return "Sắp chiếu";
      case "finished":
        return "Đã chiếu";
      case "cancelled":
        return "Đã hủy";
      case "hidden":
        return "Đã ẩn";
      case "full":
        return "Hết chỗ";
      default:
        return "N/A";
    }
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải...</div>;
  }

  if (!showtimes.length) {
    return <div className="text-center py-4">Không có suất chiếu nào</div>;
  }

  return (
    <div className="overflow-x-auto">
      {" "}
      <table className="min-w-full divide-y divide-gray-200">
        {" "}
        <thead className="bg-gray-50">
          {" "}
          <tr>
            {" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phim{" "}
            </th>{" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phòng{" "}
            </th>{" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời gian{" "}
            </th>{" "}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái{" "}
            </th>{" "}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác{" "}
            </th>{" "}
          </tr>{" "}
        </thead>{" "}
        <tbody className="bg-white divide-y divide-gray-200">
          {" "}
          {showtimes.map((showtime) => (
            <tr key={showtime.id}>
              {" "}
              <td className="px-6 py-4 whitespace-nowrap">
                {" "}
                <div className="text-sm font-medium text-gray-900">
                  {showtime.movie_name}{" "}
                </div>{" "}
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap">
                {" "}
                <div className="text-sm text-gray-900">
                  {showtime.room_name}{" "}
                </div>{" "}
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap">
                {" "}
                <div className="text-sm text-gray-900">
                  {showtime.time_range}{" "}
                </div>{" "}
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap">
                {" "}
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                    showtime.status
                  )}`}
                >
                  {getStatusDisplayName(showtime.status)}{" "}
                </span>{" "}
              </td>{" "}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {" "}
                <div className="flex justify-end space-x-2">
                  {/* Các nút chức năng */}{" "}
                  <button
                    onClick={() => onEdit(showtime)}
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                  >
                    <FaEdit className="w-5 h-5" />{" "}
                  </button>{" "}
                  {showtime.status?.toLowerCase() === "cancelled" && (
                    <button
                      onClick={() => onReactivate(showtime.id)}
                      className="text-green-600 hover:text-green-900 cursor-pointer"
                      title="Kích hoạt lại"
                    >
                      <FaCheck className="w-5 h-5" />{" "}
                    </button>
                  )}{" "}
                  {showtime.status?.toLowerCase() !== "cancelled" && (
                    <button
                      onClick={() => onDelete(showtime.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                    >
                      <FaTrash className="w-5 h-5" />{" "}
                    </button>
                  )}{" "}
                  <button
                    onClick={() => handleViewSeats(showtime.id)}
                    className="text-green-600 hover:text-green-900"
                    title="Xem ghế"
                  >
                    <FaTable className="w-5 h-5" />{" "}
                  </button>{" "}
                </div>{" "}
              </td>{" "}
            </tr>
          ))}{" "}
        </tbody>{" "}
      </table>{" "}
    </div>
  );
};

export default ShowtimeTable;
