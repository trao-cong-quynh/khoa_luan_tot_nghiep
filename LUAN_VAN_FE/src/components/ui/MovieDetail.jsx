import React from "react";

function MovieDetail({ movie }) {
  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:px-6 md:px-8 lg:px-10 sm:py-8 md:py-10">
      {/* Trailer + Poster */}
      <div className="relative bg-amber-950 h-64 sm:h-80 md:h-[400px] flex justify-center items-center overflow-hidden rounded-lg">
        {/* Trailer */}
        <div className="relative w-full sm:w-[90%] md:w-[80%]">
          <img
            src={movie.trailerThumbnail}
            alt="Trailer"
            className="w-full rounded-lg object-cover h-64 sm:h-80 md:h-[400px]"
          />
          {/* <button className="absolute inset-0 flex justify-center items-center text-white text-4xl bg-black bg-opacity-50 rounded-lg">
            ▶
          </button> */}
        </div>

        {/* Poster */}
        <div className="absolute left-4 -bottom-8 w-24 sm:left-8 sm:-bottom-12 sm:w-32 md:bottom-0 md:left-0 md:transform md:translate-x-1/4 md:translate-y-1/2 md:w-[180px] z-10">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full rounded shadow-md hover:shadow-lg transition-shadow duration-300"
          />
        </div>
      </div>

      {/* Movie Info and Description Container */}
      <div className="mt-10 sm:mt-16 md:mt-20 space-y-8 px-4 sm:px-0">
        {/* Thông tin phim */}
        <div className="pt-10 md:pt-0 md:ml-[180px]">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            {movie.title}
          </h2>
          <div className="text-sm sm:text-base text-gray-600 space-y-2">
            <p>
              <strong>Thời lượng:</strong> {movie.duration} phút
            </p>
            <p>
              <strong>Quốc gia:</strong> {movie.country}
            </p>
            <p>
              <strong>Thể loại:</strong>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </p>
            <p>
              <strong>Đạo diễn:</strong>
              <span className="inline-block bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm">
                {movie.director}
              </span>
            </p>
            <p>
              <strong>Diễn viên:</strong>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {movie.actors.map((actor, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm"
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </p>
          </div>
        </div>

        {/* Mô tả phim */}
        <div className="w-full sm:w-[90%]">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            NỘI DUNG PHIM
          </h2>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {movie.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
