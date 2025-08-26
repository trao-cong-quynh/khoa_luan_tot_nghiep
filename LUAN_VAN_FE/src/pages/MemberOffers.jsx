import React from "react";
import OfferCard from "../components/ui/OfferCard";
const memberOffersData = [
  {
    id: 1,
    title: "Thứ 3 Vui Vẻ - Thành Viên Giảm Giá Vé",
    description:
      "Vào mỗi Thứ 3 hàng tuần, thành viên Galaxy Cinema được mua vé với mức giá ưu đãi chỉ từ 50.000đ.",
    image: "https://www.galaxycine.vn/media/2024/6/1/thursday-happy.jpg",
    link: "/uu-dai-thanh-vien/thu-3-vui-ve",
  },
  {
    id: 2,
    title: "Nhận Sao Thưởng Khi Mua Vé Online",
    description:
      "Tích lũy sao thưởng cho mỗi giao dịch đặt vé trực tuyến. Quy đổi sao thành bắp nước hoặc vé xem phim miễn phí!",
    image: "https://www.galaxycine.vn/media/2024/6/1/star-point.jpg",
    link: "/uu-dai-thanh-vien/sao-thuong-online",
  },
  {
    id: 3,
    title: "Ưu Đãi Combo Bắp Nước",
    description:
      "Thành viên được mua combo bắp nước với mức giá rẻ hơn so với khách thường. Chỉ cần đăng nhập là được áp dụng!",
    image: "https://www.galaxycine.vn/media/2024/6/1/combo-member.jpg",
    link: "/uu-dai-thanh-vien/combo-uu-dai",
  },
];
function MemberOffers() {
  return (
    <div className="w-full lg:w-[80%] mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">
        Ưu đãi thành viên
      </h1>
      <div className="gird gird-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {memberOffersData.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}

export default MemberOffers;
