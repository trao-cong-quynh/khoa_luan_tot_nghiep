import React, { useState } from "react";

function PromotionCodeInput({
  onApply,
  isLoading,
  appliedPromotion,
  allPromotions = [],
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPromotionList, setShowPromotionList] = useState(false); // Hàm tiện ích để phân tích chuỗi ngày tháng không chuẩn (DD-MM-YYYY)

  const parseDate = (dateString) => {
    // Ví dụ: "04-08-2025 00:00" -> ["04", "08", "2025", "00", "00"]
    const parts = dateString.split(/[\s-:]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Tháng trong JavaScript là từ 0-11
    const year = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);
    return new Date(year, month, day, hour, minute);
  };

  // Hàm này đã bị thiếu trong code bạn gửi, tôi đã thêm lại
  const formatDate = (dateString) => {
    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Trả về chuỗi gốc nếu không thể phân tích
    }
    return date.toLocaleDateString("vi-VN");
  };

  const handleApply = () => {
    if (!code.trim()) {
      setError("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    setError("");
    onApply && onApply(code.trim());
  };

  const handleSelectPromotion = (promotion) => {
    setCode(promotion.code);
    setError("");
    onApply && onApply(promotion.code);
    setShowPromotionList(false);
  };

  const formatDiscountValue = (promotion) => {
    if (promotion.type === "PERCENT_DISCOUNT") {
      return `Giảm ${promotion.discount_value}% (tối đa ${Number(
        promotion.max_discount_amount
      ).toLocaleString()} VND)`;
    } else if (promotion.type === "FIXED_DISCOUNT") {
      return `Giảm ${Number(promotion.discount_value).toLocaleString()} VND`;
    }
    return "Giảm giá";
  };

  const isPromotionExpired = (promotion) => {
    const now = new Date();
    const endDate = parseDate(promotion.end_date);
    return now > endDate;
  };

  const isPromotionNotStarted = (promotion) => {
    const now = new Date();
    const startDate = parseDate(promotion.start_date);
    return now < startDate;
  };

  const getPromotionStatus = (promotion) => {
    if (isPromotionExpired(promotion)) {
      return { text: "Đã hết hạn", color: "text-red-500" };
    }
    if (isPromotionNotStarted(promotion)) {
      return { text: "Chưa bắt đầu", color: "text-yellow-500" };
    }
    return { text: "Đang hoạt động", color: "text-green-500" };
  };

  const availablePromotions = allPromotions.filter(
    (promotion) =>
      !isPromotionExpired(promotion) && !isPromotionNotStarted(promotion)
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="font-semibold mb-1">Mã khuyến mãi</label>{" "}
      <button
        type="button"
        onClick={() => setShowPromotionList(!showPromotionList)}
        className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        style={{
          borderColor: "var(--color-border)",
        }}
      >
        {" "}
        <div className="flex justify-between items-center">
          {" "}
          <span className="text-sm text-gray-600">
            {" "}
            {availablePromotions.length > 0
              ? `${availablePromotions.length} khuyến mãi có thể sử dụng`
              : "Không có khuyến mãi khả dụng"}{" "}
          </span>{" "}
          <svg
            className={`w-4 h-4 transition-transform ${
              showPromotionList ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />{" "}
          </svg>{" "}
        </div>{" "}
      </button>{" "}
      {showPromotionList && (
        <div className="border rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
          {" "}
          {availablePromotions.length > 0 ? (
            availablePromotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              const isSelected =
                appliedPromotion?.promotion_id === promotion.promotion_id;

              return (
                <div
                  key={promotion.promotion_id}
                  className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => handleSelectPromotion(promotion)}
                >
                  {" "}
                  <div className="flex justify-between items-start mb-2">
                    {" "}
                    <h4 className="font-semibold text-sm">
                      {promotion.name}
                    </h4>{" "}
                    <span className={`text-xs ${status.color}`}>
                      {status.text}{" "}
                    </span>{" "}
                  </div>{" "}
                  <p className="text-xs text-gray-600 mb-2">
                    {promotion.description}{" "}
                  </p>{" "}
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    {formatDiscountValue(promotion)}{" "}
                  </div>{" "}
                  <div className="text-xs text-gray-500">
                    Áp dụng cho đơn hàng từ
                    {Number(
                      promotion.min_order_amount
                    ).toLocaleString()} VND{" "}
                  </div>{" "}
                  <div className="text-xs text-gray-500">
                    Hạn sử dụng: {formatDate(promotion.start_date)} -{" "}
                    {formatDate(promotion.end_date)}{" "}
                  </div>{" "}
                  {isSelected && (
                    <div className="mt-2 text-xs text-green-600 font-medium">
                      ✓ Đã chọn{" "}
                    </div>
                  )}{" "}
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 text-sm py-4">
              Không có khuyến mãi khả dụng{" "}
            </div>
          )}{" "}
        </div>
      )}{" "}
      <div className="flex gap-2">
        {" "}
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--color-border)",
            boxShadow: "none",
          }}
          placeholder="Hoặc nhập mã khuyến mãi thủ công"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />{" "}
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="text-xs sm:text-sm md:text-base font-bold py-2 px-4 md:px-8 rounded transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "black",
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
              e.target.style.color = "black";
            }
          }}
        >
          {isLoading ? "Đang xử lý..." : "Áp Dụng"}{" "}
        </button>{" "}
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}{" "}
      {appliedPromotion && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          {" "}
          <div className="flex justify-between items-center">
            {" "}
            <div>
              {" "}
              <div className="font-medium text-green-800">
                {appliedPromotion.name}{" "}
              </div>{" "}
              <div className="text-sm text-green-600">
                {appliedPromotion.code}{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={() => {
                setCode("");
                onApply && onApply("");
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Hủy{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
      <div className="text-xs text-gray-500 mt-1">
        Lưu ý: Chỉ có thể áp dụng 1 khuyến mãi cho mỗi lần thanh toán{" "}
      </div>{" "}
    </div>
  );
}

export default PromotionCodeInput;
