import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import TheaterTable from "../../../components/admin/Theater/TheaterTable";
import {
  useGetDeletedCinemasUS,
  useRestoreCinemaUS,
} from "../../../api/homePage/queries";
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const ITEMS_PER_PAGE = 10;

const DeletedTheater = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();
  const { data: deletedCinemasData, isLoading } = useGetDeletedCinemasUS();
  const restoreCinema = useRestoreCinemaUS();
  const { userData } = useAuth();
  const currenRole =
    userData?.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");

  const handleAskRestore = (cinemaId) => {
    Swal.fire({
      title: "Xác nhận khôi phục rạp chiếu",
      text: "Bạn có chắc chắn muốn khôi phục rạp chiếu này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreCinema.mutate(cinemaId, {
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              handleApiError(response.data, "thêm lại rạp chiếu thất bại");
              return;
            }
            toast.success("Khôi phục rạp chiếu thành công!");
            queryClient.invalidateQueries({
              queryKey: ["getDeletedCinemasAPI"],
            });
            queryClient.invalidateQueries({
              queryKey: ["getDeletedCinemasAPI"],
            });
          },
          onError: (error) => {
            toast.error(getApiMessage(error, "Khôi phục rạp chiếu thất bại!"));
          },
        });
      }
    });
  };

  const filteredCinemas = Array.isArray(deletedCinemasData?.data)
    ? deletedCinemasData.data.filter((cinema) => {
        const matchSearch = cinema.cinema_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchSearch;
      })
    : [];

  const totalPages = Math.ceil(filteredCinemas.length / ITEMS_PER_PAGE);
  const paginatedCinemas = filteredCinemas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Rạp chiếu đã xóa mềm
        </h1>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-3">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm rạp chiếu đã xóa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition"
            />
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-auto">
          <TheaterTable
            theaters={paginatedCinemas}
            onEdit={() => {}}
            onDelete={handleAskRestore} // The onDelete handler now uses the SweetAlert function
            loading={isLoading}
            isDeletedView={true}
          />
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
      </div>
    </div>
  );
};

export default DeletedTheater;
