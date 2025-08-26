import React from "react";
import { FaEdit, FaTrash, FaTrashRestore } from "react-icons/fa";
import { imagePhim } from "../../../Utilities/common";

const statusMap = {
  "Đang chiếu": { text: "Đang chiếu", color: "bg-green-100 text-green-800" },
  "Sắp chiếu": { text: "Sắp chiếu", color: "bg-yellow-100 text-yellow-800" },
  "Đã kết thúc": { text: "Đã kết thúc", color: "bg-gray-200 text-gray-600" },
};

const ageRatingMap = {
  12: { text: "12+", color: "bg-green-100 text-green-800" },
  13: { text: "13+", color: "bg-yellow-100 text-yellow-800" },
  16: { text: "16+", color: "bg-orange-100 text-orange-800" },
  18: { text: "18+", color: "bg-red-100 text-red-800" },
};

const MovieTable = ({
  movies,
  onEdit,
  onDelete,
  loading,
  isDeleting,
  isDeletedView = false,
  onRowClick,
  onShowTrailer,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-20">
              Hình ảnh
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-40">
              Tên phim
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-52">
              Mô tả
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-24">
              Thời lượng
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Ngày khởi chiếu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-36">
              Đạo diễn
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-48">
              Diễn viên
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-36">
              Thể loại
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Quốc gia
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-24">
              Độ tuổi
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-36">
              Trạng thái
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-40">
              Trailer URL
            </th>
            <th className="py-3 px-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {loading ? (
            <tr>
              <td colSpan={12} className="py-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : movies.length === 0 ? (
            <tr>
              <td colSpan={12} className="py-8 text-center text-gray-400">
                Không có phim phù hợp
              </td>
            </tr>
          ) : (
            movies.map((movie) => (
              <tr
                key={movie.movie_id}
                className="hover:bg-blue-50 border-b transition-all duration-100 cursor-pointer"
                onClick={
                  onRowClick
                    ? (e) => {
                        if (e.target.closest("button") || e.target.closest("a"))
                          return;
                        onRowClick(movie);
                      }
                    : undefined
                }
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  <img
                    src={
                      movie.poster_url
                        ? `${imagePhim}${movie.poster_url}`
                        : "/placeholder.jpg"
                    }
                    alt={movie.movie_name}
                    className="h-14 w-14 object-cover rounded-lg shadow border"
                  />
                </td>
                <td className="py-3 px-4">
                  <div
                    className="text-sm font-semibold text-gray-900 truncate max-w-[10rem]"
                    title={movie.movie_name}
                  >
                    {movie.movie_name}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div
                    className="text-xs text-gray-600 truncate max-w-[13rem]"
                    title={movie.description}
                  >
                    {movie.description}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="text-xs text-gray-800 font-medium">
                    {movie.duration} phút
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="text-xs text-gray-800">
                    {movie.release_date}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div
                    className="text-xs text-gray-800 truncate max-w-[10rem]"
                    title={movie.derector}
                  >
                    {movie.derector}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div
                    className="text-xs text-gray-800 truncate max-w-[13rem]"
                    title={movie.actor || ""}
                  >
                    {movie.actor || ""}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div
                    className="text-xs text-gray-800 truncate max-w-[13rem]"
                    title={
                      movie.genres
                        ?.map((genre) => genre.genre_name)
                        .join(", ") || ""
                    }
                  >
                    {movie.genres
                      ?.map((genre) => genre.genre_name)
                      .join(", ") || ""}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="text-xs text-gray-800">{movie.country}</div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      ageRatingMap[movie.age_rating]?.color ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ageRatingMap[movie.age_rating]?.text || "Khác"}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      statusMap[movie.status]?.color ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusMap[movie.status]?.text || "Khác"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div
                    className="text-xs text-gray-800 truncate max-w-[10rem]"
                    title={movie.trailer_url || ""}
                  >
                    {movie.trailer_url ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onShowTrailer) onShowTrailer(movie.trailer_url);
                        }}
                        className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        Xem trailer
                      </button>
                    ) : (
                      "Không có"
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-center">
                  <div className="flex justify-center space-x-2">
                    {isDeletedView ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(movie.movie_id);
                        }}
                        disabled={isDeleting}
                        className={`p-2 text-green-600 hover:text-green-800 transition-colors ${
                          isDeleting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        title={isDeleting ? "Đang hoàn tác..." : "Hoàn tác"}
                      >
                        <FaTrashRestore />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(movie);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors 
                          cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(movie.movie_id);
                          }}
                          disabled={isDeleting}
                          className={`p-2 text-red-600 hover:text-red-800 transition-colors 
                            cursor-pointer${
                              isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          title={isDeleting ? "Đang xóa..." : "Xóa"}
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MovieTable;
