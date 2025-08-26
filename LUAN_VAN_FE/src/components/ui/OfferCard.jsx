import React from "react";
import { Link } from "react-router-dom";

function OfferCard({ offer }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg overflow-hidden transition duration-300 mt-4">
      <img
        src={offer.image}
        alt={offer.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-orange-500">{offer.title}</h3>
        <p className="text-gray-700 text-sm mt-2">{offer.description}</p>
        <Link
          to={offer.link}
          className="inline-block mt-3 text-blue-600 text-sm font-semibold hover:underline"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  );
}

export default OfferCard;
