import React, { useState } from "react";
import TicketTypeForm from "../../../components/admin/TicketType/TicketTypeForm";
import TicketTypeTable from "../../../components/admin/TicketType/TicketTypeTable";
import {
  useGetAllTicketTypesUS,
  useCreateTicketTypeUS,
  useUpdateTicketTypeUS,
  useDeleteTicketTypeUS,
} from "../../../api/homePage/queries";
import { toast } from "react-toastify";
import Modal from "../../../components/ui/Modal";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";

const ITEMS_PER_PAGE = 10;

const TicketTypeManagement = () => {
  const [editingTicketType, setEditingTicketType] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Query hooks
  const { data, isLoading: loadingTicketTypes } = useGetAllTicketTypesUS();

  const { mutate: createTicketType, isPending: isCreatingTicketType } =
    useCreateTicketTypeUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Thêm loại vé mới thất bại");
          return;
        }
        toast.success("Thêm loại vé thành công!");
        setIsFormVisible(false);
        queryClient.invalidateQueries({ queryKey: ["GetAllTicketTypesAPI"] });
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Thêm loại vé thất bại"));
      },
    });

  const { mutate: updateTicketType, isPending: isUpdatingTicketType } =
    useUpdateTicketTypeUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          handleApiError(response.data, "Cập nhật loại vé thất bại");
          return;
        }
        toast.success("Cập nhật loại vé thành công!");
        setIsFormVisible(false);
        setEditingTicketType(null);
        queryClient.invalidateQueries({ queryKey: ["GetAllTicketTypesAPI"] });
      },
      onError: (error) => {
        toast.error(getApiMessage(error, "Cập nhật loại vé thất bại"));
      },
    });

  const { mutate: deleteTicketTypeMutation, isPending: isDeletingTicketType } =
    useDeleteTicketTypeUS({
      onSuccess: (response) => {
        if (response?.data?.status === false) {
          Swal.fire(
            "Thất bại!",
            response?.data?.message || "Xóa loại vé thất bại",
            "error"
          );
          return;
        }
        Swal.fire(
          "Đã xóa!",
          response?.data?.message || "Xóa loại vé thành công!",
          "success"
        );
        queryClient.invalidateQueries({ queryKey: ["GetAllTicketTypesAPI"] });
      },
      onError: (error) => {
        Swal.fire(
          "Thất bại!",
          getApiMessage(error, "Xóa loại vé thất bại"),
          "error"
        );
      },
    });

  const ticketTypes = Array.isArray(data?.data?.tickeType)
    ? data.data.tickeType.filter((type) =>
        type.ticket_type_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(ticketTypes.length / ITEMS_PER_PAGE);
  const paginatedTicketTypes = ticketTypes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAdd = () => {
    setEditingTicketType(null);
    setIsFormVisible(true);
  };

  const handleEdit = (type) => {
    setEditingTicketType(type);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa loại vé này không?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      allowOutsideClick: false,
      allowEscapeKey: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTicketTypeMutation(id);
      }
    });
  };

  const handleAddOrUpdate = (formData) => {
    if (editingTicketType) {
      updateTicketType({
        id: editingTicketType.ticket_type_id,
        data: formData,
      });
    } else {
      createTicketType(formData);
    }
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingTicketType(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Quản lý Loại vé
        </h1>
        {!isFormVisible && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base
            cursor-pointer"
          >
            + Thêm loại vé mới
          </button>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-3">
            <input
              type="text"
              placeholder="Tìm kiếm loại vé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-auto">
          <TicketTypeTable
            ticketTypes={paginatedTicketTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loadingTicketTypes}
            isDeleting={isDeletingTicketType}
            isDeletedView={false}
          />
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
        <Modal open={isFormVisible} onClose={handleCancelEdit}>
          <div className="max-w-md mx-auto">
            <TicketTypeForm
              initialData={editingTicketType}
              onSubmit={handleAddOrUpdate}
              onCancel={handleCancelEdit}
              isSubmitting={isCreatingTicketType || isUpdatingTicketType} // Sử dụng isPending
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default TicketTypeManagement;
