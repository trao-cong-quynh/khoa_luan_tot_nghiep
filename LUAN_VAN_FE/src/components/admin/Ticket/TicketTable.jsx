import React from "react";
import { FaEdit, FaTrash, FaCheck, FaTable } from "react-icons/fa";

// Hàm ánh xạ trạng thái sang màu sắc
const statusColor = (status) => {
  switch (status) {
    case "paid":
    case "active":
      return "bg-green-50 text-green-600 border border-green-200";
    case "pending":
    case "pending_counter_payment":
      return "bg-yellow-50 text-yellow-600 border border-yellow-200";
    case "cancelled":
    case "failed":
    case "refunded":
      return "bg-red-50 text-red-600 border border-red-200";
    case "finished":
      return "bg-gray-50 text-gray-600 border border-gray-200";
    default:
      return "bg-gray-100 text-gray-600";
  }
};


const getStatusDisplayName = (status) => {
  switch (status) {
    case "pending":
      return "Chờ thanh toán";
    case "paid":
      return "Đã thanh toán";
    case "cancelled":
      return "Đã hủy";
    case "active":
      return "Đang hoạt động";
    case "finished":
      return "Hoàn thành";
    case "failed":
      return "Thanh toán thất bại";
    case "refunded":
      return "Đã hoàn tiền";
    case "pending_counter_payment":
      return "Thanh toán tại quầy";
    default:
      return "Không rõ";
  }
};

// Component chỉ nhận dữ liệu đã được phân trang từ component cha
const TicketTable = ({ orders, onRowClick, onEditClick, onApproveClick }) => {
  console.log("hhhhh:", orders);

  const handleEditClick = (e, order) => {
    e.stopPropagation(); // Ngăn không cho trigger onRowClick
    onEditClick(order);
  };

  const handleApproveClick = (e, order) => {
    e.stopPropagation(); // Ngăn không cho trigger onRowClick
    onApproveClick(order);
  };
  console.log("jjjjj", orders);
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">
              Mã đơn hàng
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">
              Tên phim
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">
              Suất chiếu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">
              Phòng chiếu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-right text-xs font-bold text-gray-700 uppercase">
              Tổng tiền
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">
              Ngày đặt
            </th>
            <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
              onClick={() => onRowClick(order)}
            >
              <td className="px-4 py-3 text-blue-600 font-medium underline">
                {order.id}
              </td>
              <td className="px-4 py-3">
                <span className="text-blue-600 font-medium underline cursor-pointer">
                  {order.movie}
                </span>
              </td>
              <td className="px-4 py-3 flex flex-col gap-1">
                <span className="inline-block text-red-500 border border-orange-200 bg-orange-50 rounded px-2 py-0.5 text-xs font-semibold w-fit">
                  {order.showTime}
                </span>
                <span className="inline-block text-green-600 border border-green-200 bg-green-50 rounded px-2 py-0.5 text-xs font-semibold w-fit">
                  {order.showDate}
                </span>
              </td>
              <td className="px-4 py-3">{order.room}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${statusColor(
                    order.status
                  )}`}
                >
                  {getStatusDisplayName(order.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-blue-700">
                {order.total}
              </td>
              <td className="px-4 py-3">{order.orderDate}</td>
              <td className="px-4 py-3 text-center space-x-2">
                <button
                  onClick={(e) => handleApproveClick(e, order)}
                  disabled={order.status !== "pending_counter_payment"}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    order.status === "pending_counter_payment"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title={
                    order.status === "pending_counter_payment"
                      ? "Duyệt đơn hàng"
                      : "Không thể duyệt"
                  }
                >
                  Duyệt{" "}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
