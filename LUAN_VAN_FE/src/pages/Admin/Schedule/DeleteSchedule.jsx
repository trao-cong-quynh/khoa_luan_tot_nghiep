import React, { useState, useEffect, useContext } from "react";
import {
  useGetDeleteAllMovieSchedulesUS,
  useRestoreScheduleUS,
  useGetPhimUS,
  useGetAllCinemasUS,
  useGetPhimTheoRapUS,
  useGetManagedMoviesUS,
  useGetCinemaByIdUS,
} from "../../../api/homePage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import ScheduleTable from "../../../components/admin/Schedule/ScheduleTable";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";
import { AuthContext } from "../../../contexts/AuthContext";

const DeleteSchedule = () => {
  const queryClient = useQueryClient();

  // State cho tìm kiếm, lọc, phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMovie, setFilterMovie] = useState("");
  const [filterCinema, setFilterCinema] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState("");

  // Lấy userData từ AuthContext
  const { userData } = useContext(AuthContext);
  const role =
    userData?.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");
  const cinemaId = userData?.cinema_id;

  // === FETCHING DATA DỰA TRÊN ROLE ===

  const {
    data,
    isLoading: isSchedulesLoading,
    error: schedulesError,
  } = useGetDeleteAllMovieSchedulesUS({ staleTime: 0 });
  const schedules = Array.isArray(data?.data) ? data.data : [];

  const {
    data: phimTheoRapData,
    isLoading: loadingPhimTheoRap,
    error: phimTheoRapError,
  } = useGetPhimTheoRapUS(cinemaId, {
    enabled:
      !!cinemaId &&
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
      !cinemaId ||
      (role !== "cinema_manager" &&
        role !== "showtime_manager" &&
        role !== "manager_district"),
  });

  const {
    data: managedMoviesData,
    isLoading: loadingManagedMovies,
    error: managedMoviesError,
  } = useGetManagedMoviesUS({});

  const [movieList, setMovieList] = useState([]);

  useEffect(() => {
    let finalMovieList = [];
    if (
      (role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district") &&
      cinemaId
    ) {
      finalMovieList = phimTheoRapData?.data?.movies ?? [];
    } else if (role === "manager_district") {
      finalMovieList = managedMoviesData?.data?.movies ?? [];
    } else {
      finalMovieList = allMoviesData?.data?.movies ?? [];
    }
    setMovieList(finalMovieList);
  }, [phimTheoRapData, allMoviesData, managedMoviesData, cinemaId, role]);

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
  } = useGetCinemaByIdUS(cinemaId, {
    enabled:
      !!cinemaId &&
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
        defaultFilterCinemaId = cinemaId;
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
  }, [allCinemasData, userCinemaData, cinemaId, role, filterCinema]);

  const restoreSchedule = useRestoreScheduleUS();
  const isRestoring = restoreSchedule.isPending;

  const isLoading =
    isSchedulesLoading ||
    loadingAllMovies ||
    loadingPhimTheoRap ||
    loadingManagedMovies ||
    loadingAllCinemas ||
    loadingUserCinema;

  const hasError =
    schedulesError ||
    phimTheoRapError ||
    allMoviesError ||
    managedMoviesError ||
    allCinemasError ||
    userCinemaError;

  // Lọc và tìm kiếm lịch chiếu đã xóa
  const filteredSchedules = schedules.filter((item) => {
    // Lọc theo phim
    if (filterMovie && String(item.movie_id) !== String(filterMovie)) {
      return false;
    }

    // Lọc theo rạp
    if (
      (role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district") &&
      cinemaId
    ) {
      if (String(item.cinema_id) !== String(cinemaId)) {
        return false;
      }
    } else {
      if (filterCinema && String(item.cinema_id) !== String(filterCinema))
        return false;
    }

    // Lọc theo trạng thái
    if (filterStatus) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = item.start_date ? new Date(item.start_date) : null;
      const end = item.end_date ? new Date(item.end_date) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      if (filterStatus === "past") {
        if (!end || today <= end) return false;
      } else if (filterStatus === "current") {
        if (!start || !end || today < start || today > end) return false;
      } else if (filterStatus === "upcoming") {
        if (!start || today >= start) return false;
      }
    }

    // Tìm kiếm theo tên phim hoặc rạp
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMovie, filterCinema, filterStatus]);

  const handleAskRestore = (scheduleId) => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: "Bạn muốn khôi phục lịch chiếu này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Vâng, khôi phục nó!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreSchedule.mutate(scheduleId, {
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              handleApiError(response.data, "Khôi phục lịch chiếu thất bại");
              return;
            }
            toast.success(
              getApiMessage(response, "Khôi phục lịch chiếu thành công")
            );
            queryClient.invalidateQueries({
              queryKey: ["getDeleteAllMovieSchedulesAPI"],
            });
            queryClient.invalidateQueries({
              queryKey: ["getDeleteAllMovieSchedulesAPI"],
            });
          },
          onError: (error) => {
            toast.error(getApiMessage(error, "Không thể khôi phục lịch chiếu"));
          },
        });
      }
    });
  };

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
              queryClient.invalidateQueries();
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
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight mb-4 sm:mb-0">
          Danh sách Lịch chiếu đã xóa
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
      </div>

      <div className="w-full max-h-[100vh]">
        <div className="rounded-xl shadow-lg overflow-auto">
          <ScheduleTable
            schedules={paginatedSchedules}
            movieList={movieList}
            cinemaList={cinemaList}
            onRestore={handleAskRestore}
            loading={isLoading}
            isDeleting={isRestoring}
            isDeletedView={true}
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
    </div>
  );
};

export default DeleteSchedule;
