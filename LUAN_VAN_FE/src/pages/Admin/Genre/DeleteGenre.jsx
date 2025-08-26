import React from "react";
import {
  useGetDeletedGenresUS,
  useRestoreGenreUS,
} from "../../../api/homePage";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import GenreTable from "../../../components/admin/Genre/GenreTable";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";

const DeleteGenre = () => {
  const { data, isLoading } = useGetDeletedGenresUS({ staleTime: 0 });
  const restoreGenre = useRestoreGenreUS();
  const queryClient = useQueryClient();

  const deletedGenres = Array.isArray(data?.data) ? data.data : [];

  const handleAskRestore = (genreId) => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: "Bạn muốn khôi phục thể loại này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Khôi phục!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreGenre.mutate(genreId, {
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              handleApiError(response.data, "Khôi phục thể loại thất bại");
              return;
            }
            toast.success(
              getApiMessage(response, "Khôi phục thể loại thành công")
            );
            queryClient.invalidateQueries({
              queryKey: ["GetDeletedGenresAPI"],
            });
            queryClient.invalidateQueries({ queryKey: ["GetAllGenresAPI"] });
          },
          onError: (error) => {
            toast.error(getApiMessage(error, "Không thể khôi phục thể loại"));
          },
        });
      }
    });
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 tracking-tight mb-4 sm:mb-0">
          Danh sách Thể loại đã xóa
        </h1>
      </div>
      <div className="w-full">
        <GenreTable
          genres={deletedGenres}
          onDelete={handleAskRestore}
          loading={isLoading}
          isDeletedView={true}
        />
      </div>
    </div>
  );
};

export default DeleteGenre;
