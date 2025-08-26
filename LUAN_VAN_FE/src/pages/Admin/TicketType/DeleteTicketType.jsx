import React, { useState } from "react";
import TicketTypeTable from "../../../components/admin/TicketType/TicketTypeTable";
import {
  useGetDeletedTicketTypesUS,
  useRestoreTicketTypeUS,
} from "../../../api/homePage/queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

const DeleteTicketType = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetDeletedTicketTypesUS({ staleTime: 0 });
  const restoreTicketType = useRestoreTicketTypeUS();
  const ticketTypes = data?.data || [];

  // Hàm xử lý việc khôi phục loại vé, sử dụng SweetAlert2 để xác nhận
  const handleAskRestore = (id) => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: "Bạn muốn khôi phục loại vé này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Vâng, khôi phục nó!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreTicketType.mutate(id, {
          onSuccess: async () => {
            toast.success("Khôi phục loại vé thành công!");
            await queryClient.invalidateQueries({
              queryKey: ["GetDeletedTicketTypesAPI"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["GetDeletedTicketTypesAPI"],
            });
          },
          onError: (error) => {
            toast.error("Khôi phục loại vé thất bại: " + error.message);
          },
        });
      }
    });
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="rounded flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded shadow-none border border-gray-200 sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Loại vé đã xóa
        </h1>
      </div>
      <div className="w-full">
        <div className="bg-white rounded shadow-none border border-gray-200 overflow-auto">
          <TicketTypeTable
            ticketTypes={ticketTypes}
            onEdit={() => {}}
            onDelete={handleAskRestore} // Cập nhật để gọi hàm mới
            loading={isLoading}
            isDeleting={restoreTicketType.isLoading}
            isDeletedView={true}
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteTicketType;
