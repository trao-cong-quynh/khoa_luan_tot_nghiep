import React, { useState, useEffect } from "react";
import TicketTable from "../../components/admin/Ticket/TicketTable";
import TicketDetail from "../../components/admin/Ticket/TicketDetail";
import TicketForm from "../../components/admin/Ticket/TicketForm";
import Swal from "sweetalert2";
import {
  useGetAllBookingsUS,
  useCreateBookingUS,
  useUpdateBookingUS,
  useGetBookingByIdUS,
} from "../../api/homePage/queries";

const TicketOrder = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1); // API hooks

  const { data: bookingsData, isLoading, refetch } = useGetAllBookingsUS();
  const createBooking = useCreateBookingUS();
  const updateBooking = useUpdateBookingUS(); // Lấy chi tiết booking khi chọn đơn hàng

  const { data: bookingDetail, isLoading: isDetailLoading } =
    useGetBookingByIdUS(selectedOrder?.id, {
      enabled: !!selectedOrder,
    }); // Chuyển đổi dữ liệu từ API sang format hiển thị

  const transformBookingData = (booking) => {
    const transformedData = {
      id: booking.booking_id,
      movie: booking.movie_name || "Không rõ",
      showTime: booking.showtime_start_end,
      showDate: booking.showtime_date || booking.booking_date,
      room: booking.room_name || "Phòng chiếu",
      status: booking.status,
      total: booking.total_price?.toLocaleString() || "0",
      orderDate: booking.booking_date,
      customer: booking.user?.full_name || "Khách hàng",
      phone: booking.customer_phone || "Chưa có",
      email: booking.customer_email || "Chưa có",
      discount: booking.discount?.toLocaleString() || "0",
      paymentMethod: booking.payment_method || "Chưa chọn",
      canEdit: booking.status === "pending",
      seats: booking.seats || [],
      services: booking.services || [],
      originalData: booking,
    };
    return transformedData;
  };

  useEffect(() => {
    if (!bookingsData?.data) return;
    console.log("dữ liệu:", bookingsData.data);
    let filtered = bookingsData.data.map(transformBookingData);

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.movie.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((order) => {
        if (statusFilter === "Chờ thanh toán") {
          return (
            order.status === "pending" ||
            order.status === "pending_counter_payment"
          );
        } else if (statusFilter === "Đã thanh toán") {
          return order.status === "paid" || order.status === "active";
        } else if (statusFilter === "Đã hủy") {
          return order.status === "cancelled";
        }
        return false;
      });
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [bookingsData, searchTerm, statusFilter]); // Phân trang

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ); 

  const handleEditOrder = (order) => {
    if (!order.canEdit) {
      Swal.fire({
        icon: "warning",
        title: "Cảnh báo",
        text: 'Không thể sửa đơn hàng này vì trạng thái không phải "Chờ thanh toán"!',
        confirmButtonText: "Đồng ý",
      });
      return;
    }
    setShowForm(true);
    setEditingOrder(order);
    setIsEditMode(true);
  }; // Hàm duyệt đơn hàng

  const handleApproveOrder = async (order) => {
    Swal.fire({
      title: "Xác nhận duyệt đơn hàng",
      html: `
    <p class="text-sm text-gray-600">Bạn có chắc chắn muốn duyệt và đánh dấu đơn hàng này là **Đã thanh toán**?</p>
    <div class="mt-4 text-left p-4 bg-gray-100 rounded-lg">
      <p class="font-semibold text-gray-800">Mã đơn: <span class="font-normal">${order.id}</span></p>
      <p class="font-semibold text-gray-800">Tên phim: <span class="font-normal">${order.movie}</span></p>
    
      <p class="font-semibold text-gray-800">Tổng tiền: <span class="font-normal">${order.total} VND</span></p>
    </div>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      customClass: {
        confirmButton:
          "bg-green-600 text-white border-green-600 hover:bg-green-700 mr-6 p-4 cursor-pointer rounded",
        cancelButton:
          "bg-red-600 text-white border-red-600 hover:bg-red-700 p-4 cursor-pointer rounded",
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const bookingId = order.originalData?.booking_id || order.id;
          await updateBooking.mutateAsync(bookingId);
          Swal.fire("Thành công!", "Duyệt đơn hàng thành công!", "success");
          refetch();
        } catch (error) {
          const errorMessage =
            error?.response?.data?.message ||
            "Có lỗi xảy ra khi duyệt đơn hàng!";
          Swal.fire("Lỗi!", errorMessage, "error");
        }
      }
    });
  };

  const handleSaveOrder = async (formData) => {
    try {
      if (isEditMode) {
        const dataToUpdate = new FormData();
        for (const key in formData) {
          if (Object.prototype.hasOwnProperty.call(formData, key)) {
            dataToUpdate.append(key, formData[key]);
          }
        }

        const bookingId =
          editingOrder.originalData?.booking_id || editingOrder.id;
        await updateBooking.mutateAsync({
          bookingId: bookingId,
          bookingData: dataToUpdate,
        });
        Swal.fire("Thành công!", "Cập nhật đơn hàng thành công!", "success");
      } else {
        await createBooking.mutateAsync(formData);
        Swal.fire("Thành công!", "Thêm đơn hàng thành công!", "success");
      }

      setShowForm(false);
      setEditingOrder(null);
      setIsEditMode(false);
      refetch();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra!";
      Swal.fire("Lỗi!", errorMessage, "error");
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingOrder(null);
    setIsEditMode(false);
  };

  let mergedDetail = bookingDetail;

  return (
    <div className="ml-2 space-y-6 sm:space-y-2">
      {" "}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:p-6 bg-white rounded-xl shadow-lg sticky top-0 z-30">
        {" "}
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4 sm:mb-0">
          {" "}
          Quản lý Đơn hàng{" "}
        </h1>{" "}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {" "}
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên khách, phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />{" "}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Đã thanh toán">Đã thanh toán</option>
            <option value="Đã hủy">Đã hủy</option>{" "}
          </select>{" "}
        </div>{" "}
      </div>{" "}
      <div className="w-full">
        {" "}
        {showForm ? (
          <TicketForm
            order={editingOrder}
            onSave={handleSaveOrder}
            onCancel={handleCancelForm}
            isEdit={isEditMode}
          />
        ) : !selectedOrder ? (
          <div className="bg-white rounded-xl shadow-lg overflow-auto">
            {" "}
            {isLoading ? (
              <div className="p-8 text-center">
                {" "}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>{" "}
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>{" "}
              </div>
            ) : (
              <>
                {" "}
                <TicketTable
                  orders={paginatedOrders}
                  onRowClick={setSelectedOrder}
                  onEditClick={handleEditOrder}
                  onApproveClick={handleApproveOrder}
                />{" "}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 mb-4">
                    {" "}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
                    >
                      {" "}
                      Trước{" "}
                    </button>{" "}
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`cursor-pointer px-3 py-1 mx-1 rounded ${
                          currentPage === idx + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                        }`}
                      >
                        {" "}
                        {idx + 1}{" "}
                      </button>
                    ))}{" "}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="cursor-pointer px-3 py-1 mx-1 rounded bg-gray-200 disabled:opacity-50"
                    >
                      {" "}
                      Sau{" "}
                    </button>{" "}
                  </div>
                )}{" "}
              </>
            )}{" "}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {" "}
            {isDetailLoading ? (
              <div className="p-8 text-center">
                {" "}
                Đang tải chi tiết đơn hàng...{" "}
              </div>
            ) : (
              <TicketDetail
                order={mergedDetail}
                onBack={() => setSelectedOrder(null)}
                onEdit={() => handleEditOrder(selectedOrder)}
                onApprove={() => handleApproveOrder(selectedOrder)}
              />
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};

export default TicketOrder;
