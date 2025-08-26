import React from "react";
import { FaEdit, FaTrash, FaTrashRestore } from "react-icons/fa";

const TicketTypeTable = ({
  ticketTypes = [],
  onEdit,
  onDelete,
  loading,
  isDeleting,
  isDeletedView = false,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-40">
              Tên loại vé
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Giá vé (VNĐ)
            </th>
            <th className="py-3 px-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {loading ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : ticketTypes.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-400">
                Không có loại vé phù hợp
              </td>
            </tr>
          ) : (
            ticketTypes.map((type) => (
              <tr
                key={type.ticket_type_id}
                className="hover:bg-blue-50 border-b transition-all duration-100"
              >
                <td className="py-3 px-4">
                  <div
                    className="text-sm font-semibold text-gray-900 truncate max-w-[10rem]"
                    title={type.ticket_type_name}
                  >
                    {type.ticket_type_name}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="text-xs text-gray-800 font-medium">
                    {Number(type.ticket_price).toLocaleString("vi-VN")} đ
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    {isDeletedView ? (
                      <button
                        onClick={() => onDelete(type.ticket_type_id)}
                        disabled={isDeleting}
                        className={`p-2 text-green-600 hover:text-green-800 transition-colors cursor-pointer ${
                          isDeleting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={isDeleting ? "Đang hoàn tác..." : "Hoàn tác"}
                      >
                        <FaTrashRestore />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onEdit(type)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => onDelete(type.ticket_type_id)}
                          disabled={isDeleting}
                          className={`p-2 text-red-600 hover:text-red-800 transition-colors cursor-pointer ${
                            isDeleting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title={isDeleting ? "Đang xóa..." : "Xóa"}
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTypeTable;
