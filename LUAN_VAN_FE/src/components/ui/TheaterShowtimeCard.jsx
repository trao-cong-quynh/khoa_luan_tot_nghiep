import React from "react";
import { FaChevronDown } from "react-icons/fa";

function TheaterShowtimeCard({
  theater,
  onSelectShowtime,
  selectedShowtime,
  isOpen,
  onToggle,
}) {
  return (
    <div
      className="rounded p-4 mb-4 w-[80%] mx-auto"
      style={{ backgroundColor: "var(--color-showtime-bg)", opacity: 0.7 }}
    >
      {/* HEADER RẠP */}
      <div
        className="flex justify-between items-center mb-2 cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <h4 className="font-semibold text-white">{theater.name}</h4>
          <p className="text-sm text-white">{theater.address}</p>
        </div>
        <FaChevronDown
          className={`transition-transform duration-300 text-xl ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* DANH SÁCH PHÒNG */}
      <div
        className={`overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {isOpen && theater.rooms && theater.rooms.length > 0 ? (
          theater.rooms.map((room) => (
            <div key={room.room_id} className="mb-3">
              {/* Tên phòng */}
              <p className="text-sm italic text-white mb-2">
                {room.room_name}
                {room.room_type ? ` (${room.room_type})` : ""}
              </p>

              {/* Giờ chiếu */}
              <div className="flex flex-wrap gap-2">
                {room.showtimes.map((showtimeItem) => {
                  const isSelected =
                    selectedShowtime &&
                    selectedShowtime.show_time_id === showtimeItem.show_time_id;

                  return (
                    <button
                      key={showtimeItem.show_time_id}
                      className="px-3 py-1 rounded border font-bold transition cursor-pointer"
                      style={
                        isSelected
                          ? {
                              backgroundColor: "var(--color-hover-showtime)",
                              color: "white",
                              borderColor: "var(--color-hover-showtime)",
                            }
                          : {
                              backgroundColor: "white",
                              color: "var(--color-hover-showtime)",
                              borderColor: "var(--color-hover-showtime)",
                            }
                      }
                      onClick={() => onSelectShowtime(showtimeItem)}
                    >
                      {showtimeItem.time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600">Không có suất chiếu nào cho ngày này.</p>
        )}
      </div>
    </div>
  );
}

export default TheaterShowtimeCard;
