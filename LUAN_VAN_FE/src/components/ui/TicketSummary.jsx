import React from "react";

const TicketSummary = ({
  movieTitle,
  cinema,
  showtime,
  seats,
  seatsName = [],
  totalPrice,
  tickets,
  combos,
  allCombos,
  movie,
  onBookTicket,
}) => {
  // const navigate = useNavigate();

  const totalTicketsCount = tickets?.reduce((sum, t) => sum + t.count, 0) || 0;
  const canBook =
    showtime &&
    tickets &&
    tickets.some((t) => t.count > 0) &&
    seats &&
    seats.length === totalTicketsCount;
  console.log("hhhh:", cinema);
  const formatTickets = () => {
    if (!tickets) return "";
    return tickets
      .filter((ticket) => ticket.count > 0)
      .map((ticket) => `${ticket.count} ${ticket.ticket_type_name}`)
      .join(", ");
  };

  const formatCombos = () => {
    if (!combos || !allCombos) return "";
    return Object.entries(combos)
      .filter(([, quantity]) => quantity > 0)
      .map(([comboId, quantity]) => {
        const comboDetail = allCombos.find(
          (combo) => combo.concession_id?.toString() === comboId?.toString()
        );
        return `${quantity} ${
          comboDetail ? comboDetail.concession_name : `Combo ${comboId}`
        }`;
      })
      .join(", ");
  };

  return (
    <div className="flex flex-col sm:flex-row py-4 border-t border-gray-200">
      <div className="flex-1 text-left sm:text-left mb-4 sm:mb-0 px-4 text-white">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          {movieTitle}
        </h3>
        <p className="text-sm ">
          {showtime.time} - {showtime.day} - {cinema}
        </p>
        <p className="text-sm ">Ghế : {seatsName.join(", ")}</p>
        <p className="text-sm ">{formatTickets()}</p>
        {combos && Object.values(combos).some((q) => q > 0) && (
          <p className="text-sm">{formatCombos()}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 px-4 w-full sm:w-auto">
        <div className="text-left sm:text-right w-full sm:w-auto text-white sm:grid sm:grid-cols-1 grid grid-cols-2">
          <div className="text-sm">Tạm tính:</div>
          <div className="text-lg sm:text-xl font-bold text-white text-right">
            {totalPrice.toLocaleString()} VND
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            className="text-black bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors w-full"
            // style={{ backgroundColor: "var(--color-)" }}
          >
            {showtime.time}
          </button>
          <button
            onClick={onBookTicket}
            className="px-6 py-2 rounded-lg transition-colors w-full font-semibold cursor-pointer"
            style={{
              backgroundColor: canBook ? "var(--color-primary)" : "#eee",
              color: canBook ? "white" : "#aaa",
              cursor: canBook ? "pointer" : "not-allowed",
            }}
            disabled={!canBook}
            onMouseEnter={(e) => {
              if (canBook) {
                e.target.style.backgroundColor = "var(--color-hover)";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (canBook) {
                e.target.style.backgroundColor = "var(--color-primary)";
                e.target.style.color = "white";
              }
            }}
          >
            ĐẶT VÉ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketSummary;
