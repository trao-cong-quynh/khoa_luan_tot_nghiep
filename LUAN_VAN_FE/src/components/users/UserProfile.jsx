import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// Import base URL from common utilities
import { imagePhim } from "../../Utilities/common.js";

const UserProfile = ({
  user = {},
  onUpdate,
  bgColorClass = "bg-[var(--color-header-bg)]",
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "",
    avatar: null,
    avatar_url: "",
  });
  console.log("thông tin user:", formData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const birthDateFromAPI = user.birth_date;
      let formattedBirthDate = "";
      if (birthDateFromAPI) {
        const date = new Date(birthDateFromAPI);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        formattedBirthDate = `${year}-${month}-${day}`;
      }
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        birth_date: formattedBirthDate,
        gender: user.gender || "",
        avatar: null, // avatar file itself
        avatar_url: user.avatar_url || "", // URL for displaying avatar
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, avatar: null })); // Reset avatar if no file selected
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh có định dạng: JPG, PNG, WEBP");
      e.target.value = ""; // Reset input
      setFormData((prev) => ({ ...prev, avatar: null }));
      return;
    }

    // Set the File object to formData.avatar
    setFormData((prev) => ({
      ...prev,
      avatar: file,
      avatar_url: URL.createObjectURL(file), // Create a blob URL for preview
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSubmit = new FormData();

      // Thêm các trường dữ liệu văn bản
      formDataToSubmit.append("full_name", formData.full_name);
      formDataToSubmit.append("email", formData.email);
      formDataToSubmit.append("phone", formData.phone);
      formDataToSubmit.append("birth_date", formData.birth_date);
      formDataToSubmit.append("gender", formData.gender);

      // Xử lý trường avatar:
      // Nếu có avatar mới được chọn (là một File object)
      if (formData.avatar instanceof File) {
        formDataToSubmit.append("avatar", formData.avatar);
      }

      // Logging để kiểm tra FormData trước khi gửi
      console.log("FormData chuẩn bị gửi từ UserProfile:");
      for (let [key, value] of formDataToSubmit.entries()) {
        console.log(`${key}:`, value);
      }
      console.log(
        "Is formDataToSubmit an instance of FormData?",
        formDataToSubmit instanceof FormData
      );
      formDataToSubmit.append("_method", "PATCH");
      onUpdate(formDataToSubmit); // Truyền FormData này đến cha (AccountPage)
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật thông tin!", error);
      toast.error("Cập nhật thông tin thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${bgColorClass} rounded-xl shadow-lg p-8`}>
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-200 pb-4">
        Thông tin cá nhân
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <img
            src={
              formData.avatar_url && !formData.avatar_url.startsWith("blob:")
                ? `${imagePhim}${formData.avatar_url}`
                : formData.avatar_url ||
                  "https://placehold.co/96x96/6B46C1/FFFFFF?text=Avatar"
            }
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 mb-2"
          />
          <label className="cursor-pointer text-purple-400 hover:underline text-sm">
            Thay đổi ảnh đại diện
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-blue-500 focus:outline-none focus:ring-2"
              required
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full bg-white border text-black rounded-lg p-3 text-black focus:ring-blue-500 focus:outline-none focus:ring-2"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-blue-500 focus:outline-none focus:ring-2"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-blue-500 focus:outline-none focus:ring-2"
            />
          </div>

          {/* Giới tính (optional, not in image but kept from original) */}
          {/* If you want to strictly match the image, you can remove this block */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-blue-500 
              focus:outline-none focus:ring-2 cursor-pointer"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow-md transition-colors 
              duration-200 cursor-pointer ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
          >
            {isSubmitting ? "ĐANG LƯU..." : "LƯU THÔNG TIN"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
