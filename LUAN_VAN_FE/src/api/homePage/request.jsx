import axios from "../axios";
export const NGROK_URL =
  import.meta.env.VITE_NGROK_URL || window.location.origin; // Đặt biến này trong .env của frontend
const END_POINT = {
  PHIM: "movie",
  CHITIETPHIM: "suatchieu/phim",
  LOAIVE: "ticket-type",
  DSGHE: "phong/dsghe",
  RAP: "rap",
  PHONG: "phong",
  BOOKING: "booking",
  DVANUONG: "dichvuanuong",
  USER: "user",
  USERS: "users",
  CINEMA: "cinema",
  DISTRICT: "district",
  GENRE: "genre",
  SCREENTYPE: "screentype",
  CONCESSION: "concession",
  THEATER_ROOMS: "room",
  SHOWTIME: "showtime",
  SCHEDULE: "movie-schedules",
  // MoMo Payment endpoints
  // MOMO_BOOK_AND_PAY: "payment/momo/book-and-pay",
  // MOMO_STATUS: "payment/momo/status",
  PAYMENT_INITIATE: "payment/initiate",
  PAYMENT_STATUS: "payment/status",
  PROMOTION: "promotion",
  REVENUE_REPORT: "report/revenue",
  REPORT: "report",
};

// Helper/Utility

// Hàm helper để tạo FormData
const createFormData = (data) => {
  const formData = new FormData();
  // Xử lý từng trường dữ liệu
  Object.keys(data).forEach((key) => {
    if (key === "poster" && data[key] instanceof File) {
      formData.append("poster", data[key], data[key].name);
    } else if (key === "avatar" && data[key] instanceof File) {
      // Chỉ thêm avatar nếu là File mới
      formData.append("avatar", data[key], data[key].name);
    } else if (key === "avatar" && data[key] === null) {
      // Nếu avatar là null, không thêm vào FormData để giữ ảnh cũ
      // console.log("Keeping existing avatar");
    } else if (key === "genres_ids" && Array.isArray(data[key])) {
      data[key].forEach((id) => {
        // console.log("Adding genre_id:", id);
        formData.append("genres_ids[]", id);
      });
    } else if (key === "actor") {
      // console.log("Adding actor:", data[key]);
      formData.append("actor", data[key]);
    } else if (key === "screening_type") {
      // console.log("Adding screening_type:", data[key]);
      formData.append("screening_type", data[key]);
    } else if (key === "screenin_type_ids" && Array.isArray(data[key])) {
      data[key].forEach((type) => {
        // console.log("Adding screenin_type_id:", type);
        formData.append("screenin_type_ids[]", type);
      });
    } else {
      // Chuyển đổi tên trường để khớp với backend (nếu cần) và thêm vào FormData
      // Bao gồm cả password và password_confirmation
      let backendKey = key;
      let value = data[key];

      // Xử lý các trường cụ thể, nếu không thì dùng tên key mặc định
      switch (key) {
        case "movie_name":
          backendKey = "movie_name";
          break;
        case "description":
          backendKey = "description";
          break;
        case "duration":
          backendKey = "duration";
          value = parseInt(value);
          break;
        case "release_date":
          backendKey = "release_date";
          break;
        case "derector":
          backendKey = "derector";
          break;
        case "status":
          backendKey = "status";
          break;
        case "age_rating":
          backendKey = "age_rating";
          value = parseInt(value);
          break;
        case "country":
          backendKey = "country";
          break;
        case "user_id":
          backendKey = "user_id";
          break;
        case "full_name":
          backendKey = "full_name";
          break;
        case "email":
          backendKey = "email";
          break;
        case "password":
          backendKey = "password";
          break;
        case "password_confirmation":
          backendKey = "password_confirmation";
          break;
        case "phone":
          backendKey = "phone";
          break;
        case "role":
          backendKey = "role";
          break;
        case "birth_date":
          backendKey = "birth_date";
          break;
        case "gender":
          backendKey = "gender";
          break;
        case "_method":
          backendKey = "_method";
          break;
      }

      // Append _method for PATCH requests when updating, checking for 'id' OR 'user_id'
      if (
        (backendKey === "id" || backendKey === "user_id") &&
        value !== undefined &&
        value !== null
      ) {
        formData.append("_method", "put"); // Use 'put' as backend allows PUT/PATCH
      }

      // Kiểm tra giá trị trước khi thêm vào FormData
      if (value === undefined || value === null || value === "") {
        console.warn(`Warning: ${backendKey} is empty or undefined`);
      }

      if (value !== undefined && value !== null) {
        // Chỉ thêm nếu giá trị không phải undefined hoặc null
        console.log(`Adding ${backendKey}:`, value);
        formData.append(backendKey, value);
      }
    }
  });

  // Log FormData để debug
  console.log("Final FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value instanceof File ? value.name : value}`);
  }

  return formData;
};

// Movie APIs (Phim)

export const getPhimAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.PHIM,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim:", error);
    throw error;
  }
};
export const getPhimClientAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/movies/client`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim:", error);
    throw error;
  }
};

export const searchMoviesAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/list/filter`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm phim:", error);
    throw error;
  }
};
export const searchMoviesPublicAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/list/filter-public`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm phim:", error);
    throw error;
  }
};

export const getPhimTheoRapAPI = async (cinemaId) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/cinema/${cinemaId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim theo rạp:", error);
    throw error;
  }
};

export const getChiTietPhimAPI = async (ma_phim) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/${ma_phim}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết phim:", error);
    throw error;
  }
};

export const getMovieWithShowtimesAPI = async (movieId) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/${movieId}/movieandshowtime`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phim và suất chiếu:", error);
    throw error;
  }
};

export const createPhimAPI = async (formData) => {
  try {
    const response = await axios({
      method: "POST",
      url: END_POINT.PHIM,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      transformRequest: [(data) => data], // Prevent axios from transforming FormData
    });

    return response.data;
  } catch (error) {
    console.error("Error in createPhimAPI:", error);
    throw error;
  }
};

export const updatePhimAPI = async (ma_phim, formData) => {
  try {
    formData.append("_method", "PATCH");
    const response = await axios({
      url: `${END_POINT.PHIM}/${ma_phim}`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.entries(error.response.data.errors).forEach(
        ([field, messages]) => {
          console.error(`Field ${field}:`, messages);
        }
      );
    }
    throw error;
  }
};

export const deletePhimAPI = async (ma_phim) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/${ma_phim}`,
      method: "DELETE",
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa phim ${ma_phim}:`, error);
    throw error;
  }
};

export const getDeletedMoviesAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/list/restore`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim đã xóa:", error);
    throw error;
  }
};

export const restoreMovieAPI = async (movieId) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/${movieId}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error(`Lỗi khi khôi phục phim ${movieId}:`, error);
    throw error;
  }
};

// Ticket Type APIs (Loại vé)

export const getAllTicketTypesAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.LOAIVE,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại vé:", error);
    throw error;
  }
};

export const getDeletedTicketTypesAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.LOAIVE + "/list-restore",
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại vé đã xóa mềm:", error);
    throw error;
  }
};

export const createTicketTypeAPI = async (data) => {
  try {
    const formData = createFormData(data);
    const response = await axios({
      url: END_POINT.LOAIVE,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo loại vé:", error);
    throw error;
  }
};

export const updateTicketTypeAPI = async (id, data) => {
  try {
    const formData = createFormData(data);
    formData.append("_method", "PUT");
    const response = await axios({
      url: `${END_POINT.LOAIVE}/${id}`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật loại vé:", error);
    throw error;
  }
};

export const deleteTicketTypeAPI = async (id) => {
  try {
    const response = await axios({
      url: `${END_POINT.LOAIVE}/${id}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa loại vé:", error);
    throw error;
  }
};

export const restoreTicketTypeAPI = async (id) => {
  try {
    const response = await axios({
      url: `${END_POINT.LOAIVE}/${id}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi khôi phục loại vé:", error);
    throw error;
  }
};

// Seat APIs (Ghế)

export const getDSGHEAPI = async (ma_phong) => {
  try {
    const response = await axios({
      url: `${END_POINT.DSGHE}/${ma_phong}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ghế:", error);
    throw error;
  }
};

export const getTrangThaiGheAPI = async (ma_suat_chieu) => {
  try {
    const response = await axios({
      url: `${END_POINT.DSGHE}/${ma_suat_chieu}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy trạng thái ghế:", error);
    throw error;
  }
};

// Cinema APIs (Rạp)

export const getAllCinemasAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.CINEMA,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách rạp:", error);
    throw error;
  }
};

export const getCinemaByIdAPI = async (cinemaId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CINEMA}/${cinemaId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin rạp:", error);
    throw error;
  }
};

export const createCinemaAPI = async (formData) => {
  try {
    const response = await axios({
      url: END_POINT.CINEMA,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo rạp:", error);
    throw error;
  }
};

export const updateCinemaAPI = async (cinemaId, formData) => {
  try {
    formData.append("_method", "PATCH");
    const response = await axios({
      url: `${END_POINT.CINEMA}/${cinemaId}`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin rạp:", error);
    throw error;
  }
};

export const deleteCinemaAPI = async (cinemaId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CINEMA}/${cinemaId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa rạp:", error);
    throw error;
  }
};

export const getDeletedCinemasAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.CINEMA}/list/restore`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách rạp đã xóa:", error);
    throw error;
  }
};

export const restoreCinemaAPI = async (cinemaId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CINEMA}/${cinemaId}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error(`Lỗi khi khôi phục rạp ${cinemaId}:`, error);
    throw error;
  }
};

export const getPhongAPI = async (ma_phong) => {
  try {
    const response = await axios({
      url: `${END_POINT.PHONG}/${ma_phong}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phòng:", error);
    throw error;
  }
};

export const getRapAPI = async (ma_rap) => {
  try {
    const response = await axios({
      url: `${END_POINT.RAP}/${ma_rap}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin rạp:", error);
    throw error;
  }
};

export const getRapSCAPI = async (ma_phim) => {
  try {
    const response = await axios({
      url: `${END_POINT.CHITIETPHIM}/${ma_phim}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin rạp chiếu:", error);
    throw error;
  }
};

// District (Quận)

export const getAllDistrictsAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.DISTRICT,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quận:", error);
    throw error;
  }
};
export const getDeleteAllDistrictsAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.DISTRICT}/list-restore`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quận:", error);
    throw error;
  }
};
export const createDistrictAPI = async (districtData) => {
  try {
    const formData = createFormData(districtData);
    const response = await axios({
      url: END_POINT.DISTRICT,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "mutipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo quận:", error);
    throw error;
  }
};
export const updateDistrictAPI = async (districtId, districtData) => {
  try {
    const formData = createFormData(districtData);
    formData.append("_method", "PUT");
    const response = await axios({
      url: `${END_POINT.DISTRICT}/${districtId}`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformData: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Loi khi cap nhat quan:", error);
    throw error;
  }
};

export const deleteDistrictAPI = async (districtId) => {
  try {
    const response = await axios({
      url: `${END_POINT.DISTRICT}/${districtId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa quận:", error);
    throw error;
  }
};
export const restoreDistrictAPI = async (districtId) => {
  try {
    const response = await axios({
      url: `${END_POINT.DISTRICT}/${districtId}/restore`, // Sử dụng URL từ ảnh
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    return response.data; // Trả về data từ response
  } catch (error) {
    console.error("Lỗi khi khôi phục quận/huyện:", error);
    throw error;
  }
};

// Theater Room APIs (Phòng chiếu)

export const getAllTheaterRoomsAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.THEATER_ROOMS,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng chiếu:", error);
    throw error;
  }
};

export const getTheaterRoomByIdAPI = async (roomId) => {
  try {
    const response = await axios({
      url: `${END_POINT.THEATER_ROOMS}/${roomId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phòng chiếu:", error);
    throw error;
  }
};

export const createTheaterRoomAPI = async (roomData) => {
  try {
    const formData = createFormData(roomData);
    const response = await axios({
      url: END_POINT.THEATER_ROOMS,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo phòng chiếu:", error);
    throw error;
  }
};

export const updateTheaterRoomAPI = async (roomId, roomData) => {
  try {
    const formData = createFormData(roomData);
    formData.append("_method", "PUT");
    const response = await axios({
      url: `${END_POINT.THEATER_ROOMS}/${roomId}`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin phòng chiếu:", error);
    throw error;
  }
};

export const deleteTheaterRoomAPI = async (roomId) => {
  try {
    const response = await axios({
      url: `${END_POINT.THEATER_ROOMS}/${roomId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa phòng chiếu:", error);
    throw error;
  }
};

export const restoreTheaterRoomAPI = async (roomId) => {
  try {
    const response = await axios({
      url: `${END_POINT.THEATER_ROOMS}/${roomId}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi khôi phục phòng chiếu:", error);
    throw error;
  }
};

export const getSeatMapByRoomIdAPI = async (roomId) => {
  try {
    const response = await axios({
      url: `room/${roomId}/listSeat`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy sơ đồ ghế phòng chiếu:", error);
    throw error;
  }
};

export const getTheaterRoomsByCinemaAPI = async (cinemaId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CINEMA}/${cinemaId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng chiếu của rạp:", error);
    throw error;
  }
};
export const getTheaterRoomsListByCinemaAPI = async (cinemaId) => {
  try {
    const response = await axios({
      // Đảm bảo backend của bạn có endpoint này
      url: `${END_POINT.CINEMA_ROOMS_LIST}/${cinemaId}/list-room`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách phòng chiếu của rạp ID ${cinemaId}:`,
      error
    );
    throw error;
  }
};

// Showtime APIs (Suất chiếu)

export const getAllShowtimesAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.SHOWTIME,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách suất chiếu:", error);
    throw error;
  }
};

export const createShowtimeAPI = async (showtimeData) => {
  try {
    const response = await axios({
      url: END_POINT.SHOWTIME,
      method: "POST",
      data: showtimeData,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo suất chiếu:", error);
    throw error;
  }
};

export const getShowtimeByIdAPI = async (showtimeId) => {
  try {
    const response = await axios({
      url: `${END_POINT.SHOWTIME}/${showtimeId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết suất chiếu:", error);
    throw error;
  }
};

export const updateShowtimeAPI = async (showtimeId, showtimeData) => {
  try {
    const formData = createFormData(showtimeData);
    formData.append("_method", "PUT"); // Thêm _method=PUT để Laravel xử lý như PUT request
    const response = await axios({
      url: `${END_POINT.SHOWTIME}/${showtimeId}`,
      method: "POST", // Vẫn giữ là POST nhưng thêm _method=PUT
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật suất chiếu:", error);
    throw error;
  }
};

export const deleteShowtimeAPI = async (showtimeId) => {
  try {
    const response = await axios({
      url: `${END_POINT.SHOWTIME}/${showtimeId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa suất chiếu:", error);
    throw error;
  }
};

export const reactivateShowtimeAPI = async (showtimeId) => {
  try {
    const response = await axios({
      url: `${END_POINT.SHOWTIME}/${showtimeId}/reactivate`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi kích hoạt lại suất chiếu:", error);
    throw error;
  }
};

export const getFilteredShowtimesAPI = async (filterData) => {
  try {
    const response = await axios({
      url: `${END_POINT.SHOWTIME}/getlistFilter`,
      method: "POST",
      data: filterData,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lọc danh sách suất chiếu:", error);
    throw error;
  }
};
export const getSeatMapAPI = async (showtimeId) => {
  try {
    const response = await axios({
      url: `room/${showtimeId}/seatmap`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy sơ đồ ghế:", error);
    throw error;
  }
};
export const getSeatMapCheckAPI = async ({ showtimeId, seatIds }) => {
  try {
    const response = await axios({
      url: `room/${showtimeId}/check-seat`,
      method: "POST",
      data: { seat_ids: seatIds },
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy sơ đồ ghế:", error);
    throw error;
  }
};

// Concession APIs (Dịch vụ ăn uống)

export const getAllConcessionsAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.CONCESSION,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách dịch vụ ăn uống:", error);
    throw error;
  }
};

export const getDVAnUongAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.CONCESSION,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách dịch vụ ăn uống:", error);
    throw error;
  }
};

export const getConcessionByIdAPI = async (concessionId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CONCESSION}/${concessionId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin dịch vụ ăn uống:", error);
    throw error;
  }
};

export const createConcessionAPI = async (concessionData) => {
  try {
    // Nhận FormData trực tiếp từ component
    const response = await axios({
      url: END_POINT.CONCESSION,
      method: "POST",
      data: concessionData, // Dùng formData trực tiếp
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo dịch vụ ăn uống:", error);
    throw error;
  }
};

// export const updateConcessionAPI = async (concessionId, concessionData) => {
//   try {
//     const formData = createFormData(concessionData);
//     formData.append("_method", "PUT");
//     const response = await axios({
//       url: `${END_POINT.CONCESSION}/${concessionId}`,
//       method: "POST",
//       data: formData,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//       transformRequest: [(data) => data],
//     });
//     return response;
//   } catch (error) {
//     console.error("Lỗi khi cập nhật dịch vụ ăn uống:", error);
//     throw error;
//   }
// };
export const updateConcessionAPI = async (concessionId, concessionData) => {
  try {
    // Không cần tạo FormData nữa, vì nó đã được tạo ở frontend
    // const formData = createFormData(concessionData); // Bỏ dòng này đi
    const response = await axios({
      url: `${END_POINT.CONCESSION}/${concessionId}`,
      method: "POST", // Vẫn là POST vì dùng _method: "PUT"
      data: concessionData, // Dùng thẳng concessionData (là FormData)
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật dịch vụ ăn uống:", error);
    throw error;
  }
};

export const deleteConcessionAPI = async (concessionId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CONCESSION}/${concessionId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa dịch vụ ăn uống:", error);
    throw error;
  }
};
export const getDeletedConcessionAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.CONCESSION}/list/restore`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thức ăn đã xóa:", error);
    throw error;
  }
};

export const restoreConcessionAPI = async (concessionId) => {
  try {
    const response = await axios({
      url: `${END_POINT.CONCESSION}/${concessionId}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error(`Lỗi khi khôi phục dịch vụ ăn uống ${concessionId}: `, error);
    throw error;
  }
};

// Genre APIs (Thể loại)

export const getAllGenreAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.GENRE,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thể loại:", error);
    throw error;
  }
};

export const getGenreByIdAPI = async (genreId) => {
  try {
    const response = await axios({
      url: `${END_POINT.GENRE}/${genreId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thể loại:", error);
    throw error;
  }
};

export const createGenreAPI = async (genreData) => {
  try {
    const formData = createFormData(genreData);
    const response = await axios({
      url: END_POINT.GENRE,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo thể loại:", error);
    throw error;
  }
};

export const updateGenreAPI = async (genreId, genreData) => {
  try {
    const formData = createFormData(genreData);
    formData.append("_method", "PUT");
    const response = await axios({
      url: `${END_POINT.GENRE}/${genreId}`,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin thể loại:", error);
    throw error;
  }
};

export const deleteGenreAPI = async (genreId) => {
  try {
    const response = await axios({
      url: `${END_POINT.GENRE}/${genreId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa thể loại:", error);
    throw error;
  }
};

export const restoreGenreAPI = async (genreId) => {
  try {
    const response = await axios({
      url: `${END_POINT.GENRE}/${genreId}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error(`Lỗi khi khôi phục thể loại ${genreId}:`, error);
    throw error;
  }
};

export const getDeletedGenresAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.GENRE + "/list-restore",
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thể loại đã xóa mềm:", error);
    throw error;
  }
};

// User APIs (Người dùng)

export const getAllUsersAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.USERS,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};

export const getUserByIdAPI = async (userId) => {
  try {
    const response = await axios({
      url: `${END_POINT.USERS}/${userId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    throw error;
  }
};

// request.jsx
export const createUserAPI = async (userData) => {
  try {
    const response = await axios({
      url: END_POINT.USERS,
      method: "POST",
      data: userData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng (toàn bộ đối tượng error):", error);
    throw error;
  }
};

export const updateUserAPI = async (userId, UserData) => {
  try {
    // formDataFromUserForm.append("_method", "PATCH");
    // UserData.append("_method", "PATCH");
    const response = await axios({
      url: `${END_POINT.USERS}/${userId}`,
      method: "POST",
      data: UserData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.entries(error.response.data.errors).forEach(
        ([field, messages]) => {
          console.error(`Field ${field}:`, messages);
        }
      );
    }
    throw error;
  }
};

export const deleteUserAPI = async (userId) => {
  try {
    const response = await axios({
      url: `${END_POINT.USERS}/${userId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    throw error;
  }
};

export const getCurrentUserAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.USER,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin cá nhân user:", error);
    throw error;
  }
};

// Payment APIs (New)

export const initiatePaymentAPI = async (bookingData) => {
  try {
    // Payload sẽ được truyền vào từ component, không tự động thêm URL nữa
    const response = await axios({
      url: END_POINT.PAYMENT_INITIATE,
      method: "POST",
      data: bookingData, // SỬ DỤNG bookingData TRỰC TIẾP
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi khởi tạo thanh toán:", error);
    throw error;
  }
};

export const checkPaymentStatusAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: END_POINT.PAYMENT_STATUS,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
    throw error;
  }
};

// Movie Schedule APIs (Lịch chiếu)

export const getAllMovieSchedulesAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.SCHEDULE,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lịch chiếu:", error);
    throw error;
  }
};
export const restoreScheduleAPI = async (scheduleId) => {
  try {
    const response = await axios({
      url: `${END_POINT.SCHEDULE}/${scheduleId}/restore`,
      method: "POST",
    });
    return response;
  } catch (error) {
    console.error(`Lỗi khi khôi phục phim ${scheduleId}:`, error);
    throw error;
  }
};

export const getMovieScheduleByIdAPI = async (id) => {
  try {
    const response = await axios({
      url: `${END_POINT.SCHEDULE}/${id}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết lịch chiếu:", error);
    throw error;
  }
};

export const createMovieScheduleAPI = async (data) => {
  try {
    const response = await axios({
      url: END_POINT.SCHEDULE,
      method: "POST",
      data,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo lịch chiếu:", error);
    throw error;
  }
};

export const updateMovieScheduleAPI = async (id, data) => {
  try {
    const response = await axios({
      url: `${END_POINT.SCHEDULE}/${id}`,
      method: "PATCH",
      data,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật lịch chiếu:", error);
    throw error;
  }
};

export const deleteMovieScheduleAPI = async (id) => {
  try {
    const response = await axios({
      url: `${END_POINT.SCHEDULE}/${id}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa lịch chiếu:", error);
    throw error;
  }
};
export const getDeleteAllMovieSchedulesAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.SCHEDULE}/list-restore`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lịch chiếu đã xóa:", error);
    throw error;
  }
};

// Booking APIs (Đặt vé)

export const postBooKingAPI = async (bookingData) => {
  try {
    const response = await axios({
      url: END_POINT.BOOKING,
      method: "POST",
      data: bookingData,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi đặt vé:", error);
    throw error;
  }
};
export const getAllBookingsAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.BOOKING,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đặt vé:", error);
    throw error;
  }
};

export const getBookingByIdAPI = async (bookingId) => {
  try {
    const response = await axios({
      url: `${END_POINT.BOOKING}/${bookingId}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đặt vé:", error);
    throw error;
  }
};

export const createBookingAPI = async (bookingData) => {
  try {
    const response = await axios({
      url: END_POINT.BOOKING,
      method: "POST",
      data: bookingData,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo đặt vé:", error);
    throw error;
  }
};

export const updateBookingAPI = async (bookingId) => {
  try {
    const response = await axios({
      url: `${END_POINT.BOOKING}/${bookingId}/approve-counter`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật đặt vé:", error);
    throw error;
  }
};

export const deleteBookingAPI = async (bookingId) => {
  try {
    const response = await axios({
      url: `${END_POINT.BOOKING}/${bookingId}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa đặt vé:", error);
    throw error;
  }
};

// Lấy danh sách phim cho district manager
export const getManagedMoviesAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.PHIM}/managed/list`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phim quản lý:", error);
    throw error;
  }
};

// Promotion APIs (Khuyến mãi)

export const getAllPromotionsAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.PROMOTION,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
    throw error;
  }
};
export const getAllPromotionsUserAPI = async () => {
  try {
    const response = await axios({
      url: `${END_POINT.PROMOTION}/cilent`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khuyến mãi:", error);
    throw error;
  }
};

export const getPromotionByIdAPI = async (id) => {
  try {
    const response = await axios({
      url: `${END_POINT.PROMOTION}/${id}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết khuyến mãi:", error);
    throw error;
  }
};

export const createPromotionAPI = async (formData) => {
  try {
    const response = await axios({
      url: END_POINT.PROMOTION,
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tạo khuyến mãi:", error);
    throw error;
  }
};

export const updatePromotionAPI = async (id, data) => {
  try {
    const response = await axios({
      url: `${END_POINT.PROMOTION}/${id}`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: [(data) => data],
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật khuyến mãi:", error);
    throw error;
  }
};

export const deletePromotionAPI = async (id) => {
  try {
    const response = await axios({
      url: `${END_POINT.PROMOTION}/${id}`,
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa khuyến mãi:", error);
    throw error;
  }
};

export const getUserPromotionsAPI = async (userId) => {
  try {
    const response = await axios({
      url: `${END_POINT.PROMOTION}/cilent`,
      method: "GET",
      params: {
        user_id: userId,
      },
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy khuyến mãi cho user:", error);
    throw error;
  }
};

export const calculatePromotionAPI = async (data) => {
  try {
    const response = await axios({
      url: `${END_POINT.PROMOTION}/apply`,
      method: "POST",
      data,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi tính toán khuyến mãi:", error);
    throw error;
  }
};

// ScreenType
export const getScreenTypeAPI = async () => {
  try {
    const response = await axios({
      url: END_POINT.SCREENTYPE,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại chiếu:", error);
    throw error;
  }
};

// Revenue Report APIs (Doanh thu)

export const getTotalRevenueAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REVENUE_REPORT}/total`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo doanh thu:", error);
    throw error;
  }
};
export const getTimeSeriesRevenueAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REVENUE_REPORT}/timeseries`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo doanh thu:", error);
    throw error;
  }
};

// Thêm API lấy doanh thu theo phim (theo movie_id)
export const getRevenueByMovieIdAPI = async (movieId, params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REVENUE_REPORT}/movie/${movieId}/revenue`, // Movie ID trong URL path
      method: "GET",
      params, // start_date và end_date sẽ được truyền vào đây
    });
    return response.data; // Trả về response.data để lấy trực tiếp dữ liệu chính
  } catch (error) {
    console.error(`Lỗi khi lấy doanh thu cho phim ID ${movieId}:`, error);
    throw error;
  }
};

// Thêm API lấy doanh thu tất cả phim
export const getAllMoviesRevenueAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REVENUE_REPORT}/movie/all`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu tất cả phim:", error);
    throw error;
  }
};
export const getMoviesRevenueByIDAPI = async (movieId, params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REPORT}/movie/${movieId}/revenue`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu phim theo ID:", error);
    throw error;
  }
};
// Thêm API lấy doanh thu tất cả rạp
export const getAllRapRevenueAPI = async (params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REVENUE_REPORT}/cinema/all`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu tất cả rạp:", error);
    throw error;
  }
};
export const getRapRevenueByIDAPI = async (rapId, params = {}) => {
  try {
    const response = await axios({
      url: `${END_POINT.REPORT}/cinema/${rapId}/revenue`,
      method: "GET",
      params,
    });
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy doanh thu rạp theo ID:", error);
    throw error;
  }
};
