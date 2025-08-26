import React, { useState, useEffect, useContext } from "react";
import RoomTable from "../../../components/admin/Room/RoomTable";
import RoomForm from "../../../components/admin/Room/RoomForm";
import Modal from "../../../components/ui/Modal";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  useGetAllCinemasUS,
  useGetCinemaByIdUS,
  useCreateTheaterRoomUS,
  useUpdateTheaterRoomUS,
  useDeleteTheaterRoomUS,
  useRestoreTheaterRoomUS,
} from "../../../api/homePage/queries";
import { useQueryClient } from "@tanstack/react-query";
import { handleApiError, getApiMessage } from "../../../Utilities/apiMessage";

const TheaterRoomsManagement = () => {
  const queryClient = useQueryClient();
  const { userData } = useContext(AuthContext);
  const role =
    userData.role || (Array.isArray(userData?.roles) ? userData.roles[0] : "");

  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);


  const { data: allCinemasData, isLoading: loadingAllCinemas } =
    useGetAllCinemasUS({
      enabled: role === "admin",
    });

  const { data: userCinemaData, isLoading: loadingUserCinema } =
    useGetCinemaByIdUS(userData?.cinema_id, {
      enabled:
        !!userData?.cinema_id &&
        (role === "cinema_manager" ||
          role === "showtime_manager" ||
          role === "manager_district"),
    });

  useEffect(() => {
    let finalCinemasList = [];
    let defaultSelectedCinemaId = "";

    if (
      role === "cinema_manager" ||
      role === "showtime_manager" ||
      role === "manager_district"
    ) {

      if (userCinemaData?.data) {
        finalCinemasList = [userCinemaData.data];
        defaultSelectedCinemaId = userData.cinema_id;
        console.log(
          "TheaterRoomsManagement - Manager: Fetched user's cinema:",
          finalCinemasList
        );
      } else if (loadingUserCinema) {
        console.log(
          "TheaterRoomsManagement - Manager: Loading user's cinema..."
        );
      } else if (userData.cinema_id && !userCinemaData?.data) {
        console.warn(
          "TheaterRoomsManagement - Manager: Could not fetch cinema for ID:",
          userData.cinema_id
        );
        toast.error(
          "Không thể tải thông tin rạp của bạn. Vui lòng kiểm tra lại."
        );
      }
    } else if (role === "admin") {
      if (allCinemasData?.data) {
        finalCinemasList = allCinemasData.data;
        if (finalCinemasList.length > 0) {
          defaultSelectedCinemaId = finalCinemasList[0].cinema_id;
        }
        console.log(
          "TheaterRoomsManagement - Admin: Fetched all cinemas:",
          finalCinemasList
        );
      } else if (loadingAllCinemas) {
        console.log("TheaterRoomsManagement - Admin: Loading all cinemas...");
      }
    }
    setCinemas(finalCinemasList);

    if (
      finalCinemasList.length > 0 &&
      !selectedCinema &&
      defaultSelectedCinemaId
    ) {
      setSelectedCinema(defaultSelectedCinemaId);
      console.log(
        "TheaterRoomsManagement - Auto-selected cinema:",
        defaultSelectedCinemaId
      );
    }
  }, [
    allCinemasData,
    userCinemaData,
    userData.cinema_id,
    role,
    selectedCinema,
    loadingAllCinemas,
    loadingUserCinema,
  ]);

  const createRoom = useCreateTheaterRoomUS();
  const updateRoom = useUpdateTheaterRoomUS();
  const deleteRoom = useDeleteTheaterRoomUS();
  const restoreRoom = useRestoreTheaterRoomUS();

  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsFormVisible(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setIsFormVisible(true);
  };

  const handleCancelEdit = () => {
    setIsFormVisible(false);
    setEditingRoom(null);
  };

  const handleAddOrUpdateRoom = async (formData) => {
    const payload = {
      ...formData,
      cinema_id: parseInt(selectedCinema),
    };

    try {
      if (editingRoom) {
        const res = await updateRoom.mutateAsync({
          roomId: editingRoom.room_id,
          roomData: payload,
        });
        if (res?.data?.status === false) {
          handleApiError(res.data, "Cập nhật phòng chiếu thất bại");
          return;
        }
        toast.success(res?.message || "Cập nhật phòng chiếu thành công111!");
      } else {
        // Create new room
        const res = await createRoom.mutateAsync(payload);
        if (res?.data?.status === false) {
          handleApiError(res.data, "Thêm phòng chiếu thất bại");
          return;
        }
        toast.success(res?.message || "Thêm phòng chiếu thành công111!");
      }
      setIsFormVisible(false);
      setEditingRoom(null);
      queryClient.invalidateQueries([
        "GetTheaterRoomsByCinemaAPI",
        selectedCinema,
      ]);
    } catch (err) {
      if (err?.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        errorMessages.forEach((msg) => Swal.fire("Thất bại!", msg, "error"));
        return;
      }
      Swal.fire(
        "Thất bại!",
        getApiMessage(err, "Có lỗi khi thêm/sửa phòng chiếu!"),
        "error"
      );
    }
  };

  const handleDeleteRoom = (roomId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteRoom.mutateAsync(roomId);
          if (res?.data?.status === false) {
            Swal.fire(
              "Thất bại!",
              res?.data?.message || "Xóa phòng chiếu thất bại",
              "error"
            );
            handleApiError(res.data, "Xóa phòng chiếu thất bại");
            return;
          }
          Swal.fire(
            "Đã xóa!",
            res?.data?.message || "Xóa phòng chiếu thành công",
            "success"
          );
          queryClient.invalidateQueries([
            "GetTheaterRoomsByCinemaAPI",
            selectedCinema,
          ]);
        } catch (err) {
          Swal.fire(
            "Thất bại!",
            getApiMessage(err, "Có lỗi khi xóa phòng chiếu!"),
            "error"
          );
        }
      }
    });
  };

  const handleRestoreRoom = (roomId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn khôi phục?",
      text: "Phòng chiếu sẽ được khôi phục trạng thái hoạt động!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Khôi phục",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await restoreRoom.mutateAsync(roomId);
          if (res?.data?.status === false) {
            Swal.fire(
              "Thất bại!",
              res?.data?.message || "Khôi phục phòng chiếu thất bại",
              "error"
            );
            handleApiError(res.data, "Khôi phục phòng chiếu thất bại");
            return;
          }
          Swal.fire(
            "Đã khôi phục!",
            res?.data?.message || "Khôi phục phòng chiếu thành công",
            "success"
          );
          queryClient.invalidateQueries([
            "GetTheaterRoomsByCinemaAPI",
            selectedCinema,
          ]);
        } catch (err) {
          Swal.fire(
            "Thất bại!",
            getApiMessage(err, "Có lỗi khi khôi phục phòng chiếu!"),
            "error"
          );
        }
      }
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 ">
      {/* Cinema Selection / Display */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <label htmlFor="cinema-select" className="block font-semibold mb-2">
          Rạp Chiếu:
        </label>
        {role === "cinema_manager" ||
        role === "showtime_manager" ||
        role === "manager_district" ? (
          <div className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-100 text-gray-700 font-medium">
            {cinemas.length > 0
              ? cinemas[0].cinema_name || cinemas[0].name
              : "Đang tải rạp..."}
          </div>
        ) : (
          <select
            id="cinema-select"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50"
            disabled={loadingAllCinemas || loadingUserCinema} // Disable while loading cinemas
          >
            <option value="">
              {loadingAllCinemas || loadingUserCinema
                ? "Đang tải rạp..."
                : "Chọn một rạp"}
            </option>
            {cinemas.map((cinema) => (
              <option key={cinema.cinema_id} value={cinema.cinema_id}>
                {cinema.cinema_name || cinema.name}
              </option>
            ))}
          </select>
        )}
        {!selectedCinema && (
          <p className="text-red-500 text-sm mt-2">
            Vui lòng chọn một rạp để quản lý phòng chiếu.
          </p>
        )}
      </div>

      {/* Room Table - Only show if a cinema is selected */}
      <div className="bg-white rounded-xl shadow-md p-4">
        {selectedCinema ? (
          <RoomTable
            cinemaId={selectedCinema}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
            onRestoreRoom={handleRestoreRoom}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600">
            Vui lòng chọn một rạp chiếu để xem và quản lý các phòng.
          </div>
        )}
      </div>
      {/* Room Form Modal */}
      <Modal open={isFormVisible} onClose={handleCancelEdit}>
        <RoomForm
          onSubmit={handleAddOrUpdateRoom}
          onCancel={handleCancelEdit}
          initialData={editingRoom}
        />
      </Modal>
    </div>
  );
};

export default TheaterRoomsManagement;
