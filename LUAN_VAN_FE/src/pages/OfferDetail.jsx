import React from "react";
import { useParams, Link } from "react-router-dom";
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

function OfferDetail() {
  const { slug } = useParams();
  const offer = memberOffersData.find((item) => item.link.endsWith(slug));

  if (!offer) {
    return (
      <div className="w-full lg:w-[80%] mx-auto mt-24 px-4">
        <h2 className="text-2xl font-bold text-red-500">
          Ưu đãi không tồn tại
        </h2>
        <Link
          to="/uu-dai-thanh-vien"
          className="text-blue-600 underline mt-4 inline-block"
        >
          Quay lại danh sách ưu đãi
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[80%] mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold text-orange-500 mb-4">{offer.title}</h1>
      <img
        src={offer.image}
        alt={offer.title}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <p className="text-gray-700 leading-relaxed">{offer.description}</p>
      {/* Mô tả chi tiết giả lập */}
      <p className="text-gray-600 mt-4">
        Đây là nội dung chi tiết về chương trình khuyến mãi "{offer.title}". Vui
        lòng đăng nhập để hưởng ưu đãi.
      </p>
      <Link
        to="/uu-dai-thanh-vien"
        className="inline-block mt-6 text-sm text-blue-600 underline"
      >
        ← Quay lại danh sách ưu đãi
      </Link>
    </div>
  );
}

export default OfferDetail;
