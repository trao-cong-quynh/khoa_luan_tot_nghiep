import React from "react";
import { Link } from "react-router-dom";

function EventCard({ event }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-orange-500">{event.title}</h3>
        <p className="text-gray-700 text-sm mt-2">{event.description}</p>
        <Link
          to={event.link}
          className="inline-block mt-3 text-sm font-semibold text-blue-600 hover:underline"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
