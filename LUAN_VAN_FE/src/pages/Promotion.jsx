import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const mockPromotions = [
  // Dữ liệu mẫu, có thể thay bằng API thực tế
  {
    promotion_id: 1,
    name: "Khuyến mãi 1",
    description: "Mô tả khuyến mãi 1",
    image: null,
    type: "PERCENT_DISCOUNT",
    discount_value: 10,
    start_date: "2024-06-01",
    end_date: "2024-06-30",
  },
  {
    promotion_id: 2,
    name: "Khuyến mãi 2",
    description: "Mô tả khuyến mãi 2",
    image: null,
    type: "MONEY_DISCOUNT",
    discount_value: 50000,
    start_date: "2024-06-10",
    end_date: "2024-07-10",
  },
];

const PromotionDetail = () => {
  const { id } = useParams();
  const [promotion, setPromotion] = useState(null);

  useEffect(() => {
    // Thay bằng API thực tế nếu có
    const found = mockPromotions.find(
      (p) => String(p.promotion_id) === String(id)
    );
    setPromotion(found);
  }, [id]);

  if (!promotion) {
    return (
      <div className="text-center py-10 text-gray-500">
        Không tìm thấy khuyến mãi.
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">
        {promotion.name}
      </h1>
      {promotion.image && (
        <img
          src={promotion.image}
          alt={promotion.name}
          className="w-full rounded mb-4"
        />
      )}
      <div className="mb-2 text-gray-700">{promotion.description}</div>
      <div className="mb-2">
        <span className="font-semibold">Ưu đãi: </span>
        {promotion.type === "PERCENT_DISCOUNT"
          ? `${parseFloat(promotion.discount_value)}%`
          : `${parseInt(promotion.discount_value).toLocaleString()}đ`}
      </div>
      <div className="text-sm text-gray-500">
        <span className="font-semibold">Thời gian áp dụng: </span>
        {`${new Date(promotion.start_date).toLocaleDateString()} - ${new Date(
          promotion.end_date
        ).toLocaleDateString()}`}
      </div>
    </div>
  );
};

export default PromotionDetail;
