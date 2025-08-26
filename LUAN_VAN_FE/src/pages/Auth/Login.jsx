import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authAPI from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";
import AuthLeftBanner from "../../components/Auth/AuthLeftBanner";
import { imagePhim } from "../../Utilities/common";
import { useGetPhimUS } from "../../api/homePage/queries";

const fallbackPoster = "/placeholder.jpg";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [posters.length]);
  const currentPoster = posters[posterIndex] || fallbackPoster;

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const userRole = localStorage.getItem("role");

  //   if (token && userRole === "admin") {
  //     navigate("/admin");
  //   }
  // }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);

      const token = response.data?.access_token;
      const refreshToken = response.data?.refresh_token;
      if (token) {
        localStorage.setItem("token", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        // Lưu thông tin user
        if (response.data?.user) {
          // Xử lý role từ mảng roles
          const userData = response.data.user;
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
          // Cập nhật trạng thái đăng nhập trong context
          login(userInfo);
          // Chuyển trang dựa trên role
          const redirectPath = getRedirectPathByRole(userRole);
          navigate(redirectPath, { state: { loginSuccess: true } });
        } else {
          throw new Error("Không nhận được token từ server");
        }
      } else {
        throw new Error("Không nhận được token từ server");
      }
    } catch (error) {
      console.error("Login error details:", error);
      const errorMessage = error.message || "Đăng nhập thất bại!";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };
  // Hàm xác định đường dẫn chuyển hướng dựa trên role
  const getRedirectPathByRole = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "booking_manager":
        return "/manage/ticket_order";
      case "ticket_manager":
        return "/manage/ticket_order";
      case "showtime_manager":
        return "/manage/showtime";
      case "cinema_manager":
        return "/manage/user";
      case "finance_manager":
        return "/finance/revenue";
      case "content_manager":
        return "/content/articles";
      case "district_manager":
        return "/district_manager/user";
      default:
        return "/"; // User thường
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 mb-4">
      <div className="flex lg:w-[60%] bg-white rounded-2xl shadow-lg overflow-hidden mt-4">
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
        <div className="w lg:w-1/2 flex flex-col justify-center p-16 mt-2">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Đăng nhập tài khoản
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                placeholder="Nhập Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6 items-center">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Mật khẩu:
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập Mật Khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="-mt-2 absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <a
                className="inline-block align-baseline font-bold text-sm"
                style={{
                  color: "var(--color-black)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "var(--color-black)";
                }}
                href="#"
              >
                Quên mật khẩu?
              </a>
            </div>

            <div className="flex items-center justify-center mb-4">
              <button
                className={`text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "black",
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
                disabled={loading}
              >
                {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 mb-4">
              Bạn chưa có tài khoản?
            </div>

            <div className="flex items-center justify-center">
              <Link
                to="/register"
                className="bg-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full text-center"
                style={{
                  color: "var(--color-hover)",
                  borderColor: "var(--color-border)",
                  border: "2px solid var(--color-border)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "var(--color-hover)";
                  e.target.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.color = "var(--color-black)";
                }}
              >
                ĐĂNG KÝ
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
