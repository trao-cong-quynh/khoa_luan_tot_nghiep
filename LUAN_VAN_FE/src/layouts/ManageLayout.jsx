import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/sidebar.jsx"; // Đường dẫn đúng
import HeaderAdmin from "../components/layout/headerAdmin"; // Import HeaderAdmin

const ManageLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-slate-100">
      {/* Sidebar cố định */}
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        {" "}
        <HeaderAdmin />
        <main className="flex-1 overflow-auto mt-20 ml-2">
          {" "}
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageLayout;
