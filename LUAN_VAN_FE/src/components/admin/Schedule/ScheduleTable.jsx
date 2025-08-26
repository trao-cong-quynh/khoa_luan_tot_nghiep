import React from "react";
import { FaEdit, FaTrash, FaTrashRestore } from "react-icons/fa";

const ScheduleTable = ({
  schedules = [],
  movieList = [],
  cinemaList = [],
  onEdit,
  onDelete,
  onRestore,
  loading,
  isDeleting,
  isDeletedView = false,
}) => {
  // Tạo map tra cứu phim theo movie_id
  const movieMap = React.useMemo(() => {
    if (!Array.isArray(movieList)) return {};
    const map = {};
    movieList.forEach((movie) => {
      map[movie.movie_id] = movie;
    });
    return map;
  }, [movieList]);

  // Tạo map tra cứu rạp theo cinema_id
  const cinemaMap = React.useMemo(() => {
    if (!Array.isArray(cinemaList)) return {};
    const map = {};
    cinemaList.forEach((cinema) => {
      map[cinema.cinema_id] = cinema;
    });
    return map;
  }, [cinemaList]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-100 to-blue-200">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-12">
              STT
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-48">
              Phim chiếu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-48">
              Rạp chiếu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-56">
              Thời gian chiếu
            </th>
            <th className="py-3 px-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Phân loại
            </th>
            <th className="py-3 px-4 text-center text-xs font-bold text-blue-700 uppercase tracking-wider w-32">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {loading ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : schedules.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-400">
                {isDeletedView
                  ? "Không có lịch chiếu đã xóa nào"
                  : "Không có lịch chiếu nào"}
              </td>
            </tr>
          ) : (
            schedules.map((schedule, idx) => {
              const movie = movieMap[schedule.movie_id];
              const cinema = cinemaMap[schedule.cinema_id];
              const stt = idx + 1;
              return (
                <tr
                  key={schedule.movie_schedule_id}
                  className="hover:bg-blue-50 border-b transition-all duration-100"
                >
                  <td className="py-3 px-4 whitespace-nowrap">{stt}</td>
                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-900">
                    {movie?.movie_name || movie?.title || "-"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-900">
                    {cinema?.cinema_name || cinema?.name || "-"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {schedule.start_date} đến {schedule.end_date}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {(() => {
                      const today = new Date();
                      const start = schedule.start_date
                        ? new Date(schedule.start_date)
                        : null;
                      const end = schedule.end_date
                        ? new Date(schedule.end_date)
                        : null;
                      let status = "-";
                      let color = "bg-gray-200 text-gray-700";
                      if (start && end) {
                        if (today > end) {
                          status = "Đã chiếu";
                          color = "bg-gray-300 text-gray-700";
                        } else if (today < start) {
                          status = "Sắp chiếu";
                          color = "bg-yellow-100 text-yellow-800";
                        } else {
                          status = "Đang chiếu";
                          color = "bg-green-100 text-green-800";
                        }
                      }
                      return (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color}`}
                        >
                          {status}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      {isDeletedView ? (
                        <button
                          onClick={() =>
                            onRestore && onRestore(schedule.movie_schedule_id)
                          }
                          disabled={isDeleting}
                          className={`p-2 text-green-600 hover:text-green-800 transition-colors cursor-pointer ${
                            isDeleting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          title={isDeleting ? "Đang hoàn tác..." : "Hoàn tác"}
                        >
                          <FaTrashRestore />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit && onEdit(schedule)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() =>
                              onDelete && onDelete(schedule.movie_schedule_id)
                            }
                            className="p-2 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;
