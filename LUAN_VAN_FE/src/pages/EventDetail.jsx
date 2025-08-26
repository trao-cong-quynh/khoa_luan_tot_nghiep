import React from "react";
import { useParams, Link } from "react-router-dom";
const eventData = [
  {
    id: 1,
    title: "Ưu đãi Tháng 6: Vé chỉ từ 49K",
    description: "Thưởng thức những bộ phim hot với giá vé siêu rẻ chỉ từ 49K.",
    image: "https://www.galaxycine.vn/media/2024/6/1/sale-49k.jpg",
    link: "/su-kien-dac-biet/uu-dai-49k",
  },
  {
    id: 2,
    title: "Combo Popcorn siêu tiết kiệm",
    description: "Mua combo bắp nước với giá ưu đãi chỉ có tại Galaxy Cinema.",
    image: "https://www.galaxycine.vn/media/2024/6/1/combo-deal.jpg",
    link: "/su-kien-dac-biet/combo-popcorn",
  },
  {
    id: 3,
    title: "Thành viên VIP - Ưu đãi kép",
    description: "Đặc quyền dành riêng cho khách hàng VIP trong tháng này.",
    image: "https://www.galaxycine.vn/media/2024/6/1/vip-event.jpg",
    link: "/su-kien-dac-biet/vip-uu-dai",
  },
];

function EventDetail() {
  const { slug } = useParams();
  const event = eventData.find((item) => item.link.endsWith(slug));

  if (!event) {
    return (
      <div className="w-full lg:w-[80%] mx-auto mt-24 px-4">
        <h2 className="text-2xl font-bold text-red-500">
          Sự kiện không tồn tại
        </h2>
        <Link
          to="/su-kien-dac-biet"
          className="text-blue-600 underline mt-4 inline-block"
        >
          Quay lại danh sách sự kiện
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[80%] mx-auto mt-24 px-4">
      <h1 className="text-3xl font-bold text-orange-500 mb-4">{event.title}</h1>
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-64 object-cover rounded-lg mb-4"
      />
      <p className="text-gray-700 leading-relaxed">{event.description}</p>
      {/* Nội dung chi tiết giả lập */}
      <p className="text-gray-600 mt-4">
        Tham gia sự kiện "{event.title}" để nhận nhiều phần quà hấp dẫn và ưu
        đãi đặc biệt!
      </p>
      <Link
        to="/su-kien-dac-biet"
        className="inline-block mt-6 text-sm text-blue-600 underline"
      >
        ← Quay lại danh sách sự kiện
      </Link>
    </div>
  );
}

export default EventDetail;
