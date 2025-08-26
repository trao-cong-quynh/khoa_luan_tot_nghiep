import React, { useState, useEffect } from "react";

const GenreForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    genre_id: null,
    genre_name: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        genre_id: initialData.genre_id || initialData.id || null,
        genre_name: initialData.genre_name || "",
      });
    } else {
      setFormData({
        genre_id: null,
        genre_name: "",
      });
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.genre_name.trim()) {
      newErrors.genre_name = "Vui lòng nhập tên thể loại";
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
        {initialData ? "Chỉnh sửa thể loại" : "Thêm thể loại mới"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên thể loại
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="genre_name"
            placeholder="Nhập tên thể loại"
            value={formData.genre_name}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 ${
              errors.genre_name
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:outline-none focus:ring-2`}
          />
          {errors.genre_name && (
            <p className="mt-1 text-sm text-red-500">{errors.genre_name}</p>
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
            {initialData ? "Cập nhật thể loại" : "Tạo thể loại"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenreForm;
