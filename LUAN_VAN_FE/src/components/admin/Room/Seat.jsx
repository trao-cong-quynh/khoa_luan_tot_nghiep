import React from "react";
import { FaEdit } from "react-icons/fa";
import clsx from "clsx";

const seatTypeStyles = {
  normal: "bg-purple-600",
  vip: "bg-red-500",
  couple: "bg-pink-500",
  unavailable: "bg-gray-400 cursor-not-allowed",
};

const Seat = ({
  label,
  type = "normal",
  isEditable = false,
  onEdit,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center rounded-md text-white font-semibold w-7 h-7 m-0.5 select-none bg-opacity-70",
        seatTypeStyles[type]
      )}
      style={{ backgroundColor: undefined, ...props.style }}
      {...props}
    >
      {label}
      {isEditable && (
        <button
          className="absolute top-0 right-0 p-1 text-green-500 hover:text-green-700 bg-white rounded-full shadow"
          style={{ transform: "translate(40%,-40%)" }}
          onClick={onEdit}
          tabIndex={-1}
        >
          <FaEdit size={14} />
        </button>
      )}
    </div>
  );
};

export default Seat;
