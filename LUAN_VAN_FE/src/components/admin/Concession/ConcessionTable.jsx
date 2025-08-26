import React from "react";
import { FaEdit, FaTrash, FaRedo } from "react-icons/fa";
import { imagePhim } from "../../../Utilities/common";

const ConcessionTable = ({
  concessions,
  onEdit,
  onDelete,
  loading,
  isDeletedView,
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-16">
              ID
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Tên dịch vụ
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Giá
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Loại
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Ảnh
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Mô tả
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider w-24">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-8 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-500">
                    Đang tải dữ liệu...
                  </span>
                </div>
              </td>
            </tr>
          ) : concessions.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12 mb-2"
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
                  <p>Không có dịch vụ nào</p>
                </div>
              </td>
            </tr>
          ) : (
            concessions.map((item) => (
              <tr
                key={item.concession_id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.concession_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div
                    className="truncate max-w-xs"
                    title={item.concession_name}
                  >
                    {item.concession_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {Number(item.unit_price).toLocaleString()}₫
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.image_url ? (
                    <img
                      src={
                        item.image_url.startsWith("/storage")
                          ? `${imagePhim}${item.image_url}`
                          : item.image_url
                      }
                      alt={item.concession_name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <span className="text-gray-400 italic">Không có ảnh</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.description ? (
                    <div className="truncate max-w-xs" title={item.description}>
                      {item.description}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Không có mô tả</span>
                  )}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    {!isDeletedView && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-blue-600 hover:text-blue-800 transition-colors 
                        rounded-lg hover:bg-blue-100 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onDelete(item.concession_id, item.concession_name)
                      }
                      className={`p-2 cursor-pointer ${
                        isDeletedView
                          ? "text-green-600 hover:text-green-800 hover:bg-green-100"
                          : "text-red-600 hover:text-red-800 hover:bg-red-100"
                      } transition-colors rounded-lg`}
                      title={isDeletedView ? "Khôi phục" : "Xóa"}
                    >
                      {isDeletedView ? <FaRedo /> : <FaTrash />}
                    </button>
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

export default ConcessionTable;
