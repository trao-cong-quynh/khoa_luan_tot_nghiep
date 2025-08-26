import React, { useState, useEffect, useContext } from "react";
import ScheduleTable from "../../../components/admin/Schedule/ScheduleTable.jsx";
import ScheduleForm from "../../../components/admin/Schedule/ScheduleForm.jsx";
import Modal from "../../../components/ui/Modal"; // Vẫn dùng cho form thêm/sửa
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  useGetAllMovieSchedulesUS,
  useCreateMovieScheduleUS,
  useUpdateMovieScheduleUS,
  useDeleteMovieScheduleUS,
  useGetPhimUS,
  useGetManagedMoviesUS,
  useGetAllCinemasUS,
  useGetCinemaByIdUS,
  useGetPhimTheoRapUS,
} from "../../../api/homePage/queries";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  getApiMessage,
  handleApiError,
} from "../../../Utilities/apiMessage.js";
import Swal from "sweetalert2"; // Đảm bảo đã import

const ScheduleManagement = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const queryClient = useQueryClient();

  // State cho tìm kiếm, lọc, phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMovie, setFilterMovie] = useState("");
  const [filterCinema, setFilterCinema] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState(""); // "", "past", "current", "upcoming"

  // Lấy userData từ AuthContext
  const { userData } = useContext(AuthContext);
  const role =
    userData.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");

  // Lấy danh sách lịch chiếu
  const {
    data: SchedulesData,
    isLoading: loadingSchedules,
    error: schedulesError, // Thêm biến error cho schedules
  } = useGetAllMovieSchedulesUS();
  const schedules = SchedulesData?.data || [];

  // Lấy danh sách phim theo role
  const {
    data: phimTheoRapData,
    isLoading: loadingPhimTheoRap,
    error: phimTheoRapError,
  } = useGetPhimTheoRapUS(userData?.cinema_id, {
    enabled:
      !!userData?.cinema_id &&
      (role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district"),
  });

  const {
    data: allMoviesData,
    isLoading: loadingAllMovies,
    error: allMoviesError, 
  } = useGetPhimUS({
    enabled:
      !userData?.cinema_id ||
      (role !== "cinema_manager" &&
        role !== "showtime_manager" &&
        role !== "manager_district"),
  });

  const {
    data: managedMoviesData,
    isLoading: loadingManagedMovies,
    error: managedMoviesError,
  } = useGetManagedMoviesUS({
    enabled: role === "manager_district",
  });

  const [movieList, setMovieList] = useState([]);

  useEffect(() => {
    let finalMovieList = [];
    if (
      (role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district") &&
      userData.cinema_id
    ) {
      finalMovieList = phimTheoRapData?.data?.movies ?? [];
    } else if (role === "manager_district") {
      finalMovieList = managedMoviesData?.data?.movies ?? [];
    } else {
      finalMovieList = allMoviesData?.data?.movies ?? [];
    }
    setMovieList(finalMovieList);
  }, [
    phimTheoRapData,
    allMoviesData,
    managedMoviesData,
    userData.cinema_id,
    role,
  ]);

  // Lấy danh sách rạp chiếu theo role
  const {
    data: allCinemasData,
    isLoading: loadingAllCinemas,
    error: allCinemasError,
  } = useGetAllCinemasUS({
    enabled:
      role === "admin" ||
      (role !== "cinema_manager" &&
        role !== "showtime_manager" &&
        role !== "manager_district"),
  });

  const {
    data: userCinemaData,
    isLoading: loadingUserCinema,
    error: userCinemaError,
  } = useGetCinemaByIdUS(userData?.cinema_id, {
    enabled:
      !!userData?.cinema_id &&
      (role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district"),
  });

  const [cinemaList, setCinemaList] = useState([]);

  useEffect(() => {
    let finalCinemaList = [];
    let defaultFilterCinemaId = "";

    if (
      role === "cinema_manager" ||
      role === "showtime_manager" ||
      role === "manager_district"
    ) {
      if (userCinemaData?.data) {
        finalCinemaList = [userCinemaData.data];
        defaultFilterCinemaId = userData.cinema_id;
      }
    } else {
      if (allCinemasData?.data) {
        finalCinemaList = allCinemasData.data;
      }
    }
    setCinemaList(finalCinemaList);

    if (defaultFilterCinemaId && !filterCinema) {
      setFilterCinema(defaultFilterCinemaId);
    } else if (
      finalCinemaList.length > 0 &&
      !filterCinema &&
      role === "admin"
    ) {
      setFilterCinema(finalCinemaList[0].cinema_id);
    }
  }, [allCinemasData, userCinemaData, userData.cinema_id, role, filterCinema]);


  const { mutate: createSchedule, isPending: isCreatingSchedule } =
    useCreateMovieScheduleUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Thêm lịch chiếu mới thất bại");
          return;
        }
        toast.success("Thêm lịch chiếu thành công");
        setIsFormVisible(false);
        queryClient.invalidateQueries(["GetAllMovieSchedulesAPI"]);
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể thêm lịch chiếu mới"));
      },
    });

  const { mutate: updateSchedule, isPending: isUpdatingSchedule } =
    useUpdateMovieScheduleUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Cập nhật lịch chiếu thất bại");
          return;
        }
        toast.success("Cập nhật lịch chiếu thành công");
        setIsFormVisible(false);
        setEditingSchedule(null);
        queryClient.invalidateQueries(["GetAllMovieSchedulesAPI"]);
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể cập nhật lịch chiếu"));
      },
    });

  const { mutate: deleteScheduleMutation, isPending: isDeletingSchedule } =
    useDeleteMovieScheduleUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          Swal.fire(
            "Thất bại!",
            response?.data?.message || "Xóa lịch chiếu thất bại",
            "error"
          );
          return;
        }
        Swal.fire(
          "Thành công!",
          response?.data?.message || "Xóa lịch chiếu thành công",
          "success"
        );
        queryClient.invalidateQueries(["GetAllMovieSchedulesAPI"]);
      },
      onError: (error) => {
        Swal.fire(
          "Thất bại!",
          getApiMessage(error, "Không thể xóa lịch chiếu"),
          "error"
        );
      },
    });

  // Xử lý Thêm/Cập nhật
  const handleAddOrUpdateSchedule = (data) => {
    if (editingSchedule) {
      updateSchedule({ id: editingSchedule.movie_schedule_id, data });
    } else {
      createSchedule(data);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true, // Đảo ngược vị trí nút để "Hủy" bên trái, "Xóa" bên phải
      confirmButtonColor: "#dc2626", // Màu đỏ cho nút xóa
      allowOutsideClick: false, // Ngăn đóng khi click ra ngoài
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteScheduleMutation(id); // Gọi mutation xóa lịch chiếu
      }
    });
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingSchedule(null);
  };

  // Lọc và tìm kiếm lịch chiếu
  const filteredSchedules = schedules.filter((item) => {
    // Lọc theo phim
    if (filterMovie && String(item.movie_id) !== String(filterMovie)) {
      return false;
    }

    // Lọc theo rạp (áp dụng filterCinema nếu là admin, hoặc userCinemaId nếu là manager)
    if (
      (role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district") &&
      userData.cinema_id
    ) {
      if (String(item.cinema_id) !== String(userData.cinema_id)) {
        return false;
      }
    } else {
      if (filterCinema && String(item.cinema_id) !== String(filterCinema))
        return false;
    }

    // Lọc theo trạng thái chiếu
    if (filterStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Chuẩn hóa về đầu ngày để so sánh
      const start = item.start_date ? new Date(item.start_date) : null;
      const end = item.end_date ? new Date(item.end_date) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999); // Chuẩn hóa về cuối ngày

      if (filterStatus === "past") {
        if (!end || today <= end) return false;
      } else if (filterStatus === "current") {
        if (!start || !end || today < start || today > end) return false;
      } else if (filterStatus === "upcoming") {
        if (!start || today >= start) return false;
      }
    }

    // Tìm kiếm theo tên phim hoặc rạp (nếu có dữ liệu)
    const movie = movieList.find(
      (m) => String(m.movie_id) === String(item.movie_id)
    );
    const cinema = cinemaList.find(
      (c) => String(c.cinema_id) === String(item.cinema_id)
    );
    const movieName = movie?.movie_name || movie?.title || movie?.name || "";
    const cinemaName = cinema?.cinema_name || cinema?.name || "";

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      if (
        !movieName.toLowerCase().includes(lower) &&
        !cinemaName.toLowerCase().includes(lower)
      ) {
        return false;
      }
    }
    return true;
  });

  // Phân trang
  const totalItems = filteredSchedules.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Khi filter/search thay đổi thì reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMovie, filterCinema, filterStatus]);

  // Kiểm tra lỗi tổng thể để hiển thị thông báo lỗi
  const hasError =
    schedulesError ||
    phimTheoRapError ||
    allMoviesError ||
    managedMoviesError ||
    allCinemasError ||
    userCinemaError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">
            Đã xảy ra lỗi khi tải dữ liệu
          </p>
          <p>{hasError.message || "Vui lòng thử lại sau."}</p>
          <button
            onClick={() => {
              // Thêm logic refetch tất cả các query liên quan ở đây nếu cần
              queryClient.invalidateQueries(); // Để refetch tất cả các query đang active
            }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Quản lý Lịch chiếu
        </h1>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 items-center bg-white p-4 rounded-xl shadow-md">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên phim hoặc rạp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
        />
        <select
          value={filterMovie}
          onChange={(e) => setFilterMovie(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-64"
        >
          <option value="">Tất cả phim</option>
          {movieList.map((movie) => (
            <option key={movie.movie_id} value={movie.movie_id}>
              {movie.movie_name || movie.title || movie.name}
            </option>
          ))}
        </select>
        {/* Conditional rendering cho dropdown rạp */}
        {role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district" ? (
          <div className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 font-medium sm:w-64">
            {cinemaList.length > 0
              ? cinemaList[0].cinema_name || cinemaList[0].name
              : "Đang tải..."}
          </div>
        ) : (
          <select
            value={filterCinema}
            onChange={(e) => setFilterCinema(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full sm:w-48"
          >
            <option value="">Tất cả rạp</option>
            {cinemaList.map((cinema) => (
              <option key={cinema.cinema_id} value={cinema.cinema_id}>
                {cinema.cinema_name || cinema.name}
              </option>
            ))}
          </select>
        )}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full sm:w-48"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="past">Đã chiếu</option>
          <option value="current">Đang chiếu</option>
          <option value="upcoming">Sắp chiếu</option>
        </select>
        <button
          onClick={handleAddSchedule}
          className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base cursor-pointer"
        >
          <FaPlus className="mr-2" />
          Thêm lịch chiếu
        </button>
      </div>

      <div className="w-full max-h-[100vh]">
        <div className=" rounded-xl shadow-lg overflow-auto ">
          <ScheduleTable
            schedules={paginatedSchedules}
            movieList={movieList}
            cinemaList={cinemaList}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loadingSchedules}
            isDeleting={isDeletingSchedule}
          />
        </div>
        {/* Pagination */}
        <div className="bg-white h-14 flex justify-center items-center gap-2 mt-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 cursor-pointer"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modal hiển thị form thêm/sửa - Vẫn giữ nguyên */}
      <Modal open={isFormVisible} onClose={handleCancelEdit}>
        <div className="max-w-md mx-auto">
          <ScheduleForm
            movieList={movieList}
            cinemaList={cinemaList}
            initialData={editingSchedule}
            onSubmit={handleAddOrUpdateSchedule}
            onCancel={handleCancelEdit}
            loading={
              loadingAllMovies ||
              loadingManagedMovies ||
              loadingPhimTheoRap ||
              loadingAllCinemas ||
              loadingUserCinema ||
              isCreatingSchedule ||
              isUpdatingSchedule
            }
          />
        </div>
      </Modal>
    </div>
  );
};

export default ScheduleManagement;
