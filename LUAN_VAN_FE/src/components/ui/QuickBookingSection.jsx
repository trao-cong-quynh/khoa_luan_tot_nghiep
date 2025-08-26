import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetPhimUS,
  useGetMovieWithShowtimesUS,
} from "../../api/homePage/queries";

const QuickBookingSection = () => {
  const navigate = useNavigate();

  // Custom Styles cho tất cả Select với chiều rộng cố định
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "45px",
      height: "45px",
      width: "200px",
      // Đặt chiều rộng cố định
      zIndex: 50,
      boxShadow: state.isFocused
        ? "0 0 0 2px var(--color-hover)"
        : provided.boxShadow,
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "45px",
      padding: "0 8px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "45px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    menu: (provided) => ({
      ...provided,
      width: "100%",
      zIndex: 100,
      position: "absolute",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  const { data: moviesData, isLoading: isLoadingMovies } = useGetPhimUS();
  const movies = moviesData?.data?.movies || [];

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  const { data: movieDetailData, isLoading: isLoadingDetail } =
    useGetMovieWithShowtimesUS(selectedMovie?.value, {
      enabled: !!selectedMovie,
    });
  const cinemasWithShowtimes =
    movieDetailData?.data?.cinemas_with_showtimes || [];

  const movieOptions = movies.map((movie) => ({
    value: movie.movie_id,
    label: movie.movie_name,
  }));

  const cinemaOptions = useMemo(() => {
    return cinemasWithShowtimes.map((cinema) => ({
      value: cinema.cinema_id,
      label: cinema.cinema_name,
      original: cinema,
    }));
  }, [cinemasWithShowtimes]);

  const dateOptions = useMemo(() => {
    if (!selectedCinema) return [];
    const cinema = cinemasWithShowtimes.find(
      (c) => c.cinema_id === selectedCinema.value
    );
    if (!cinema) return [];
    const datesSet = new Set();
    cinema.rooms.forEach((room) => {
      room.showtimes_for_this_movie.forEach((showtime) => {
        const date = showtime.start_time.split("T")[0];
        datesSet.add(date);
      });
    });
    return Array.from(datesSet)
      .sort()
      .map((date) => ({
        value: date,
        label: new Date(date).toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
        }),
      }));
  }, [selectedCinema, cinemasWithShowtimes]);

  const showtimeOptions = useMemo(() => {
    if (!selectedCinema || !selectedDate) return [];
    const cinema = cinemasWithShowtimes.find(
      (c) => c.cinema_id === selectedCinema.value
    );
    if (!cinema) return [];
    let showtimes = [];
    cinema.rooms.forEach((room) => {
      room.showtimes_for_this_movie.forEach((showtime) => {
        if (showtime.start_time.split("T")[0] === selectedDate.value) {
          const d = new Date(showtime.start_time);
          showtimes.push({
            value: showtime.show_time_id,
            label: d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            originalShowtime: {
              ...showtime,
              room_name: room.room_name,
              room_type: room.room_type,
              room_id: room.room_id,
              theater: {
                cinema_name: cinema.cinema_name,
                address: cinema.address,
              },
            },
          });
        }
      });
    });
    return showtimes;
  }, [selectedCinema, selectedDate, cinemasWithShowtimes]);

  useEffect(() => {
    setSelectedCinema(null);
    setSelectedDate(null);
    setSelectedShowtime(null);
  }, [selectedMovie]);
  useEffect(() => {
    setSelectedDate(null);
    setSelectedShowtime(null);
  }, [selectedCinema]);
  useEffect(() => {
    setSelectedShowtime(null);
  }, [selectedDate]);

  const handleQuickBook = () => {
    if (!selectedShowtime) {
      toast.error("Vui lòng chọn đầy đủ thông tin để mua vé nhanh.");
      return;
    }
    const formattedShowtime = {
      ...selectedShowtime.originalShowtime,
      time: selectedShowtime.label,
      day: selectedDate
        ? new Date(selectedDate.value).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
          })
        : "",
    };
    navigate(`/movie/${selectedMovie.value}`, {
      state: {
        selectedShowtime: formattedShowtime,
        initialStep: 2,
      },
    });
  };

  // Ref cho từng Select
  const movieSelectRef = React.useRef();
  const cinemaSelectRef = React.useRef();
  const dateSelectRef = React.useRef();
  const showtimeSelectRef = React.useRef();

  return (
    <div className="w-full max-w-screen-xl mx-auto bg-white p-2 sm:p-4 shadow-md rounded-lg flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full">
        {/* Step 1 */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-white bg-[var(--color-header-bg)] rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
            1
          </span>
          <div className="flex-grow">
            <Select
              classNamePrefix="react-select"
              ref={movieSelectRef}
              inputId="select-movie"
              styles={{
                ...customSelectStyles,
                control: (provided, state) => ({
                  ...customSelectStyles.control(provided, state),
                  width: "100%",
                }),
              }}
              options={movieOptions}
              placeholder="Chọn Phim"
              value={selectedMovie}
              onChange={setSelectedMovie}
              isLoading={isLoadingMovies}
              isClearable
              menuPortalTarget={
                typeof window !== "undefined" ? window.document.body : null
              }
            />
          </div>
        </div>
        {/* Step 2 */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-white bg-[var(--color-header-bg)] rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
            2
          </span>
          <div className="flex-grow">
            <Select
              classNamePrefix="react-select"
              ref={cinemaSelectRef}
              inputId="select-cinema"
              styles={{
                ...customSelectStyles,
                control: (provided, state) => ({
                  ...customSelectStyles.control(provided, state),
                  width: "100%",
                }),
              }}
              options={cinemaOptions}
              placeholder="Chọn Rạp"
              value={selectedCinema}
              onChange={setSelectedCinema}
              isLoading={isLoadingDetail}
              isDisabled={!selectedMovie}
              isClearable
              menuPortalTarget={
                typeof window !== "undefined" ? window.document.body : null
              }
            />
          </div>
        </div>
        {/* Step 3 */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-white bg-[var(--color-header-bg)] rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
            3
          </span>
          <div className="flex-grow">
            <Select
              classNamePrefix="react-select"
              ref={dateSelectRef}
              inputId="select-date"
              styles={{
                ...customSelectStyles,
                control: (provided, state) => ({
                  ...customSelectStyles.control(provided, state),
                  width: "100%",
                }),
              }}
              options={dateOptions}
              placeholder="Chọn Ngày"
              value={selectedDate}
              onChange={setSelectedDate}
              isLoading={isLoadingDetail}
              isDisabled={!selectedCinema}
              isClearable
              menuPortalTarget={
                typeof window !== "undefined" ? window.document.body : null
              }
            />
          </div>
        </div>
        {/* Step 4 */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-white bg-[var(--color-header-bg)] rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">
            4
          </span>
          <div className="flex-grow">
            <Select
              classNamePrefix="react-select"
              ref={showtimeSelectRef}
              inputId="select-showtime"
              styles={{
                ...customSelectStyles,
                control: (provided, state) => ({
                  ...customSelectStyles.control(provided, state),
                  width: "100%",
                }),
              }}
              options={showtimeOptions}
              placeholder="Chọn Suất"
              value={selectedShowtime}
              onChange={setSelectedShowtime}
              isLoading={isLoadingDetail}
              isDisabled={!selectedDate}
              isClearable
              menuPortalTarget={
                typeof window !== "undefined" ? window.document.body : null
              }
            />
          </div>
        </div>
        <button
          onClick={handleQuickBook}
          className={`px-6 py-3 rounded-lg transition-colors duration-300 w-full md:w-auto flex-shrink-0 text-base font-semibold mt-2 md:mt-0 ${
            selectedShowtime
              ? "cursor-pointer"
              : "cursor-not-allowed opacity-50"
          }`}
          style={{
            backgroundColor: selectedShowtime
              ? "var(--color-header-bg)"
              : "#ccc",
            color: selectedShowtime ? "black" : "#666",
          }}
          onMouseEnter={(e) => {
            if (selectedShowtime) {
              e.target.style.backgroundColor = "var(--color-hover)";
              e.target.style.color = "white";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedShowtime) {
              e.target.style.backgroundColor = "var(--color-header-bg)";
              e.target.style.color = "black";
            }
          }}
          disabled={!selectedShowtime}
        >
          Mua vé nhanh
        </button>
      </div>
    </div>
  );
};

export default QuickBookingSection;
