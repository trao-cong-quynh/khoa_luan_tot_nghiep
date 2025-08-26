import React from "react";
import { FaEdit, FaTrash, FaRedo } from "react-icons/fa";

const TheaterTable = ({
  theaters,
  onEdit,
  onDelete,
  loading,
  isDeletedView,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-16">
              ID
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-1/4">
              Tên rạp
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-1/3">
              Địa chỉ
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-1/3">
              Địa chỉ map
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider w-24">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={5} className="py-8 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-500">
                    Đang tải dữ liệu...
                  </span>
                </div>
              </td>
            </tr>
          ) : theaters.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center">
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
                  <p>Không có rạp chiếu nào</p>
                </div>
              </td>
            </tr>
          ) : (
            theaters.map((theater) => (
              <tr
                key={theater.cinema_id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {theater.cinema_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div
                    className="truncate max-w-[200px]"
                    title={theater.cinema_name}
                  >
                    {theater.cinema_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div
                    className="truncate max-w-[300px]"
                    title={theater.address}
                  >
                    {theater.address}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div
                    className="truncate max-w-[300px]"
                    title={theater.map_address}
                  >
                    {theater.map_address}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    {!isDeletedView && (
                      <button
                        onClick={() => onEdit(theater)}
                        className="cursor-pointer p-2 text-blue-600 hover:text-blue-800 
                        transition-colors rounded-lg hover:bg-blue-100"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(theater.cinema_id)}
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

export default TheaterTable;
