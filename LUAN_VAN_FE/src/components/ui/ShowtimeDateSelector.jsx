import React from "react";

function ShowtimeDateSelector({ dates, selectedDate, onSelect }) {
  return (
    <div className="flex justify-center gap-4 mt-4">
      {dates.map((date, index) => (
        <button
          key={index}
          onClick={() => onSelect(date)}
          className={`border rounded px-4 py-2 font-bold transition`}
          style={
            selectedDate && selectedDate.fullDate === date.fullDate
              ? {
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  borderColor: "var(--color-primary)",
                }
              : {
                  backgroundColor: "white",
                  color: "var(--color-primary)",
                  borderColor: "var(--color-primary)",
                }
          }
        >
          <p className="font-bold">{date.day}</p>
          <p className="text-sm">{date.weekday}</p>
        </button>
      ))}
    </div>
  );
}

export default ShowtimeDateSelector;
