import React from "react";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "../components/layout/SidebarAdmin"; // Đường dẫn đúng
import HeaderAdmin from "../components/layout/headerAdmin"; // Import HeaderAdmin

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar cố định */}
      <SidebarAdmin />
      <div className="flex flex-col flex-1 md:ml-64">
        {" "}
        <HeaderAdmin />
        <main className="flex-1 overflow-auto mt-20 w-full">
          {" "}
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
