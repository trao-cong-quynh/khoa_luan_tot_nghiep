import React, { createContext, useState, useContext, useEffect } from "react";
import authAPI from "../api/auth";

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    stars: 0,
    role: "user",
    user_id: null,
    avatar_url: "", 
    cinema_id: null, 
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const updateUserData = (newUserData) => {
    const existingUser = JSON.parse(localStorage.getItem("user")) || {};
    const finalUserData = { ...userData, ...newUserData };
    setUserData(finalUserData);

    const updatedUserData = { ...existingUser, ...newUserData };
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };
  useEffect(() => {
 
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("user");


    if (token && userInfo) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userInfo);
        // Xử lý role từ cả trường hợp role đơn lẻ và mảng roles
        let userRole = "user";
        if (user.role) {
          userRole = user.role;
        } else if (user.roles && user.roles.length > 0) {
          userRole = user.roles[0];
        }

        console.log("Current user role:", userRole);
        console.log("Full user data from localStorage:", user);
        const updatedUserData = {
          name: user.full_name || "User",
          stars: 0,
          role: userRole,
          user_id: user.user_id, 
          avatar_url: user.avatar_url || "",
          cinema_id: user.cinema_id || null,
        };
        setUserData(updatedUserData);
      } catch (error) {
        console.error("Error parsing user info:", error);
        logout();
      } finally {
        setIsLoading(false);
        console.log(
          "AuthContext (checkLoginStatus): Completed, isLoading=",
          isLoading,
          ", isLoggedIn=",
          isLoggedIn
        );
      }
    } else {
      setIsLoggedIn(false);
      setUserData({
        name: "",
        stars: 0,
        role: "user",
        user_id: null,
        avatar_url: "",
      });
      console.log("No user logged in, default role: user");
      setIsLoading(false);
      console.log(
        "AuthContext (checkLoginStatus): Completed (no token/user), isLoading=",
        isLoading,
        ", isLoggedIn=",
        isLoggedIn
      );
    }
  };

  const login = (userInfo) => {
    setIsLoggedIn(true);

    // Xử lý role từ cả trường hợp role đơn lẻ và mảng roles
    let userRole = "user";
    if (userInfo.role) {
      userRole = userInfo.role;
    } else if (userInfo.roles && userInfo.roles.length > 0) {
      userRole = userInfo.roles[0];
    }

    console.log("User logged in with role:", userRole);
    console.log("Full login user data:", userInfo);

    // Lưu token và thông tin user vào localStorage
    if (userInfo.token) {
      localStorage.setItem("token", userInfo.token);
    }
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUserData({
      ...userInfo,
      role: userRole,
      name: userInfo.full_name || "User",
    });
    const updatedUserData = {
      name: userInfo.full_name || "User",
      stars: 0,
      role: userRole,
      user_id: userInfo.user_id,
      avatar_url: userInfo.avatar_url || "",
      cinema_id: userInfo.cinema_id || null, 
    };
    setUserData(updatedUserData);

    // Log state sau khi cập nhật
    console.log("Updated userData state:", {
      name: userInfo.full_name || "User",
      stars: 0,
      role: userRole,
    });
  };

  const logout = () => {
    authAPI.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData({
      name: "",
      stars: 0,
      role: "user",
      user_id: null,
      avatar_url: "",
      cinema_id: null,
    });
    console.log("User logged out, role reset to: user");
  };

  const isAdmin = () => {
    const adminStatus = userData.role === "admin";
    return adminStatus;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userData,
        login,
        logout,
        checkLoginStatus,
        isAdmin,
        isLoading,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
