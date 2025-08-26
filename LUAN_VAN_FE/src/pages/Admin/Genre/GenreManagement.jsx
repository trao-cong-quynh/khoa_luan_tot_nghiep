import React, { useState } from "react";
import GenreForm from "../../../components/admin/Genre/GenreForm";
import GenreTable from "../../../components/admin/Genre/GenreTable";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  useGetAllGenresUS,
  useCreateGenreUS,
  useUpdateGenreUS,
  useDeleteGenreUS,
  useRestoreGenreUS,
} from "../../../api/homePage/queries";
import { toast } from "react-toastify";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 10;

const GenreManagement = () => {
  const [editingGenre, setEditingGenre] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  const {
    data: genresData,
    isLoading: loading,
    error,
    refetch: fetchGenres, 
  } = useGetAllGenresUS();

  const { mutate: createGenre, isLoading: isCreating } = useCreateGenreUS({
    onSuccess: (response) => {
      if (response?.data?.status === false) {
        handleApiError(response.data, "Thêm thể loại mới thất bại");
        return;
      }
      toast.success("Thêm thể loại thành công!");
      setIsFormVisible(false);
      fetchGenres();
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Không thể thêm thể loại mới"));
    },
  });

  const { mutate: updateGenre, isLoading: isUpdating } = useUpdateGenreUS({
    onSuccess: (response) => {
      if (response?.data?.status === false) {
        handleApiError(response.data, "Cập nhật thể loại thất bại");
        return;
      }
      toast.success("Cập nhật thể loại thành công!");
      setIsFormVisible(false);
      setEditingGenre(null);
      fetchGenres();
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Không thể cập nhật thể loại"));
    },
  });

  const { mutate: deleteGenre, isLoading: isDeleting } = useDeleteGenreUS({
    onSuccess: (response) => {
      if (response?.data?.status === false) {
        Swal.fire(
          "Thất bại!",
          response?.data?.message || "Xóa thể loại thất bại",
          "error"
        );
        return;
      }
      Swal.fire(
        "Thành công!",
        response?.data?.message || "Xóa thể loại thành công!",
        "success"
      );
      fetchGenres();
    },
    onError: (error) => {
      Swal.fire(
        "Thất bại!",
        getApiMessage(error, "Có lỗi xảy ra khi xóa thể loại!"),
        "error"
      );
    },
  });

  const { mutate: restoreGenre, isLoading: isRestoring } = useRestoreGenreUS({
    onSuccess: () => {
      toast.success("Khôi phục thể loại thành công!");
      fetchGenres();
    },
    onError: (error) => {
      toast.error("Khôi phục thể loại thất bại: " + error.message);
    },
  });

  const handleAddGenre = () => {
    setEditingGenre(null);
    setIsFormVisible(true);
  };

  const handleEdit = (genre) => {
    setEditingGenre(genre);
    setIsFormVisible(true);
  };

  const handleSaveGenre = async (genreData) => {
    try {
      if (genreData.genre_id) {
        updateGenre({ genreId: genreData.genre_id, genreData });
      } else {
        createGenre(genreData);
      }
    } catch (err) {
      console.error("Error saving genre:", err);
      toast.error(getApiMessage(err, "Có lỗi xảy ra khi lưu thể loại!"));
    }
  };

  const handleDelete = (genreId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      confirmButtonColor: "#dc2626",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteGenre(genreId);
      }
    });
  };

  const handleRestore = (genreId) => {
    // Swal.fire cho xác nhận khôi phục cũng là một lựa chọn tốt
    Swal.fire({
      title: "Xác nhận khôi phục!",
      text: "Bạn có chắc chắn muốn khôi phục thể loại này không?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        restoreGenre(genreId);
      }
    });
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingGenre(null);
  };

  // Xử lý dữ liệu thể loại
  // genresData?.data?.genres => genresData?.data nếu API trả về trực tiếp mảng
  const genres = Array.isArray(genresData?.data) ? genresData.data : [];
  console.log("Genres data from API hook (GenreManagement):", genres);
  const filteredGenres = genres.filter((genre) => {
    const matchSearch = (genre.genre_name || "") // Đảm bảo genre_name không null
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredGenres.length / ITEMS_PER_PAGE);
  const paginatedGenres = filteredGenres.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Hiển thị lỗi chung nếu có lỗi từ useGetAllGenresUS
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">
            Đã xảy ra lỗi khi tải dữ liệu
          </p>
          <p>{error.message}</p>
          <button
            onClick={() => fetchGenres()}
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
          Quản lý Thể loại
        </h1>

        {!isFormVisible && (
          <button
            onClick={handleAddGenre}
            disabled={isCreating} // Vô hiệu hóa khi đang tạo
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="mr-2" />
            {isCreating ? "Đang thêm..." : "Thêm thể loại mới"}
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
                placeholder="Tìm kiếm thể loại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
              />
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        {isFormVisible ? (
          <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto">
            {" "}
            {/* Giới hạn chiều rộng của form */}
            <GenreForm
              initialData={editingGenre}
              onSubmit={handleSaveGenre}
              onCancel={handleCancelEdit}
              isSubmitting={isCreating || isUpdating} // Truyền trạng thái đang submit
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-auto">
            <GenreTable
              genres={paginatedGenres}
              onEdit={handleEdit}
              onDelete={handleDelete} // Gọi hàm handleDelete đã được sửa đổi
              onRestore={handleRestore} // Gọi hàm handleRestore đã được sửa đổi
              loading={loading} // Truyền isLoading thành loading
              isDeleting={isDeleting} // Truyền trạng thái đang xóa
              isRestoring={isRestoring} // Truyền trạng thái đang khôi phục
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 py-4 border-t">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GenreManagement;
