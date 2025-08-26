import React from "react";
import { imagePhim } from "../../Utilities/common";

function MovieDetailPage({ movie }) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 mt-10">
      {/* Trailer + Poster */}
      <div className="relative bg-black h-[250px] md:h-[400px] flex justify-center items-center overflow-visible rounded-lg">
        {/* Trailer */}
        <iframe
          width="100%"
          height="100%"
          src={movie.trailer_url}
          title="Movie Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="rounded-lg object-cover h-[200px] md:h-[400px] w-full "
        ></iframe>
        {/* Poster nhỏ nổi góc dưới trái, tràn xuống dưới */}
        <div className="absolute left-0 md:left-10 -bottom-55 w-32 md:w-[180px] z-10 shadow-lg ">
          <img
            src={
              movie.poster_url
                ? `${imagePhim}${movie.poster_url}`
                : "/placeholder.jpg"
            }
            alt={movie.movie_name}
            className="w-full rounded shadow-md border-2 border-white"
          />
        </div>
      </div>


      <div className="mt-28 md:mt-32 space-y-0 px-1 sm:px-0 ">
        {/* Thông tin phim */}
        <div className="-mt-20 md:pt-0 md:ml-[240px]">
          <h2 className="ml-32 md:ml-0 text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            {movie.movie_name}
          </h2>
          <div className="text-sm sm:text-lg text-gray-600 space-y-2">
            <p className="ml-32 md:ml-0">
              <strong>Thời lượng: </strong> {movie.duration} phút
            </p>
            <p className="ml-32 md:ml-0">
              <strong>Quốc gia: </strong> {movie.country}
            </p>
            <div className="flex items-center flex-wrap gap-2 mt-1 ml-32 md:ml-0">
              <strong>Thể loại:</strong>
              {movie.genres && movie.genres.length > 0 ? (
                movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-sm px-2 py-1 rounded text-base sm:text-sm text-primary-custom"
                  >
                    {genre.genre_name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Không có</span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <strong>Diễn viên:</strong>
              {movie.actor ? (
                movie.actor.split(",").map((actor, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-sm px-2 py-1 rounded text-lg sm:text-sm text-primary-custom"
                  >
                    {actor.trim()}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Không có</span>
              )}
            </div>
            <p>
              <strong>Đạo diễn: </strong>
              <span className="inline-block bg-gray-200 text-sm px-2 py-1 rounded text-xs sm:text-sm text-primary-custom">
                {movie.derector}
              </span>
            </p>
          </div>
        </div>

        {/* Mô tả phim */}
        <div className="w-full sm:w-[100%] max-w-12xl mx-auto mt-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            NỘI DUNG PHIM
          </h2>
          <p className="text-primary-custom text-sm sm:text-base leading-relaxed text-justify">
            {movie.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
