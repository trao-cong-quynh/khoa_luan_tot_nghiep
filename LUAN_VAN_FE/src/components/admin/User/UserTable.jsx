import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { imagePhim } from "../../../Utilities/common";

const UserTable = ({
  users,
  onEdit,
  onDelete,
  loading,
  currentLoggedInUserId,
}) => {
  // const getAvatarUrl = (avatar_url) => {
  //   if (!avatar_url) return "/placeholder-avatar.jpg";
  //   if (avatar_url.startsWith("/storage/")) return avatar_url;
  //   return `${imagePhim}${avatar_url}`;
  // };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-6 ">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              STT
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Ảnh đại diện
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Họ và tên
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Số điện thoại
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Vai trò
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Ngày sinh
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
              Giới tính
            </th>
            <th className="px-6 py-3 text-center text-xs font-bold text-blue-700 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={9} className="py-8 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-500">
                    Đang tải dữ liệu...
                  </span>
                </div>
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-8 text-center text-gray-400">
                Không có người dùng nào
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={user.user_id}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={
                      user.avatar_url
                        ? `${imagePhim}${user.avatar_url}`
                        : "/placeholder.jpg"
                    }
                    alt={user.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {Array.isArray(user.roles) && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-1
                          ${
                            role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : role === "district_manager"
                              ? "bg-yellow-300 text-yellow-800"
                              : role === "cinema_manager"
                              ? "bg-yellow-200 text-yellow-800"
                              : role === "booking_manager"
                              ? "bg-yellow-100 text-yellow-800"
                              : role === "showtime_manager"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }
                        `}
                      >
                        {role === "admin"
                          ? "Quản trị viên"
                          : role === "district_manager"
                          ? "Quản lý cụm rạp"
                          : role === "cinema_manager"
                          ? "Quản lý rạp"
                          : role === "booking_manager"
                          ? "Quản lý đơn hàng"
                          : role === "showtime_manager"
                          ? "Quản lý suất chiếu"
                          : "Người dùng"}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                      Không rõ
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(user.birth_date).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.gender}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    {user.user_id !== currentLoggedInUserId && (
                      <button
                        onClick={() => onDelete(user.user_id)}
                        className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
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

export default UserTable;
