import React from "react";
import { Link } from "react-router-dom";

function PromotionCard({ id, image, title }) {
  return (
    <Link to={`/promotion/${id}`} className="block w-full">
      <div className="w-full">
        <div className="w-full overflow-hidden rounded shadow-sm">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
        <p className="text-sm mt-2 text-center px-2">{title}</p>
      </div>
    </Link>
  );
}

export default PromotionCard;
