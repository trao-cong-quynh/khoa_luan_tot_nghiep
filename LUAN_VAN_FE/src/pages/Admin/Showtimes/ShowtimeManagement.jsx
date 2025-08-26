import React, { useState, useEffect } from "react";
import ShowtimeForm from "../../../components/admin/Showtime/ShowtimeForm";
import ShowtimeTable from "../../../components/admin/Showtime/ShowtimeTable";
import {
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
  FaExclamationCircle,
} from "react-icons/fa";
import Modal from "../../../components/ui/Modal";
import { useGetSeatMapUS } from "../../../api/homePage";
import Seat from "../../../components/admin/Room/Seat";
import {
  useGetAllCinemasUS,
  useGetTheaterRoomsByCinemaUS,
  useGetPhimTheoRapUS,
  useGetFilteredShowtimesUS,
  useCreateShowtimeUS,
  useUpdateShowtimeUS,
  useReactivateShowtimeUS,
  useDeleteShowtimeUS,
  useGetCinemaByIdUS,
} from "../../../api/homePage";
import { toast } from "react-toastify";
import { useAuth } from "../../../contexts/AuthContext";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";

const ShowtimeManagement = () => {
  const { userData } = useAuth();
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [movies, setMovies] = useState([]);
  const [showSeatMapModal, setShowSeatMapModal] = useState(false);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  // Lấy danh sách rạp cho Admin (nếu có quyền truy cập tất cả)
  const { data: allCinemasData, isLoading: isLoadingAllCinemas } =
    useGetAllCinemasUS({
      enabled:
        userData?.role !== "cinema_manager" &&
        userData?.role !== "showtime_manager", // Chỉ fetch nếu KHÔNG phải là manager
    });

  // Lấy thông tin rạp cụ thể cho Cinema/Showtime Manager
  const { data: userCinemaData, isLoading: isLoadingUserCinema } =
    useGetCinemaByIdUS(userData?.cinema_id, {
      enabled:
        (userData?.role === "cinema_manager" ||
          userData?.role === "showtime_manager") &&
        !!userData?.cinema_id, // Chỉ fetch nếu là manager và có cinema_id
    });

  // Lấy danh sách phòng chiếu theo rạp
  const { data: roomsData } = useGetTheaterRoomsByCinemaUS(selectedCinema, {
    enabled: !!selectedCinema,
  });
  // Lấy danh sách phim theo rạp đã chọn
  const { data: moviesData } = useGetPhimTheoRapUS(selectedCinema, {
    enabled: !!selectedCinema,
  });
  // Lấy danh sách suất chiếu lọc
  const filteredShowtimesMutation = useGetFilteredShowtimesUS();

  // Các hook mutation cho suất chiếu
  const createShowtime = useCreateShowtimeUS();
  const updateShowtime = useUpdateShowtimeUS();
  const reactivateShowtime = useReactivateShowtimeUS();
  const deleteShowtime = useDeleteShowtimeUS();

  // Lấy danh sách rạp khi load trang và set giá trị mặc định
  useEffect(() => {
    let finalCinemasList = [];
    let defaultSelectedCinemaId = "";

    if (
      userData?.role === "cinema_manager" ||
      userData?.role === "showtime_manager"
    ) {
      // Dành cho manager: Chỉ lấy rạp của họ
      if (userCinemaData?.data && userData.cinema_id) {
        finalCinemasList = [userCinemaData.data]; // Đảm bảo là một mảng
        defaultSelectedCinemaId = userData.cinema_id;
      } else if (isLoadingUserCinema) {
        // console.log("ShowtimeManagement - Manager: Loading user's cinema...");
      } else if (userData.cinema_id && !userCinemaData?.data) {
        // Có cinema_id nhưng không fetch được data, có thể do lỗi API hoặc không tìm thấy
        // console.warn(
        // 	"ShowtimeManagement - Manager: Could not fetch cinema for ID:",
        // 	userData.cinema_id,
        // 	userCinemaData
        // );
        toast.error(
          "Không thể tải thông tin rạp của bạn. Vui lòng kiểm tra lại."
        );
      }
    } else {
      // Dành cho Admin: Lấy tất cả các rạp
      if (allCinemasData?.data) {
        finalCinemasList = allCinemasData.data;
        if (finalCinemasList.length > 0 && !selectedCinema) {
          defaultSelectedCinemaId = finalCinemasList[0].cinema_id;
        }
        console.log(
          "ShowtimeManagement - Admin: Fetched all cinemas:",
          finalCinemasList
        );
      } else if (isLoadingAllCinemas) {
        console.log("ShowtimeManagement - Admin: Loading all cinemas...");
      } else if (!allCinemasData?.data) {
        console.warn(
          "ShowtimeManagement - Admin: No cinemas data available from useGetAllCinemasUS."
        );
      }
    }

    setCinemas(finalCinemasList);
    // Nếu chưa có rạp nào được chọn, và có rạp mặc định
    if (
      finalCinemasList.length > 0 &&
      !selectedCinema &&
      defaultSelectedCinemaId
    ) {
      setSelectedCinema(defaultSelectedCinemaId);
    }
  }, [
    allCinemasData,
    userCinemaData,
    userData.role,
    userData.cinema_id,
    selectedCinema,
    isLoadingAllCinemas,
    isLoadingUserCinema,
  ]);

  // Khi chọn rạp, lấy danh sách phòng chiếu
  useEffect(() => {
    if (roomsData?.data?.theater_rooms) {
      const roomsList = roomsData.data.theater_rooms;
      setRooms(roomsList);
      if (roomsList.length > 0) {
        setSelectedRoom(roomsList[0].room_id);
      } else {
        setSelectedRoom("");
      }
    } else {
      setRooms([]);
      setSelectedRoom("");
    }
  }, [roomsData, selectedCinema]);

  // Lấy danh sách phim theo rạp đã chọn
  useEffect(() => {
    if (moviesData?.data?.movies) {
      setMovies(moviesData.data.movies);
    } else if (moviesData?.movies) {
      setMovies(moviesData.movies);
    } else {
      setMovies([]);
    }
  }, [moviesData, selectedCinema]);

  // Tự động tìm kiếm suất chiếu khi có đủ thông tin
  useEffect(() => {
    if (selectedCinema && selectedRoom && selectedDate) {
      handleSearch();
    }
  }, [selectedCinema, selectedRoom, selectedDate]);

  // Hàm xác định trạng thái động dựa vào thời gian
  const getShowtimeStatus = (showtime) => {
    const now = new Date();
    const start = new Date(showtime.start_time);
    const end = new Date(showtime.end_time);
    if (now < start) return "Sắp chiếu";
    if (now >= start && now <= end) return "Đang chiếu";
    if (now > end) return "Đã chiếu";
    return "N/A";
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const filter = {
        cinema_id: selectedCinema,
        room_id: selectedRoom,
        date: selectedDate,
      };
      const res = await filteredShowtimesMutation.mutateAsync(filter);
      let mappedShowtimes = (res.data || []).map((item) => {
        console.log("Mapping item:", item);
        // Định dạng ngày (vd: "30/07/2025")
        const startDateTime = new Date(item.start_time);
        const endDateTime = new Date(item.end_time);
        const formattedDateStart = startDateTime.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const formattedDateEnd = endDateTime.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        // Định dạng giờ (vd: "10:00")
        const formattedStartTime = startDateTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const formattedEndTime = endDateTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return {
          id: item.showtime_id,
          movie_id: item.movie_id || item.movie?.movie_id,
          movie_name: item.movie?.movie_name || "",
          screen_type: item.screen_type || "2D",
          translation_type: item.translation_type || "Phụ đề",
          time_range:
            item.start_time && item.end_time
              ? `${formattedDateStart} ${formattedStartTime} - ${formattedDateEnd} ${formattedEndTime}`
              : "",
          show_type: item.show_type || "",
          status: item.status || "",
          room_name: `${item.room?.room_name || ""} - ${
            item.room?.cinema?.cinema_name || ""
          }`,
          start_time: item.start_time,
          end_time: item.end_time,
          duration: item.movie?.duration || 0,
        };
      });
      // Lọc theo trạng thái động nếu có chọn filter
      if (statusFilter) {
        mappedShowtimes = mappedShowtimes.filter(
          (showtime) => getShowtimeStatus(showtime) === statusFilter
        );
      }
      console.log("Mapped showtimes:", mappedShowtimes); // Debug log
      setShowtimes(mappedShowtimes);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
      setShowtimes([]);
    }
    setLoading(false);
  };

  const toLocalTime = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleEdit = (showtime) => {
    console.log("handleEdit - Full showtime object:", showtime);
    let date = "";
    let startTime = "";
    let endTime = "";
    if (showtime.start_time) {
      date = showtime.start_time.slice(0, 10);
      startTime = toLocalTime(showtime.start_time);
    }
    if (showtime.end_time) {
      endTime = toLocalTime(showtime.end_time);
    }
    console.log("showtime.start_time:", showtime.start_time);
    console.log("showtime.end_time:", showtime.end_time);
    console.log("showtime.movie_id:", showtime.movie_id);
    const editingData = {
      ...showtime,
      movieId: showtime.movie_id,
      date,
      startTime,
      endTime,
    };
    console.log("editingData being set:", editingData);
    setEditingShowtime(editingData);
    setIsFormVisible(true);
  };

  const handleReactivateConfirm = async (showtimeId) => {
    try {
      const res = await reactivateShowtime.mutateAsync(showtimeId);
      if (res?.data?.status === false) {
        handleApiError(res.data, "Kích hoạt lại suất chiếu thất bại");
        return;
      }
      toast.success(
        res?.data?.message || "Kích hoạt lại suất chiếu thành công"
      );
      handleSearch();
    } catch (err) {
      toast.error(getApiMessage(err, "Có lỗi khi kích hoạt lại suất chiếu!"));
    }
  };

  // Hàm mới để hiển thị Swal xác nhận khôi phục
  const handleReactivateClick = (showtimeId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn khôi phục?",
      text: "Suất chiếu này sẽ được kích hoạt lại.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      confirmButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        handleReactivateConfirm(showtimeId);
      }
    });
  };

  const handleDeleteClick = (showtimeId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      confirmButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteConfirm(showtimeId);
      }
    });
  };

  const handleDeleteConfirm = async (showtimeId) => {
    try {
      const res = await deleteShowtime.mutateAsync(showtimeId);
      if (res?.data?.status === false) {
        Swal.fire(
          "Thất bại!",
          res?.data?.message || "Xóa suất chiếu thất bại",
          "error"
        );
        handleApiError(res.data, "Xóa suất chiếu thất bại");
        return;
      }
      Swal.fire(
        "Đã xóa!",
        res?.data?.message || "Xóa suất chiếu thành công",
        "success"
      );
      handleSearch();
    } catch (err) {
      Swal.fire(
        "Thất bại!",
        getApiMessage(err, "Có lỗi khi xóa suất chiếu!"),
        "error"
      );
    }
  };

  const handleAddOrUpdateShowtime = async (formData) => {
    const selectedMovie = movies.find(
      (m) => String(m.movie_id) === String(formData.movieId)
    );

    if (!selectedMovie) {
      toast.error("Không tìm thấy thông tin phim");
      return;
    }

    if (!formData.date || !formData.startTime) {
      toast.error("Vui lòng chọn ngày và thời gian bắt đầu");
      return;
    }

    if (!selectedMovie.duration) {
      toast.error("Không tìm thấy thông tin thời lượng phim");
      return;
    }

    // 1. Tạo đối tượng Date cho thời gian bắt đầu (dựa trên múi giờ địa phương)
    // Lưu ý: Đảm bảo startDateTime được tạo đúng cách để có thể tính toán chính xác
    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`); // Sử dụng 'T' và thêm ':00' cho giây để đảm bảo parsing tốt hơn

    // Kiểm tra tính hợp lệ của startDateTime
    if (isNaN(startDateTime.getTime())) {
      toast.error("Định dạng ngày hoặc giờ bắt đầu không hợp lệ.");
      return;
    }

    // 2. Tính toán thời gian kết thúc bằng cách thêm thời lượng phim (milliseconds)
    const calculatedEndDateTime = new Date(
      startDateTime.getTime() + selectedMovie.duration * 60000
    );

    // 3. Chuẩn bị các chuỗi thời gian cho payload
    // Sử dụng toISOString() để có định dạng chuẩn, sau đó cắt bỏ phần không cần thiết
    // Lưu ý: toISOString() trả về giờ GMT/UTC, bạn có thể cần điều chỉnh múi giờ nếu backend của bạn mong đợi múi giờ địa phương.
    // Tuy nhiên, thường thì backend sẽ tự chuyển đổi từ ISO String (UTC) sang múi giờ của nó.
    // Nếu backend mong muốn múi giờ địa phương, bạn cần viết hàm format thủ công hơn.
    // Với Laravel (backend phổ biến), ISO string thường hoạt động tốt.

    const formatLocalToApi = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const hours = String(dateObj.getHours()).padStart(2, "0");
      const minutes = String(dateObj.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    const payload = {
      movie_id: parseInt(formData.movieId),
      room_id: parseInt(selectedRoom), // Đảm bảo selectedRoom có giá trị
      start_time: formatLocalToApi(startDateTime),
      end_time: formatLocalToApi(calculatedEndDateTime),
      screen_type: formData.screenType,
      translation_type: formData.translationType,
    };

    console.log("Payload being sent:", payload); // Kiểm tra lại payload trước khi gửi

    try {
      let res;
      if (editingShowtime && editingShowtime.id) {
        res = await updateShowtime.mutateAsync({
          showtimeId: editingShowtime.id,
          showtimeData: payload,
        });
        if (res?.data?.status === false) {
          toast.error(res?.data?.message || "Cập nhật suất chiếu thất bại");
          return;
        }
        toast.success(res?.data?.message || "Cập nhật suất chiếu thành công");
      } else {
        res = await createShowtime.mutateAsync(payload);
        if (res?.data?.status === false) {
          toast.error(res?.data?.message || "Thêm suất chiếu thất bại");
          return;
        }
        toast.success(res?.data?.message || "Thêm suất chiếu thành công");
      }
      setEditingShowtime(null);
      setIsFormVisible(false);
      handleSearch();
    } catch (err) {
      if (err?.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();

        Swal.fire({
          title: "Thất bại!",
          html: errorMessages
            .map(
              (msg) =>
                `<div><FaExclamationTriangle className="inline mr-1"/> ${msg}</div>`
            )
            .join("<br/>"),
          icon: "error",
        });
        return;
      }

      Swal.fire(
        "Thất bại!",
        getApiMessage(err, "Có lỗi khi thêm/sửa suất chiếu!"),
        "error"
      );
    }
  };

  const handleAddShowtime = () => {
    setEditingShowtime({
      date: selectedDate,
    });
    setIsFormVisible(true);
  };
  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingShowtime(null);
  };

  const handleViewSeats = (showtimeId) => {
    setSelectedShowtimeId(showtimeId);
    setShowSeatMapModal(true);
  };
  const handleCloseSeatMap = () => {
    setShowSeatMapModal(false);
    setSelectedShowtimeId(null);
  };

  const {
    data: seatMapData,
    isLoading: isLoadingSeatMap,
    isError: isErrorSeatMap,
    error: errorSeatMap,
  } = useGetSeatMapUS(selectedShowtimeId, {
    enabled: showSeatMapModal && !!selectedShowtimeId,
  });

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <form
        className="flex flex-col md:flex-row gap-4 items-end bg-white rounded-xl shadow-md p-4 sm:p-6"
        onSubmit={handleSearch}
      >
        <div className="flex-1">
          <label className="block font-semibold mb-1">Rạp chiếu:</label>
          {userData.role === "cinema_manager" ||
          userData.role === "showtime_manager" ? (
            <div className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 font-medium">
              {userCinemaData?.data?.cinema_name ||
                userCinemaData?.data?.name ||
                "Đang tải..."}
            </div>
          ) : (
            <select
              value={selectedCinema}
              onChange={(e) => setSelectedCinema(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
              required
            >
              <option value="">Select a cinema</option>
              {cinemas.map((cinema) => (
                <option key={cinema.cinema_id} value={cinema.cinema_id}>
                  {cinema.cinema_name || cinema.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Phòng chiếu:</label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
            disabled={!selectedCinema}
            required
          >
            <option value="">Select a auditorium</option>
            {rooms.map((room) => (
              <option key={room.room_id} value={room.room_id}>
                {room.room_name || room.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Ngày chiếu:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
          >
            <option value="">Tất cả</option>
            <option value="Sắp chiếu">Sắp chiếu</option>
            <option value="Đang chiếu">Đang chiếu</option>
            <option value="Đã chiếu">Đã chiếu</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold shadow-md transition-all cursor-pointer"
        >
          <FaSearch className="mr-2" />
          Tìm kiếm
        </button>
      </form>
      <div className="w-full">
        <Modal open={isFormVisible} onClose={handleCancelEdit}>
          <div className="min-w-[450px] max-w-[550px] min-h-[400px] max-h-[600px] overflow-y-auto">
            <ShowtimeForm
              initialData={editingShowtime}
              onSubmit={handleAddOrUpdateShowtime}
              onCancel={handleCancelEdit}
              movies={movies}
              mode={editingShowtime?.id ? "edit" : "add"}
              defaultDate={selectedDate}
            />
          </div>
        </Modal>

        <div className="bg-white rounded-xl shadow-lg overflow-auto">
          {/* Thông tin phía trên bảng */}
          <div className="mb-4">
            <div className="text-center font-semibold">
              Lịch chiếu ngày:{" "}
              {selectedDate &&
                new Date(selectedDate).toLocaleDateString("vi-VN")}
            </div>
            <div className="bg-blue-500 text-white text-center py-2 my-2 font-semibold">
              Rạp:{" "}
              {(() => {
                const cinema = cinemas.find(
                  (c) => String(c.cinema_id) === String(selectedCinema)
                );
                return cinema?.cinema_name || cinema?.name || "";
              })()}
            </div>
            <div className="text-purple-600 font-semibold mb-2">
              {(() => {
                const room = rooms.find(
                  (r) => String(r.room_id) === String(selectedRoom)
                );
                return room?.room_name || room?.name || "";
              })()}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Số phim có sẵn: {movies.length} phim
            </div>
          </div>
          <ShowtimeTable
            showtimes={showtimes}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReactivate={handleReactivateClick} // Cập nhật prop để sử dụng hàm mới
            loading={loading}
            handleViewSeats={handleViewSeats}
          />
          <div className="flex justify-start mt-4 p-4">
            {movies.length === 0 && selectedCinema && (
              <div className="flex items-center text-orange-600 mb-2">
                <FaExclamationCircle className="mr-2" />
                <span>Không có phim nào được lên lịch chiếu cho rạp này</span>
              </div>
            )}
            <button
              onClick={handleAddShowtime}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-semibold cursor-pointer"
              disabled={!selectedRoom || !selectedCinema || movies.length === 0}
            >
              <FaPlus className="mr-2" />
              Thêm suất chiếu
            </button>
          </div>
        </div>
        {/* Modal hiển thị sơ đồ ghế */}
        {showSeatMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-lg p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
                onClick={handleCloseSeatMap}
              >
                &times;
              </button>
              <h3 className="text-lg font-bold mb-4 text-center">
                Sơ đồ ghế phòng chiếu
              </h3>
              {isLoadingSeatMap ? (
                <div>Đang tải sơ đồ ghế...</div>
              ) : isErrorSeatMap ? (
                <div className="text-red-500">
                  Lỗi: {errorSeatMap?.message || "Không thể tải sơ đồ ghế"}
                </div>
              ) : seatMapData?.data ? (
                <>
                  <div className="w-full bg-gray-800 text-white text-center py-2 rounded mb-4">
                    MÀN HÌNH
                  </div>
                  <div className="flex flex-col items-center overflow-x-auto">
                    {(() => {
                      let seatRows = seatMapData.data?.seat_map || [];
                      return seatRows.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex items-center">
                          {row.map((seat, seatIdx) => (
                            // Thêm điều kiện kiểm tra
                            <React.Fragment key={seatIdx}>
                              {seat ? (
                                <Seat
                                  key={seat.seat_id}
                                  label={seat.seat_display_name}
                                  type={
                                    seat.status === "unavailable"
                                      ? "unavailable"
                                      : seat.status === "booked"
                                      ? "booked"
                                      : "normal"
                                  }
                                />
                              ) : (
                                <div className="w-8 h-8 m-1" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      ));
                    })()}
                  </div>
                  {/* Chú thích */}
                  <div className="flex justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-purple-600" />{" "}
                      <span>Ghế thường</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500" />{" "}
                      <span>Ghế đã đặt</span>
                    </div>
                  </div>
                </>
              ) : (
                <div>Không có dữ liệu ghế.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimeManagement;
