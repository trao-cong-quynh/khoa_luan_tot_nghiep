import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // debugger;
  const { isAdmin, isLoggedIn, isLoading, userData } = useAuth();
  const location = useLocation();

  console.log(
    "ProtectedRoute (render): Path=",
    location.pathname,
    ", isLoading=",
    isLoading,
    ", isLoggedIn=",
    isLoggedIn,
    ", isAdmin=",
    isAdmin(),
    ", User Role:",
    userData.role,
    ", Allowed Roles:",
    allowedRoles
  );

  if (isLoading) {
    console.log(
      "ProtectedRoute: Still loading auth status, returning Loading..."
    );
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    console.log("ProtectedRoute: Not logged in, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra nếu có yêu cầu role cụ thể
  if (allowedRoles && allowedRoles.length > 0) {
    // Debug chi tiết về role comparison
    console.log("=== ROLE COMPARISON DEBUG ===");
    console.log("User role (raw):", `"${userData.role}"`);
    console.log("User role (length):", userData.role?.length);
    console.log(
      "User role (char codes):",
      userData.role?.split("").map((c) => c.charCodeAt(0))
    );
    console.log("Allowed roles:", allowedRoles);
    console.log(
      "Allowed roles (detailed):",
      allowedRoles.map((role) => ({
        role: `"${role}"`,
        length: role.length,
        charCodes: role.split("").map((c) => c.charCodeAt(0)),
      }))
    );

    const hasRequiredRole = allowedRoles.includes(userData.role);
    console.log(
      `ProtectedRoute: Checking role access - User role: "${
        userData.role
      }", Required roles: [${allowedRoles.join(
        ", "
      )}], Has access: ${hasRequiredRole}`
    );

    if (!hasRequiredRole) {
      // debugger;
      console.log(
        `ProtectedRoute: Access denied - User role "${
          userData.role
        }" not in allowed roles: [${allowedRoles.join(", ")}]`
      );

      // Hiển thị thông báo lỗi
      toast.error(
        `Bạn không có quyền truy cập trang này. Vai trò hiện tại: ${userData.role}`,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );

      // Redirect về trang phù hợp với role của user
      if (userData.role === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (
        userData.role === "booking_manager" ||
        userData.role === "ticket_manager" ||
        userData.role === "cinema_manager"
      ) {
        return <Navigate to="/manage/ticket_order" replace />;
      } else if (
        userData.role === "showtime_manager" ||
        userData.role === "cinema_manager"
      ) {
        // debugger;
        return <Navigate to="/manage/showtime" replace />;
      } else if (userData.role === "finance_manager") {
        return <Navigate to="/finance/revenue" replace />;
      } else if (userData.role === "content_manager") {
        return <Navigate to="/content/articles" replace />;
      } else if (userData.role === "district_manager") {
        return <Navigate to="/district_manager/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  console.log("ProtectedRoute: Access granted to route");
  return children;
};

export default ProtectedRoute;
