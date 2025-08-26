import axiosInstance from "./axios";

const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/login", {
      email,
      password,
    });

    if (response.data && response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);

      // Lưu thông tin user đầy đủ vào localStorage
      if (response.data.user) {
        const userData = response.data.user;
        // Đảm bảo có role trong user data
        if (userData.roles && userData.roles.length > 0) {
          userData.role = userData.roles[0]; // Thêm role đơn lẻ để tương thích
        }
        localStorage.setItem("user", JSON.stringify(userData));
      }
    }

    return response;
  },

  register: async (userData) => {
    // Chuyển đổi giới tính theo yêu cầu của backend
    const genderMap = {
      Nam: "Nam",
      Nữ: "Nữ",
      Khác: "Khác",
    };

    const response = await axiosInstance.post("/register", {
      full_name: userData.fullName,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.confirmPassword,
      phone: userData.phone,
      birth_date: userData.dob,
      gender: genderMap[userData.gender] || "Nam", // Mặc định là Nam nếu không khớp
    });
    return response;
  },

  logout: async () => {
    try {
      await axiosInstance.get("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  getCurrentUser: () => {
    return localStorage.getItem("token");
  },

  getUserInfo: async () => {
    const response = await axiosInstance.get("/user");
    return response;
  },
};

export default authAPI;
