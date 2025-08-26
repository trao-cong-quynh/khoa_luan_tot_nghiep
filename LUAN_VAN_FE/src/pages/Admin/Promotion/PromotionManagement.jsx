import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useQueryClient } from "@tanstack/react-query";

import Modal from "../../../components/ui/Modal.jsx";
import {
  useGetAllPromotionsUS,
  useCreatePromotionUS,
  useUpdatePromotionUS,
  useDeletePromotionUS,
} from "../../../api/homePage/queries.jsx";
import PromotionFrom from "../../../components/admin/Promotion/PromotionFrom.jsx";
import PromotionTable from "../../../components/admin/Promotion/PromotionTable.jsx";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";

const ITEMS_PER_PAGE = 10;

// ======================================================
// Hàm tiện ích để định dạng ngày tháng
// ======================================================
// Định dạng từ "DD-MM-YYYY HH:mm" sang "YYYY-MM-DD" để input[type=date] có thể hiểu
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("-");
  return `${year}-${month}-${day}`;
};

// Định dạng từ "YYYY-MM-DD" sang "DD-MM-YYYY 00:00" để gửi lên API
const formatInputDateForAPI = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year} 00:00`;
};

const PromotionManagement = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const {
    data: promotionsData,
    isLoading: loadingPromotions,
    error,
    refetch,
  } = useGetAllPromotionsUS();

  const { mutate: createPromotion, isPending: isCreating } =
    useCreatePromotionUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Thêm khuyến mãi mới thất bại");
          return;
        }
        toast.success(response.message || "Thêm khuyến mãi mới thành công!");
        setIsFormVisible(false);
        setEditingPromotion(null);
        queryClient.invalidateQueries(["GetAllPromotionsAPI"]);
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể thêm khuyến mãi mới."));
      },
    });

  const { mutate: updatePromotion, isPending: isUpdating } =
    useUpdatePromotionUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Cập nhật khuyến mãi thất bại");
          return;
        }
        toast.success(response.message || "Cập nhật khuyến mãi thành công!");
        setIsFormVisible(false);
        setEditingPromotion(null);
        queryClient.invalidateQueries(["GetAllPromotionsAPI"]);
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Không thể cập nhật khuyến mãi."));
      },
    });

  const { mutate: deletePromotionMutation, isPending: isDeleting } =
    useDeletePromotionUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          Swal.fire(
            "Thất bại!",
            response?.data?.message || "Xóa khuyến mãi thất bại",
            "error"
          );
          return;
        }
        Swal.fire(
          "Đã xóa!",
          response?.data?.message || "Xóa khuyến mãi thành công",
          "success"
        );
        queryClient.invalidateQueries(["GetAllPromotionsAPI"]);
      },
      onError: (error) => {
        Swal.fire(
          "Thất bại!",
          getApiMessage(error, "Xóa khuyến mãi thất bại."),
          "error"
        );
      },
    });

  const promotions = promotionsData?.data || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        {" "}
        <div className="text-red-500 text-center">
          <p className="text-xl font-bold mb-2">Đã xảy ra lỗi</p>{" "}
          <p>{error.message}</p>{" "}
          <button
            onClick={() => refetch()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Thử lại{" "}
          </button>{" "}
        </div>{" "}
      </div>
    );
  }

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setIsFormVisible(true);
  };

  const handleEditPromotion = (promotion) => {
    // Định dạng lại ngày tháng trước khi truyền vào form
    const promotionWithFormattedDates = {
      ...promotion,
      start_date: promotion.start_date
        ? formatDateForInput(promotion.start_date)
        : "",
      end_date: promotion.end_date
        ? formatDateForInput(promotion.end_date)
        : "",
    };
    setEditingPromotion(promotionWithFormattedDates);
    setIsFormVisible(true);
  };

  const handleAddOrUpdatePromotion = (formData) => {
    if (editingPromotion) {
      updatePromotion({
        id: editingPromotion.promotion_id,
        data: formData,
      });
    } else {
      createPromotion(formData);
    }
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingPromotion(null);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa khuyến mãi này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deletePromotionMutation(id);
      }
    });
  };

  const filteredPromotions = promotions.filter((promo) =>
    (promo.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="ml-10 space-y-6 sm:space-y-2">
      {" "}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        {" "}
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Quản lý Khuyến mãi{" "}
        </h1>{" "}
        {!isFormVisible && (
          <button
            onClick={handleAddPromotion}
            disabled={isCreating}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r
    from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600
    hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base
    disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="mr-2" />{" "}
            {isCreating ? "Đang thêm..." : "Thêm khuyến mãi mới"}{" "}
          </button>
        )}{" "}
      </div>{" "}
      {!isFormVisible && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          {" "}
          <div className="relative">
            {" "}
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />{" "}
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khuyến mãi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            />{" "}
          </div>{" "}
        </div>
      )}{" "}
      <div>
        {" "}
        <div className="bg-white rounded-xl shadow-lg overflow-auto max-h-[70vh]">
          {" "}
          <PromotionTable
            promotions={paginatedPromotions}
            onEdit={handleEditPromotion}
            onDelete={handleDelete}
            loading={loadingPromotions}
            isDeleting={isDeleting}
          />{" "}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-4 border-t">
              {" "}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50
      disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước{" "}
              </button>{" "}
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
                  {index + 1}{" "}
                </button>
              ))}{" "}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50
      disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau{" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>{" "}
        <Modal
          open={isFormVisible}
          onClose={handleCancelForm}
          widthClass="min-w-[500px]"
        >
          {" "}
          <div className="mx-auto">
            {" "}
            <PromotionFrom
              initialData={editingPromotion}
              onSubmit={handleAddOrUpdatePromotion}
              onCancel={handleCancelForm}
              isEdit={!!editingPromotion}
              loading={isCreating || isUpdating}
            />{" "}
          </div>{" "}
        </Modal>{" "}
      </div>{" "}
    </div>
  );
};

export default PromotionManagement;
