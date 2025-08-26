import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  useGetDeletedConcessionUS,
  useRestoreConcessionUS,
} from "../../../api/homePage";
import { toast } from "react-toastify";
import ConcessionTable from "../../../components/admin/Concession/ConcessionTable";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2"; 
import { useQueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 10;

const DeletedConcession = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Lấy danh sách concession đã xóa mềm
  const { data: deletedConcessionsData, isLoading: isLoadingConcessions } =
    useGetDeletedConcessionUS({ staleTime: 0 });

  console.log("Current deleted concessions data:", deletedConcessionsData);

  // Hook để khôi phục concession
  const { mutate: restoreConcession, isLoading: isRestoring } =
    useRestoreConcessionUS();

  // Lọc theo tên
  const filteredConcessions = Array.isArray(
    deletedConcessionsData?.data?.concessions
  )
    ? deletedConcessionsData.data.concessions.filter((item) => {
        const matchSearch = item.concession_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchSearch;
      })
    : [];

  const totalPages = Math.ceil(filteredConcessions.length / ITEMS_PER_PAGE);
  const paginatedConcessions = filteredConcessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Hàm xử lý việc khôi phục concession
  const handleAskRestore = (concessionId, concessionName) => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: `Bạn muốn khôi phục đồ ăn/uống "${concessionName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Vâng, khôi phục nó!",
      cancelButtonText: "Hủy bỏ",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreConcession(concessionId, {
          onSuccess: async (response) => {
            console.log("Restore API call successful. Response:", response);
            if (response?.data?.status === false) {
              handleApiError(response.data, "Khôi phục đồ ăn/uống thất bại");
              return;
            }
            toast.success(
              getApiMessage(response, "Khôi phục đồ ăn/uống thành công")
            );
            await queryClient.invalidateQueries({
              queryKey: ["getDeletedConcessionAPI"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["getDeletedConcessionAPI"],
            });
            setCurrentPage(1);
          },
          onError: (error) => {
            console.error("Restore API call failed. Error:", error);
            toast.error(getApiMessage(error, "Không thể khôi phục đồ ăn/uống"));
          },
        });
      }
    });
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Đồ ăn/uống đã xóa mềm
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-3">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đồ ăn/uống đã xóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            />
          </div>
        </div>
      </div>

      <div className="w-full">
        <ConcessionTable
          concessions={paginatedConcessions}
          onEdit={() => {}} // Không cho phép edit trong view đã xóa
          onDelete={handleAskRestore} // Cập nhật để gọi hàm mới
          loading={isLoadingConcessions}
          isDeletedView={true}
        />

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 py-4 border-t bg-white rounded-b-xl">
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
    </div>
  );
};

export default DeletedConcession;
