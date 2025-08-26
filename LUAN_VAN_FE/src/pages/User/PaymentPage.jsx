import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PaymentForm from "./../../components/ui/payment/PaymentForm";
import BookingSummary from "./../../components/ui/payment/BookingSummary";
import PaymentSteps from "./../../components/ui/payment/PaymentSteps";
import PaymentMethodSelection from "./../../components/ui/payment/PaymentMethodSelection";
import PaymentActionButtons from "./../../components/ui/payment/PaymentActionButtons";
import GradientModal from "./../../components/ui/GradientModal";
import {
  usePostBookingUS,
  useInitiatePaymentUS,
  useCalculatePromotionUS,
  useGetUserPromotionsUS,
  useGetSeatMapCheckUS,
} from "./../../api/homePage/queries";
import { useAuth } from "./../../contexts/AuthContext";
import PromotionCodeInput from "./../../components/ui/payment/PromotionCodeInput";
import { getApiMessage } from "./../../Utilities/apiMessage";
import { NGROK_URL } from "./../../api/homePage/request";

function calculateTotalPrice(bookingData) {
  let total = 0;
  // Tính tiền vé
  if (bookingData.tickets) {
    total += bookingData.tickets.reduce((sum, ticket) => {
      const ticketPrice = parseFloat(ticket.ticket_price) || 0;
      const ticketCount = ticket.count || 0;
      return sum + ticketPrice * ticketCount;
    }, 0);
  }
  // Tính tiền combo/concession
  if (bookingData.combos && bookingData.allCombos) {
    total += Object.entries(bookingData.combos).reduce(
      (sum, [comboId, quantity]) => {
        const combo = bookingData.allCombos.find(
          (c) => c.concession_id?.toString() === comboId?.toString()
        );
        const comboPrice = combo?.unit_price || 0;
        return sum + comboPrice * quantity;
      },
      0
    );
  }
  return total;
}

function PaymentPage() {
  const { userData, isLoading: authLoading } = useAuth();
  const userId = userData?.user_id;

  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state || {};
  const [hasRedirected, setHasRedirected] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    agreeAge: false,
    agreeTerms: false,
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");

  const memoizedBookingDetails = useMemo(() => {
    return {
      movieTitle: bookingData.movieTitle || "Chưa có thông tin phim",
      age_rating:
        bookingData.movie?.age_rating || "Phim dành cho khán giả mọi lứa tuổi",
      cinemaName: bookingData.cinema || "Chưa chọn rạp",
      cinemaAddress: bookingData.cinema || "Chưa có địa chỉ",
      showtime: bookingData.showtime
        ? `${bookingData.showtime.time || ""} ${
            bookingData.showtime.day || ""
          }`.trim() || "Chưa chọn suất chiếu"
        : "Chưa chọn suất chiếu",
      room: bookingData.showtime.room_name || "01",
      ticketCount:
        bookingData.tickets?.reduce((sum, ticket) => sum + ticket.count, 0) ||
        0,
      ticketType:
        bookingData.tickets
          ?.map((t) =>
            `${t.count} ${t.ticket_type_name || t.label || ""}`.trim()
          )
          .join(", ") || "Chưa chọn vé",
      seatType: "Ghế Thường",
      seatNumber: bookingData.seatsName?.join(", ") || "Chưa chọn ghế",
      combo: bookingData.combos
        ? Object.entries(bookingData.combos)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
              const combo = bookingData.allCombos?.find(
                (c) => c.concession_id?.toString() === id?.toString()
              );
              return `${qty} ${combo?.concession_name || `Combo ${id}`}`;
            })
            .join(", ")
        : "Chưa chọn combo",
      total: calculateTotalPrice(bookingData),
      holdTime: 180,
    };
  }, [bookingData]);

  const [timeLeft, setTimeLeft] = useState(memoizedBookingDetails.holdTime);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(memoizedBookingDetails.total);
  const { mutate: checkSeats, isLoading: isCheckingSeats } =
    useGetSeatMapCheckUS();
  const { mutate: calculatePromotion, isLoading: isCalculatingPromotion } =
    useCalculatePromotionUS();
  const {
    data: promotionsData,
    isLoading: isLoadingPromotions,
    error: promotionsError,
  } = useGetUserPromotionsUS(
    {
      enabled: !!userId,
    },
    userId
  );
  const allPromotions = Array.isArray(promotionsData) ? promotionsData : [];
  console.log("pro:", allPromotions);
  const {
    mutate: bookTicket,
    isLoading: _isBooking,
    isSuccess,
    isError,
    data: _bookingResponse,
    error: _bookingError,
  } = usePostBookingUS();

  const {
    mutate: initiatePayment,
    isLoading: isPaymentLoading,
    isSuccess: isPaymentSuccess,
    isError: isPaymentError,
    data: paymentResponse,
    error: paymentError,
  } = useInitiatePaymentUS();

  const { isLoggedIn } = useAuth();
  const seatMapRef = useRef();

  // Thêm một ref để kiểm soát việc hiển thị thông báo lỗi
  const errorToastShownRef = useRef(false);

  useEffect(() => {
    if (seatMapRef.current && seatMapRef.current.refreshSeatMap) {
      seatMapRef.current.refreshSeatMap();
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowTimeoutModal(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (isPaymentSuccess && paymentResponse) {
      const paymentDetails = paymentResponse.data?.payment_details;
      const payUrl = paymentDetails?.payUrl;
      const message = paymentResponse.message;

      if (payUrl && !hasRedirected) {
        setHasRedirected(true);
        window.location.href = payUrl;
        return;
      }

      if (
        selectedPaymentMethod === "counter_payment" &&
        !payUrl &&
        message === "Đặt vé giữ chổ thành công."
      ) {
        toast.success(
          "Đặt vé giữ chỗ thành công! Vui lòng thanh toán tại quầy.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        setCurrentStep(3);
        return;
      }
    }
  }, [isPaymentSuccess, paymentResponse, hasRedirected, selectedPaymentMethod]);

  useEffect(() => {
    if (isPaymentError && paymentError) {
      if (errorToastShownRef.current) {
        return;
      }

      console.error("Payment error:", paymentError);
      const errorMessage =
        paymentError?.data?.message ||
        paymentError?.data?.errors ||
        paymentError?.message ||
        "Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.";

      // Đặt cờ là đã hiển thị toast
      errorToastShownRef.current = true;

      if (
        errorMessage.includes("đã được đặt") ||
        errorMessage.includes("không khả dụng") ||
        errorMessage.includes("booked")
      ) {
        toast.info("Ghế đã bị người khác đặt. Vui lòng chọn ghế khác.", {
          position: "top-right",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          const movieId =
            bookingData.movie?.movie_id || location.pathname.split("/").pop();
          window.location.href = `/movie/${movieId}?${new URLSearchParams({
            showtime: bookingData.showtime?.show_time_id || "",
            fromPayment: "true",
          })}`;
        }, 3000);
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      setTimeout(() => {
        errorToastShownRef.current = false;
      }, 100);
    }
  }, [isPaymentError, paymentError, bookingData, location]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Đặt vé thành công! Vé của bạn đang chờ xác nhận.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    if (isError) {
      toast.error("Đặt vé thất bại! Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (isLoggedIn) {
      setCurrentStep(2);
    }
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePay = async () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để thanh toán!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    const seatIds = bookingData.seats;
    const showtimeId =
      bookingData.showtime?.show_time_id ||
      bookingData.showtime?.id ||
      bookingData.showtime_id;

    // Reset cờ trước khi gọi API
    errorToastShownRef.current = false;

    console.log("Giá trị showtimeId trước khi gọi checkSeats:", showtimeId);
    let concessions = [];
    if (bookingData.combos && bookingData.allCombos) {
      concessions = Object.entries(bookingData.combos)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({
          concession_id: Number(id),
          quantity: qty,
        }));
    } else if (Array.isArray(bookingData.concessions)) {
      concessions = bookingData.concessions;
    }

    try {
      const checkPayload = {
        showtime_id: showtimeId,
        seat_ids: seatIds,
      };

      // Chờ cho API checkSeats hoàn thành
      await new Promise((resolve, reject) => {
        checkSeats(checkPayload, {
          onSuccess: (res) => {
            resolve(res);
          },
          onError: (err) => {
            // KHÔNG hiển thị toast ở đây, chỉ reject để khối catch xử lý
            reject(err);
          },
        });
      });

      // Nếu checkSeats thành công, tiếp tục với initiatePayment
      const bookingPayload = {
        showtime_id:
          bookingData.showtime?.show_time_id ||
          bookingData.showtime?.id ||
          bookingData.showtime_id,
        tickets: [],
        concessions,
        payment_method: selectedPaymentMethod,
      };
      if (appliedPromotion) {
        bookingPayload.promotion_id = appliedPromotion.promotion_id;
      }
      if (
        Array.isArray(bookingData.tickets) &&
        Array.isArray(bookingData.seats)
      ) {
        let seatIndex = 0;
        bookingData.tickets.forEach((ticket) => {
          for (let i = 0; i < ticket.count; i++) {
            if (bookingData.seats[seatIndex] !== undefined) {
              bookingPayload.tickets.push({
                seat_id: bookingData.seats[seatIndex],
                ticket_type_id: ticket.id || ticket.ticket_type_id,
              });
              seatIndex++;
            }
          }
        });
      }
      if (
        selectedPaymentMethod === "momo" ||
        selectedPaymentMethod === "onepay"
      ) {
        bookingPayload.notifyUrl = `${NGROK_URL}/api/payment/momo/ipn`;
        bookingPayload.returnUrl = `${NGROK_URL}/api/payment/momo/return`;
      }
      initiatePayment(bookingPayload);
    } catch (error) {
      // Logic xử lý lỗi tập trung tại đây
      console.error("Error during payment initiation or seat check:", error);

      const errorMessage =
        error?.data?.message ||
        error?.data?.errors ||
        error?.message ||
        "Lỗi xảy ra trong quá trình kiểm tra ghế hoặc thanh toán.";

      if (
        errorMessage.includes("đã được đặt") ||
        errorMessage.includes("không khả dụng") ||
        errorMessage.includes("booked")
      ) {
        toast.info("Ghế đã bị người khác đặt. Vui lòng chọn ghế khác.", {
          position: "top-right",
          autoClose: 7000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setTimeout(() => {
          const movieId =
            bookingData.movie?.movie_id || location.pathname.split("/").pop();
          window.location.href = `/movie/${movieId}?${new URLSearchParams({
            showtime: bookingData.showtime?.show_time_id || "",
            fromPayment: "true",
          })}`;
        }, 3000);
      } else {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };
  const handleTimeoutOk = () => {
    setShowTimeoutModal(false);
    const movieId = bookingData.movie?.movie_id;
    if (movieId) {
      navigate(`/movie/${movieId}`);
    } else {
      navigate("/");
    }
  };

  const handleApplyPromotion = (code) => {
    if (!code || code.trim() === "") {
      setAppliedPromotion(null);
      setDiscountAmount(0);
      setFinalTotal(memoizedBookingDetails.total);
      return;
    }
    const promo = allPromotions.find((p) => p.code === code);
    if (!promo) {
      toast.error("Mã khuyến mãi không hợp lệ hoặc không tồn tại.");
      setAppliedPromotion(null);
      setDiscountAmount(0);
      setFinalTotal(memoizedBookingDetails.total);
      return;
    }
    setAppliedPromotion(promo);
    calculatePromotion(
      {
        promotion_id: promo.promotion_id,
        total_price: memoizedBookingDetails.total,
        order_product_type: "TICKET",
      },
      {
        onSuccess: (res) => {
          const promoData = res?.data;
          const message = getApiMessage(res, "Áp dụng khuyến mãi thành công!");
          if (!promoData || typeof promoData.discount_amount === "undefined") {
            toast.error(message);
            setDiscountAmount(0);
            setFinalTotal(memoizedBookingDetails.total);
            return;
          }
          setDiscountAmount(promoData.discount_amount || 0);
          setFinalTotal(promoData.final_amount || memoizedBookingDetails.total);
          toast.success(
            `${message} Giảm ${promoData.discount_amount.toLocaleString()} VND`
          );
        },
        onError: (err) => {
          const message = getApiMessage(
            err,
            "Mã khuyến mãi không hợp lệ hoặc không áp dụng được."
          );
          setAppliedPromotion(null);
          setDiscountAmount(0);
          setFinalTotal(memoizedBookingDetails.total);
          toast.error(message);
        },
      }
    );
  };
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg my-8">
      <h1 className="text-2xl font-bold mb-6">TRANG THANH TOÁN</h1>
      <PaymentSteps currentStep={currentStep} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:hidden">
          <BookingSummary
            ref={seatMapRef}
            bookingDetails={{
              ...memoizedBookingDetails,
              discountAmount,
              appliedPromotion,
              finalTotal: finalTotal || memoizedBookingDetails.total,
            }}
            bookingData={bookingData}
            timeLeft={timeLeft}
          />
        </div>
        <div className="w-full lg:basis-1/2">
          {currentStep === 1 && !isLoggedIn && (
            <PaymentForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleFormSubmit}
            />
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <PromotionCodeInput
                onApply={handleApplyPromotion}
                isLoading={isCalculatingPromotion}
                appliedPromotion={appliedPromotion}
                allPromotions={allPromotions}
              />
              <h2 className="text-xl font-semibold">
                Chọn phương thức thanh toán
              </h2>
              <PaymentMethodSelection
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
              />
              <PaymentActionButtons
                onBack={() => setCurrentStep(1)}
                onPay={handlePay}
                isLoading={isPaymentLoading}
              />
            </div>
          )}
          {currentStep === 3 && (
            <div className="text-center space-y-4">
              {!isPaymentLoading && (
                <div>
                  <h2 className="text-xl font-semibold text-green-600">
                    Thanh toán thành công!
                  </h2>
                  <p className="text-gray-600">
                    Vé của bạn đã được đặt thành công.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden lg:basis-1/2 lg:block">
          <BookingSummary
            ref={seatMapRef}
            bookingDetails={{
              ...memoizedBookingDetails,
              discountAmount,
              appliedPromotion,
              finalTotal: finalTotal || memoizedBookingDetails.total,
            }}
            bookingData={bookingData}
            timeLeft={timeLeft}
          />
        </div>
      </div>
      <GradientModal open={showTimeoutModal} onClose={handleTimeoutOk}>
        <h2 className="text-2xl font-extrabold mb-4 text-white">
          HẾT THỜI GIAN MUA VÉ!
        </h2>
        <p className="mb-8 text-white text-lg">
          Thời gian giữ vé của bạn đã kết thúc, vui lòng thao tác lại!
        </p>
        <button
          className="w-full py-2 text-lg font-bold rounded border transition mt-2 cursor-pointer"
          style={{
            border: "2px solid var(--color-button)",
            color: "var(--color-text)",
            background: "#fff",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--color-button)";
            e.target.style.color = "#222";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#fff";
            e.target.style.color = "var(--color-text)";
          }}
          onClick={handleTimeoutOk}
        >
          OK
        </button>
      </GradientModal>
    </div>
  );
}

export default PaymentPage;
