import React from "react";
import { Link } from "react-router-dom";

const theaters = [
  {
    id: 1,
    name: "Galaxy Nguyễn Du",
    address: "116 Nguyễn Du, Quận 1, TP.HCM",
    image:
      "https://www.galaxycine.vn/media/2021/8/25/nguyen-du_1629876791316.jpg",
    description:
      "Rạp có âm thanh Dolby Atmos hiện đại cùng nhiều phòng chiếu lớn.",
    linkDetail: "/rap/galaxy-nguyen-du",
  },
  {
    id: 2,
    name: "Galaxy Kinh Dương Vương",
    address: "718bis Kinh Dương Vương, Quận 6, TP.HCM",
    image:
      "https://www.galaxycine.vn/media/2021/8/25/kinh-duong-vuong_1629876942062.jpg",
    description: "Nằm trong khu vực sầm uất, tiện lợi di chuyển.",
    linkDetail: "/rap/galaxy-kinh-duong-vuong",
  },
  {
    id: 3,
    name: "Galaxy Tân Bình",
    address: "246 Nguyễn Hồng Đào, Tân Bình, TP.HCM",
    image:
      "https://www.galaxycine.vn/media/2021/8/25/tan-binh_1629877124357.jpg",
    description: "Rạp chiếu phim với phòng chiếu chuẩn Hollywood.",
    linkDetail: "/rap/galaxy-tan-binh",
  },
  // Thêm nhiều rạp khác...
];
function TheaterList() {
  return (
    <div className="w-full lg:w-[80%] mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Hệ Thống Rạp Galaxy
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theaters.map((theater) => (
          <div
            key={theater.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition duration-300"
          >
            <img
              src={theater.image}
              alt={theater.name}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-orange-500">
                {theater.name}
              </h2>
              <p className="text-gray-600 text-sm">{theater.address}</p>
              <p className="text-gray-700 mt-2 text-sm">
                {theater.description}
              </p>
              <Link
                to={theater.linkDetail}
                className="inline-block mt-3 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 text-sm"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TheaterList;
