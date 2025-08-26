import React from "react";
import { Outlet } from "react-router-dom";
import SidebarDistrictManager from "../components/layout/Sidebar_district_manager"; // Đường dẫn đúng
import HeaderAdmin from "../components/layout/headerAdmin"; // Import HeaderAdmin

const DistrictManagerDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-r from-slate-100">
      {/* Sidebar cố định */}
      <SidebarDistrictManager />
      <div className="flex flex-col flex-1 ml-64">
        {" "}
        <HeaderAdmin />
        <main className="flex-1 overflow-auto mt-20">
          {" "}
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DistrictManagerDashboard;
