import React, { useState, useContext } from "react";
import MovieTable from "../../../components/admin/Movie/MovieTable";
import MovieForm from "../../../components/admin/Movie/MovieForm";
import { toast } from "react-toastify";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  useGetPhimUS,
  useGetManagedMoviesUS,
  useCreatePhimUS,
  useUpdatePhimUS,
  useDeletePhimUS,
  useGetScreenTypeUS,
} from "../../../api/homePage/queries";
import Modal from "../../../components/ui/Modal";
import MovieDetailModalContent from "../../../components/ui/MovieDetailModalContent";
import ModalPhim from "../../../components/ui/Modal_phim";
import { AuthContext } from "../../../contexts/AuthContext";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";
const ITEMS_PER_PAGE = 10;

const MovieManagement = () => {
  const [editingMovie, setEditingMovie] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [detailModal, setDetailModal] = useState({ open: false, movie: null });
  const [trailerModal, setTrailerModal] = useState({ open: false, url: null });

  // Lấy role hiện tại từ AuthContext
  const { userData } = useContext(AuthContext);
  const role =
    userData?.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");

  // Luôn gọi cả hai hook
  const {
    data: allMoviesData,
    isLoading: loadingAll,
    error: errorAll,
    refetch: fetchAllMovies,
  } = useGetPhimUS();

  const {
    data: managedMoviesData,
    isLoading: loadingManaged,
    error: errorManaged,
    refetch: fetchManagedMovies,
  } = useGetManagedMoviesUS();

  // Lấy danh sách hình thức chiếu
  const { data: screenTypeData } = useGetScreenTypeUS();
  const screenTypes = Array.isArray(screenTypeData?.data?.screentype)
    ? screenTypeData.data.screentype.map((s) => ({
        id: s.screening_type_id,
        name: s.screening_type_name,
      }))
    : [];
  const moviesData =
    role === "district_manager" ? managedMoviesData : allMoviesData;
  const loading = role === "district_manager" ? loadingManaged : loadingAll;
  const error = role === "district_manager" ? errorManaged : errorAll;
  const fetchMovies =
    role === "district_manager" ? fetchManagedMovies : fetchAllMovies;

  const { mutate: createMovie, isLoading: isCreating } = useCreatePhimUS({
    onSuccess: (response) => {
      if (response?.status === false) {
        console.log("API Response:", response);
        handleApiError(response, "Thêm phim mới thất bại");
        return;
      }
      toast.success(response.message || "Thêm phim mới thành công");
      setIsFormVisible(false);
      fetchMovies();
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Không thể thêm phim mới"));
    },
  });

  const { mutate: updateMovie, isLoading: isUpdating } = useUpdatePhimUS({
    onSuccess: (response) => {
      if (response?.data?.status === false) {
        handleApiError(response.data, "Cập nhật phim thất bại");
        return;
      }
      toast.success(response.message || "Cập nhật phim thành công");
      setIsFormVisible(false);
      fetchMovies();
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Không thể cập nhật phim"));
    },
  });

  const { mutate: deleteMovie, isLoading: isDeleting } = useDeletePhimUS({
    onSuccess: (response) => {
      console.log("API Response:", response);
      if (response?.data?.status === false) {
        Swal.fire(
          "Thất bại!",
          response?.message || "Xóa phim thất bại",
          "error"
        );
        handleApiError(response.data, "Xóa phim thất bại");
        return;
      }
      Swal.fire(
        "Thành công!",
        response.message || "Xóa phim thành công",
        "success"
      );
      fetchMovies();
    },
    onError: (error) => {
      Swal.fire(
        // <-- SỬ DỤNG SWEETALERT2
        "Thất bại!",
        getApiMessage(error, "Không thể xóa phim"),
        "error"
      );
    },
  });

  const handleAddMovie = () => {
    setEditingMovie(null);
    setIsFormVisible(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setIsFormVisible(true);
  };

  const handleSaveMovie = async (movieData) => {
    try {
      // Lấy id từ FormData
      const id = movieData.get("id") || movieData.get("movie_id");
      if (id) {
        updateMovie({ ma_phim: id, movieData });
      } else {
        // console.log("[MovieManagement] Gọi createMovie");
        createMovie(movieData);
      }
    } catch (error) {
      console.error("Error saving movie:", error);
    }
  };

  const handleDeleteMovie = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true, // Đảo ngược vị trí nút để "Hủy" bên trái, "Xóa" bên phải
      confirmButtonColor: "#dc2626",
      allowOutsideClick: false, // Ngăn đóng khi click ra ngoài
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMovie(id); // Gọi mutation xóa phim
      }
    });
  };
  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingMovie(null);
  };
  const movies = moviesData?.data?.movies || moviesData?.data || [];
  const filteredMovies = Array.isArray(movies)
    ? movies.filter((movie) => {
        const matchTitle = (movie.movie_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus ? movie.status === filterStatus : true;
        return matchTitle && matchStatus;
      })
    : [];

  // Phân trang
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Đã xảy ra lỗi</p>
          <p>{error.message}</p>
          <button
            onClick={() => fetchMovies()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-2 space-y-6 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Quản lý Phim
        </h1>
        {!isFormVisible && (
          <button
            onClick={handleAddMovie}
            disabled={isCreating}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r 
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base 
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaPlus className="mr-2" />
            {isCreating ? "Đang thêm..." : "Thêm phim mới"}
          </button>
        )}
      </div>

      {!isFormVisible && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-3">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                bg-gray-50 transition"
              />
            </div>
            <div className="flex-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                bg-gray-50 transition cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Đang chiếu">Đang chiếu</option>
                <option value="Sắp chiếu">Sắp chiếu</option>
                <option value="Đã kết thúc">Đã kết thúc</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {isFormVisible ? (
          <div className="bg-white rounded-xl shadow-lg max-w-7xl mx-auto">
            <MovieForm
              movieToEdit={editingMovie}
              onSave={handleSaveMovie}
              onCancel={handleCancelEdit}
              isSubmitting={isCreating || isUpdating}
              screenTypes={screenTypes}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg mx-auto overflow-y-auto">
            <MovieTable
              movies={paginatedMovies}
              onEdit={handleEditMovie}
              onDelete={handleDeleteMovie}
              loading={loading}
              isDeleting={isDeleting}
              onRowClick={(movie) => setDetailModal({ open: true, movie })}
              onShowTrailer={(url) => setTrailerModal({ open: true, url })}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 py-4 border-t">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Trước
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Modal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, movie: null })}
      >
        {detailModal.movie && (
          <MovieDetailModalContent movie={detailModal.movie} />
        )}
      </Modal>
      {/* <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, id: null })}
      >
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Bạn có chắc chắn muốn xóa phim này không? Hành động này không thể
            hoàn tác.
          </h2>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Xác nhận
            </button>
            <button
              onClick={() => setConfirmModal({ open: false, id: null })}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Hủy
            </button>
          </div>
        </div>
      </Modal> */}
      <ModalPhim
        open={trailerModal.open}
        onClose={() => setTrailerModal({ open: false, url: null })}
      >
        {trailerModal.url && (
          <div className="aspect-video w-[350px] sm:w-[500px]">
            <iframe
              src={trailerModal.url}
              title="Trailer"
              allowFullScreen
              className="w-full h-56 sm:h-72 rounded-lg border"
            />
          </div>
        )}
      </ModalPhim>
    </div>
  );
};

export default MovieManagement;
