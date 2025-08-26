import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authAPI from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import AuthLeftBanner from "../../components/Auth/AuthLeftBanner";
import { imagePhim } from "../../Utilities/common";
import { useGetPhimUS } from "../../api/homePage/queries";

const fallbackPoster = "/placeholder.jpg";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { data: moviesData, isLoading } = useGetPhimUS();
  const movies = moviesData?.data?.movies || [];
  const posters = movies
    .filter((m) => m.poster_url)
    .map((m) => `${imagePhim}${m.poster_url}`);

  const [posterIndex, setPosterIndex] = useState(0);
  useEffect(() => {
    setPosterIndex(0);
  }, [posters.length]);
  useEffect(() => {
    if (posters.length > 1) {
      const interval = setInterval(() => {
        setPosterIndex((prev) => {
          let next = Math.floor(Math.random() * posters.length);
          while (next === prev && posters.length > 1) {
            next = Math.floor(Math.random() * posters.length);
          }
          return next;
        });
      }, 600000);
      return () => clearInterval(interval);
    }
  }, [posters.length]);
  const currentPoster = posters[posterIndex] || fallbackPoster;

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "Nam",
    dob: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [touched, setTouched] = useState({});
  const [showErrors, setShowErrors] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    // Validate full name
    if (
      !formData.fullName ||
      formData.fullName.length < 2 ||
      formData.fullName.length > 255
    ) {
      toast.error("Họ và tên phải từ 2-255 ký tự!");
      return false;
    }
    // Kiểm tra tên chỉ chứa chữ cái và khoảng trắng
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(formData.fullName)) {
      toast.error("Họ và tên chỉ được chứa chữ cái và khoảng trắng!");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Email không hợp lệ, ví dụ: abc@gmail.com");
      return false;
    }

    // Validate password
    if (formData.password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự!");
      return false;
    }
    // Kiểm tra mật khẩu có chữ hoa, số và ký tự đặc biệt
    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      toast.error(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt!"
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không đúng!");
      return false;
    }

    // Validate phone
    if (!/^(\+?\d{9,15})$/.test(formData.phone)) {
      toast.error(
        "Số điện thoại không hợp lệ. Chỉ được chứa số và có thể bắt đầu bằng dấu +"
      );
      return false;
    }

    // Validate birth date
    if (!formData.dob) {
      toast.error("Ngày sinh là bắt buộc!");
      return false;
    }
    const today = new Date();
    const birthDate = new Date(formData.dob);
    if (birthDate >= today) {
      toast.error("Ngày sinh không được ở tương lai!");
      return false;
    }

    // Validate gender
    if (!["Nam", "Nữ", "Khác"].includes(formData.gender)) {
      toast.error("Giới tính phải là Nam hoặc Nữ hoặc Khác!");
      return false;
    }

    // Validate agree terms
    if (!formData.agreeTerms) {
      toast.error(
        "Bạn phải đồng ý với Điều khoản dịch vụ và Chính sách bảo mật!"
      );
      return false;
    }

    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowErrors(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      await authAPI.register(formData);

      // Tự động đăng nhập sau khi đăng ký thành công
      const loginResponse = await authAPI.login(
        formData.email,
        formData.password
      );

      if (loginResponse.data?.access_token) {
        // Lưu token và thông tin user
        localStorage.setItem("token", loginResponse.data.access_token);
        if (loginResponse.data?.user) {
          // Xử lý role từ mảng roles
          const userData = loginResponse.data.user;
          const userRole =
            userData.roles && userData.roles.length > 0
              ? userData.roles[0]
              : "user";

          // Tạo object user với role đơn lẻ để tương thích với code hiện tại
          const userInfo = {
            ...userData,
            role: userRole,
          };

          localStorage.setItem("user", JSON.stringify(userInfo));
          login(userInfo);
        }

        toast.success("Đăng ký thành công!", {
          position: "top-right",
          autoClose: 1000,
          closeOnClick: true,
          draggable: true,
        });

        setTimeout(() => {
          navigate("/");
        }, 600000);
      }
    } catch (error) {
      console.error("Register error:", error);
      // Kiểm tra nếu có lỗi validation từ server
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        // Hiển thị lỗi đầu tiên
        const firstError = Object.values(errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error(error.response?.data?.message || "Đăng ký thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 mb-4 mt-4">
      {/* <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      /> */}
      <div className="flex lg:w-[60%] bg-white rounded-2xl shadow-lg overflow-hidden">
        {isLoading || movies.length === 0 ? (
          <div
            className="w-1/2 flex items-center justify-center"
            style={{ background: "var(--color-primary)" }}
          >
            <span className="text-xl font-bold text-white">
              Đang tải phim...
            </span>
          </div>
        ) : (
          <AuthLeftBanner image={currentPoster} />
        )}
        <div className="lg:w-1/2 flex flex-col justify-center p-16">
          <h2
            className="text-4xl font-bold mb-8 text-center"
            style={{ color: "var(--color-blue)" }}
          >
            Đăng ký tài khoản
          </h2>
          <form onSubmit={handleRegister}>
            {/* Họ và tên */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="fullName"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="fullName"
                type="text"
                placeholder="Nhập Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {(touched.fullName || showErrors) && !formData.fullName && (
                <p className="text-red-500 text-xs italic mt-1">
                  Vui lòng nhập thông tin
                </p>
              )}
            </div>
            {/* Email */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Nhập Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {(touched.email || showErrors) && !formData.email && (
                <p className="text-red-500 text-xs italic mt-1">
                  Vui lòng nhập Email
                </p>
              )}
            </div>
            {/* Số điện thoại */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="phone"
              >
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="phone"
                type="tel"
                placeholder="Nhập Số điện thoại"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
              />
              {(touched.phone || showErrors) && !formData.phone && (
                <p className="text-red-500 text-xs italic mt-1">
                  Vui lòng nhập số điện thoại
                </p>
              )}
            </div>
            {/* Giới tính */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    style={{ accentColor: "var(--color-hover)" }}
                    name="gender"
                    value="Nam"
                    checked={formData.gender === "Nam"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span className="ml-2 text-gray-700">Nam</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    style={{ accentColor: "var(--color-hover)" }}
                    name="gender"
                    value="Nữ"
                    checked={formData.gender === "Nữ"}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <span className="ml-2 text-gray-700">Nữ</span>
                </label>
              </div>
            </div>
            {/* Ngày sinh */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="dob"
              >
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="dob"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                max={new Date().toISOString().split("T")[0]}
                required
              />
              {(touched.dob || showErrors) && !formData.dob && (
                <p className="text-red-500 text-xs italic mt-1">
                  Vui lòng chọn ngày sinh
                </p>
              )}
            </div>
            {/* Mật khẩu */}
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập Mật Khẩu"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {(touched.password || showErrors) && !formData.password && (
                <p className="text-red-500 text-xs italic mt-1">
                  Vui lòng nhập mật khẩu
                </p>
              )}
            </div>
            {/* Nhập lại mật khẩu */}
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirmPassword"
              >
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {(touched.confirmPassword || showErrors) &&
                !formData.confirmPassword && (
                  <p className="text-red-500 text-xs italic mt-1">
                    Vui lòng nhập lại mật khẩu
                  </p>
                )}
            </div>
            {/* Checkbox đồng ý điều khoản */}
            <div className="mb-6 text-sm">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  style={{ accentColor: "var(--color-hover)" }}
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <span className="ml-2 text-gray-700">
                  Bằng việc đăng ký tài khoản, tôi đồng ý với Điều khoản dịch vụ
                  và Chính sách bảo mật của Galaxy Cinema.
                </span>
              </label>
              {touched.agreeTerms && !formData.agreeTerms && (
                <p className="text-red-500 text-xs italic mt-1">
                  Vui lòng chọn điều khoản
                </p>
              )}
            </div>
            {/* Nút Hoàn thành */}
            <div className="flex items-center justify-center mb-4">
              <button
                className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full cursor-pointer"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "var(--color-hover)";
                    e.target.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor = "var(--color-primary)";
                    e.target.style.color = "white";
                  }
                }}
                type="submit"
                disabled={loading} // Disable button when loading
              >
                {loading ? "Đang đăng ký..." : "Hoàn thành"}
              </button>
            </div>
            {/* Quên mật khẩu */}
            {/* <div className="text-center mb-4">
              <a
                className="inline-block align-baseline font-bold text-sm"
                style={{
                  color: "text-black",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "text-black";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "var(--color-hover)";
                }}
                href="#"
              >
                Quên mật khẩu?
              </a>
            </div> */}
            {/* Link đăng nhập */}
            <div className="text-center text-sm text-gray-600 mb-4">
              Bạn đã có tài khoản?
            </div>
            <div className="flex items-center justify-center">
              <Link
                to="/login"
                className="inline-block text-center bg-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                style={{
                  color: "var(--color-text)",
                  borderColor: "var(--color-border)",
                  border: "2px solid var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--color-hover)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "var(--color-hover)";
                }}
              >
                ĐĂNG NHẬP
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
