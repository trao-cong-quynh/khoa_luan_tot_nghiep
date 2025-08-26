import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import TicketSummary from "../../components/ui/TicketSummary";

const TicketSummaryPage = ({
  showtime,
  tickets,
  seats,
  seatsName = [],
  combos,
  movieTitle,
  allCombos,
  movie,
  cinema,
  theaterAddress,
  onBookTicket,
}) => {
  const { footerRef } = useOutletContext();
  const containerRef = useRef(null); // Tạo ref để tham chiếu đến div cha
  const [isAboveFooter, setIsAboveFooter] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  console.log("cinemesss:", cinema);
  const calculateTotalPrice = () => {
    let total = 0;
    if (tickets) {
      total += tickets.reduce((sum, ticket) => {
        const ticketPrice = parseFloat(ticket.ticket_price) || 0;
        const ticketCount = ticket.count || 0;
        return sum + ticketPrice * ticketCount;
      }, 0);
    }
    if (combos) {
      total += Object.entries(combos).reduce((sum, [comboId, quantity]) => {
        const numericComboId = Number(comboId);
        const combo = allCombos?.find(
          (c) => c.concession_id === numericComboId
        );
        const comboPrice = combo?.unit_price || 0;
        return sum + comboPrice * quantity;
      }, 0);
    }
    return total;
  };

  useEffect(() => {
    // Lấy chiều cao thực tế của component
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    updateContainerHeight();

    const handleScroll = () => {
      if (!footerRef?.current || !containerRef.current) return;

      const footerRect = footerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // So sánh vị trí của component với footer
      // Thêm một padding nhỏ (ví dụ 10px) để có khoảng cách
      const bottomOfContainer = windowHeight - containerHeight;
      if (bottomOfContainer > footerRect.top - 10) {
        setIsAboveFooter(true);
      } else {
        setIsAboveFooter(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    window.addEventListener("resize", updateContainerHeight);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, [footerRef, containerHeight]);

  const totalPrice = calculateTotalPrice();

  return (
    <div
      ref={containerRef} // Gán ref vào div cha
      className={`left-0 right-0 bg-[#006666] shadow-lg z-50 transition-all duration-300 ease-in-out
        ${isAboveFooter ? "absolute" : "fixed"} bottom-0`}
      style={
        isAboveFooter && footerRef?.current
          ? {
              top: footerRef.current.offsetTop - containerHeight,
              bottom: "auto",
            }
          : { bottom: 0 }
      }
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <TicketSummary
          movieTitle={movieTitle}
          cinema={`${cinema} - ${theaterAddress}`}
          showtime={showtime}
          seats={seats}
          seatsName={seatsName}
          totalPrice={totalPrice}
          tickets={tickets}
          combos={combos}
          allCombos={allCombos}
          movie={movie}
          onBookTicket={onBookTicket}
        />
      </div>
    </div>
  );
};

export default TicketSummaryPage;
