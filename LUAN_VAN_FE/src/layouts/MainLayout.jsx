import React, { useRef } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";

function MainLayout() {
  const footerRef = useRef(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow px-4 sm:px-6 lg:px-8 pt-16 sm:pt-16 md:pt-24 ">
        <Outlet context={{ footerRef }} />
      </main>
      <Footer ref={footerRef} />
    </div>
  );
}

export default MainLayout;
