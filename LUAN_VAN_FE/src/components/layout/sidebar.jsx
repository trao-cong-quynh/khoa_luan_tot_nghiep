import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaFilm,
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaUserCircle,
  FaPlusCircle,
  FaTrash,
  FaClock,
  FaTags,
  FaTicketAlt,
  FaCalendarAlt,
  FaCog,
  FaMoneyBillWave,
  FaNewspaper,
  FaGift,
} from "react-icons/fa";
import { VscPieChart, VscGraph } from "react-icons/vsc";

const Sidebar = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (dropdownName) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdownName]: !prev[dropdownName],
    }));
  };

  // Cấu hình menu cho từng role
  const roleConfig = {
    booking_manager: {
      title: "BOOKING MANAGER",
      menus: [
        {
          name: "booking",
          label: "Quản lý đặt vé",
          icon: FaTicketAlt,
          items: [
            {
              label: "Danh sách đơn hàng",
              path: "/manage/ticket_order",
              icon: FaTicketAlt,
            },
          ],
        },
      ],
    },
    showtime_manager: {
      title: "SHOWTIME MANAGER",
      menus: [
        {
          name: "schedule",
          label: "Quản lý lịch chiếu",
          icon: FaCalendarAlt,
          items: [
            {
              label: "Danh sách suất chiếu",
              path: "/manage/showtime",
              icon: FaClock,
            },
          ],
        },
      ],
    },
    cinema_manager: {
      title: "CINEMA MANAGER",
      menus: [
        {
          name: "user",
          label: "Quản lý nhân viên rạp",
          icon: FaBuilding,
          items: [
            {
              label: "Danh sách nhân viên",
              path: "/manage/user",
              icon: FaBuilding,
            },
          ],
        },
        {
          name: "theater",
          label: "Quản lý phòng chiếu phim",
          icon: FaBuilding,
          items: [
            {
              label: "Danh sách phòng chiếu",
              path: "/manage/theater_rooms",
              icon: FaBuilding,
            },
          ],
        },
        {
          name: "schedule",
          label: "Quản lý lịch chiếu",
          icon: FaClock,
          items: [
            {
              label: "Lịch chiếu phim",
              path: "/manage/schedule",
              icon: FaCalendarAlt,
            },
            {
              label: "Lịch chiếu phim đã xóa",
              path: "/manage/schedule_delete",
              icon: FaCalendarAlt,
            },
          ],
        },
        {
          name: "showtime",
          label: "Quản lý suất chiếu",
          icon: FaClock,
          items: [
            {
              label: "Danh sách suất chiếu",
              path: "/manage/showtime",
              icon: FaClock,
            },
          ],
        },
        {
          name: "booking",
          label: "Quản lý đặt vé",
          icon: FaTicketAlt,
          items: [
            {
              label: "Danh sách đơn hàng",
              path: "/manage/ticket_order",
              icon: FaTicketAlt,
            },
          ],
        },
      ],
    },
    admin: {
      title: "ADMIN PANEL",
      menus: [
        {
          name: "dashboard",
          label: "Dashboard",
          icon: VscGraph,
          items: [
            { label: "Tổng quan", path: "/admin/dashboard", icon: VscGraph },
            {
              label: "Doanh thu theo phim",
              path: "/admin/dashboard_movie",
              icon: VscGraph,
            },
            {
              label: "Doanh thu theo rạp",
              path: "/admin/dashboard_theater",
              icon: VscGraph,
            },
          ],
        },
        {
          name: "movie",
          label: "Quản lý Phim",
          icon: FaFilm,
          items: [
            { label: "Danh sách phim", path: "/admin/movies", icon: FaFilm },
            {
              label: "Phim đã xóa",
              path: "/admin/movies/deleted",
              icon: FaTrash,
            },
          ],
        },
        {
          name: "user",
          label: "Quản lý người dùng",
          icon: FaUsers,
          items: [
            {
              label: "Danh sách người dùng",
              path: "/admin/user",
              icon: FaUsers,
            },
          ],
        },
        {
          name: "theater",
          label: "Quản lý rạp phim",
          icon: FaBuilding,
          items: [
            {
              label: "Danh sách rạp chiếu",
              path: "/admin/theater",
              icon: FaBuilding,
            },
            {
              label: "Danh sách rạp chiếu đã xóa",
              path: "/admin/delete_cinema",
              icon: FaTrash,
            },
          ],
        },
        {
          name: "schedule",
          label: "Quản lý lịch chiếu",
          icon: FaCalendarAlt,
          items: [
            {
              label: "Danh sách lịch chiếu",
              path: "/admin/schedule",
              icon: FaCalendarAlt,
            },
          ],
        },
        {
          name: "showtime",
          label: "Quản lý suất chiếu",
          icon: FaClock,
          items: [
            {
              label: "Danh sách suất chiếu",
              path: "/admin/showtime",
              icon: FaClock,
            },
          ],
        },
        {
          name: "genre",
          label: "Quản lý Thể loại",
          icon: FaTags,
          items: [
            { label: "Danh sách thể loại", path: "/admin/genre", icon: FaTags },
            {
              label: "Danh sách thể loại đã xóa",
              path: "/admin/genre_delete",
              icon: FaTrash,
            },
          ],
        },
        {
          name: "concession",
          label: "Quản lý thức ăn",
          icon: FaTags,
          items: [
            {
              label: "Danh sách thức ăn",
              path: "/admin/concession",
              icon: FaTags,
            },
            {
              label: "Danh sách thức ăn đã xóa",
              path: "/admin/delete_concession",
              icon: FaTrash,
            },
          ],
        },
        {
          name: "ticket_type",
          label: "Quản lý loại vé",
          icon: FaTicketAlt,
          items: [
            {
              label: "Danh sách loại vé",
              path: "/admin/ticket_type",
              icon: FaTicketAlt,
            },
            {
              label: "Danh sách loại vé đã xóa",
              path: "/admin/ticket_type-delete",
              icon: FaTrash,
            },
          ],
        },
        {
          name: "ticket_order",
          label: "Quản lý đơn hàng",
          icon: FaTicketAlt,
          items: [
            {
              label: "Danh sách đơn hàng",
              path: "/admin/ticket_order",
              icon: FaTicketAlt,
            },
          ],
        },
        {
          name: "promotion",
          label: "Quản lý khuyến mãi",
          icon: FaGift,
          items: [
            {
              label: "Danh sách khuyến mãi",
              path: "/admin/promotion",
              icon: FaGift,
            },
          ],
        },
        {
          name: "articles",
          label: "Quản lý bài viết",
          icon: FaNewspaper,
          items: [
            {
              label: "Danh sách bài viết",
              path: "/admin/articles",
              icon: FaNewspaper,
            },
          ],
        },
      ],
    },
    // Thêm các role mới ở đây
    // finance_manager: {
    //   title: "FINANCE MANAGER",
    //   menus: [
    //     {
    //       name: "finance",
    //       label: "Quản lý tài chính",
    //       icon: FaMoneyBillWave,
    //       items: [
    //         {
    //           label: "Báo cáo doanh thu",
    //           path: "/admin/finance/revenue",
    //           icon: VscGraph,
    //         },
    //         {
    //           label: "Quản lý thanh toán",
    //           path: "/admin/finance/payment",
    //           icon: FaMoneyBillWave,
    //         },
    //         {
    //           label: "Báo cáo chi phí",
    //           path: "/admin/finance/expenses",
    //           icon: VscGraph,
    //         },
    //       ],
    //     },
    //   ],
    // },
    // content_manager: {
    //   title: "CONTENT MANAGER",
    //   menus: [
    //     {
    //       name: "content",
    //       label: "Quản lý nội dung",
    //       icon: FaNewspaper,
    //       items: [
    //         {
    //           label: "Quản lý bài viết",
    //           path: "/admin/articles",
    //           icon: FaNewspaper,
    //         },
    //         { label: "Quản lý banner", path: "/admin/banner", icon: FaFilm },
    //         {
    //           label: "Quản lý tin tức",
    //           path: "/admin/news",
    //           icon: FaNewspaper,
    //         },
    //       ],
    //     },
    //   ],
    // },
  };

  // Lấy cấu hình cho role hiện tại
  const currentRoleConfig = roleConfig[userData.role] || roleConfig.admin;

  // Hàm render menu item
  const renderMenuItem = (item) => {
    const IconComponent = item.icon;
    return (
      <li
        key={item.path}
        className="p-2 rounded hover:bg-[#3F72AF] cursor-pointer flex items-center space-x-2"
        onClick={() => navigate(item.path)}
      >
        <IconComponent className="text-sm" />
        <span>{item.label}</span>
      </li>
    );
  };

  // Hàm render menu group
  const renderMenuGroup = (menu) => {
    const IconComponent = menu.icon;
    const isOpen = openDropdowns[menu.name] || false;

    return (
      <li key={menu.name}>
        <div
          className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-[#3F72AF]"
          onClick={() => toggleDropdown(menu.name)}
        >
          <span>{menu.label}</span>
          <span>{isOpen ? "▲" : "▼"}</span>
        </div>
        {isOpen && (
          <ul className="ml-4 mt-2 space-y-2">
            {menu.items.map(renderMenuItem)}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="w-64 bg-[#112D4E] text-white h-screen flex flex-col shadow-lg fixed left-0 top-0 p-0 m-0 z-[10000]">
      <div
        className="text-3xl font-bold text-[#DBE2EF] mb-8 cursor-pointer p-4"
        onClick={() => navigate("/admin/dashboard")}
      >
        {currentRoleConfig.title}
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll m-0 p-0">
        <nav>
          <ul className="space-y-4">
            {currentRoleConfig.menus.map(renderMenuGroup)}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
