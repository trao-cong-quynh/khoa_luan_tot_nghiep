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

const SidebarAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Sử dụng một state duy nhất để lưu tên dropdown đang mở.
  // Khởi tạo mặc định là 'dashboard' để mục này luôn mở khi load trang.
  const [openDropdown, setOpenDropdown] = useState("dashboard");

  // Hàm xử lý việc mở/đóng dropdown
  const handleToggleDropdown = (dropdownName) => {
    // Nếu dropdown được click đã mở, đóng nó lại (set state thành null).
    // Nếu chưa mở, mở nó ra (set state thành tên dropdown đó).
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Định nghĩa nhóm đường dẫn để xác định active của mục cha
  const pathGroups = {
    dashboard: [
      "/admin/dashboard",
      "/admin/dashboard_movie",
      "/admin/dashboard_theater",
    ],
    phim: ["/admin/movies", "/admin/movies/deleted"],
    user: ["/admin/user"],
    theater: ["/admin/theater", "/admin/delete_cinema"],
    district: ["/admin/district", "/admin/delete_district"],
    schedule: ["/admin/schedule", "/admin/schedule_delete"],
    showtime: ["/admin/showtime"],
    genre: ["/admin/genre", "/admin/genre_delete"],
    concession: ["/admin/concession", "/admin/delete_concession"],
    ticketType: ["/admin/ticket_type", "/admin/ticket_type-delete"],
    ticket: ["/admin/ticket_order"],
    promotion: ["/admin/promotion"],
    articles: ["/admin/articles"],
  };

  // Hàm kiểm tra active cho mục cha (nhóm)
  const isActiveGroup = (group) =>
    pathGroups[group].some((path) => currentPath.startsWith(path));

  // Hàm kiểm tra active cho từng mục con
  const isActiveItem = (path) => currentPath === path;

  return (
    <div className="w-[17%] bg-[#112D4E] text-white h-screen flex flex-col shadow-lg fixed left-0 top-0 p-0 m-0 z-[10000]">
      <div
        className="text-3xl font-bold text-[#DBE2EF] mb-8 cursor-pointer p-4"
        onClick={() => navigate("/admin/dashboard")}
      >
        ADMIN PANEL
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll m-0 p-0">
        <nav>
          <ul className="space-y-4">
            <ul className="space-y-2">
              {" "}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("dashboard") ? "bg-[#3F72AF]" : ""
                  }`}
                  // Thay đổi onClick để gọi hàm xử lý chung
                  onClick={() => handleToggleDropdown("dashboard")}
                >
                  <span>Dashboard</span>
                  <span>{openDropdown === "dashboard" ? "▲" : "▼"}</span>
                </div>
                {/* Thay đổi điều kiện render bằng state mới */}
                {openDropdown === "dashboard" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/dashboard") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/dashboard")}
                    >
                      <VscGraph className="text-sm" />
                      <span>Tổng quan</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/dashboard_movie")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/dashboard_movie")}
                    >
                      <VscGraph className="text-sm" />
                      <span>Doanh thu theo phim</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/dashboard_theater")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/dashboard_theater")}
                    >
                      <VscGraph className="text-sm" />
                      <span>Doanh thu theo rạp</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* 1. Phim Dropdown */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("phim") ? " bg-[#3F72AF]" : ""
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
                        isActiveItem("/admin/movies") ? "bg-[#3F72AF] " : ""
                      }`}
                      onClick={() => navigate("/admin/movies")}
                    >
                      <FaFilm className="text-sm" />
                      <span>Danh sách phim</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/movies/deleted")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/movies/deleted")}
                    >
                      <FaTrash className="text-sm" />
                      <span>Phim đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý người dùng */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("user") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("user")}
                >
                  <span>Quản lý người dùng</span>
                  <span>{openDropdown === "user" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "user" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/user") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/user")}
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách người dùng</span>
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
                        isActiveItem("/admin/theater") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/theater")}
                    >
                      <FaBuilding className="text-sm" />
                      <span>Danh sách rạp chiếu</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/delete_cinema")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/delete_cinema")}
                    >
                      <FaTrash className="text-sm" />
                      <span>Danh sách rạp chiếu đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý quận huyện */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("district") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("district")}
                >
                  <span>Quản lý quận huyện</span>
                  <span>{openDropdown === "district" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "district" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/district") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/district")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách quận huyện</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/district_delete")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/district_delete")}
                    >
                      <FaTrash className="text-sm" />
                      <span>Danh sách quận huyện đã xóa</span>
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
                        isActiveItem("/admin/schedule") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/schedule")}
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách lịch chiếu</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/schedule_delete")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/schedule_delete")}
                    >
                      <FaUsers className="text-sm" />
                      <span>Danh sách lịch chiếu đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý suất chiếu*/}
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
                        isActiveItem("/admin/showtime") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/showtime")}
                    >
                      <FaClock className="text-sm" />
                      <span>Danh sách suất chiếu</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý thể loại */}
              <li>
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
                        isActiveItem("/admin/genre") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/genre")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách thể loại</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/genre_delete")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/genre_delete")}
                    >
                      <FaTrash className="text-sm" />
                      <span>Danh sách thể loại đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý thức ăn */}
              <li>
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
                        isActiveItem("/admin/concession") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/concession")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách thức ăn</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/delete_concession")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/delete_concession")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách thức ăn đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý loại vé */}
              <li>
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF] ${
                    isActiveGroup("ticketType") ? "bg-[#3F72AF]" : ""
                  }`}
                  onClick={() => handleToggleDropdown("ticketType")}
                >
                  <span>Quản lý loại vé</span>
                  <span>{openDropdown === "ticketType" ? "▲" : "▼"}</span>
                </div>
                {openDropdown === "ticketType" && (
                  <ul className="ml-4 mt-2 space-y-2">
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/ticket_type") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/ticket_type")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách loại vé</span>
                    </li>
                    <li
                      className={`p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2 ${
                        isActiveItem("/admin/ticket_type-delete")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/ticket_type-delete")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách loại vé đã xóa</span>
                    </li>
                  </ul>
                )}
              </li>
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
                        isActiveItem("/admin/ticket_order")
                          ? "bg-[#3F72AF]"
                          : ""
                      }`}
                      onClick={() => navigate("/admin/ticket_order")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách đơn hàng</span>
                    </li>
                  </ul>
                )}
              </li>
              {/* Quản lý khuyến mãi */}
              <li>
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
                        isActiveItem("/admin/promotion") ? "bg-[#3F72AF]" : ""
                      }`}
                      onClick={() => navigate("/admin/promotion")}
                    >
                      <FaTags className="text-sm" />
                      <span>Danh sách khuyến mãi</span>
                    </li>
                  </ul>
                )}
              </li>
            </ul>{" "}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SidebarAdmin;
