import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaUserCircle, FaUserTag } from "react-icons/fa";
import { useGetCurrentUserUS, useUpdateUserUS } from "../../api/homePage"; // Bổ sung useUpdateUserUS
import { useAuth } from "../../contexts/AuthContext";
import { imagePhim } from "../../Utilities/common";
import PAGE_TITLES from "../ui/PageTitles";
import Modal from "../ui/Modal";
import UserProfile from "../users/UserProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getApiMessage, handleApiError } from "../../Utilities/apiMessage";

const HeaderAdmin = () => {
  const location = useLocation();
  const { logout, updateUserData } = useAuth();
  const queryClient = useQueryClient();

  const { data: userData, isLoading, isError } = useGetCurrentUserUS();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const pageTitle = PAGE_TITLES[location.pathname] || "";
  const [showProfileModal, setShowProfileModal] = useState(false);
  const userDropdownRef = useRef(null);

  const updateUserMutation = useUpdateUserUS({
    onSuccess: (data) => {
      const message = getApiMessage(data, "Cập nhật thông tin thành công!");
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      const updatedUser = data.data;
      if (updatedUser) {
        updateUserData(updatedUser);
      }
    },
    onError: (error) => {
      handleApiError(error, "Có lỗi xảy ra khi cập nhật thông tin!");
      console.error("Error updating profile:", error);
    },
  });

  const handleLogout = () => {
    logout();
  };

  const handleUpdateProfile = async (formData) => {
    try {
      await updateUserMutation.mutateAsync({
        userId: userData?.data?.user_id, // Lấy userId từ dữ liệu đã fetch
        userData: formData,
      });
      setShowProfileModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const user = userData?.data;

  if (isLoading) {
    return (
      <header className="fixed top-0 left-64 right-0 bg-white shadow-md p-4 flex items-center justify-between z-50">
        Đang tải...
      </header>
    );
  }

  if (isError) {
    return (
      <header className="fixed top-0 left-64 right-0 bg-white shadow-md p-4 flex items-center justify-between z-50">
        Lỗi tải dữ liệu.
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-64 right-0 bg-white shadow-md p-4 flex items-center justify-between z-50">
      <div className="text-2xl font-bold text-blue-700">{pageTitle}</div>
      <div className="relative" ref={userDropdownRef}>
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => setShowUserDropdown((prev) => !prev)}
        >
          {user?.avatar_url ? (
            <img
              src={`${imagePhim}${user.avatar_url}`}
              alt="Admin Avatar"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <FaUserCircle className="text-gray-500 text-3xl" />
          )}
          <span className="font-semibold text-gray-800">
            {user?.full_name || "Admin User"}
          </span>
        </div>
        {showUserDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black shadow-lg rounded-md py-2 z-50">
            <button
              onClick={() => {
                setShowProfileModal(true);
                setShowUserDropdown(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-[var(--color-button)] flex gap-2 cursor-pointer"
            >
              <FaUserTag /> Tài khoản
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-[var(--color-button)] cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        )}
        <Modal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          widthClass="max-w-4xl"
        >
          <UserProfile
            user={user}
            onUpdate={handleUpdateProfile}
            bgColorClass="white"
          />
        </Modal>
      </div>
    </header>
  );
};

export default HeaderAdmin;
