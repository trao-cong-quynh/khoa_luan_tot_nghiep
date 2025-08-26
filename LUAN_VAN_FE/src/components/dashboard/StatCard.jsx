import React from "react";

const StatCard = ({ title, value, color = "blue" }) => {
  const colorMap = {
    blue: "border-blue-500 text-blue-600",
    green: "border-green-500 text-green-600",
    orange: "border-orange-500 text-orange-600",
    red: "border-red-500 text-red-600",
  };

  return (
    <div
      className={`border-l-4 p-4 shadow rounded bg-white ${colorMap[color]}`}
    >
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
