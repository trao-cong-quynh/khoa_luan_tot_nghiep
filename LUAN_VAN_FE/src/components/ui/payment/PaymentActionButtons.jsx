import React from "react";

const PaymentActionButtons = ({ onBack, onPay, isLoading = false }) => {
  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="font-bold py-3 px-8 rounded transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = "var(--color-hover)";
            e.target.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = "var(--color-primary)";
            e.target.style.color = "white";
          }
        }}
      >
        QUAY LẠI
      </button>
      <button
        onClick={onPay}
        disabled={isLoading}
        className="font-bold py-3 px-8 rounded transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = "var(--color-hover)";
            e.target.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = "var(--color-primary)";
            e.target.style.color = "white";
          }
        }}
      >
        {isLoading ? "ĐANG XỬ LÝ..." : "THANH TOÁN"}
      </button>
    </div>
  );
};

export default PaymentActionButtons;
