import React, { useState, useCallback } from "react";
import TheaterForm from "../../../components/admin/Theater/TheaterForm";
import TheaterTable from "../../../components/admin/Theater/TheaterTable";
import RoomTable from "../../../components/admin/Room/RoomTable";
import RoomForm from "../../../components/admin/Room/RoomForm";
import { FaPlus, FaSearch } from "react-icons/fa";
import {
  useGetAllCinemasUS,
  useCreateCinemaUS,
  useUpdateCinemaUS,
  useDeleteCinemaUS,
  useCreateTheaterRoomUS,
  useUpdateTheaterRoomUS,
  useDeleteTheaterRoomUS,
  useRestoreTheaterRoomUS,
  useGetAllDistrictsUS,
} from "../../../api/homePage/queries";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../components/ui/Modal"; // Đảm bảo import Modal
import { getApiMessage, handleApiError } from "../../../Utilities/apiMessage";
import Swal from "sweetalert2";
import { useAuth } from "../../../contexts/AuthContext";

const ITEMS_PER_PAGE = 10;

const TheaterManagement = () => {
  const [editingTheater, setEditingTheater] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCinemaIdForRooms, setSelectedCinemaIdForRooms] =
    useState(null);
  const [isRoomFormVisible, setIsRoomFormVisible] = useState(false); // State để điều khiển Modal cho RoomForm
  const [editingRoom, setEditingRoom] = useState(null);
  const { userData } = useAuth();
  const currenRole =
    userData?.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");
  // React Query hooks
  const { data: cinemasData, isLoading: loadingCinemas } = useGetAllCinemasUS(); // Đổi tên isLoading để rõ ràng hơn
  const { data: districtsData, isLoading: loadingDistricts } =
    useGetAllDistrictsUS({ enabled: userData?.role.includes("admin") });
  const { mutate: createCinema, isPending: isCreatingCinema } =
    useCreateCinemaUS();
  const { mutate: updateCinema, isPending: isUpdatingCinema } =
    useUpdateCinemaUS();
  const { mutate: deleteCinema, isPending: isDeletingCinema } =
    useDeleteCinemaUS();
  const { mutate: createRoom, isPending: isCreatingRoom } =
    useCreateTheaterRoomUS();
  const { mutate: updateRoom, isPending: isUpdatingRoom } =
    useUpdateTheaterRoomUS();
  const { mutate: deleteRoom, isPending: isDeletingRoom } =
    useDeleteTheaterRoomUS();
  const { mutate: restoreRoom, isPending: isRestoringRoom } =
    useRestoreTheaterRoomUS();
  const queryClient = useQueryClient();

  const handleEdit = (theater) => {
    setEditingTheater(theater);
    setIsFormVisible(true);
    setSelectedCinemaIdForRooms(theater.cinema_id);
    setIsRoomFormVisible(false);
    setEditingRoom(null);
  };

  const handleDelete = (theaterId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa rạp chiếu này không?",
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
        deleteCinema(theaterId, {
          // Gọi mutate trực tiếp
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              Swal.fire(
                "Thất bại!",
                response?.data?.message || "Xóa rạp chiếu thất bại",
                "error"
              );
              handleApiError(response.data, "Xóa rạp chiếu thất bại");
              return;
            }
            Swal.fire(
              "Đã xóa!",
              response?.data?.message || "Xóa rạp chiếu thành công",
              "success"
            );
            queryClient.invalidateQueries({ queryKey: ["GetAllCinemasAPI"] });
          },
          onError: (error) => {
            Swal.fire(
              "Thất bại!",
              getApiMessage(error, "Xóa rạp chiếu thất bại"),
              "error"
            );
          },
        });
      }
    });
  };

  const handleAddOrUpdateTheater = (theaterData) => {
    if (editingTheater) {
      updateCinema(
        { cinemaId: editingTheater.cinema_id, cinemaData: theaterData },
        {
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              handleApiError(response.data, "Cập nhật rạp chiếu thất bại");
              return;
            }
            toast.success("Cập nhật rạp chiếu thành công!");
            setIsFormVisible(false);
            setEditingTheater(null);
            setSelectedCinemaIdForRooms(null);
            setIsRoomFormVisible(false);
            setEditingRoom(null);
            queryClient.invalidateQueries({ queryKey: ["GetAllCinemasAPI"] });
          },
          onError: (error) => {
            toast.error(getApiMessage(error, "Không thể cập nhật rạp chiếu"));
          },
        }
      );
    } else {
      createCinema(theaterData, {
        // Gọi mutate trực tiếp
        onSuccess: (response) => {
          if (response?.data?.status === false) {
            handleApiError(response.data, "Thêm rạp mới thất bại");
            return;
          }
          toast.success(response.message || "Thêm rạp chiếu thành công!"); // Sửa lỗi response.message
          setIsFormVisible(false);
          setSelectedCinemaIdForRooms(null);
          setIsRoomFormVisible(false);
          setEditingRoom(null);
          queryClient.invalidateQueries({ queryKey: ["GetAllCinemasAPI"] });
        },
        onError: (error) => {
          toast.error(getApiMessage(error, "Không thể thêm rạp mới"));
        },
      });
    }
  };

  const handleAddTheater = () => {
    setEditingTheater(null);
    setIsFormVisible(true);
    setSelectedCinemaIdForRooms(null);
    setIsRoomFormVisible(false);
    setEditingRoom(null);
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingTheater(null);
    setSelectedCinemaIdForRooms(null);
    setIsRoomFormVisible(false);
    setEditingRoom(null);
  };

  const handleAddRoom = () => {
    setIsRoomFormVisible(true);
    setEditingRoom(null);
  };

  const handleEditRoom = (room) => {
    setIsRoomFormVisible(true);
    setEditingRoom(room);
  };

  const handleSaveRoom = (roomData) => {
    if (editingRoom) {
      updateRoom(
        {
          roomId: editingRoom.room_id,
          roomData: { cinema_id: selectedCinemaIdForRooms, ...roomData },
        },
        {
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              handleApiError(
                response.data,
                "Cập nhật phòng chiếu mới thất bại"
              );
              return;
            }
            toast.success(
              response.message || "Cập nhật phòng chiếu thành công!"
            );
            setIsRoomFormVisible(false);
            setEditingRoom(null);
            queryClient.invalidateQueries({
              queryKey: [
                "GetTheaterRoomsByCinemaAPI",
                selectedCinemaIdForRooms,
              ],
            });
          },
          onError: (error) => {
            toast.error(
              getApiMessage(error, "Không thể cập nhật phòng chiếu mới")
            );
          },
        }
      );
    } else {
      createRoom(
        { ...roomData, cinema_id: selectedCinemaIdForRooms },
        {
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              handleApiError(response.data, "Thêm phòng chiếu mới thất bại");
              return;
            }
            toast.success("Thêm phòng chiếu thành công!");
            setIsRoomFormVisible(false);
            queryClient.invalidateQueries({
              queryKey: [
                "GetTheaterRoomsByCinemaAPI",
                selectedCinemaIdForRooms,
              ],
            });
          },
          onError: (error) => {
            toast.error(getApiMessage(error, "Không thể thêm phòng chiếu mới"));
          },
        }
      );
    }
  };

  const handleDeleteRoom = (roomId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa phòng chiếu này không?",
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
        deleteRoom(roomId, {
          // Gọi mutate trực tiếp
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              Swal.fire(
                "Thất bại!",
                response?.data?.message || "Xóa phòng chiếu thất bại",
                "error"
              );
              handleApiError(response.data, "Xóa phòng chiếu thất bại");
              return;
            }
            Swal.fire(
              "Đã xóa!",
              response?.data?.message || "Xóa phòng chiếu thành công!",
              "success"
            );
            queryClient.invalidateQueries({
              queryKey: [
                "GetTheaterRoomsByCinemaAPI",
                selectedCinemaIdForRooms,
              ],
            });
          },
          onError: (error) => {
            Swal.fire(
              "Thất bại!",
              getApiMessage(error, "Không thể xóa phòng chiếu"),
              "error"
            );
          },
        });
      }
    });
  };

  const handleRestoreRoom = (roomId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn khôi phục phòng chiếu này không?",
      text: "Phòng sẽ được kích hoạt lại.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#3085d6", // Màu xanh cho khôi phục
      allowOutsideClick: false,
      allowEscapeKey: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        restoreRoom(roomId, {
          // Gọi mutate trực tiếp
          onSuccess: (response) => {
            if (response?.data?.status === false) {
              Swal.fire(
                "Thất bại!",
                response?.data?.message || "Khôi phục phòng chiếu thất bại",
                "error"
              );
              handleApiError(response.data, "Khôi phục phòng chiếu thất bại");
              return;
            }
            Swal.fire(
              "Đã khôi phục!",
              response?.data?.message || "Khôi phục phòng chiếu thành công!",
              "success"
            );
            queryClient.invalidateQueries({
              queryKey: [
                "GetTheaterRoomsByCinemaAPI",
                selectedCinemaIdForRooms,
              ],
            });
          },
          onError: (error) => {
            Swal.fire(
              "Thất bại!",
              getApiMessage(error, "Không thể khôi phục phòng chiếu"),
              "error"
            );
          },
        });
      }
    });
  };

  const handleCancelRoomForm = () => {
    setIsRoomFormVisible(false);
    setEditingRoom(null);
  };

  const filteredTheaters = (cinemasData?.data || []).filter((theater) => {
    const matchSearch = theater.cinema_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchSearch;
  });

  const totalPages = Math.ceil(filteredTheaters.length / ITEMS_PER_PAGE);
  const paginatedTheaters = filteredTheaters.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const geocodeAddress = useCallback((address) => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK") {
          const location = results[0].geometry.location;
          setSelectedCinemaIdForRooms(location.lat() + "," + location.lng());
        } else {
          console.error(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    }
  }, []);

  const handleAddressChange = (address) => {
    geocodeAddress(address);
  };

  const getMapUrl = () => {
    if (editingTheater && editingTheater.map_address) {
      return editingTheater.map_address;
    }
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.435373360717!2d106.69937787427165!3d10.777928659167632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f48779307a5%3A0x9ba2ed64e9e3ef7b!2zQ0dWIFZpbmNvbSDEkOG7k25nIEto4bufaQ!5e0!3m2!1sen!2s!4v1750994606691!5m2!1sen!2s";
  };

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          Quản lý Rạp chiếu
        </h1>
        {!isFormVisible && (
          <button
            onClick={handleAddTheater}
            className="inline-flex items-center px-4 py-2 sm:px-5 sm:py-2 bg-gradient-to-r
            from-blue-500 to-blue-700 text-white rounded-xl hover:from-blue-600
            hover:to-blue-800 font-semibold shadow-md transition-all text-sm sm:text-base cursor-pointer"
          >
            <FaPlus className="mr-2" />
            Thêm rạp chiếu mới
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
                placeholder="Tìm kiếm rạp chiếu..."
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
          <>
            <div className="flex flex-col lg:flex-row w-full space-y-8 lg:space-y-0 lg:space-x-8">
              <div className="w-full lg:w-1/2">
                <TheaterForm
                  initialData={editingTheater}
                  onSubmit={handleAddOrUpdateTheater}
                  onCancel={handleCancelEdit}
                  onAddressChange={handleAddressChange}
                  cinemas={cinemasData?.data || []}
                  // districts={districtsData?.data || []}
                  isSubmitting={isCreatingCinema || isUpdatingCinema} // Truyền trạng thái submit
                />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col space-y-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="relative">
                    <iframe
                      src={getMapUrl()}
                      width="100%"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-[450px]"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent to-transparent"></div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {editingTheater
                        ? `Bản đồ hiển thị vị trí rạp chiếu ${editingTheater.cinema_name}`
                        : "Bản đồ hiển thị vị trí rạp chiếu"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {selectedCinemaIdForRooms && (
              <RoomTable
                cinemaId={selectedCinemaIdForRooms}
                onAddRoom={handleAddRoom}
                onEditRoom={handleEditRoom}
                onDeleteRoom={handleDeleteRoom}
                onRestoreRoom={handleRestoreRoom}
                isDeletingRoom={isDeletingRoom} // Truyền trạng thái xóa phòng
                isRestoringRoom={isRestoringRoom} // Truyền trạng thái khôi phục phòng
              />
            )}

            {/* Modal cho RoomForm */}
            <Modal open={isRoomFormVisible} onClose={handleCancelRoomForm}>
              <div className="max-w-md mx-auto">
                <RoomForm
                  onSubmit={handleSaveRoom}
                  onCancel={handleCancelRoomForm}
                  initialData={editingRoom}
                  isSubmitting={isCreatingRoom || isUpdatingRoom} // Truyền trạng thái submit
                />
              </div>
            </Modal>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-lg">
            <TheaterTable
              theaters={paginatedTheaters}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loadingCinemas}
              isDeletingTheater={isDeletingCinema} // Truyền trạng thái xóa rạp
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

export default TheaterManagement;
