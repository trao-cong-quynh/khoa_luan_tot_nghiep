import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDeletedMoviesUS,
  useRestoreMovieUS,
} from "../../../api/homePage/queries";
import MovieTable from "../../../components/admin/Movie/MovieTable";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import Modal from "../../../components/ui/Modal";
import MovieDetailModalContent from "../../../components/ui/MovieDetailModalContent";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 10;

const DeletedMovies = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const queryClient = useQueryClient();
  const [detailModal, setDetailModal] = useState({ open: false, movie: null });

  const {
    data: deletedMoviesResponse,
    isLoading,
    error,
  } = useGetDeletedMoviesUS({
    onError: (err) => {
      console.error("Lỗi khi lấy danh sách phim đã xóa: ", err);
      const errorMessage =
        err.response?.message || "Không thể tải danh sách phim đã xóa!";
      toast.error(errorMessage);
    },
  });

  const { mutate: restoreMovieMutation, isLoading: isRestoring } =
    useRestoreMovieUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Khôi phục phim thất bại");
          return;
        }
        toast.success(getApiMessage(response, "Khôi phục phim thành công"));
        queryClient.invalidateQueries({ queryKey: ["GetDeletedMoviesAPI"] });
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể khôi phục phim"));
      },
    });

  const handleRestoreMovie = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: "Bạn muốn khôi phục bộ phim này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Vâng, khôi phục nó!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreMovieMutation(id);
      }
    });
  };

  const movies = deletedMoviesResponse?.data?.movies || [];

  const filteredMovies = Array.isArray(movies)
    ? movies.filter((movie) => {
        const matchTitle = (movie.movie_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus ? movie.status === filterStatus : true;
        return matchTitle && matchStatus;
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const paginatedMovies = filteredMovies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Danh sách phim đã xóa
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-3">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            />
          </div>
          <div className="flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang chiếu">Đang chiếu</option>
              <option value="Sắp chiếu">Sắp chiếu</option>
              <option value="Đã kết thúc">Đã kết thúc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-auto">
          {isLoading ? (
            <p className="p-4 text-center text-gray-500">
              Đang tải danh sách phim...
            </p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">
              Có lỗi xảy ra khi tải phim: {error.message}
            </p>
          ) : paginatedMovies.length === 0 ? (
            <p className="p-4 text-center text-gray-500 ">
              Không có phim nào đã xóa mềm hoặc không khớp với tiêu chí tìm
              kiếm/lọc.
            </p>
          ) : (
            <MovieTable
              movies={paginatedMovies}
              onEdit={() => {}}
              onDelete={handleRestoreMovie}
              loading={isLoading}
              isDeleting={isRestoring}
              isDeletedView={true}
              onRowClick={(movie) => setDetailModal({ open: true, movie })}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4 border-t">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-lg ${
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
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
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
      </div>
    </div>
  );
};

export default DeletedMovies;
