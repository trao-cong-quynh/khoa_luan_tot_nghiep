import React from "react";
import { FiEye } from "react-icons/fi";

function NewsCard({ image, title, views }) {
  return (
    <div className="flex items-start space-x-2 mb-4 h-33">
      <img src={image} alt={title} className="w-16 h-16 object-cover rounded" />
      <div className="text-sm">
        <p className="line-clamp-2 font-medium text-gray-800">{title}</p>
        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
          <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
            Thích
          </button>
          <span className="flex items-center space-x-1">
            <FiEye />
            <span>{views}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;
