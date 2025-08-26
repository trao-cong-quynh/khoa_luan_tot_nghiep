import axios from "axios";
import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_API_URL;
const timeout = import.meta.env.VITE_API_TIMEOUT || 20000;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout,
});

axiosInstance.interceptors.request.use(
  function (config) {
    config.headers["Content-Type"] = "application/json";
    const token = localStorage.getItem("token");
    // console.log("Current token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Added Authorization header:", config.headers.Authorization);
    } else {
      // console.warn("No token found in localStorage");
    }
    return config;
  },
  function (error) {
    // console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    // console.log("Response from server:", response);
    // Kiểm tra nếu response.data có cấu trúc { data: {...} }
    if (response.data && response.data.data) {
      return response.data;
    }
    // Nếu không, trả về toàn bộ response
    return response;
  },
  async function (error) {
    console.error("Error response:", error.response);
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Có lỗi xảy ra";
      // Xử lý từng mã lỗi
      if (status === 401) {
        console.log("Received 401 error, attempting to refresh token");
        try {
          // Thử refresh token
          const refreshToken = localStorage.getItem("refreshToken");
          console.log("Current refresh token:", refreshToken);
          if (refreshToken) {
            const response = await axiosInstance.post("/refresh-token", {
              refresh_token: refreshToken,
            });
            // console.log("Refresh token response:", response);
            if (response.data?.access_token) {
              localStorage.setItem("token", response.data.access_token);
              // console.log("New token stored:", response.data.access_token);
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${response.data.access_token}`;
              return axiosInstance(error.config);
            }
          } else {
            console.warn("No refresh token found");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
        // Nếu refresh token thất bại hoặc không có refresh token, đăng xuất
        console.log("Logging out due to authentication failure");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      if (status === 403) {
        toast.error("Bạn không có quyền thực hiện thao tác này!");
        window.location.href = "/";
      }
      if (status === 400) {
        toast.error(message || "Dữ liệu gửi sai. Vui lòng kiểm tra lại!");
      }
      if (status === 404) {
        toast.error("Không tìm thấy dữ liệu!");
      }
      if (status === 422) {
        // Nếu có lỗi chi tiết từ server (Laravel validation)
        const errors = error.response.data?.errors;
        if (errors && typeof errors === "object") {
          Object.values(errors).forEach((errArr) => {
            if (Array.isArray(errArr)) {
              errArr.forEach((errMsg) => toast.error(errMsg));
            } else {
              toast.error(errArr);
            }
          });
        } else {
          toast.error(message || "Dữ liệu không hợp lệ!");
        }
      }
      if (status === 500) {
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau!");
      }
      // Trả về error với message từ server
      return Promise.reject({
        message,
        status,
        data: error.response.data,
      });
    } else if (error.request) {
      toast.error("Không thể kết nối đến server");
      return Promise.reject({
        message: "Không thể kết nối đến server",
        status: 0,
      });
    } else {
      toast.error(error.message || "Có lỗi xảy ra");
      return Promise.reject({
        message: error.message || "Có lỗi xảy ra",
        status: 0,
      });
    }
  }
);

export default axiosInstance;
