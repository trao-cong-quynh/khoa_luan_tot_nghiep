import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaTicketAlt, FaUtensils, FaStar } from "react-icons/fa";
import { imagePhim } from "../../../Utilities/common";

const statusStyle = (status) =>
  status === "active"
    ? "bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full text-xs font-semibold"
    : "bg-gray-200 text-gray-500 border border-gray-300 px-3 py-1 rounded-full text-xs font-semibold";

// Hàm tiện ích để chuyển đổi chuỗi ngày tháng từ API sang định dạng hiển thị
const formatApiDate = (dateString) => {
  if (!dateString) return "";
  // Tách ngày, tháng, năm từ chuỗi "DD-MM-YYYY HH:mm"
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("-");
  // Tạo đối tượng Date mới với định dạng "YYYY-MM-DD" để tránh lỗi không tương thích
  return new Date(`${year}-${month}-${day}`).toLocaleDateString("vi-VN");
};

const PromotionTable = ({ promotions = [], onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto w-[1025]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              ID
            </th>
            {/* Thêm cột Hình ảnh */}
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Hình ảnh
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Tên khuyến mãi
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Mã khuyến mại
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Mô tả
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Ngày bắt đầu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Ngày kết thúc
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Loại
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Giá trị giảm
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Giảm tối đa
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Đơn hàng tối thiểu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Số lần dùng/người
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Tổng số lượt dùng
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Áp dụng cho
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {promotions.map((promo) => (
            <tr
              key={promo.promotion_id || promo.code}
              className="hover:bg-blue-50 border-b transition-all duration-100"
            >
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.promotion_id}
              </td>
              <td className="py-3 px-4">
                {promo.image_url ? (
                  <img
                    src={
                      promo.image_url
                        ? `${imagePhim}${promo.image_url}`
                        : "/placeholder.jpg"
                    }
                    alt={promo.name}
                    className="w-20 h-auto rounded-md shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-20 h-12 bg-gray-200 flex items-center justify-center rounded-md text-xs text-gray-500">
                    Không có ảnh
                  </div>
                )}
              </td>
              <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-900">
                {promo.name}
              </td>
              <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-900">
                {promo.code}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.description}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {formatApiDate(promo.start_date)}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {formatApiDate(promo.end_date)}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">{promo.type}</td>
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.discount_value}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.max_discount_amount}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.min_order_amount}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.usage_limit_per_user}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {promo.total_usage_limit}
              </td>
              <td className="py-3 px-4 whitespace-nowrap flex items-center gap-2">
                {promo.apply_to_product_type === "TICKET" && (
                  <FaTicketAlt
                    className="inline text-blue-500"
                    title="Vé xem phim"
                  />
                )}
                {promo.apply_to_product_type === "CONCESSION" && (
                  <FaUtensils
                    className="inline text-green-500"
                    title="Đồ ăn/uống"
                  />
                )}
                {promo.apply_to_product_type === "ALL" && (
                  <FaStar className="inline text-yellow-500" title="Tất cả" />
                )}
                <span>
                  {promo.apply_to_product_type === "TICKET"
                    ? "Vé xem phim"
                    : promo.apply_to_product_type === "CONCESSION"
                    ? "Đồ ăn/uống"
                    : "Tất cả"}
                </span>
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <span className={statusStyle(promo.status)}>
                  {promo.status === "active" ? "Kích hoạt" : "Ẩn"}
                </span>
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                    onClick={() => onEdit && onEdit(promo)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                    title="Xóa"
                    onClick={() => onDelete && onDelete(promo.promotion_id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromotionTable;
