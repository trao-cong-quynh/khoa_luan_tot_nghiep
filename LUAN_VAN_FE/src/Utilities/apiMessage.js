// Hàm tiện ích lấy message từ response hoặc error của API
export function getApiMessage(resOrErr, defaultMsg = "Có lỗi xảy ra!") {
  return (
    resOrErr?.data?.message ||
    resOrErr?.response?.data?.message ||
    resOrErr?.message ||
    defaultMsg
  );
}

// Hàm xử lý lỗi theo code, dùng chung cho các trang admin
import { toast } from "react-toastify";
export function handleApiError(errorPayload, defaultMsg = "Có lỗi xảy ra") {
  if (!errorPayload) {
    toast.error(defaultMsg);
    return;
  }
  switch (
    errorPayload.code
  ) {
    case 500:
      toast.error(errorPayload.message || "Tên đã tồn tại trong hệ thống.");
      break;
    case 400:
      toast.error(errorPayload.message || "Dữ liệu gửi lên không hợp lệ.");
      break;
    case 200:
      toast.success(errorPayload.message || "Thành công");
      break;
    default:
      toast.error(errorPayload.message || defaultMsg);
  }
}
