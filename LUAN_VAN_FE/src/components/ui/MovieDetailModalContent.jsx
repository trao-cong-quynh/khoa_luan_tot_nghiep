import React from "react";
import { imagePhim } from "../../Utilities/common";

const MovieDetailModalContent = ({ movie }) => {
  if (!movie) return null;
  return (
    <div className="p-4 sm:p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <img
          src={
            movie.poster_url
              ? `${imagePhim}${movie.poster_url}`
              : "/placeholder.jpg"
          }
          alt={movie.movie_name}
          className="w-32 h-44 object-cover rounded-lg shadow border mx-auto sm:mx-0"
        />
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-bold text-blue-700 mb-2">
            {movie.movie_name}
          </h2>
          <div className="text-sm text-gray-700 mb-1 max-h-32 overflow-y-auto pr-1">
            <span className="font-semibold">Mô tả:</span> {movie.description}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Đạo diễn:</span> {movie.derector}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Diễn viên:</span>{" "}
            {movie.actor || "-"}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Thể loại:</span>{" "}
            {movie.genres?.map((g) => g.genre_name).join(", ") || "-"}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Loại chiếu:</span>{" "}
            {movie.screening_types
              ?.map((s) => s.screening_type_name)
              .join(", ") || "-"}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Thời lượng:</span> {movie.duration}{" "}
            phút
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Ngày khởi chiếu:</span>{" "}
            {movie.release_date}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Quốc gia:</span> {movie.country}
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Độ tuổi:</span> {movie.age_rating}+
          </div>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Trạng thái:</span> {movie.status}
          </div>
          {movie.trailer_url && (
            <div className="mt-2">
              <span className="font-semibold">Trailer:</span>
              <div className="aspect-video w-full mt-1">
                <iframe
                  src={movie.trailer_url}
                  title="Trailer"
                  allowFullScreen
                  className="w-full h-48 rounded-lg border"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailModalContent;
