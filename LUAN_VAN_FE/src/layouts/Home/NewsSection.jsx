import React from "react";
import { FiEye } from "react-icons/fi";
import NewsCard from "../../components/ui/NewsCard";
import news1 from "../../assets/new/lilo--stitch.jpg";
import news2 from "../../assets/new/mua-lua--anh-trai-vuot-ngan-chong-gai-movie-bao-nhieu-chong-gai--bay-nhieu-tu-hao.jpeg";
const dummyNews = {
  main: {
    image: news1,
    title:
      "[Review] Lilo & Stitch: Bản Live-action Thành Công Nhất Của Disney?",
    views: 508,
  },
  side: [
    {
      image: news2,
      title:
        "[Review] Mưa Lửa – Anh Trai Vượt Ngàn Chông Gai Movie: Bao Nhiêu Chông Gai,...",
      views: 508,
    },
    {
      image: news2,
      title:
        "[Review] Mưa Lửa – Anh Trai Vượt Ngàn Chông Gai Movie: Bao Nhiêu Chông Gai,...",
      views: 508,
    },
    {
      image: news2,
      title:
        "[Review] Mưa Lửa – Anh Trai Vượt Ngàn Chông Gai Movie: Bao Nhiêu Chông Gai,...",
      views: 508,
    },
  ],
};

function NewsSection() {
  return (
    <section className="max-w-screen-xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-4">TIN TỨC</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tin lớn */}
        <div className="md:col-span-2 ">
          <img
            src={dummyNews.main.image}
            alt="main news"
            className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover rounded"
          />
          <h3 className="mt-3 font-bold text-lg">{dummyNews.main.title}</h3>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Thích
            </button>
            <span className="flex items-center space-x-1">
              <FiEye />
              <span>{dummyNews.main.views}</span>
            </span>
          </div>
        </div>

        {/* Tin phụ */}
        <div>
          {dummyNews.side.map((news, index) => (
            <NewsCard key={index} {...news} />
          ))}
        </div>
      </div>

      {/* Xem thêm */}
      <div className="flex justify-center mt-6">
        <button
          className="py-2 px-6 rounded cursor-pointer font-bold transition"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "black",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "var(--color-hover)";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "var(--color-primary)";
            e.target.style.color = "black";
          }}
        >
          Xem thêm &gt;
        </button>
      </div>
    </section>
  );
}

export default NewsSection;
