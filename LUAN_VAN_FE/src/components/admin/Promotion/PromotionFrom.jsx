import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { imagePhim } from "../../../Utilities/common";
// Giả sử imagePhim là một hằng số đã được định nghĩa ở đâu đó

// Hàm tiện ích để định dạng ngày tháng
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("-");
  return `${year}-${month}-${day}`;
};

// Hàm tiện ích để định dạng ngày tháng cho API
const formatInputDateForAPI = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year} 00:00`;
};

// Định nghĩa trạng thái mặc định của form
const defaultFields = {
  name: "",
  code: "",
  description: "",
  start_date: "",
  end_date: "",
  type: "PERCENT_DISCOUNT",
  discount_value: "",
  max_discount_amount: "",
  min_order_amount: "",
  usage_limit_per_user: "",
  total_usage_limit: "",
  apply_to_product_type: "TICKET",
  status: "active",
  image: null,
};

const PromotionFrom = ({
  initialData = null,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}) => {
  const [formData, setFormData] = useState(defaultFields);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFields,
        ...initialData,
        // Chuyển đổi định dạng ngày tháng khi nhận dữ liệu từ prop
        start_date: initialData.start_date
          ? formatDateForInput(initialData.start_date)
          : "",
        end_date: initialData.end_date
          ? formatDateForInput(initialData.end_date)
          : "",
        image: null, // Luôn reset image file
      });
      setImagePreview(
        initialData.image_url ? `${imagePhim}${initialData.image_url}` : null
      );
    } else {
      setFormData(defaultFields);
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên khuyến mãi.";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Vui lòng nhập mã khuyến mãi.";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Vui lòng chọn ngày bắt đầu.";
    }
    if (!formData.end_date) {
      newErrors.end_date = "Vui lòng chọn ngày kết thúc.";
    }
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    const discountValue = parseFloat(formData.discount_value);
    if (isNaN(discountValue) || discountValue <= 0) {
      newErrors.discount_value = "Giá trị giảm giá phải là số lớn hơn 0.";
    }
    if (
      formData.type === "PERCENT_DISCOUNT" &&
      (discountValue > 100 || discountValue < 0)
    ) {
      newErrors.discount_value = "Phần trăm giảm giá phải từ 0 đến 100.";
    }

    const maxDiscount = parseFloat(formData.max_discount_amount);
    if (isNaN(maxDiscount) || maxDiscount < 0) {
      newErrors.max_discount_amount = "Giảm tối đa không hợp lệ.";
    }

    const minOrder = parseFloat(formData.min_order_amount);
    if (isNaN(minOrder) || minOrder < 0) {
      newErrors.min_order_amount = "Đơn hàng tối thiểu không hợp lệ.";
    }

    const usagePerUser = parseInt(formData.usage_limit_per_user);
    if (isNaN(usagePerUser) || usagePerUser < 1) {
      newErrors.usage_limit_per_user =
        "Số lần dùng/người phải lớn hơn hoặc bằng 1.";
    }

    const totalUsage = parseInt(formData.total_usage_limit);
    if (isNaN(totalUsage) || totalUsage < 1) {
      newErrors.total_usage_limit =
        "Tổng số lượt dùng phải lớn hơn hoặc bằng 1.";
    }

    if (usagePerUser > totalUsage) {
      newErrors.usage_limit_per_user =
        "Số lần dùng/người không được lớn hơn tổng số lượt dùng.";
    }

    // Kiểm tra hình ảnh chỉ khi TẠO MỚI (không phải chỉnh sửa)
    if (!isEdit && !formData.image) {
      newErrors.image = "Vui lòng chọn một hình ảnh.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Chỉ chấp nhận file ảnh có định dạng: PNG, JPG, JPEG, WEBP"
        );
        e.target.value = null;
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(
          initialData?.image_url ? `${imagePhim}${initialData.image_url}` : null
        );
        return;
      }
      if (file.size > maxSize) {
        toast.error("Kích thước file không được vượt quá 2MB");
        e.target.value = null;
        setFormData((prev) => ({ ...prev, image: null }));
        setImagePreview(
          initialData?.image_url ? `${imagePhim}${initialData.image_url}` : null
        );
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    } else {
      setFormData((prev) => ({ ...prev, image: null }));
      setImagePreview(
        initialData?.image_url ? `${imagePhim}${initialData.image_url}` : null
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const formDataToSend = new FormData();

      // Thêm promotion_id chỉ khi có (tức là đang chỉnh sửa)
      if (isEdit && initialData?.promotion_id) {
        formDataToSend.append("promotion_id", initialData.promotion_id);
      }

      for (const key in formData) {
        if (
          key !== "image" &&
          formData[key] !== null &&
          formData[key] !== undefined
        ) {
          if (key === "start_date" || key === "end_date") {
            // Chuyển đổi định dạng ngày tháng về lại định dạng API yêu cầu
            formDataToSend.append(key, formatInputDateForAPI(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      } else if (isEdit && initialData?.image_url) {
        // Nếu chỉnh sửa nhưng không chọn ảnh mới, gửi lại URL ảnh cũ
        formDataToSend.append("image_url", initialData.image_url);
      }

      // Thêm trường _method khi chỉnh sửa để Laravel xử lý PATCH
      if (isEdit) {
        formDataToSend.append("_method", "PATCH");
      }

      onSubmit(formDataToSend);
    } else {
      toast.error("Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div
      className="p-6 w-full mx-auto"
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isEdit ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi"}
        </h2>
        {onCancel && (
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onCancel}
            type="button"
          >
            &times;
          </button>
        )}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Trường hình ảnh */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Hình ảnh khuyến mãi
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
              errors.image ? "border-red-500" : ""
            }`}
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Ảnh xem trước"
                className="w-40 h-auto rounded-md object-cover border border-gray-300"
              />
            </div>
          )}
          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
        </div>
        {/* Các trường còn lại giữ nguyên, thêm logic hiển thị lỗi */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tên khuyến mãi
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tên khuyến mãi"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Mã khuyến mãi
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.code ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập mã khuyến mãi"
          />
          {errors.code && (
            <p className="text-red-500 text-sm mt-1">{errors.code}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Nhập mô tả"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date || ""}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.start_date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Ngày kết thúc
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date || ""}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.end_date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Loại khuyến mãi
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="PERCENT_DISCOUNT">Phần trăm (%)</option>
            <option value="FIXED_DISCOUNT">Giảm giá cố định (VNĐ)</option>
          </select>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Giá trị giảm{" "}
              {formData.type === "PERCENT_DISCOUNT" ? " (%)" : " (VNĐ)"}
            </label>
            <input
              type="number"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.discount_value ? "border-red-500" : "border-gray-300"
              }`}
              min={0}
            />
            {errors.discount_value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.discount_value}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Giảm tối đa (VNĐ)
            </label>
            <input
              type="number"
              name="max_discount_amount"
              value={formData.max_discount_amount}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.max_discount_amount
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              min={0}
            />
            {errors.max_discount_amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.max_discount_amount}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Đơn hàng tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              name="min_order_amount"
              value={formData.min_order_amount}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.min_order_amount ? "border-red-500" : "border-gray-300"
              }`}
              min={0}
            />
            {errors.min_order_amount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.min_order_amount}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Số lần dùng / người
            </label>
            <input
              type="number"
              name="usage_limit_per_user"
              value={formData.usage_limit_per_user}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.usage_limit_per_user
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              min={1}
            />
            {errors.usage_limit_per_user && (
              <p className="text-red-500 text-sm mt-1">
                {errors.usage_limit_per_user}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Tổng số lượt dùng
            </label>
            <input
              type="number"
              name="total_usage_limit"
              value={formData.total_usage_limit}
              onChange={handleChange}
              className={`w-full border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.total_usage_limit ? "border-red-500" : "border-gray-300"
              }`}
              min={1}
            />
            {errors.total_usage_limit && (
              <p className="text-red-500 text-sm mt-1">
                {errors.total_usage_limit}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Áp dụng cho</label>
          <select
            name="apply_to_product_type"
            value={formData.apply_to_product_type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="TICKET">Vé xem phim</option>
            <option value="CONCESSION">Đồ ăn/uống</option>
            <option value="ALL">Tất cả</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="active">Kích hoạt</option>
            <option value="inactive">Ẩn</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu"}
          </button>
          {onCancel && (
            <button
              type="button"
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition cursor-pointer"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PromotionFrom;
