import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useGetPhimUS,
  useGetAllShowtimesUS,
  useGetAllTheaterRoomsUS,
  useGetAllConcessionsUS,
} from "../../../api/homePage/queries";

const TicketForm = ({ order = null, onSave, onCancel, isEdit = false }) => {
  const [formData, setFormData] = useState({
    // Thông tin cơ bản
    customer: "",
    phone: "",
    email: "",
    note: "",
    status: "Chờ thanh toán",

    // Thông tin phim và suất chiếu
    movie: "",
    showTime: "",
    showDate: "",
    room: "",

    // Thông tin ghế
    seats: [],
    seatType: "Ghế thường",

    // Thông tin vé
    tickets: [],
    ticketType: "Vé thường",
    ticketCount: 1,

    // Thông tin combo/dịch vụ
    services: [],
    combos: {},

    // Thông tin thanh toán
    total: "0",
    discount: "0",
    paymentMethod: "Chưa chọn",
  });

  const [errors, setErrors] = useState({});

  // API hooks
  const { data: moviesData } = useGetPhimUS();
  const { data: showtimesData } = useGetAllShowtimesUS();
  const { data: roomsData } = useGetAllTheaterRoomsUS();
  const { data: concessionsData } = useGetAllConcessionsUS();

  // Đảm bảo movies luôn là mảng
  let movies = [];
  if (Array.isArray(moviesData?.data)) {
    movies = moviesData.data.map((movie) => movie.movie_name);
  } else if (moviesData?.data && typeof moviesData.data === "object") {
    movies = Object.values(moviesData.data).map((movie) => movie.movie_name);
  }

  const rooms =
    roomsData?.data && Array.isArray(roomsData.data)
      ? roomsData.data.map(
          (room) => `${room.room_name} - ${room.cinemas?.cinema_name}`
        )
      : [];
  const showTimes =
    showtimesData?.data && Array.isArray(showtimesData.data)
      ? showtimesData.data.map(
          (showtime) =>
            `${new Date(showtime.start_time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${new Date(showtime.end_time).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
        )
      : [];

  const seatTypes = ["Ghế thường", "Ghế VIP", "Ghế 4DX"];
  const paymentMethods = [
    "Chưa chọn",
    "MoMo",
    "OnePay",
    "Tiền mặt",
    "Thẻ tín dụng",
  ];

  const availableSeats = [
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "B8",
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
    "C6",
    "C7",
    "C8",
    "D1",
    "D2",
    "D3",
    "D4",
    "D5",
    "D6",
    "D7",
    "D8",
    "E1",
    "E2",
    "E3",
    "E4",
    "E5",
    "E6",
    "E7",
    "E8",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
  ];

  let availableServices = [];
  if (Array.isArray(concessionsData?.data)) {
    availableServices = concessionsData.data.map(concession => ({
      name: concession.concession_name,
      price: concession.price?.toLocaleString() || "0"
    }));
  } else if (concessionsData?.data && typeof concessionsData.data === "object") {
    availableServices = Object.values(concessionsData.data).map(concession => ({
      name: concession.concession_name,
      price: concession.price?.toLocaleString() || "0"
    }));
  } else {
    availableServices = [
      { name: "HCINEMA COMBO", price: "113,000" },
      { name: "MY COMBO", price: "87,000" },
      { name: "LADIES LOVE SET", price: "183,000" },
      { name: "KIDS COMBO", price: "67,000" },
      { name: "VIP COMBO", price: "200,000" },
    ];
  }

  // Khởi tạo form data khi edit
  useEffect(() => {
    if (order && isEdit) {
      setFormData({
        customer: order.customer || "",
        phone: order.phone || "",
        email: order.email || "",
        note: order.note || "",
        status: order.status || "Chờ thanh toán",
        movie: order.movie || "",
        showTime: order.showTime || "",
        showDate: order.showDate || "",
        room: order.room || "",
        seats: order.seats || [],
        seatType: order.seatType || "Ghế thường",
        tickets: order.tickets || [],
        ticketType: order.ticketType || "Vé thường",
        ticketCount: order.ticketCount || 1,
        services: order.services || [],
        combos: order.combos || {},
        total: order.total || "0",
        discount: order.discount || "0",
        paymentMethod: order.paymentMethod || "Chưa chọn",
      });
    }
  }, [order, isEdit]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer.trim()) {
      newErrors.customer = "Tên khách hàng không được để trống";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.movie.trim()) {
      newErrors.movie = "Vui lòng chọn phim";
    }

    if (!formData.showTime.trim()) {
      newErrors.showTime = "Vui lòng chọn suất chiếu";
    }

    if (!formData.room.trim()) {
      newErrors.room = "Vui lòng chọn phòng chiếu";
    }

    if (formData.seats.length === 0) {
      newErrors.seats = "Vui lòng chọn ít nhất 1 ghế";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSeatChange = (seatName, isSelected) => {
    setFormData((prev) => ({
      ...prev,
      seats: isSelected
        ? [
            ...prev.seats,
            { name: seatName, type: prev.seatType, price: "100,000" },
          ]
        : prev.seats.filter((seat) => seat.name !== seatName),
    }));
  };

  const handleServiceChange = (serviceName, quantity) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services
        .map((service) =>
          service.name === serviceName
            ? { ...service, quantity: parseInt(quantity) || 0 }
            : service
        )
        .filter((service) => service.quantity > 0),
    }));
  };

  const calculateTotal = () => {
    let total = 0;

    // Tính tiền ghế
    total += formData.seats.length * 100000;

    // Tính tiền combo
    formData.services.forEach((service) => {
      const price = parseInt(service.price.replace(/,/g, ""));
      total += price * service.quantity;
    });

    // Trừ giảm giá
    const discount = parseInt(formData.discount.replace(/,/g, "")) || 0;
    total -= discount;

    return total.toLocaleString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    // Chuyển đổi dữ liệu sang format API
    const submitData = {
      user_id: order?.originalData?.user_id || 1, // Default user ID
      show_time_id: formData.showTimeId || 1, // Cần map từ showTime
      total_price: parseInt(calculateTotal().replace(/,/g, "")),
      discount: parseInt(formData.discount.replace(/,/g, "")) || 0,
      status:
        formData.status === "Chờ thanh toán"
          ? "pending"
          : formData.status === "Đã thanh toán"
          ? "paid"
          : "cancelled",
      payment_method:
        formData.paymentMethod === "Chưa chọn" ? null : formData.paymentMethod,
      note: formData.note,
      // Dữ liệu ghế
      seats: formData.seats.map((seat) => ({
        seat_id: seat.seatId || 1,
        ticket_type_id: seat.ticketTypeId || 1,
      })),
      // Dữ liệu dịch vụ
      concessions: formData.services.map((service) => ({
        concession_id: service.concessionId || 1,
        quantity: service.quantity,
      })),
    };

    onSave(submitData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEdit ? "Sửa đơn hàng" : "Thêm đơn hàng mới"}
        </h2>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thông tin khách hàng */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên khách hàng *
              </label>
              <input
                type="text"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.customer ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên khách hàng"
              />
              {errors.customer && (
                <p className="text-red-500 text-sm mt-1">{errors.customer}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0123456789"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái đơn hàng
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Chờ thanh toán">Chờ thanh toán</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thông tin phim và suất chiếu */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            Thông tin phim và suất chiếu
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phim *
              </label>
              <select
                name="movie"
                value={formData.movie}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.movie ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn phim</option>
                {movies.map((movie) => (
                  <option key={movie} value={movie}>
                    {movie}
                  </option>
                ))}
              </select>
              {errors.movie && (
                <p className="text-red-500 text-sm mt-1">{errors.movie}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suất chiếu *
              </label>
              <select
                name="showTime"
                value={formData.showTime}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.showTime ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn suất chiếu</option>
                {showTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.showTime && (
                <p className="text-red-500 text-sm mt-1">{errors.showTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày chiếu
              </label>
              <input
                type="date"
                name="showDate"
                value={formData.showDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng chiếu *
              </label>
              <select
                name="room"
                value={formData.room}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.room ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Chọn phòng chiếu</option>
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
              {errors.room && (
                <p className="text-red-500 text-sm mt-1">{errors.room}</p>
              )}
            </div>
          </div>
        </div>

        {/* Chọn ghế */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Chọn ghế *</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại ghế
            </label>
            <select
              name="seatType"
              value={formData.seatType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {seatTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-8 gap-2 max-w-2xl">
            {availableSeats.map((seatName) => {
              const isSelected = formData.seats.some(
                (seat) => seat.name === seatName
              );
              return (
                <button
                  key={seatName}
                  type="button"
                  onClick={() => handleSeatChange(seatName, !isSelected)}
                  className={`p-2 text-xs font-bold rounded border transition-colors ${
                    isSelected
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {seatName}
                </button>
              );
            })}
          </div>
          {errors.seats && (
            <p className="text-red-500 text-sm mt-2">{errors.seats}</p>
          )}
        </div>

        {/* Chọn combo/dịch vụ */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Chọn combo/dịch vụ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableServices.map((service) => {
              const existingService = formData.services.find(
                (s) => s.name === service.name
              );
              const quantity = existingService ? existingService.quantity : 0;

              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.price} VND</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleServiceChange(
                          service.name,
                          Math.max(0, quantity - 1)
                        )
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleServiceChange(service.name, quantity + 1)
                      }
                      className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thông tin thanh toán */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Thông tin thanh toán</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giảm giá (VND)
              </label>
              <input
                type="text"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng tiền
              </label>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-lg font-bold text-blue-600">
                {calculateTotal()} VND
              </div>
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ghi chú bổ sung về đơn hàng..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEdit ? "Cập nhật" : "Thêm đơn hàng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
