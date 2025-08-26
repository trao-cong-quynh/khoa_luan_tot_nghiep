// src/pages/AccountPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import UserProfile from "../../components/users/UserProfile";
import PurchaseHistory from "../../components/users/PurchaseHistory";
import { useGetCurrentUserUS, useUpdateUserUS } from "../../api/homePage";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { getApiMessage, handleApiError } from "../../Utilities/apiMessage";
import { imagePhim } from "../../Utilities/common";
const AccountPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoggedIn, updateUserData } = useAuth();
  const { data: userData, isLoading, error } = useGetCurrentUserUS();
  const [activeTab, setActiveTab] = useState("profile");
  
  const updateUserMutation = useUpdateUserUS({
    onSuccess: (data) => {
      const message = getApiMessage(data, "Cập nhật thông tin thành công!");
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ["GetCurrentUserAPI"] });
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

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleUpdateProfile = async (formData) => {
    try {
      await updateUserMutation.mutateAsync({
        userId: userData?.data?.user_id,
        userData: formData,
      });
    } catch (err) {
      // Error handling is done in the mutation's onError callback
      console.error("Error updating profile:", err);
    }
  };

  const handleChangePassword = () => {
    // Implement password change logic here
    console.log("Change password clicked");
  };

  if (!isLoggedIn) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-white">
        <p>Đang tải thông tin người dùng...</p>
      </div>
    );
  }

  if (error) {
    const errorMessage = getApiMessage(
      error,
      "Lỗi khi tải thông tin người dùng"
    );
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      </div>
    );
  }

  const user = userData?.data;

  return (
    <div className="mt-20 min-h-screen text-gray-100 font-inter mt-16 md:grid-cols-6 md:grid grid grid-cols-1">
      <aside className="bg-[var(--color-header-bg)] p-4 items-center rounded-r-xl shadow-lg fixed-height-panel">
        <div className="flex flex-col items-center mb-8">
          {/* Bạn có thể thêm phần avatar và tên người dùng tại đây nếu muốn */}
          <img
            src={
              user?.avatar_url
                ? `${imagePhim}${user.avatar_url}`
                : "https://placehold.co/96x96/6B46C1/FFFFFF?text=Avatar"
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 mb-2"
          />
          <span className="text-lg font-semibold text-white mb-1">
            {user?.full_name || "Tên người dùng"}
          </span>
        </div>
        <nav className="w-full space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center w-full p-3 rounded-lg transition-colors text-white cursor-pointer ${
              activeTab === "profile"
                ? "bg-[var(--color-button)] font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            Thông tin khách hàng
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center w-full p-3 rounded-lg transition-colors text-white cursor-pointer ${
              activeTab === "history"
                ? "bg-[var(--color-button)] font-semibold"
                : "hover:bg-gray-700"
            }`}
          >
            Lịch sử mua hàng
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-8 md:col-span-5">
        {/* <h1 className="text-4xl font-extrabold mb-8 text-black uppercase tracking-wide">
          {activeTab === "profile"
            ? "THÔNG TIN KHÁCH HÀNG"
            : "LỊCH SỬ MUA HÀNG"}
        </h1> */}
        {activeTab === "profile" ? (
          <UserProfile user={user} onUpdate={handleUpdateProfile} />
        ) : (
          <PurchaseHistory />
        )}
      </main>
    </div>
  );
};

export default AccountPage;
