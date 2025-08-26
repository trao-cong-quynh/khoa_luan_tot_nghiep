import React, { useState } from "react";
import ModalPhim from "./Modal_phim";

function getAutoplayUrl(url) {
  if (!url) return "";
  return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

function MovieCard({
  image,
  category,
  title,
  trailerUrl,
  onBuyTicket,
  country,
}) {
  const [openTrailer, setOpenTrailer] = useState(false);

  return (
    <div className="w-full max-w-xs mx-auto text-center">
      <div className="relative group cursor-pointer">
        <img
          src={image}
          alt={title}
          className="w-full rounded object-cover h-64 sm:h-72 md:h-80 lg:h-96"
        />
        {/* Overlay mờ chỉ phủ lên ảnh */}
        <div className="absolute inset-0 pointer-events-none group-hover:backdrop-blur-[1px] transition duration-300 rounded z-10"></div>
        {/* Nút nằm trên overlay, luôn rõ nét */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="flex items-center gap-2 px-6 py-2 rounded mb-3 text-base font-semibold transition cursor-pointer font-bold"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--color-hover)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--color-primary)";
              e.target.style.color = "white";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onBuyTicket && onBuyTicket();
            }}
          >
            <span className="material-icons">confirmation_number</span>
            Mua vé
          </button>
          {trailerUrl && (
            <button
              className="flex items-center gap-2 px-6 py-2 rounded text-base font-semibold transition border font-bold cursor-pointer"
              style={{
                backgroundColor: "white",
                color: "var(--color-button)",
                border: "2px solid var(--color-button)",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "var(--color-button)";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "white";
                e.target.style.color = "var(--color-button)";
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenTrailer(true);
              }}
            >
              <span className="material-icons">play_circle</span>
              Trailer
            </button>
          )}
        </div>
      </div>
      {/* Phần text nằm ngoài overlay */}
      <p className="text-sm mt-2 text-gray-700 font-medium truncate">
        {category}
      </p>
      <p className="text-base font-semibold text-gray-900 truncate mt-1">
        {title}
      </p>
      <p className="test-base font-semibold text-gray-900 truncate ">
        {country}
      </p>
      {/* Modal trailer */}
      <ModalPhim open={openTrailer} onClose={() => setOpenTrailer(false)}>
        <div className="w-[350px] h-[200px] sm:w-[500px] sm:h-[300px] md:w-[600px] md:h-[340px] flex items-center justify-center">
          <iframe
            width="100%"
            height="100%"
            src={openTrailer ? getAutoplayUrl(trailerUrl) : trailerUrl}
            title="Movie Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded object-cover w-full h-full cursor-pointer"
          ></iframe>
        </div>
      </ModalPhim>
    </div>
  );
}

export default MovieCard;
