import React from "react";

// Hàm chuyển đổi dữ liệu chi tiết booking từ API sang format UI
const transformBookingDetail = (data) => ({
  id: data.booking_id,
  total: data.total_price?.toLocaleString() + " VND",
  status:
    data.status === "paid"
      ? "Đã thanh toán"
      : data.status === "pending"
      ? "Chờ thanh toán"
      : data.status === "cancelled"
      ? "Đã hủy"
      : data.status,
  orderDate: data.booking_date
    ? new Date(data.booking_date).toLocaleDateString("vi-VN")
    : "",
  qrCodeUrl: data.qr_code_url,
  movie: data.showtime?.movie?.movie_name || "",
  showTime: data.showtime
    ? `${new Date(data.showtime.start_time).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(data.showtime.end_time).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "",
  showDate: data.showtime
    ? new Date(data.showtime.start_time).toLocaleDateString("vi-VN")
    : "",
  room: data.showtime?.room?.room_name || "",
  cinema: data.showtime?.room?.cinema?.cinema_name || "",
  customer: data.user?.full_name || "",
  phone: data.user?.phone || "",
  email: data.user?.email || "",
  seats:
    data.tickets?.map((t) => ({
      name: t.seat_display_name,
      type: t.ticket_type_name,
      price: t.unit_price?.toLocaleString() + " VND",
    })) || [],
  services:
    data.concessions?.map((c) => ({
      name: c.concession_name,
      quantity: c.quantity,
      price: c.total_price?.toLocaleString() + " VND",
      total: c.total_price?.toLocaleString() + " VND",
    })) || [],
});

const TicketDetail = ({ order: rawOrder, onBack, onEdit }) => {
  if (!rawOrder) return null;

  // Nếu dữ liệu là từ API chi tiết mới, transform lại
  const order = rawOrder.data
    ? transformBookingDetail(rawOrder.data)
    : rawOrder;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors cursor-pointer"
          onClick={onBack}
        >
          ← Quay lại
        </button>
        {order.canEdit && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => onEdit(order)}
          >
            ✏️ Sửa đơn hàng
          </button>
        )}
      </div>

      {/* QR code */}
      {order.qrCodeUrl && (
        <div className="mb-4 flex justify-center">
          <img src={order.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
        </div>
      )}

      <div className="flex gap-8 flex-wrap">
        {/* Thông tin đơn hàng */}
        <div className="flex-1 min-w-[250px]">
          <h3 className="text-lg font-bold mb-2">Thông tin đơn hàng</h3>
          <div className="space-y-2">
            <div>
              <span>Mã đơn hàng:</span> <b>{order.id}</b>
            </div>
            <div>
              <span>Phim:</span>{" "}
              <span className="text-blue-600 font-semibold">{order.movie}</span>
            </div>
            <div>
              <span>Giờ chiếu:</span>{" "}
              <span className="text-red-600 border border-red-200 px-2 py-1 rounded">
                {order.showTime}
              </span>
            </div>
            <div>
              <span>Ngày chiếu:</span> {order.showDate}
            </div>
            <div>
              <span>Phòng chiếu:</span> {order.room}
            </div>
            <div>
              <span>Rạp:</span> {order.cinema}
            </div>
            <div>
              <span>Ngày đặt:</span> {order.orderDate}
            </div>
          </div>
        </div>

        {/* Thông tin khách hàng */}
        <div className="flex-1 min-w-[250px]">
          <h3 className="text-lg font-bold mb-2">Thông tin khách hàng</h3>
          <div className="space-y-2">
            <div>
              <span>Khách hàng:</span>{" "}
              <span className="text-blue-600 font-semibold">
                {order.customer}
              </span>
            </div>
            <div>
              <span>Điện thoại:</span> {order.phone}
            </div>
            <div>
              <span>Email:</span> {order.email}
            </div>
            <div>
              <span>Trạng thái:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  order.status === "Đã thanh toán" ||
                  order.status === "paid" ||
                  order.status === "active"
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : order.status === "Đã hủy" ||
                      order.status === "cancelled" ||
                      order.status === "cancelled_by_room"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : order.status === "Chờ thanh toán" ||
                      order.status === "pending"
                    ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <span>Tổng tiền:</span>{" "}
              <span className="text-blue-600 font-semibold">{order.total}</span>
            </div>
          </div>
        </div>

        {/* Ghế & Dịch vụ */}
        <div className="flex-2 min-w-[250px]">
          <h3 className="text-lg font-bold mb-2">Ghế & Dịch vụ</h3>
          <table className="w-full mb-4 border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Thông tin ghế</th>
                <th className="border-b p-2">Loại ghế</th>
                <th className="border-b p-2">Giá tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.seats && order.seats.length > 0 ? (
                order.seats.map((seat, idx) => (
                  <tr key={idx}>
                    <td className="border-b p-2">{seat.name}</td>
                    <td className="border-b p-2">{seat.type}</td>
                    <td className="border-b p-2">{seat.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-2">
                    Không có ghế
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Tên dịch vụ</th>
                <th className="border-b p-2">Số lượng</th>
                <th className="border-b p-2">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.services && order.services.length > 0 ? (
                order.services.map((service, idx) => (
                  <tr key={idx}>
                    <td className="border-b p-2">{service.name}</td>
                    <td className="border-b p-2">{service.quantity}</td>
                    <td className="border-b p-2">{service.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center text-gray-400 py-2">
                    Không có dịch vụ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
