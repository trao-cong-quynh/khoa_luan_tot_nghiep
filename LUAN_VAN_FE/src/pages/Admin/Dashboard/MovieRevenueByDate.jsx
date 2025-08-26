import React, { useState, useMemo, useEffect } from "react";
import MovieRevenueTable from "../../../components/dashboard/MovieRevenueTable";
import TopViewsBarChart from "../../../components/dashboard/TopViewsBarChart";
import {
  useGetAllMoviesRevenueUS,
  useGetPhimUS,
  useGetMoviesRevenueByIDUS,
} from "../../../api/homePage/queries";
import Papa from "papaparse";

const MovieRevenueByDate = () => {
  const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(getFormattedDate(new Date()));
  const [endDate, setEndDate] = useState(getFormattedDate(new Date()));
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [shouldFetchAll, setShouldFetchAll] = useState(true);
  const [shouldFetchSingle, setShouldFetchSingle] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const {
    data: allMoviesList,
    isLoading: loadingAllMoviesList,
    error: errorAllMoviesList,
  } = useGetPhimUS();

  const {
    data: allMoviesRevenueData,
    isLoading: isLoadingAllMoviesRevenue,
    isError: isErrorAllMoviesRevenue,
    refetch: refetchAllMoviesRevenue,
  } = useGetAllMoviesRevenueUS(
    {
      group_by: period,
      start_date: startDate,
      end_date: endDate,
    },
    { enabled: shouldFetchAll }
  );

  const {
    data: singleMovieRevenueData,
    isLoading: isLoadingSingleMovieRevenue,
    isError: isErrorSingleMovieRevenue,
    refetch: refetchSingleMovieRevenue,
  } = useGetMoviesRevenueByIDUS(
    selectedMovieId,
    {
      group_by: period,
      start_date: startDate,
      end_date: endDate,
    },
    { enabled: shouldFetchSingle && !!selectedMovieId }
  );

  // Lấy dữ liệu doanh thu từng kỳ của 1 phim (nếu có)
  // Đặt trước singleMovie vì singleMovie sẽ dùng singleMoviePeriods
  const singleMoviePeriods = useMemo(() => {
    return singleMovieRevenueData?.data?.data || [];
  }, [singleMovieRevenueData]);

  // Xử lý dữ liệu doanh thu của tất cả phim để hiển thị
  const allMovies = useMemo(() => {
    return (allMoviesRevenueData?.data?.["all movies revenue"] || []).map(
      (item) => ({
        name: item.movie_name,
        sold: item.book_count,
        revenue: Number(item.total_revenue),
      })
    );
  }, [allMoviesRevenueData]);

  // Xử lý dữ liệu doanh thu của một phim cụ thể để hiển thị
  // tính tổng từ singleMoviePeriods
  const singleMovie = useMemo(() => {
    if (!singleMovieRevenueData?.data) {
      return [];
    }

    const movieName = singleMovieRevenueData.data.movie_name;

    // Tính tổng doanh thu và tổng số vé từ mảng singleMoviePeriods
    let totalRevenueSum = 0;
    let totalBookingCountSum = 0;

    singleMoviePeriods.forEach((item) => {
      // Đảm bảo chuyển đổi sang số và xử lý null/undefined
      totalRevenueSum += Number(item.total_revenue || 0);
      totalBookingCountSum += Number(item.booking_count || 0);
    });

    return [
      {
        name: movieName,
        sold: totalBookingCountSum,
        revenue: totalRevenueSum,
      },
    ];
  }, [singleMovieRevenueData, singleMoviePeriods]); // Thêm singleMoviePeriods vào dependency array

  const displayMovies =
    selectedMovieId && singleMovie.length > 0 ? singleMovie : allMovies;
  const displayIsLoading =
    isLoadingSingleMovieRevenue || isLoadingAllMoviesRevenue;
  const displayIsError = isErrorSingleMovieRevenue || isErrorAllMoviesRevenue;

  const totalPages = Math.ceil(displayMovies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemsForTable = displayMovies.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const currentItemsForChart = selectedMovieId
    ? singleMoviePeriods
    : displayMovies.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [period, startDate, endDate, selectedMovieId, displayMovies.length]);

  const handleLoadData = () => {
    setShouldFetchAll(true);
    setShouldFetchSingle(false);
    setSelectedMovieId(null);
    setCurrentPage(1);
    refetchAllMoviesRevenue();
  };

  const handleFetchSingleMovieRevenue = (movieId) => {
    setSelectedMovieId(movieId);
    setShouldFetchSingle(true);
    setShouldFetchAll(false);
    setCurrentPage(1);
    refetchSingleMovieRevenue();
  };

  const handleExport = () => {
    let dataToExport = [];
    let fileNamePrefix = "bao_cao_doanh_thu";

    if (selectedMovieId && singleMovie.length > 0) {
      dataToExport = singleMovie;
      const movieName = singleMovie[0].name;
      fileNamePrefix = `bao_cao_doanh_thu_phim_${movieName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}`;
    } else if (allMovies.length > 0) {
      dataToExport = allMovies;
      fileNamePrefix = "bao_cao_doanh_thu_tat_ca_phim";
    } else {
      alert("Không có dữ liệu để xuất báo cáo.");
      return;
    }

    const exportData = dataToExport.map((item) => ({
      "Tên Phim": item.name,
      "Số Vé Bán Ra": item.sold,
      "Doanh Thu": item.revenue.toLocaleString("vi-VN") + " đ",
    }));

    const csv = Papa.unparse(exportData);
    const BOM = "\uFEFF";
    const csvContent = BOM + csv;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    };

    const fileName = `${fileNamePrefix}_tu_${formatDate(
      startDate
    )}_den_${formatDate(endDate)}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="flex justify-center mt-0.5 mb-6 bg-white h-12">
        <ul className="inline-flex items-center -space-x-px">
          <li>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
          </li>
          {pageNumbers.map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`cursor-pointer px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                  currentPage === number
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 bg-white"
                }`}
              >
                {number}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="cursor-pointer px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="">
      <div
        className="ml-2 w-full mx-auto bg-white rounded-xl shadow-md p-4 flex flex-col
        sm:flex-row sm:items-end gap-4 mb-2 mt-2"
      >
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chọn kỳ
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Ngày</option>
            <option value="week">Tuần</option>
            <option value="month">Tháng</option>
            <option value="year">Năm</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chọn phim (tùy chọn)
          </label>
          <select
            value={selectedMovieId || ""}
            onChange={(e) => {
              const movieId = e.target.value;
              if (movieId) {
                handleFetchSingleMovieRevenue(movieId);
              } else {
                setSelectedMovieId(null);
                setShouldFetchSingle(false);
                setShouldFetchAll(true);
                refetchAllMoviesRevenue();
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tất cả phim</option>
            {loadingAllMoviesList && (
              <option disabled>Đang tải danh sách phim...</option>
            )}
            {errorAllMoviesList && (
              <option disabled>Lỗi tải danh sách phim</option>
            )}
            {allMoviesList?.data?.movies.map((movie) => (
              <option key={movie.movie_id} value={movie.movie_id}>
                {movie.movie_name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={handleLoadData}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          >
            Tìm kiếm
          </button>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          >
            Xuất báo cáo
          </button>
        </div>
      </div>

      {displayIsLoading && <div>Đang tải dữ liệu...</div>}
      {displayIsError && <div>Lỗi khi tải dữ liệu! Vui lòng thử lại.</div>}

      {!displayIsLoading && !displayIsError && (
        <>
          {/* Hiển thị biểu đồ cho 1 phim cụ thể nếu có dữ liệu */}
          {selectedMovieId && singleMoviePeriods.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    minWidth: `${Math.max(
                      singleMoviePeriods.length * 120,
                      700
                    )}px`,
                  }}
                >
                  <TopViewsBarChart
                    data={singleMoviePeriods}
                    title="Doanh thu theo kỳ"
                    dataKey="total_revenue"
                    xAxisDataKey="period_key"
                    color="#60a5fa"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    minWidth: `${Math.max(
                      singleMoviePeriods.length * 120,
                      700
                    )}px`,
                  }}
                >
                  <TopViewsBarChart
                    data={singleMoviePeriods}
                    title="Số vé bán ra theo kỳ"
                    dataKey="booking_count"
                    xAxisDataKey="period_key"
                    color="#f472b6"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hiển thị biểu đồ cho tất cả phim nếu không có phim được chọn */}
          {!selectedMovieId && displayMovies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    minWidth: `${Math.max(
                      currentItemsForChart.length * 150,
                      1000
                    )}px`,
                  }}
                >
                  <TopViewsBarChart
                    data={currentItemsForChart}
                    title="Doanh thu theo phim"
                    dataKey="revenue"
                    xAxisDataKey="name"
                    color="#60a5fa"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <div
                  style={{
                    minWidth: `${Math.max(
                      currentItemsForChart.length * 150,
                      1000
                    )}px`,
                  }}
                >
                  <TopViewsBarChart
                    data={currentItemsForChart}
                    title="Số vé bán ra theo phim"
                    dataKey="sold"
                    xAxisDataKey="name"
                    color="#f472b6"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 ml-2">
            <MovieRevenueTable data={currentItemsForTable} />
            {!selectedMovieId &&
              displayMovies.length > itemsPerPage &&
              renderPaginationButtons()}
          </div>
        </>
      )}
    </div>
  );
};

export default MovieRevenueByDate;
