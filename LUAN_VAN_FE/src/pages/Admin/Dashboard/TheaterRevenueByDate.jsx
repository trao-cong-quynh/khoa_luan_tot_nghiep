import React, { useState, useMemo, useEffect } from "react";
// Không cần import DatePicker nữa
// import "react-datepicker/dist/react-datepicker.css"; // Không cần import CSS này nữa
import TheaterRevenueTable from "../../../components/dashboard/TheaterRevenueTable";
import TopViewsBarChart from "../../../components/dashboard/TopViewsBarChart";
import {
  useGetAllRapRevenueUS,
  useGetRapRevenueByIDUS,
  useGetAllCinemasUS,
} from "../../../api/homePage/queries";
import Papa from "papaparse";

const TheaterRevenueByDate = () => {
  // Hàm tiện ích để định dạng ngày Date object sang YYYY-MM-DD
  const getFormattedDate = (date) => {
    if (!date) return ""; // Xử lý trường hợp date là null
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }; // Hàm tiện ích để parse chuỗi YYYY-MM-DD sang Date object

  const parseDate = (dateString) => {
    return dateString ? new Date(dateString) : null;
  };
  const [period, setPeriod] = useState("day"); // Khởi tạo startDate và endDate với định dạng YYYY-MM-DD cho input type="date"
  const [startDate, setStartDate] = useState(getFormattedDate(new Date()));
  const [endDate, setEndDate] = useState(getFormattedDate(new Date()));
  const [selectedRapId, setSelectedRapId] = useState(null);
  const [shouldFetchAll, setShouldFetchAll] = useState(true);
  const [shouldFetchSingle, setShouldFetchSingle] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // Hook để lấy danh sách tất cả các rạp

  const {
    data: allCinemasData,
    isLoading: loadingAllRapsList,
    error: errorAllRapsList,
  } = useGetAllCinemasUS(); // Xử lý dữ liệu danh sách rạp để hiển thị trong select

  const allRapsList = useMemo(() => {
    return (
      allCinemasData?.data?.map((cinema) => ({
        rap_id: cinema.cinema_id,
        rap_name: cinema.cinema_name,
      })) || []
    );
  }, [allCinemasData]); // Hook để lấy doanh thu của tất cả các rạp

  const {
    data: allRapsRevenueData,
    isLoading: isLoadingAllRapsRevenue,
    isError: isErrorAllRapsRevenue,
    refetch: refetchAllRapsRevenue,
  } = useGetAllRapRevenueUS(
    {
      group_by: period,
      start_date: startDate, // Giữ nguyên định dạng YYYY-MM-DD
      end_date: endDate, // Giữ nguyên định dạng YYYY-MM-DD
    },
    { enabled: shouldFetchAll }
  ); // Hook để lấy doanh thu của một rạp cụ thể

  const {
    data: singleRapRevenueData,
    isLoading: isLoadingSingleRapRevenue,
    isError: isErrorSingleRapRevenue,
    refetch: refetchSingleRapRevenue,
  } = useGetRapRevenueByIDUS(
    selectedRapId,
    {
      group_by: period,
      start_date: startDate, // Giữ nguyên định dạng YYYY-MM-DD
      end_date: endDate, // Giữ nguyên định dạng YYYY-MM-DD
    },
    { enabled: shouldFetchSingle && !!selectedRapId }
  ); // Xử lý dữ liệu doanh thu từng kỳ của 1 rạp (nếu có)

  const singleRapPeriods = useMemo(() => {
    return singleRapRevenueData?.data?.data || [];
  }, [singleRapRevenueData]); // Xử lý dữ liệu doanh thu của tất cả rạp để hiển thị

  const allRaps = useMemo(() => {
    return (allRapsRevenueData?.data?.["all cinema revenue"] || []).map(
      (item) => ({
        name: item.cinema_name,
        sold: item.booking_count,
        revenue: Number(item.total_revenue),
      })
    );
  }, [allRapsRevenueData]); // Xử lý dữ liệu doanh thu của một rạp cụ thể để hiển thị (tổng cộng)

  const singleRap = useMemo(() => {
    if (!singleRapRevenueData?.data) {
      return [];
    }

    const rapName = singleRapRevenueData.data.rap_name;

    let totalRevenueSum = 0;
    let totalBookingCountSum = 0;

    singleRapPeriods.forEach((item) => {
      totalRevenueSum += Number(item.total_revenue || 0);
      totalBookingCountSum += Number(item.booking_count || 0);
    });

    return [
      {
        name: rapName,
        sold: totalBookingCountSum,
        revenue: totalRevenueSum,
      },
    ];
  }, [singleRapRevenueData, singleRapPeriods]);

  const displayRaps =
    selectedRapId && singleRap.length > 0 ? singleRap : allRaps;
  const displayIsLoading = isLoadingSingleRapRevenue || isLoadingAllRapsRevenue;
  const displayIsError = isErrorSingleRapRevenue || isErrorAllRapsRevenue;

  const totalPages = Math.ceil(displayRaps.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemsForTable = displayRaps.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const currentItemsForChart = selectedRapId
    ? singleRapPeriods
    : displayRaps.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [period, startDate, endDate, selectedRapId, displayRaps.length]);

  const handleLoadData = () => {
    setShouldFetchAll(true);
    setShouldFetchSingle(false);
    setSelectedRapId(null); // Reset selectedRapId khi tìm kiếm tổng quát
    setCurrentPage(1);
    refetchAllRapsRevenue();
  };

  const handleFetchSingleRapRevenue = (rapId) => {
    setSelectedRapId(rapId);
    setShouldFetchSingle(true);
    setShouldFetchAll(false);
    setCurrentPage(1);
    refetchSingleRapRevenue();
  };

  const handleExport = () => {
    let dataToExport = [];
    let fileNamePrefix = "bao_cao_doanh_thu_rap";

    if (selectedRapId && singleRap.length > 0) {
      dataToExport = singleRapPeriods.map((item) => ({
        "Tên Rạp": singleRapRevenueData.data.rap_name,
        Kỳ: item.period_key,
        "Số Vé Bán Ra": item.booking_count,
        "Doanh Thu": Number(item.total_revenue).toLocaleString("vi-VN") + " đ",
      }));
      const rapName = singleRapRevenueData.data.rap_name;
      fileNamePrefix = `bao_cao_doanh_thu_rap_${rapName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}`;
    } else if (allRaps.length > 0) {
      dataToExport = allRaps.map((item) => ({
        "Tên Rạp": item.name,
        "Số Vé Bán Ra": item.sold,
        "Doanh Thu": item.revenue.toLocaleString("vi-VN") + " đ",
      }));
      fileNamePrefix = "bao_cao_doanh_thu_tat_ca_rap";
    } else {
      alert("Không có dữ liệu để xuất báo cáo.");
      return;
    }

    const csv = Papa.unparse(dataToExport);
    const BOM = "\uFEFF"; // Byte Order Mark for UTF-8
    const csvContent = BOM + csv;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" }); // formatDate cho việc đặt tên file vẫn cần Date object

    const fileName = `${fileNamePrefix}_tu_${getFormattedDate(
      parseDate(startDate)
    )}_den_${getFormattedDate(parseDate(endDate))}.csv`;

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
      <nav className="flex justify-center mt-4 mb-6 bg-white">
        {" "}
        <ul className="inline-flex items-center -space-x-px">
          {" "}
          <li>
            {" "}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="cursor-pointer px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước{" "}
            </button>{" "}
          </li>{" "}
          {pageNumbers.map((number) => (
            <li key={number}>
              {" "}
              <button
                onClick={() => paginate(number)}
                className={`cursor-pointer px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                  currentPage === number
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 bg-white"
                }`}
              >
                {number}{" "}
              </button>{" "}
            </li>
          ))}{" "}
          <li>
            {" "}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="cursor-pointer px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau{" "}
            </button>{" "}
          </li>{" "}
        </ul>{" "}
      </nav>
    );
  };

  return (
    <div className="">
      {" "}
      <div
        className="ml-2 w-full mx-auto bg-white rounded-xl shadow-md p-4 flex flex-col
 sm:flex-row sm:items-end gap-4 mb-2 mt-2"
      >
        {" "}
        <div className="flex-1">
          {" "}
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chọn kỳ{" "}
          </label>{" "}
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="day">Ngày</option> <option value="week">Tuần</option>{" "}
            <option value="month">Tháng</option>{" "}
            <option value="year">Năm</option>{" "}
          </select>{" "}
        </div>{" "}
        <div className="flex-1">
          {" "}
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Từ ngày{" "}
          </label>{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />{" "}
        </div>{" "}
        <div className="flex-1">
          {" "}
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Đến ngày{" "}
          </label>{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />{" "}
        </div>{" "}
        <div className="flex-1">
          {" "}
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chọn rạp (tùy chọn){" "}
          </label>{" "}
          <select
            value={selectedRapId || ""}
            onChange={(e) => {
              const rapId = e.target.value;
              if (rapId) {
                handleFetchSingleRapRevenue(rapId);
              } else {
                setSelectedRapId(null);
                setShouldFetchSingle(false);
                setShouldFetchAll(true);
                refetchAllRapsRevenue();
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Tất cả rạp</option>{" "}
            {loadingAllRapsList && (
              <option disabled>Đang tải danh sách rạp...</option>
            )}{" "}
            {errorAllRapsList && (
              <option disabled>Lỗi tải danh sách rạp</option>
            )}{" "}
            {allRapsList.map((rap) => (
              <option key={rap.rap_id} value={rap.rap_id}>
                {rap.rap_name}{" "}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        <div className="w-full sm:w-auto">
          {" "}
          <button
            onClick={handleLoadData}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          >
            Tìm kiếm{" "}
          </button>{" "}
        </div>{" "}
        <div className="w-full sm:w-auto">
          {" "}
          <button
            onClick={handleExport}
            className="w-full sm:w-auto px-6 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          >
            Xuất báo cáo{" "}
          </button>{" "}
        </div>{" "}
      </div>
      {displayIsLoading && <div>Đang tải dữ liệu...</div>}{" "}
      {displayIsError && <div>Lỗi khi tải dữ liệu! Vui lòng thử lại.</div>}{" "}
      {!displayIsLoading && !displayIsError && (
        <>
          {/* Hiển thị biểu đồ cho 1 rạp cụ thể nếu có dữ liệu */}{" "}
          {selectedRapId && singleRapPeriods.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              {" "}
              <div style={{ overflowX: "auto" }}>
                {" "}
                <div
                  style={{
                    minWidth: `${Math.max(
                      singleRapPeriods.length * 120,
                      700
                    )}px`,
                  }}
                >
                  {" "}
                  <TopViewsBarChart
                    data={singleRapPeriods}
                    title="Doanh thu theo kỳ"
                    dataKey="total_revenue"
                    xAxisDataKey="period_key"
                    color="#60a5fa"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div style={{ overflowX: "auto" }}>
                {" "}
                <div
                  style={{
                    minWidth: `${Math.max(
                      singleRapPeriods.length * 120,
                      700
                    )}px`,
                  }}
                >
                  {" "}
                  <TopViewsBarChart
                    data={singleRapPeriods}
                    title="Số vé bán ra theo kỳ"
                    dataKey="booking_count"
                    xAxisDataKey="period_key"
                    color="#f472b6"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {/* Hiển thị biểu đồ cho tất cả rạp nếu không có rạp được chọn */}{" "}
          {!selectedRapId && displayRaps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
              {" "}
              <div style={{ overflowX: "auto" }}>
                {" "}
                <div
                  style={{
                    minWidth: `${Math.max(
                      currentItemsForChart.length * 150,
                      1000
                    )}px`,
                  }}
                >
                  {" "}
                  <TopViewsBarChart
                    data={currentItemsForChart}
                    title="Doanh thu theo rạp"
                    dataKey="revenue"
                    xAxisDataKey="name"
                    color="#60a5fa"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div style={{ overflowX: "auto" }}>
                {" "}
                <div
                  style={{
                    minWidth: `${Math.max(
                      currentItemsForChart.length * 150,
                      1000
                    )}px`,
                  }}
                >
                  {" "}
                  <TopViewsBarChart
                    data={currentItemsForChart}
                    title="Số vé bán ra theo rạp"
                    dataKey="sold"
                    xAxisDataKey="name"
                    color="#f472b6"
                    xAxisTick={{ fontSize: 14, angle: 0, dy: 14 }}
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}{" "}
          <div className="ml-2 mt-6 bg-white">
            <TheaterRevenueTable data={currentItemsForTable} />{" "}
            {!selectedRapId &&
              displayRaps.length > itemsPerPage &&
              renderPaginationButtons()}{" "}
          </div>{" "}
        </>
      )}{" "}
    </div>
  );
};

export default TheaterRevenueByDate;
