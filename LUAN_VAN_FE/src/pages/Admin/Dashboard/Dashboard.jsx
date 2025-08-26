import React, { useState, useMemo, useEffect } from "react";
import StatCard from "../../../components/dashboard/StatCard";
import TopViewsBarChart from "../../../components/dashboard/TopViewsBarChart";
import RevenueLineChart from "../../../components/dashboard/RevenueLineChart";
import RevenueByMovieTable from "../../../components/dashboard/RevenueByMovieTable";
import RevenueByCinemaTable from "../../../components/dashboard/RevenueByCinemaTable";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  useGetTimeSeriesRevenueUS,
  useGetAllMoviesRevenueUS,
  useGetAllRapRevenueUS,
} from "../../../api/homePage/queries";

const Dashboard = () => {
  const [period, setPeriod] = useState("day");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return thirtyDaysAgo.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  const [requestParams, setRequestParams] = useState({
    period: "day",
    startDate: (() => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return thirtyDaysAgo.toISOString().slice(0, 10);
    })(),
    endDate: new Date().toISOString().slice(0, 10),
  });

  const {
    data: timeSeriesData,
    isLoading: isLoadingTimeSeries,
    isError: isErrorTimeSeries,
  } = useGetTimeSeriesRevenueUS(
    {
      group_by: requestParams.period,
      start_date: requestParams.startDate,
      end_date: requestParams.endDate,
    },
    {
      enabled: !!requestParams.startDate && !!requestParams.endDate,
    }
  );

  const totalRevenue = useMemo(() => {
    return (timeSeriesData?.data?.data || []).reduce(
      (sum, item) => sum + Number(item.total_revenue || 0),
      0
    );
  }, [timeSeriesData]);

  const bookingsCount = useMemo(() => {
    return (timeSeriesData?.data?.data || []).reduce(
      (sum, item) => sum + Number(item.booking_count || 0),
      0
    );
  }, [timeSeriesData]);

  // Lấy đơn vị tiền tệ từ dữ liệu timeSeriesData
  const currency = timeSeriesData?.data?.currency || "VNĐ";

  // Xử lý displayPeriod từ data_range_start và data_range_end/and của timeSeriesData
  const displayPeriod = useMemo(() => {
    if (!timeSeriesData?.data) return "-";

    const {
      group_by,
      date_range_start,
      date_range_end,
      date_range_and,
      display_period: apiDisplayPeriod,
    } = timeSeriesData.data;

    if (group_by === "day" && apiDisplayPeriod) {
      return apiDisplayPeriod;
    } else if (date_range_start) {
      const start = date_range_start.split(" ")[0];
      const end = (date_range_end || date_range_and)?.split(" ")[0];
      return end ? `${start} ~ ${end}` : start;
    }
    return "-";
  }, [timeSeriesData]);

  const revenueByMonth = useMemo(() => {
    return (timeSeriesData?.data?.data || []).map((item) => ({
      month: item.period_key,
      revenue: Number(item.total_revenue || 0),
    }));
  }, [timeSeriesData]);

  // Lấy doanh thu theo phim (cho RevenueByMovieTable và TopViewsBarChart)
  const {
    data: allMoviesRevenueData,
    isLoading: isLoadingAllMoviesRevenue,
    isError: isErrorAllMoviesRevenue,
  } = useGetAllMoviesRevenueUS(
    // Sử dụng requestParams để đồng bộ với nút Tìm kiếm
    {
      group_by: requestParams.period,
      start_date: requestParams.startDate,
      end_date: requestParams.endDate,
    },
    {
      enabled: !!requestParams.startDate && !!requestParams.endDate,
    }
  );

  const movieRevenue = useMemo(() => {
    // Sắp xếp theo doanh thu giảm dần và chỉ lấy TOP 5
    return (allMoviesRevenueData?.data?.["all movies revenue"] || [])
      .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))
      .slice(0, 5) // Chỉ lấy 5 mục tượng trưng
      .map((item) => ({
        name: item.movie_name,
        tickets: item.book_count,
        revenue: Number(item.total_revenue),
      }));
  }, [allMoviesRevenueData]);

  // TopViewsData cho biểu đồ bar chart (lấy từ movieRevenue)
  const topViewsData = useMemo(() => {
    // Sắp xếp theo số vé bán ra và lấy top 5
    return [...movieRevenue]
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5)
      .map((item) => ({ name: item.name, views: item.tickets }));
  }, [movieRevenue]);

  // Lấy doanh thu theo rạp (cho RevenueByCinemaTable)
  const {
    data: allRapsRevenueData,
    isLoading: isLoadingAllRapsRevenue,
    isError: isErrorAllRapsRevenue,
  } = useGetAllRapRevenueUS(
    {
      group_by: requestParams.period,
      start_date: requestParams.startDate,
      end_date: requestParams.endDate,
    },
    {
      enabled: !!requestParams.startDate && !!requestParams.endDate,
    }
  );

  const cinemaRevenue = useMemo(() => {
    // Sắp xếp theo doanh thu giảm dần và chỉ lấy TOP 5
    return (allRapsRevenueData?.data?.["all cinema revenue"] || [])
      .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))
      .slice(0, 5) // Chỉ lấy 5 mục tượng trưng
      .map((item) => ({
        name: item.cinema_name,
        tickets: item.booking_count,
        revenue: Number(item.total_revenue),
      }));
  }, [allRapsRevenueData]);

  // Cập nhật stats data
  const stats = [
    {
      title: `Doanh thu (${displayPeriod})`,
      value: isLoadingTimeSeries
        ? "..."
        : totalRevenue.toLocaleString("vi-VN") + " " + currency,
      color: "blue",
    },
    {
      title: "Tổng vé bán ra",
      value: isLoadingTimeSeries ? "..." : bookingsCount,
      color: "orange",
    },
  ];

  // Logic hiển thị toast khi đăng nhập thành công
  const location = useLocation();
  useEffect(() => {
    if (location.state?.loginSuccess) {
      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Xóa state để toast không xuất hiện lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Console logs để kiểm tra giá trị và trạng thái
  useEffect(() => {}, [
    period,
    startDate,
    endDate,
    requestParams,
    isLoadingTimeSeries,
    timeSeriesData,
    totalRevenue,
    bookingsCount,
    displayPeriod,
  ]);

  return (
    <div className="pl-2">
      
      {/* Bộ lọc doanh thu */}
      <div
        className="w-full mx-auto bg-white rounded-xl shadow-md p-4 flex flex-col
        sm:flex-row sm:items-end gap-4 mb-2 mt-1"
      >
        <div className="flex-1 w-full">
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
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={period === "year"}
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={period === "year"}
          />
        </div>
        <div className="w-full sm:w-auto">
          <button
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg
            font-semibold shadow hover:bg-blue-700 transition cursor-pointer"
            style={{ minHeight: "42px" }}
            onClick={() => setRequestParams({ period, startDate, endDate })} // Kích hoạt fetch dữ liệu
          >
            Tìm kiếm
          </button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mb-2">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

        {/* Biểu đồ Doanh thu theo thời gian */}
        {isLoadingTimeSeries ? (
          <div className="text-center py-4">
            Đang tải dữ liệu doanh thu theo thời gian...
          </div>
        ) : isErrorTimeSeries ? (
          <div className="text-center py-4 text-red-500">
            Lỗi khi tải dữ liệu doanh thu theo thời gian!
          </div>
        ) : (
          <div style={{ overflowX: "auto", paddingBottom: "10px" }}>
            <div
              style={{
                minWidth: `${Math.max(revenueByMonth.length * 70, 600)}px`,
                height: "380px",
              }}
            >
              <RevenueLineChart
                data={revenueByMonth}
                loading={isLoadingTimeSeries}
              />
            </div>
          </div>
        )}
      </div>
      {/* Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {isLoadingAllMoviesRevenue ? (
          <div className="text-center py-4">
            Đang tải bảng doanh thu phim...
          </div>
        ) : isErrorAllMoviesRevenue ? (
          <div className="text-center py-4 text-red-500">
            Lỗi khi tải bảng doanh thu phim!
          </div>
        ) : (
          <RevenueByMovieTable data={movieRevenue} />
        )}

        {isLoadingAllRapsRevenue ? (
          <div className="text-center py-4">Đang tải bảng doanh thu rạp...</div>
        ) : isErrorAllRapsRevenue ? (
          <div className="text-center py-4 text-red-500">
            Lỗi khi tải bảng doanh thu rạp!
          </div>
        ) : (
          <RevenueByCinemaTable data={cinemaRevenue} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
