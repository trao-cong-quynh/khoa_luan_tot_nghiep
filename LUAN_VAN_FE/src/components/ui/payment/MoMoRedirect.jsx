import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCheckPaymentStatusUS } from "../../../api/homePage/queries";

const MoMoRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  const { mutate: checkPaymentStatus, ...rest } = useCheckPaymentStatusUS({
    onSuccess: (data) => {
      console.log("MoMo status check result:", data);
      if (data?.data?.data?.resultCode === 0) {
        setStatus("success");
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate("/", {
            state: {
              message: "Thanh toán thành công!",
              orderId: searchParams.get("orderId"),
            },
          });
        }, 3000);
      } else {
        setStatus("failed");
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate("/", {
            state: {
              message: "Thanh toán thất bại. Vui lòng thử lại.",
              orderId: searchParams.get("orderId"),
            },
          });
        }, 3000);
      }
    },
    onError: (error) => {
      console.error("Error checking MoMo status:", error);
      setStatus("error");
      setTimeout(() => {
        navigate("/", {
          state: {
            message: "Không thể kiểm tra trạng thái thanh toán.",
            orderId: searchParams.get("orderId"),
          },
        });
      }, 3000);
    },
  });

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (orderId) {
      // Check payment status after a short delay
      setTimeout(() => {
        checkPaymentStatus(orderId);
      }, 1000);
    } else {
      setStatus("error");
      setTimeout(() => {
        navigate("/", {
          state: { message: "Thông tin đơn hàng không hợp lệ." },
        });
      }, 3000);
    }
  }, [searchParams, checkPaymentStatus, navigate]);

  const renderContent = () => {
    switch (status) {
      case "checking":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-lg">
              Đang kiểm tra trạng thái thanh toán...
            </p>
          </div>
        );
      case "success":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mt-4">
              Thanh toán thành công!
            </h2>
            <p className="mt-2 text-gray-600">Đang chuyển về trang chủ...</p>
          </div>
        );
      case "failed":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mt-4">
              Thanh toán thất bại
            </h2>
            <p className="mt-2 text-gray-600">Đang chuyển về trang chủ...</p>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-600 mt-4">
              Có lỗi xảy ra
            </h2>
            <p className="mt-2 text-gray-600">Đang chuyển về trang chủ...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default MoMoRedirect;
