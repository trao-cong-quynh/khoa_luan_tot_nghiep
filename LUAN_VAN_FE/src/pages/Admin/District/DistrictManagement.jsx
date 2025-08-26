import React, { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  useGetAllDistrictsUS,
  useCreateDistrictUS,
  useUpdateDistrictUS,
  useDeleteDistrictUS,
} from "../../../api/homePage";
import { toast } from "react-toastify";
import Modal from "../../../components/ui/Modal";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";
import DistrictTable from "../../../components/admin/District/DistrictTable";
import DistrictForm from "../../../components/admin/District/DistrictForm";
import Swal from "sweetalert2";
const ITEMS_PER_PAGE = 10;

const DistrictManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [isDeletedView, setIsDeletedView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: districtData,
    isLoading: loading,
    error,
    refetch: fetchDistricts,
  } = useGetAllDistrictsUS({
    isDeleted: isDeletedView,
    searchTerm,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });
  //tạo, cập nhật, xóa quận huyện
  const { mutate: createDistrict, isLoading: createDistrictLoading } =
    useCreateDistrictUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Thêm quận huyện không thành công");
          return;
        }
        toast.success("Thêm quận huyện thành công");
        setIsFormVisible(false);
        fetchDistricts();
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Thêm quận huyện không thành công"));
      },
    });

  const { mutate: updateDistrict, isLoading: updateDistrictLoading } =
    useUpdateDistrictUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Cập nhật quận huyện không thành công");
          return;
        }
        toast.success("Cập nhật quận huyện thành công");
        setIsFormVisible(false);
        setEditingDistrict(null);
        fetchDistricts();
      },
      onError: (error) => {
        toast.error(
          getApiMessage(error, "Cập nhật quận huyện không thành công")
        );
      },
    });

  const { mutate: deleteDistrict, isLoading: deleteDistrictLoading } =
    useDeleteDistrictUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Xóa quận huyện không thành công");
          return;
        }
        toast.success("Xóa quận huyện thành công");
        fetchDistricts();
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Xóa quận huyện không thành công"));
      },
    });

  const handleAddDistrict = () => {
    setEditingDistrict(null);
    setIsFormVisible(true);
  };
  const handleEditDistrict = (district) => {
    setEditingDistrict(district);
    setIsFormVisible(true);
  };
  const handleSaveDistrict = (districtData) => {
    try {
      if (districtData.district_id) {
        updateDistrict({ districtId: districtData.district_id, districtData });
      } else {
        createDistrict(districtData);
      }
    } catch (err) {
      console.error("Error saving genre:", err);
      toast.error(getApiMessage(err, "Có lỗi xảy ra khi lưu thể loại!"));
    }
  };
  const handleDeleteDistrict = (districtId) => {
    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa quận huyện này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDistrict(districtId);
      }
    });
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingDistrict(null);
  };
  // Đảm bảo districts luôn là một mảng.
  // districtData?.data là nơi dữ liệu thực tế được mong đợi.
  const districts = Array.isArray(districtData?.data) ? districtData.data : [];
  console.log("Districts data from API hook (DistrictManagement):", districts);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredDistricts = districts.filter((district) => {
    const matchSearch = (district.district_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredDistricts.length / ITEMS_PER_PAGE);
  const paginatedDistricts = filteredDistricts.slice(
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
          <p className="text-xl font-bold mb-2">
            Đã xảy ra lỗi khi tải dữ liệu
          </p>
          <p>{error.message}</p>
          <button
            onClick={() => fetchDistricts()}
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
          Quản lý Quận/Huyện
        </h1>
        {!isFormVisible && (
          <button
            onClick={handleAddDistrict}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base
            cursor-pointer"
          >
            + Thêm quận huyện mới
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-3">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm quận..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-auto">
          <DistrictTable
            districts={paginatedDistricts}
            loading={loading}
            onEdit={handleEditDistrict}
            onDelete={handleDeleteDistrict}
            isDeleting={deleteDistrictLoading}
            isDeletedView={false}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
          />

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
        <Modal open={isFormVisible} onClose={handleCancelEdit}>
          <div className="max-w-md mx-auto">
            <DistrictForm
              initialData={editingDistrict}
              onSubmit={handleSaveDistrict}
              onCancel={handleCancelEdit}
              loading={createDistrictLoading || updateDistrictLoading}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default DistrictManagement;
