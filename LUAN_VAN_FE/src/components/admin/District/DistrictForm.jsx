import React, { useState, useEffect } from "react";

const DistrictForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    district_id: null,
    district_name: "",
    district_code: "",
  });
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (initialData) {
      setFormData({
        district_id: initialData.district_id || initialData.id || null,
        district_name: initialData.district_name || "",
        district_code: initialData.district_code || "",
      });
    } else {
      setFormData({
        district_id: null,
        district_name: "",
        district_code: "",
      });
    }
    setErrors({});
  }, [initialData]);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.district_name.trim()) {
      newErrors.district_name = "Vui lòng nhập tên quận/huyện";
    }
    if (!formData.district_code.trim()) {
      newErrors.district_code = "Vui lòng nhập mã quận/huyện";
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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  return (
    <div className="p-6 bg-white rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialData ? "Chỉnh sửa quận/huyện" : "Thêm quận/huyện mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tên quận/huyện
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="district_name"
            placeholder="Nhập tên quận/huyện "
            value={formData.district_name}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.district_name ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {errors.district_name && (
            <p className="mt-1 text-sm text-red-500">{errors.district_name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mã code
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="district_code"
            placeholder="Nhập tên quận/huyện "
            value={formData.district_code}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.district_code ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {errors.district_code && (
            <p className="mt-1 text-sm text-red-500">{errors.district_name}</p>
          )}
        </div>
        <div className="flex space-x-2 mb-4 ">
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
            {initialData ? "Cập nhật quận huyện" : "Tạo quận huyện"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DistrictForm;
