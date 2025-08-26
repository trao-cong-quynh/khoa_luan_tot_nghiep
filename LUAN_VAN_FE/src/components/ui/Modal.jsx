import React from "react";

export default function Modal({
  open,
  onClose,
  children,
  widthClass = "max-w-xl",
  bgColorClass = "bg-white",
  marginTop = "mt-0",
}) {
  // Thêm prop widthClass với giá trị mặc định
  if (!open) return null;

  return (
    <div
      className={`${marginTop} fixed inset-0 z-50 flex items-center justify-center bg-white/30 bg-opacity-0`}
    >
      <div
        // Áp dụng widthClass vào div chứa nội dung Modal
        className={`${bgColorClass} rounded border border-gray-200 shadow-none p-6 relative ${
          widthClass ? widthClass : "min-w-[500px]"
        }`}
        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra bên ngoài Modal
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-3xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
