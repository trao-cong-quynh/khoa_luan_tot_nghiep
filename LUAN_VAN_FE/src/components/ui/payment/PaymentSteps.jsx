import React from "react";

const PaymentSteps = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 lg:grid-cols-6 text-center font-bold mb-2">
        <div
          style={{
            color:
              currentStep === 1
                ? "var(--color-hover)"
                : "var(--color-showtime-bg)",
          }}
        >
          <span className="text-3xl">1</span>
          <br />
          THÔNG TIN KHÁCH HÀNG
        </div>
        <div
          style={{
            color:
              currentStep === 2
                ? "var(--color-showtime-bg)"
                : "var(--color-showtime-bg)",
          }}
        >
          <span className="text-3xl">2</span>
          <br />
          THANH TOÁN
        </div>
        <div
          style={{
            color: currentStep === 3 ? "var(--color-hover)" : "#bdbdbd",
          }}
        >
          <span className="text-3xl">3</span>
          <br />
          THÔNG TIN VÉ
        </div>
      </div>
      {/* Progress Bar */}
      <div className="relative lg:w-[calc(50%-4rem)] ml-4 h-1 bg-gray-300 rounded-full">
        <div
          className="absolute top-0 left-0 h-1 rounded-full"
          style={{
            backgroundColor: "var(--color-showtime-bg)",
            width: `${(currentStep - 1) * 50}%`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default PaymentSteps;
