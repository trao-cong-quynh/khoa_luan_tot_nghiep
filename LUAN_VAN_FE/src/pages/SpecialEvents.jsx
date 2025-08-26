import React from "react";
// import eventData from "./eventData";
import EventCard from "../components/ui/EventCard";
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

function SpecialEvents() {
  return (
    <div className="w-full lg:w-[80%] mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">
        Sự Kiện Đặc Biệt
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {eventData.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

export default SpecialEvents;
