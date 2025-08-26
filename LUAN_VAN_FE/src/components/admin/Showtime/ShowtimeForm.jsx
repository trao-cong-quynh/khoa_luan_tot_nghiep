import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";

const screenTypes = ["2D", "3D"];
const translationTypes = ["Phụ đề", "Lồng tiếng"];

const statusColor = {
  "Đang chiếu":
    "bg-green-100 text-green-700 border border-green-400 px-2 rounded text-xs ml-2",
  "Sắp chiếu":
    "bg-blue-100 text-blue-700 border border-blue-400 px-2 rounded text-xs ml-2",
  "Đã chiếu":
    "bg-red-100 text-red-700 border border-red-400 px-2 rounded text-xs ml-2",
};

const ShowtimeForm = ({
  onSubmit,
  onCancel,
  initialData,
  movies = [],
  mode = "add",
  defaultDate,
}) => {
  const [formData, setFormData] = useState({
    movieId: "",
    date: defaultDate || "", 
    startTime: "", 
    endTime: "", 
    screenType: "2D",
    translationType: "Phụ đề", 
  });

  useEffect(() => {
    if (initialData) {
      // Khi có initialData (chế độ chỉnh sửa)
      const startDate = initialData.start_time
        ? initialData.start_time.slice(0, 10)
        : defaultDate || "";
      const startTime = initialData.start_time
        ? initialData.start_time.slice(11, 16)
        : ""; // Chỉ lấy giờ:phút
      const endTime = initialData.end_time
        ? initialData.end_time.slice(11, 16)
        : ""; // Chỉ lấy giờ:phút

      setFormData({
        movieId: initialData.movieId || initialData.movie_id || "",
        date: startDate, // Ngày bắt đầu của suất chiếu
        startTime: startTime,
        endTime: endTime,
        screenType: initialData.screen_type || "2D", // Đảm bảo lấy từ initialData
        translationType: initialData.translation_type || "Phụ đề", // Đảm bảo lấy từ initialData
      });
    } else {
      // Chế độ thêm mới, chỉ cập nhật ngày mặc định
      setFormData((prev) => ({
        ...prev,
        date: defaultDate || "",
        // Giữ nguyên screenType và translationType mặc định hoặc từ state trước đó
        screenType: prev.screenType || "2D",
        translationType: prev.translationType || "Phụ đề",
      }));
    }
  }, [initialData, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Để hàm onSubmit ở component cha có thể xử lý, chúng ta cần truyền đủ dữ liệu.
    // formData.date sẽ là ngày bắt đầu.
    // formData.startTime là giờ bắt đầu.
    // formData.endTime là giờ kết thúc.
    // Component cha sẽ cần kết hợp chúng thành start_time và end_time đầy đủ.
    onSubmit(formData);
  };

  const handleMovieChange = (e) => {
    const movieId = e.target.value;
    const newSelectedMovie = movies.find(
      (m) => String(m.movie_id) === String(movieId)
    );

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        movieId: movieId,
        endTime: "", // Reset endTime khi đổi phim
        // Giữ lại screenType và translationType hoặc đặt mặc định nếu cần
        screenType: newSelectedMovie?.screen_type || "2D", // Có thể lấy từ movie data nếu có
        translationType: newSelectedMovie?.translation_type || "Phụ đề", // Có thể lấy từ movie data nếu có
      };

      // Nếu có startTime và phim mới được chọn, tính toán endTime lại
      if (updatedFormData.startTime && newSelectedMovie?.duration) {
        const startDateTime = new Date(
          `${updatedFormData.date} ${updatedFormData.startTime}`
        );
        const endDateTime = new Date(
          startDateTime.getTime() + newSelectedMovie.duration * 60000
        );

        updatedFormData.endTime = endDateTime.toTimeString().slice(0, 5); // Giờ:phút
      }
      return updatedFormData;
    });
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    const selectedMovie = movies.find(
      (m) => String(m.movie_id) === String(formData.movieId)
    );

    let newEndTime = "";
    // Đảm bảo có ngày, giờ bắt đầu và thời lượng phim để tính toán
    if (formData.date && newStartTime && selectedMovie?.duration) {
      const startDateTime = new Date(`${formData.date} ${newStartTime}`);
      // Thêm thời lượng phim vào thời gian bắt đầu
      const endDateTime = new Date(
        startDateTime.getTime() + selectedMovie.duration * 60000
      );

      // Định dạng giờ kết thúc thành HH:MM
      newEndTime = endDateTime.toTimeString().slice(0, 5);

      // Cập nhật ngày nếu suất chiếu kéo dài sang ngày hôm sau
      // Lấy ngày của startDateTime và endDateTime
      // const startDate = startDateTime.toISOString().slice(0, 10);
      // const endDate = endDateTime.toISOString().slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime,
    }));
  };

  // Lấy trạng thái phim động từ prop movies
  const selectedMovie = movies.find(
    (m) => String(m.movie_id) === String(formData.movieId)
  );

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 text-center">
        {mode === "edit" ? "Cập nhật lịch chiếu" : "Thêm suất chiếu"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phim chiếu */}
        <div className="min-h-[80px]">
          <label className="block font-semibold mb-1">
            Phim chiếu <span className="text-red-500">*</span>
          </label>
          <select
            name="movieId"
            value={formData.movieId}
            onChange={handleMovieChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Chọn phim</option>
            {movies.map((movie) => (
              <option key={movie.movie_id} value={movie.movie_id}>
                {movie.movie_name}
              </option>
            ))}
          </select>
          <div className="mt-1 min-h-[40px]">
            {formData.movieId && selectedMovie ? (
              <>
                <span className={statusColor[selectedMovie.status] || ""}>
                  {selectedMovie.status}
                </span>
                {selectedMovie.duration && (
                  <div className="mt-1 text-xs text-gray-600">
                    Thời lượng: {selectedMovie.duration} phút
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-400">
                Chọn phim để xem thông tin
              </div>
            )}
          </div>
        </div>
        {/* Ngày chiếu */}
        <div className="min-h-[60px]">
          <label className="block font-semibold mb-1">
            Ngày chiếu <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full border rounded p-2"
            required
          />
        </div>
        {/* Thời gian chiếu */}
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="block font-semibold mb-1">
              Thời gian chiếu <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleStartTimeChange}
                className="border rounded p-2 w-full"
                required
              />
              <span className="self-center">-</span>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="border rounded p-2 w-full"
                required
                // disabled // Có thể disable để ngăn chỉnh sửa thủ công nếu luôn muốn tự tính toán
              />
            </div>
          </div>
        </div>
        {/* <div>
          <label className="block font-semibold mb-1">
            Hình thức chiếu <span className="text-red-500">*</span>
          </label>
          <select
            name="screenType"
            value={formData.screenType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, screenType: e.target.value }))
            }
            className="w-full border rounded p-2"
            required
          >
            <option value="">Chọn hình thức chiếu</option>
            {screenTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div> */}
        {/* <div>
          <label className="block font-semibold mb-1">
            Hình thức dịch <span className="text-red-500">*</span>
          </label>
          <select
            name="translationType"
            value={formData.translationType}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                translationType: e.target.value,
              }))
            }
            className="w-full border rounded p-2"
            required
          >
            <option value="">Chọn hình thức dịch</option>
            {translationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div> */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-semibold cursor-pointer"
        >
          {initialData && initialData.id
            ? "Cập nhật lịch chiếu"
            : "Tạo suất chiếu"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-300 text-gray-800 py-2 rounded mt-2 hover:bg-gray-400 cursor-pointer"
          >
            Hủy
          </button>
        )}
      </form>
    </div>
  );
};

export default ShowtimeForm;
