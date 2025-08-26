import React, { useState, useEffect } from "react";

const TicketTypeForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    ticket_type_name: "",
    ticket_price: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ticket_type_name: initialData.ticket_type_name || "",
        ticket_price: initialData.ticket_price || "",
      });
    } else {
      setFormData({
        ticket_type_name: "",
        ticket_price: "",
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ticket_type_name.trim()) {
      newErrors.ticket_type_name = "Vui lòng nhập tên loại vé";
    }
    if (!formData.ticket_price) {
      newErrors.ticket_price = "Vui lòng nhập giá vé";
    } else if (
      isNaN(Number(formData.ticket_price)) ||
      Number(formData.ticket_price) <= 0
    ) {
      newErrors.ticket_price = "Giá vé phải là số dương";
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
    <div className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {initialData ? "Chỉnh sửa loại vé" : "Thêm loại vé mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên loại vé <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ticket_type_name"
            placeholder="Nhập tên loại vé"
            value={formData.ticket_type_name}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.ticket_type_name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.ticket_type_name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.ticket_type_name}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá vé (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="ticket_price"
            placeholder="Nhập giá vé"
            value={formData.ticket_price}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.ticket_price
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
            min={1}
          />
          {errors.ticket_price && (
            <p className="mt-1 text-sm text-red-500">{errors.ticket_price}</p>
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
            Hủy
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center bg-blue-500 text-white py-2 
            rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
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
            {initialData ? "Cập nhật" : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketTypeForm;
