import React from "react";
import { useParams, Link } from "react-router-dom";

const theaterData = {
  "galaxy-nguyen-du": {
    name: "Galaxy Nguyễn Du",
    address: "116 Nguyễn Du, Quận 1, TP.HCM",
    image:
      "https://www.galaxycine.vn/media/2021/8/25/nguyen-du_1629876791316.jpg",
    description:
      "Galaxy Nguyễn Du là rạp chiếu phim hiện đại với âm thanh Dolby Atmos, phục vụ nhiều suất chiếu mỗi ngày.",
    facilities: [
      "Phòng chiếu chuẩn Hollywood",
      "Ghế đôi",
      "Đặt vé online",
      "Snack bar",
    ],
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4978045509965!2d106.6883165743006!3d10.773133331887742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3c0189fa2b%3A0x6e75dc36d4dba07d!2sGalaxy%20Nguy%E1%BB%85n%20Du!5e0!3m2!1sen!2s!4v1750994151496!5m2!1sen!2s", // Thay bằng link map thật
  },
  "galaxy-kinh-duong-vuong": {
    name: "Galaxy Kinh Dương Vương",
    address: "718bis Kinh Dương Vương, Quận 6, TP.HCM",
    image:
      "https://www.galaxycine.vn/media/2021/8/25/kinh-duong-vuong_1629876942062.jpg",
    description:
      "Rạp Galaxy Kinh Dương Vương tọa lạc tại khu vực đông dân cư, thuận tiện cho khách hàng khu vực Quận 6 và lân cận.",
    facilities: ["Ghế VIP", "3D Screen", "Quầy thức ăn đa dạng"],
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.7931564301102!2d106.62569567427126!3d10.75041875967449!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752c2ab06fc7b7%3A0x50a4eefae0a2deca!2sGalaxy%20Kinh%20Duong%20Vuong!5e0!3m2!1sen!2s!4v1750994413606!5m2!1sen!2s",
  },
  // Thêm các rạp khác...
};

function TheaterDetail() {
  const { slug } = useParams();
  const theater = theaterData[slug];

  if (!theater) {
    return (
      <div className="w-full lg:w-[80%] mx-auto mt-24 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">
          Không tìm thấy rạp!
        </h1>
        <Link
          to="/he-thong-rap"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Quay về danh sách rạp
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-[80%] mx-auto px-4">
      <h1 className="text-3xl font-bold mb-4 text-orange-500">
        {theater.name}
      </h1>
      <img
        src={theater.image}
        alt={theater.name}
        className="w-full h-64 object-cover rounded-lg shadow-md mb-4"
      />
      <p className="text-gray-700 mb-2">
        <strong>Địa chỉ:</strong> {theater.address}
      </p>
      <p className="text-gray-700 mb-4">{theater.description}</p>

      <h2 className="text-xl font-semibold mb-2">Tiện ích tại rạp:</h2>
      <ul className="list-disc pl-5 mb-6 text-gray-700">
        {theater.facilities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {theater.mapEmbedUrl && (
        <div className="w-full h-64">
          <iframe
            src={theater.mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title={`Bản đồ ${theater.name}`}
            className="rounded-lg shadow-md"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default TheaterDetail;
