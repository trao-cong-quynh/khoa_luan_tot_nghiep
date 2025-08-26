import React from "react";
import {
  useGetDeleteAllDistrictsUS,
  useRestoreDistrictUS,
} from "../../../api/homePage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import DistrictTable from "../../../components/admin/District/DistrictTable";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";

const DeleteDistrict = () => {
  const { data, isLoading } = useGetDeleteAllDistrictsUS({ staleTime: 0 });
  const restoreDistrict = useRestoreDistrictUS();
  const queryClient = useQueryClient();

  const deletedDistricts = Array.isArray(data?.data) ? data.data : [];

  const handleAskRestore = (districtId) => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: "Bạn muốn khôi phục quận này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Vâng, khôi phục nó!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    }).then((result) => {
      // Nếu người dùng xác nhận
      if (result.isConfirmed) {
        // Gọi mutation để khôi phục quận với districtId tương ứng
        restoreDistrict.mutate(districtId, {
          // Xử lý khi API call thành công
          onSuccess: (response) => {
            // Kiểm tra trạng thái trả về từ API
            if (response?.data?.status === false) {
              handleApiError(response.data, "Khôi phục quận thất bại");
              return;
            }
            // Hiển thị thông báo thành công
            toast.success(getApiMessage(response, "Khôi phục quận thành công"));
            // Invalidate (vô hiệu hóa) các queries liên quan để React Query fetch lại dữ liệu
            queryClient.invalidateQueries({
              queryKey: ["useGetDeletedDistrictsUS"],
            });
            queryClient.invalidateQueries({
              queryKey: ["useGetAllDistrictsUS"],
            });
          },
          onError: (error) => {
            toast.error(getApiMessage(error, "Không thể khôi phục quận"));
          },
        });
      }
    });
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight mb-4 sm:mb-0">
          Danh sách Quận đã xóa
        </h1>
      </div>
      <div className="w-full">
        {/* Render bảng hiển thị danh sách quận đã xóa */}
        <DistrictTable
          districts={deletedDistricts}
          onDelete={handleAskRestore} // Sử dụng onDelete để trigger hành động khôi phục
          loading={isLoading}
          isDeletedView={true} // Bật chế độ hiển thị cho các mục đã xóa
        />
      </div>
    </div>
  );
};

export default DeleteDistrict;
