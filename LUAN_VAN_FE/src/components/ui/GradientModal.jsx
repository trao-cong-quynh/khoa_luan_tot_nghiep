import React from "react";

export default function GradientModal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.2)" }}
    >
      <div
        className="relative w-[400px] max-w-[90vw] rounded-xl p-8 flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #6a3093 0%, #3366cc 100%)",
        }}
      >
        <button
          className="absolute top-4 right-6 text-white text-3xl font-bold hover:text-gray-200 cursor-pointer"
          onClick={onClose}
          style={{ zIndex: 20 }}
        >
          &times;
        </button>
        <div
          className="w-full flex flex-col items-center justify-center"
          style={{ zIndex: 10 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
