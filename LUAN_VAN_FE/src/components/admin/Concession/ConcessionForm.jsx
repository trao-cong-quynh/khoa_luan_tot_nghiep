import React, { useState, useEffect } from "react";
import { imagePhim } from "../../../Utilities/common";
const ConcessionForm = ({
  onSubmit,
  onCancel,
  initialData,
  categoryOptions = [],
}) => {
  const [formData, setFormData] = useState({
    concession_id: null,
    concession_name: "",
    unit_price: "",
    category: "",
    description: "",
    image: null,
    image_url: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        concession_id: initialData.concession_id || null,
        concession_name: initialData.concession_name || "",
        unit_price: initialData.unit_price || "",
        category: initialData.category || "",
        description: initialData.description || "",
        image: null,
        image_url: initialData.image_url || "",
      });
    } else {
      setFormData({
        concession_id: null,
        concession_name: "",
        unit_price: "",
        category: "",
        description: "",
        image: null,
        image_url: "",
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.concession_name.trim()) {
      newErrors.concession_name = "Vui lòng nhập tên dịch vụ";
    }
    if (!formData.unit_price || isNaN(formData.unit_price)) {
      newErrors.unit_price = "Vui lòng nhập giá hợp lệ";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Vui lòng nhập loại dịch vụ";
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        image_url: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formDataToSend = new FormData();

      formDataToSend.append("concession_name", formData.concession_name);
      formDataToSend.append("unit_price", formData.unit_price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("description", formData.description);

      if (formData.image instanceof File) {
        formDataToSend.append("image", formData.image);
      }

      // Chỉ thêm _method: "PUT" khi cập nhật
      if (initialData) {
        formDataToSend.append("_method", "PUT");
      }

      // Thay đổi ở đây: Gửi cả ID và FormData
      onSubmit(initialData?.concession_id, formDataToSend);
    }
  };

  return (
    <div className="p-6 max-h-[100vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialData ? "Chỉnh sửa dịch vụ ăn uống" : "Thêm dịch vụ ăn uống mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên dịch vụ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="concession_name"
            placeholder="Nhập tên dịch vụ"
            value={formData.concession_name}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.concession_name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.concession_name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.concession_name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="unit_price"
            placeholder="Nhập giá"
            value={formData.unit_price}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.unit_price
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.unit_price && (
            <p className="mt-1 text-sm text-red-500">{errors.unit_price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại dịch vụ <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.category
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          >
            <option value="">Chọn loại dịch vụ</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả dịch vụ
          </label>
          <textarea
            name="description"
            placeholder="Nhập mô tả dịch vụ (tùy chọn)"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-2.5 border-gray-300 focus:ring-blue-500 focus:outline-none focus:ring-2 min-h-[80px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ảnh dịch vụ
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border rounded-lg p-2.5 border-gray-300 focus:ring-blue-500 focus:outline-none focus:ring-2"
          />
          {(formData.image_url || formData.image) && (
            <img
              src={
                formData.image_url
                  ? formData.image_url.startsWith("blob:")
                    ? formData.image_url
                    : formData.image_url.startsWith("/storage")
                    ? `${imagePhim}${formData.image_url}`
                    : formData.image_url
                  : ""
              }
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border"
            />
          )}
        </div>
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
            {initialData ? "Cập nhật dịch vụ" : "Tạo dịch vụ"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConcessionForm;
