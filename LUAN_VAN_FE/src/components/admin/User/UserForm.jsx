import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { imagePhim } from "../../../Utilities/common";

const UserForm = ({
  onSubmit,
  initialData,
  onCancel,
  districts = [],
  cinemas = [],
  loadingDistricts,
  loadingCinemas,
  currentUserRole,
  currentUserId,
  managedCinemas = [],
}) => {
  const [formData, setFormData] = useState({
    user_id: null,
    full_name: "",
    email: "",
    avatar: null,
    avatar_url_from_backend: "",
    password: "",
    password_confirmation: "",
    phone: "",
    role: "user",
    birth_date: "",
    gender: "",
    district_ids: [],
    cinema_id: "",
  });
  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState("");

  // UseMemo để tạo danh sách roleOptions dựa trên vai trò của người dùng hiện tại
  const roleOptions = useMemo(() => {
    switch (currentUserRole) {
      case "admin":
        return [
          { value: "user", label: "Người dùng" },
          { value: "admin", label: "Quản trị viên" },
          { value: "district_manager", label: "Quản lý cụm rạp" },
          { value: "cinema_manager", label: "Quản lý rạp" },
          { value: "booking_manager", label: "Quản lý đơn hàng" },
          { value: "showtime_manager", label: "Quản lý suất chiếu" },
        ];
      case "district_manager":
        return [
          { value: "cinema_manager", label: "Quản lý rạp" },
          { value: "booking_manager", label: "Quản lý đơn hàng" },
          { value: "showtime_manager", label: "Quản lý suất chiếu" },
        ];
      case "cinema_manager":
        return [
          { value: "booking_manager", label: "Quản lý đơn hàng" },
          { value: "showtime_manager", label: "Quản lý suất chiếu" },
        ];
      default:
        return [{ value: "user", label: "Người dùng" }];
    }
  }, [currentUserRole]);

  // Lọc danh sách rạp chiếu dựa trên vai trò của người dùng hiện tại
  const filteredCinemas = useMemo(() => {
    if (currentUserRole === "cinema_manager") {
      // Nếu là quản lý rạp, chỉ hiển thị rạp của chính họ
      const managedCinemaId = managedCinemas[0]?.cinema_id;
      return cinemas.filter((c) => c.cinema_id === managedCinemaId);
    }
    // Nếu là admin hoặc district_manager, hiển thị tất cả các rạp (để tạo người dùng mới)
    return cinemas;
  }, [currentUserRole, cinemas, managedCinemas]);

  useEffect(() => {
    if (initialData) {
      const roles = Array.isArray(initialData.roles) ? initialData.roles : [];
      const selectedRole = roles[0] || initialData.role || "user";

      let districtIds = [];
      let cinemaId = "";

      if (
        roles.includes("district_manager") &&
        initialData.managed_districts &&
        Array.isArray(initialData.managed_districts)
      ) {
        districtIds = initialData.managed_districts.map((d) => d.district_id);
      } else if (
        roles.includes("cinema_manager") ||
        roles.includes("showtime_manager") ||
        roles.includes("booking_manager")
      ) {
        if (initialData.cinema_id) {
          cinemaId = String(initialData.cinema_id);
        }
      }

      setFormData({
        user_id: initialData.user_id || null,
        full_name: initialData.full_name || "",
        email: initialData.email || "",
        avatar: null,
        avatar_url_from_backend: initialData.avatar_url || "",
        password: "",
        password_confirmation: "",
        phone: initialData.phone || "",
        role: selectedRole,
        birth_date: initialData.birth_date
          ? initialData.birth_date.slice(0, 10)
          : "",
        gender: initialData.gender || "",
        district_ids: districtIds,
        cinema_id: cinemaId,
      });

      if (initialData.avatar_url) {
        setAvatarPreview(`${imagePhim}${initialData.avatar_url}`);
      } else {
        setAvatarPreview("");
      }
    } else {
      setFormData({
        user_id: null,
        full_name: "",
        email: "",
        avatar: null,
        avatar_url_from_backend: "",
        password: "",
        password_confirmation: "",
        phone: "",
        // Gán role mặc định dựa trên quyền của người dùng hiện tại
        role: roleOptions[0]?.value || "user",
        birth_date: "",
        gender: "",
        district_ids: [],
        cinema_id: "",
      });
      setAvatarPreview("");
    }
    setErrors({});
  }, [initialData, roleOptions]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validation cho mật khẩu chỉ cần khi tạo mới hoặc khi người dùng nhập mật khẩu mới
    const isEditing = !!initialData;
    const isPasswordChange = formData.password && formData.password.length > 0;

    if (!isEditing || isPasswordChange) {
      if (!formData.password) {
        newErrors.password = "Vui lòng nhập mật khẩu";
      } else if (formData.password.length < 8) {
        newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
      } else if (
        !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(formData.password)
      ) {
        newErrors.password =
          "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt";
      }

      if (!formData.password_confirmation) {
        newErrors.password_confirmation = "Vui lòng xác nhận mật khẩu";
      } else if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = "Mật khẩu xác nhận không khớp";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^(\+?\d{9,15})$/.test(formData.phone)) {
      newErrors.phone =
        "Số điện thoại không hợp lệ. Chỉ được chứa số và có thể bắt đầu bằng dấu +";
    }

    if (!formData.birth_date) {
      newErrors.birth_date = "Vui lòng chọn ngày sinh";
    }

    if (!formData.gender) {
      newErrors.gender = "Vui lòng chọn giới tính";
    }

    // --- Logic phân quyền và kiểm tra validation mới ---
    const isDistrictManager = currentUserRole === "district_manager";
    const isCinemaManager = currentUserRole === "cinema_manager";

    // Kiểm tra xem role được chọn có hợp lệ với người dùng hiện tại không
    if (!roleOptions.some((opt) => opt.value === formData.role)) {
      newErrors.role = "Vai trò được chọn không hợp lệ.";
    }

    if (formData.role === "district_manager") {
      if (!formData.district_ids || formData.district_ids.length === 0) {
        newErrors.district_ids =
          "Người dùng có vai trò 'Quản lý cụm rạp' bắt buộc phải quản lý ít nhất một quận.";
      }
    } else if (
      ["showtime_manager", "booking_manager", "cinema_manager"].includes(
        formData.role
      )
    ) {
      if (!formData.cinema_id) {
        newErrors.cinema_id =
          "Người dùng có vai trò này bắt buộc phải thuộc một rạp chiếu.";
      }
    }

    if (isDistrictManager && formData.role === "district_manager") {
      // District manager không thể tự tạo một district manager khác
      newErrors.role =
        "Bạn không thể tạo một người dùng có vai trò 'Quản lý cụm rạp'.";
    }
    if (
      isCinemaManager &&
      (formData.role === "admin" ||
        formData.role === "district_manager" ||
        formData.role === "cinema_manager")
    ) {
      // Cinema manager không thể tạo admin, district manager, hoặc cinema manager khác
      newErrors.role = "Bạn không có quyền tạo người dùng với vai trò này.";
    }
    // --- Kết thúc logic phân quyền ---

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Chỉ chấp nhận file ảnh có định dạng: PNG, JPG, JPEG, WEBP"
        );
        setFormData((prev) => ({ ...prev, avatar: null }));
        setAvatarPreview("");
        e.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        toast.error("Kích thước file không được vượt quá 2MB");
        setFormData((prev) => ({ ...prev, avatar: null }));
        setAvatarPreview("");
        e.target.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);

      setFormData((prev) => ({
        ...prev,
        avatar: file,
        avatar_url_from_backend: "",
      }));

      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: "" }));
      }
    } else {
      if (formData.avatar_url_from_backend) {
        setAvatarPreview(`${imagePhim}${formData.avatar_url_from_backend}`);
      } else {
        setAvatarPreview("");
      }
      setFormData((prev) => ({ ...prev, avatar: null }));
    }
  };

  const handleDistrictCheckboxChange = (e) => {
    const districtId = Number(e.target.value);
    const isChecked = e.target.checked;

    setFormData((prev) => {
      const currentDistrictIds = prev.district_ids || [];
      let newDistrictIds;
      if (isChecked) {
        newDistrictIds = [...currentDistrictIds, districtId];
      } else {
        newDistrictIds = currentDistrictIds.filter((id) => id !== districtId);
      }
      return { ...prev, district_ids: newDistrictIds };
    });

    if (errors.district_ids) {
      setErrors((prev) => ({ ...prev, district_ids: "" }));
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData((prev) => {
      let newFormData = { ...prev, role: newRole };
      // Khi thay đổi vai trò, reset các trường liên quan
      if (newRole !== "district_manager") {
        newFormData.district_ids = [];
      }
      if (
        !["showtime_manager", "booking_manager", "cinema_manager"].includes(
          newRole
        )
      ) {
        newFormData.cinema_id = "";
      }
      // Gán rạp mặc định nếu là cinema_manager đang tạo/sửa người dùng
      if (currentUserRole === "cinema_manager") {
        newFormData.cinema_id = managedCinemas[0]?.cinema_id?.toString() || "";
      }
      return newFormData;
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.district_ids;
      delete newErrors.cinema_id;
      delete newErrors.role;
      return newErrors;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("[UserForm] Đã bấm nút Cập nhật/Thêm mới!");

    if (validateForm()) {
      const formDataToSend = new FormData();

      formDataToSend.append("full_name", formData.full_name || "");
      formDataToSend.append("email", formData.email || "");
      formDataToSend.append("phone", formData.phone || "");
      formDataToSend.append("role", formData.role || "user");
      formDataToSend.append("birth_date", formData.birth_date || "");
      formDataToSend.append("gender", formData.gender || "");

      if (formData.password && formData.password.length > 0) {
        formDataToSend.append("password", formData.password);
        formDataToSend.append(
          "password_confirmation",
          formData.password_confirmation
        );
      }

      if (formData.avatar instanceof File) {
        formDataToSend.append("avatar", formData.avatar);
      }

      if (formData.role === "district_manager") {
        if (
          Array.isArray(formData.district_ids) &&
          formData.district_ids.length > 0
        ) {
          formData.district_ids.forEach((id) => {
            formDataToSend.append(`district_ids[]`, Number(id));
          });
        }
        formDataToSend.append("cinema_id", "");
      } else if (
        ["showtime_manager", "booking_manager", "cinema_manager"].includes(
          formData.role
        )
      ) {
        // Nếu người dùng hiện tại là cinema_manager, chỉ gán rạp của họ
        if (
          currentUserRole === "cinema_manager" &&
          managedCinemas[0]?.cinema_id
        ) {
          formDataToSend.append(
            "cinema_id",
            Number(managedCinemas[0].cinema_id)
          );
        } else if (formData.cinema_id) {
          formDataToSend.append("cinema_id", Number(formData.cinema_id));
        }
        formDataToSend.append("district_ids", []);
      } else {
        formDataToSend.append("cinema_id", "");
        formDataToSend.append("district_ids", []);
      }
      console.log("idddd:", managedCinemas[0]?.cinema_id);
      if (initialData) {
        formDataToSend.append("_method", "PATCH");
      }

      console.log("[UserForm] Dữ liệu thực tế trong FormDataToSend:");
      for (let pair of formDataToSend.entries()) {
        console.log("[FormData entry]", pair[0] + ":", pair[1]);
      }

      onSubmit(initialData?.user_id, formDataToSend);
    } else {
      console.log("[UserForm] Validate lỗi, không submit!");
      toast.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-2 mt-10 max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialData ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <div>
          <input
            type="text"
            name="full_name"
            placeholder="Họ và tên"
            value={formData.full_name}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${
              errors.full_name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="avatar"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ảnh đại diện (chọn file mới nếu muốn thay đổi)
          </label>
          {avatarPreview && (
            <div className="mb-2">
              <img
                src={avatarPreview}
                alt="Ảnh đại diện hiện tại"
                className="w-20 h-20 rounded-full object-cover border border-gray-300"
              />
            </div>
          )}
          <input
            type="file"
            name="avatar"
            id="avatar"
            onChange={handleAvatarChange}
            accept="image/*"
            className="w-full border rounded p-2 border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full 
            file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.avatar && (
            <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (để trống nếu không đổi)"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border rounded p-2 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Xác nhận mật khẩu"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`w-full border rounded p-2 ${
                errors.password_confirmation
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password_confirmation}
              </p>
            )}
          </div>
        </div>

        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <select
            name="role"
            value={formData.role}
            onChange={handleRoleChange}
            className={`w-full border rounded p-2 ${
              errors.role ? "border-red-500" : "border-gray-300"
            }`}
            // disabled={currentUserRole === "cinema_manager"} // Cinema manager không được thay đổi vai trò này
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role}</p>
          )}
        </div>

        {formData.role === "district_manager" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn cụm rạp quản lý
            </label>
            <div
              className={`border rounded p-2 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto ${
                errors.district_ids ? "border-red-500" : "border-gray-300"
              }`}
            >
              {loadingDistricts ? (
                <p className="col-span-2 text-gray-500">Đang tải quận...</p>
              ) : districts.length > 0 ? (
                districts.map((district) => (
                  <label
                    key={district.district_id}
                    className="inline-flex items-center"
                  >
                    <input
                      type="checkbox"
                      value={district.district_id}
                      checked={formData.district_ids.includes(
                        district.district_id
                      )}
                      onChange={handleDistrictCheckboxChange}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-gray-700">
                      {district.district_name}
                    </span>
                  </label>
                ))
              ) : (
                <p className="col-span-2 text-gray-500">
                  Không có quận nào được tìm thấy.
                </p>
              )}
            </div>
            {errors.district_ids && (
              <p className="text-red-500 text-sm mt-1">{errors.district_ids}</p>
            )}
          </div>
        )}

        {["showtime_manager", "booking_manager", "cinema_manager"].includes(
          formData.role
        ) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn rạp quản lý
            </label>
            <select
              name="cinema_id"
              value={formData.cinema_id}
              onChange={handleChange}
              className={`w-full border rounded p-2 ${
                errors.cinema_id ? "border-red-500" : "border-gray-300"
              }`}
              // disabled={currentUserRole === "cinema_manager"} // Cinema manager không được thay đổi rạp của chính họ
            >
              <option value="">Chọn rạp</option>
              {loadingCinemas ? (
                <option disabled>Đang tải rạp...</option>
              ) : filteredCinemas.length > 0 ? (
                filteredCinemas.map((cinema) => (
                  <option key={cinema.cinema_id} value={cinema.cinema_id}>
                    {cinema.cinema_name}
                  </option>
                ))
              ) : (
                <option disabled>Không có rạp nào được tìm thấy.</option>
              )}
            </select>
            {errors.cinema_id && (
              <p className="text-red-500 text-sm mt-1">{errors.cinema_id}</p>
            )}
          </div>
        )}

        <div>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${
              errors.birth_date ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.birth_date && (
            <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>
          )}
        </div>

        <div>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors cursor-pointer"
          >
            {initialData ? "Cập nhật" : "Thêm mới"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition-colors cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
