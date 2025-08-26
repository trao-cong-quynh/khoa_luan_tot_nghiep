import React from "react";
import momoLogo from "../../../assets/img_payment/momo.png"; // You might need to add this image to your assets

const PaymentMethodSelection = ({ selectedMethod, onMethodSelect }) => {
  return (
    <div className="space-y-4">
      <div
        className={`border p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50 hover:text-black transition-colors ${
          selectedMethod === "momo"
            ? "border-[var(--color-showtime-bg)] bg-[var(--color-showtime-bg)] text-[var(--color-text-white)]"
            : ""
        }`}
        onClick={() => onMethodSelect("momo")}
      >
        <img src={momoLogo} alt="Momo Logo" className="w-10 h-10" />
        <div className="flex-1">
          <p className="font-semibold">Thanh toán qua MoMo</p>
          <p className="text-sm">Thanh toán nhanh chóng và an toàn</p>
        </div>
        {selectedMethod === "momo" && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-button)" }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      <div
        className={`border p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50 hover:text-black transition-colors ${
          selectedMethod === "counter_payment"
            ? "border-[var(--color-showtime-bg)] bg-[var(--color-showtime-bg)] text-[var(--color-text-white)]"
            : ""
        }`}
        onClick={() => onMethodSelect("counter_payment")}
      >
        <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-600 font-bold">$</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Thanh toán tại rạp</p>
          <p className="text-sm">Thanh toán khi đến rạp</p>
        </div>
        {selectedMethod === "counter_payment" && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-button)" }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Onepay payment method */}
      <div
        className={`border p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50 hover:text-black transition-colors ${
          selectedMethod === "onepay"
            ? "border-[var(--color-showtime-bg)] bg-[var(--color-showtime-bg)] text-[var(--color-text-white)]"
            : ""
        }`}
        onClick={() => onMethodSelect("onepay")}
      >
        <div className="w-10 h-10 bg-[var(--color-hover-showtime)] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">O</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Thanh toán qua Onepay</p>
          <p className="text-sm">Thanh toán bằng thẻ ATM, Visa, MasterCard</p>
        </div>
        {selectedMethod === "onepay" && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-button)" }}
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
