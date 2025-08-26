import React, { useState, useEffect, useMemo } from "react";
import UserTable from "../../../components/admin/User/UserTable.jsx";
import UserForm from "../../../components/admin/User/UserForm.jsx";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  useGetAllUsersUS,
  useCreateUserUS,
  useUpdateUserUS,
  useDeleteUserUS,
  useGetAllDistrictsUS,
  useGetUserByIdUS,
  useGetAllCinemasUS,
} from "../../../api/homePage/queries.jsx";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 10;

const UserManagement = () => {
  const [editingUser, setEditingUser] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { userData } = useAuth();
  const queryClient = useQueryClient();
  const currenRole =
    userData?.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");

  // Lấy danh sách users
  const {
    data: usersData,
    isLoading: loadingUsers,
    error,
    refetch: fetchUsers,
  } = useGetAllUsersUS();

  // Lấy chi tiết user khi chỉnh sửa
  const { data: detailedUserData, isLoading: loadingDetailedUser } =
    useGetUserByIdUS(editingUserId, {
      enabled: !!editingUserId,
    });

  // Lấy danh sách quận
  const { data: districtsData, isLoading: loadingDistricts } =
    useGetAllDistrictsUS({ enabled: userData?.role.includes("admin") });
  const districts = districtsData?.data || [];

  // Lấy danh sách tất cả rạp chiếu
  const { data: cinemaData, isLoading: loadingCinema } = useGetAllCinemasUS();
  const cinemas = cinemaData?.data || [];

  // Lấy danh sách rạp mà người dùng hiện tại quản lý
  // Đây là phần sửa đổi để truyền dữ liệu đúng vào UserForm
  const managedCinemas = useMemo(() => {
    if (currenRole === "cinema_manager" && userData?.cinema_id) {
      const foundCinema = cinemas.find(
        (c) => c.cinema_id === userData.cinema_id
      );
      // Trả về một mảng chứa rạp tìm được nếu có
      return foundCinema ? [foundCinema] : [];
    }
    return [];
  }, [currenRole, userData, cinemas]);

  useEffect(() => {
    if (detailedUserData?.data && editingUserId) {
      setEditingUser(detailedUserData.data);
    }
  }, [detailedUserData, editingUserId]);

  const { mutate: createUser, isPending: isCreatingUser } = useCreateUserUS({
    onSuccess: (response) => {
      if (response?.data?.status === false) {
        handleApiError(response.data, "Thêm người dùng mới thất bại");
        return;
      }
      toast.success(response.message || "Thêm người dùng mới thành công");
      setIsFormVisible(false);
      setEditingUser(null);
      queryClient.invalidateQueries(["GetAllUsersAPI"]);
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Không thể thêm người dùng mới"));
    },
  });

  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUserUS({
    onSuccess: (response) => {
      if (response?.data?.status === false) {
        handleApiError(response.data, "Cập nhật người dùng thất bại");
        return;
      }
      toast.success(response.message || "Cập nhật người dùng thành công");
      setIsFormVisible(false);
      setEditingUser(null);
      queryClient.invalidateQueries(["GetAllUsersAPI"]);
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Không thể cập nhật người dùng"));
    },
  });

  const { mutate: deleteUserMutation, isPending: isDeletingUser } =
    useDeleteUserUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          Swal.fire(
            "Thất bại!",
            response?.data?.message || "Xóa người dùng thất bại",
            "error"
          );
          return;
        }
        Swal.fire(
          "Đã xóa!",
          response?.data?.message || "Xóa người dùng thành công",
          "success"
        );
        queryClient.invalidateQueries(["GetAllUsersAPI"]);
      },
      onError: (error) => {
        Swal.fire(
          "Thất bại!",
          getApiMessage(error, "Xóa người dùng thất bại."),
          "error"
        );
      },
    });

  const users = usersData?.data || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Đã xảy ra lỗi</p>
          <p>{error.message}</p>
          <button
            onClick={() => fetchUsers()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(users)) {
    console.error("users is not an array:", users);
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl">
        Đã xảy ra lỗi khi tải dữ liệu người dùng.
      </div>
    );
  }

  const handleEdit = (user) => {
    setEditingUserId(user.user_id);
    setEditingUser(user);
    setIsFormVisible(true);
  };

  const handleDelete = (userId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa người dùng này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUserMutation(userId);
      }
    });
  };

  const handleAddOrUpdateUser = (userId, UserData) => {
    if (userId) {
      updateUser({ userId, userData: UserData });
    } else {
      createUser(UserData);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingUser(null);
    setEditingUserId(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      (user.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole
      ? Array.isArray(user.roles) && user.roles.includes(filterRole)
      : true;
    return matchSearch && matchRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Quản lý Người dùng
        </h1>
        {!isFormVisible && (
          <button
            onClick={handleAddUser}
            disabled={isCreatingUser}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="mr-2" />
            {isCreatingUser ? "Đang thêm..." : "Thêm người dùng mới"}
          </button>
        )}
      </div>

      {!isFormVisible && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-3">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
              />
            </div>
            <div className="flex-1">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
              >
                <option value="">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="district_manager">District Manager</option>
                <option value="cinema_manager">Quản lý rạp</option>
                <option value="booking_manager">Booking manager</option>
                <option value="showtime_manager">Showtime Manager</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="">
        <div className="bg-white rounded-xl shadow-lg overflow-auto max-h-[70vh]">
          <UserTable
            users={paginatedUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loadingUsers}
            isDeleting={isDeletingUser}
            currentLoggedInUserId={userData.user_id}
          />

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </div>
        <Modal
          open={isFormVisible}
          onClose={handleCancelEdit}
          widthClass="min-w-[500px]"
        >
          <div className="mx-auto">
            <UserForm
              initialData={editingUser}
              onSubmit={handleAddOrUpdateUser}
              onCancel={handleCancelEdit}
              isSubmitting={isCreatingUser || isUpdatingUser}
              districts={districts}
              loadingDistricts={loadingDistricts}
              loadingDetailedUser={loadingDetailedUser}
              cinemas={cinemas}
              loadingCinema={loadingCinema}
              currentUserRole={currenRole}
              managedCinemas={managedCinemas} // Đã sửa ở đây
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;
