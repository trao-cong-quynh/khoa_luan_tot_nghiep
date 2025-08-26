import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaFilm,
  FaUsers,
  FaBuilding,
  FaTrash,
  FaClock,
  FaTags,
} from "react-icons/fa";
import { VscGraph } from "react-icons/vsc";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "./headerAdmin";
// import { useAuth } from "../../contexts/AuthContext";
// import { imagePhim } from "../../Utilities/common";

// const DistrictManagerDashboard = () => {
//   return (
//     <div className="flex min-h-screen bg-gradient-to-r from-slate-100">
//       {/* Sidebar cố định */}
//       <SidebarDistrictManager />
//       <div className="flex flex-col flex-1 ml-64">
//         <HeaderAdmin />
//         <main className="flex-1 overflow-auto mt-20">
//           <div className="container mx-auto">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// Component SidebarDistrictManager
const SidebarDistrictManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Sử dụng một state duy nhất để lưu tên dropdown đang mở.
  const [openDropdown, setOpenDropdown] = useState("");

  // Hàm xử lý việc mở/đóng dropdown
  const handleToggleDropdown = (dropdownName) => {
    // Nếu dropdown được click đã mở, đóng nó lại (set state thành null).
    // Nếu chưa mở, mở nó ra (set state thành tên dropdown đó).
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Định nghĩa nhóm đường dẫn để xác định active của mục cha
  const pathGroups = {
    user: ["/district_manager/user"],
    phim: ["/district_manager/movies"],
    theater: ["/district_manager/theater", "/district_manager/delete_cinema"],
    schedule: [
      "/district_manager/schedule",
      "/district_manager/schedule/deleted",
    ],
    showtime: ["/district_manager/showtime"],
    genre: ["/district_manager/genre"],
    concession: ["/district_manager/concession"],
    ticket: ["/district_manager/ticket_order"],
    promotion: ["/district_manager/promotion"],
    articles: ["/district_manager/articles"],
  };

  // Hàm kiểm tra active cho mục cha (nhóm)
  const isActiveGroup = (group) =>
    pathGroups[group].some((path) => currentPath.startsWith(path));

  // Hàm kiểm tra active cho từng mục con
  const isActiveItem = (path) => currentPath === path;

  return (
    <div className="w-64 bg-[#112D4E] text-white h-screen flex flex-col shadow-lg fixed left-0 top-0 p-0 m-0 z-[10000]">
      <div
        className="text-3xl font-bold text-[#DBE2EF] mb-8 cursor-pointer p-4"
        onClick={() => navigate("/district_manager/dashboard")}
      >
        Quản lý quận
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll m-0 p-0">
        <nav>
          <ul className="space-y-4">
            <ul className="space-y-2">
              {" "}
              {/* Dashboard Dropdown */}
              {/*<li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("dashboard") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("dashboard")}
                >
                  <span>Dashboard</span>
                  <span>{openDropdown === "dashboard" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "dashboard" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/dashboard")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/dashboard")}
                    >
                      <VscGraph className="text-sm" />
                      <span>Tổng quan</span>
                    </li>
                  </ul>
                )}
              </li>*/}
              {/* Quản lý nhân viên */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("user") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("user")}
                >
                  <span>Quản lý nhân viên</span>
                  <span>{openDropdown === "user" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "user" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/user")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/user")}
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách nhân viên</span>
                    </li>
                    {/* <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/delete_user")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/delete_user")}
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách nhân viên</span>
                    </li> */}
                  </ul>
                )}
              </li>
              {/* Quản lý phim */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("phim") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("phim")}
                >
                  <span>Quản lý Phim</span>
                  <span>{openDropdown === "phim" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "phim" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/movies")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/movies")}
                    >
                      <FaFilm className="text-sm" />
                      <span>Danh sách phim</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý rạp phim */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("theater") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("theater")}
                >
                  <span>Quản lý rạp phim</span>
                  <span>{openDropdown === "theater" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "theater" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/theater")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/theater")}
                    >
                      <FaBuilding className="text-sm" />
                      <span>Danh sách rạp chiếu</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/delete_cinema")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() =>
                        navigate("/district_manager/delete_cinema")
                      }
                    >
                      <FaTrash className="text-sm" />
                      <span>Danh sách rạp chiếu đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý lịch chiếu */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("schedule") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("schedule")}
                >
                  <span>Quản lý lịch chiếu</span>
                  <span>{openDropdown === "schedule" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "schedule" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/schedule")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/schedule")}
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách lịch chiếu</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/schedule/deleted")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() =>
                        navigate("/district_manager/schedule/deleted")
                      }
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách lịch chiếu đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý suất chiếu */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("showtime") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("showtime")}
                >
                  <span>Quản lý suất chiếu</span>
                  <span>{openDropdown === "showtime" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "showtime" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/showtime")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/showtime")}
                    >
                      <FaClock className="text-sm" />
                      <span>Danh sách suất chiếu</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý thể loại */}
              {/* <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("genre") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("genre")}
                >
                  <span>Quản lý Thể loại</span>
                  <span>{openDropdown === "genre" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "genre" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/genre")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/genre")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách thể loại</span>
                    </li>
                  </ul>
                )}
              </li> */}
              {/* Quản lý thức ăn */}
              {/* <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("concession") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("concession")}
                >
                  <span>Quản lý thức ăn</span>
                  <span>{openDropdown === "concession" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "concession" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/concession")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/concession")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách thức ăn</span>
                    </li>
                  </ul>
                )}
              </li> */}
              {/* Quản lý đơn hàng */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("ticket") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("ticket")}
                >
                  <span>Quản lý đơn hàng</span>
                  <span>{openDropdown === "ticket" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "ticket" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/ticket_order")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/ticket_order")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách đơn hàng</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý khuyến mãi */}
              {/* <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("promotion") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("promotion")}
                >
                  <span>Quản lý khuyến mãi</span>
                  <span>{openDropdown === "promotion" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "promotion" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/promotion")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/promotion")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách khuyến mãi</span>
                    </li>
                  </ul>
                )}
              </li> */}
              {/* Quản lý bài viết */}
              {/* <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("articles") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("articles")}
                >
                  <span>Quản lý bài viết</span>
                  <span>{openDropdown === "articles" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "articles" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/district_manager/articles")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/district_manager/articles")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách bài viết</span>
                    </li>
                  </ul>
                )}
              </li> */}
            </ul>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SidebarDistrictManager;
