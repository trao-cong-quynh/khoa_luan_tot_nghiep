import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const AgeRestrictionModal = ({
  isOpen,
  onClose,
  movieName,
  ageRating,
  userAge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-4xl" />
        </div>

        <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
          Hạn chế độ tuổi
        </h2>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            Phim{" "}
            <span className="font-semibold text-blue-600">"{movieName}"</span>{" "}
            có độ tuổi tối thiểu là{" "}
            <span className="font-bold text-red-500">{ageRating}+</span>
          </p>
          <p className="text-gray-600 mb-2">
            Tuổi hiện tại của bạn:{" "}
            <span className="font-bold text-blue-600">{userAge} tuổi</span>
          </p>
          <p className="text-red-500 font-medium">
            Bạn chưa đủ tuổi để đặt vé xem phim này.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgeRestrictionModal;
