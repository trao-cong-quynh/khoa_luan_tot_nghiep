import React, { useState } from "react";
import ConcessionTable from "../../../components/admin/Concession/ConcessionTable";
import ConcessionForm from "../../../components/admin/Concession/ConcessionForm";
import { toast } from "react-toastify";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  useGetAllConcessionsUS,
  useCreateConcessionUS,
  useUpdateConcessionUS,
  useDeleteConcessionUS,
} from "../../../api/homePage/queries";
import Modal from "../../../components/ui/Modal";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";
const ITEMS_PER_PAGE = 10;

const CATEGORY_OPTIONS = [
  { value: "Drink", label: "Đồ uống" },
  { value: "Food", label: "Đồ ăn" },
  { value: "Snack", label: "Snack" },
  { value: "Combo", label: "Combo" },
  { value: "Other", label: "Khác" },
];

const ConcessionManagement = () => {
  const [editingConcession, setEditingConcession] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // React Query hooks
  const {
    data: concessionsData,
    isLoading: loading,
    error,
    refetch: fetchConcessions,
  } = useGetAllConcessionsUS();

  const { mutate: createConcession, isLoading: isCreating } =
    useCreateConcessionUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          //
          console.log("API Response:", response);
          handleApiError(response.data, "Thêm dịch vụ mới thất bại"); //
          return;
        }
        toast.success(response.message || "Thêm dịch vụ mới thành công");
        setIsFormVisible(false);
        fetchConcessions();
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể thêm dịch vụ mới"));
      },
    });

  const { mutate: updateConcession, isLoading: isUpdating } =
    useUpdateConcessionUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Cập nhật dịch vụ thất bại"); //
          return;
        }
        toast.success("Cập nhật dịch vụ thành công");
        setIsFormVisible(false);
        fetchConcessions();
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể cập nhật dịch vụ")); //
      },
    });

  const { mutate: deleteConcession, isLoading: isDeleting } =
    useDeleteConcessionUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          //
          Swal.fire(
            "Thất bại!",
            response?.data?.message || "Xóa dịch vụ thất bại",
            "error"
          );
          handleApiError(response.data, "Xóa dịch vụ thất bại"); //
          return;
        }
        Swal.fire(
          "Thành công!",
          response?.data?.message || "Xóa dịch vụ thành công",
          "success"
        );
        fetchConcessions();
      },
      onError: (error) => {
        Swal.file(
          "Thất bại!",
          getApiMessage(error, "Không thể xóa dịch vụ"),
          "error"
        );
      },
    });

  const handleAddConcession = () => {
    setEditingConcession(null);
    setIsFormVisible(true);
  };

  const handleEditConcession = (concession) => {
    setEditingConcession(concession);
    setIsFormVisible(true);
  };

  const handleSaveConcession = async (concessionId, concessionData) => {
    try {
      if (concessionId) {
        updateConcession({
          concessionId,
          concessionData,
        });
      } else {
        createConcession(concessionData);
      }
    } catch (error) {
      console.error("Error saving concession:", error);
      toast.error(getApiMessage(error, "Có lỗi xảy ra khi lưu dịch vụ!"));
    }
  };

  const handleDeleteConcession = async (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true, // Đảo ngược vị trí nút để "Hủy" bên trái, "Xóa" bên phải
      confirmButtonColor: "#dc2626",
      allowOutsideClick: false, // Ngăn đóng khi click ra ngoài
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteConcession(id); // Gọi mutation xóa dịch vụ
      }
    });
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingConcession(null);
  };

  // Xử lý dữ liệu dịch vụ
  const concessions = concessionsData?.data?.concessions || [];
  const filteredConcessions = Array.isArray(concessions)
    ? concessions.filter((item) => {
        const matchName = (item.concession_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchCategory = filterCategory
          ? item.category === filterCategory
          : true;
        return matchName && matchCategory;
      })
    : [];

  // Phân trang
  const totalPages = Math.ceil(filteredConcessions.length / ITEMS_PER_PAGE);
  const paginatedConcessions = filteredConcessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lấy danh sách category duy nhất để filter
  const uniqueCategories = Array.from(
    new Set(concessions.map((c) => c.category))
  ).filter(Boolean);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Đã xảy ra lỗi</p>
          <p>{error.message}</p>
          <button
            onClick={() => fetchConcessions()}
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
          Quản lý Dịch vụ ăn uống
        </h1>
        {!isFormVisible && (
          <button
            onClick={handleAddConcession}
            disabled={isCreating}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r 
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600 
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base 
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FaPlus className="mr-2" />
            {isCreating ? "Đang thêm..." : "Thêm dịch vụ mới"}
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
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
              />
            </div>
            <div className="flex-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
              >
                <option value="">Tất cả loại dịch vụ</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-auto">
          <ConcessionTable
            concessions={paginatedConcessions}
            onEdit={handleEditConcession}
            onDelete={handleDeleteConcession}
            loading={loading}
            isDeleting={isDeleting}
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
        <Modal
          open={isFormVisible}
          onClose={handleCancelEdit}
          widthClass="min-w-[500px]"
        >
          <div className="mx-auto">
            <ConcessionForm
              initialData={editingConcession}
              onSubmit={handleSaveConcession}
              onCancel={handleCancelEdit}
              isSubmitting={isCreating || isUpdating}
              categoryOptions={CATEGORY_OPTIONS}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ConcessionManagement;
