import React, { useState, useEffect } from "react";

const TheaterForm = ({
  onSubmit,
  onCancel,
  initialData,
  onAddressChange,
  districts = [],
  cinemas = [],
}) => {
  const [formData, setFormData] = useState({
    cinema_id: null,
    cinema_name: "",
    address: "",
    map_address: "",
    district_id: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        cinema_id: initialData.cinema_id,
        cinema_name: initialData.cinema_name,
        address: initialData.address,
        map_address: initialData.map_address,
        district_id:
          initialData.district_id || initialData.district?.district_id || "",
      });
    } else {
      setFormData({
        cinema_id: null,
        cinema_name: "",
        address: "",
        map_address: "",
        district_id: "",
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.cinema_name.trim()) {
      newErrors.cinema_name = "Vui lòng nhập tên rạp chiếu";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    }
    if (!formData.map_address.trim()) {
      newErrors.map_address = "Vui lòng nhập địa chỉ map";
    }
    if (!formData.district_id) {
      newErrors.district_id = "Vui lòng chọn quận";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Trigger address change for map update
    if (name === "map_address" && onAddressChange) {
      onAddressChange(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("[TheaterForm] handleSubmit được gọi");
    if (validateForm()) {
      const fd = new FormData();
      // Chỉ append cinema_name nếu giá trị đã thay đổi hoặc đang tạo mới
      if (!initialData || formData.cinema_name !== initialData.cinema_name) {
        fd.append("cinema_name", formData.cinema_name);
      }
      fd.append("address", formData.address);
      if (formData.map_address) {
        fd.append("map_address", formData.map_address);
      }
      if (formData.district_id) {
        fd.append("district_id", formData.district_id);
      }
      if (initialData && initialData.cinema_id) {
        fd.append("cinema_id", initialData.cinema_id);
      }
      // Log lại để kiểm tra
      // console.log("[TheaterForm] Địa chỉ gửi lên:", formData.address);
      for (let pair of fd.entries()) {
        console.log("[TheaterForm][FormData gửi lên]", pair[0] + ":", pair[1]);
      }
      onSubmit(fd);
    }
  };

  // Sinh danh sách quận từ cinemas nếu không có districts
  const districtOptions =
    districts.length > 0
      ? districts
      : Array.from(
          new Map(
            cinemas.map((cinema) => [cinema.district_id, cinema.district])
          ).values()
        ).filter(Boolean);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialData ? "Chỉnh sửa rạp chiếu" : "Thêm rạp chiếu mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-2 mb-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex items-center justify-center bg-gray-200 text-gray-800 
            py-2 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center bg-blue-500 text-white 
            py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {initialData ? "Cập nhật rạp chiếu" : "Tạo rạp chiếu"}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên rạp chiếu
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="cinema_name"
            placeholder="Nhập tên rạp chiếu"
            value={formData.cinema_name}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.cinema_name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.cinema_name && (
            <p className="mt-1 text-sm text-red-500">{errors.cinema_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            placeholder="Nhập địa chỉ"
            value={formData.address}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.address
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ map
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="map_address"
            placeholder="Nhập địa chỉ map"
            value={formData.map_address}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.map_address
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.map_address && (
            <p className="mt-1 text-sm text-red-500">{errors.map_address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận <span className="text-red-500">*</span>
          </label>
          <select
            name="district_id"
            value={formData.district_id || ""}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.district_id
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
            required
          >
            <option value="">Chọn quận</option>
            {districtOptions.map((district) => (
              <option key={district.district_id} value={district.district_id}>
                {district.district_name}
              </option>
            ))}
          </select>
          {errors.district_id && (
            <p className="mt-1 text-sm text-red-500">{errors.district_id}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default TheaterForm;
