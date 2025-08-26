import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/layout/header";
import LoginPage from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import HomePage from "./pages/User/HomePage";
import DetailMoviePage from "./pages/User/DetailMoviePage";
import PaymentPage from "./pages/User/PaymentPage";
import MoMoRedirect from "./components/ui/payment/MoMoRedirect";
import MovieManagement from "./pages/Admin/Movie/MovieManagement";
import DeletedMovies from "./pages/Admin/Movie/DeletedMovies";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ManageLayout from "./layouts/ManageLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AccountPage from "./pages/User/AccountPage";
import UserManagement from "./pages/Admin/User/UserManagement";
import ShowtimeManagement from "./pages/Admin/Showtimes/ShowtimeManagement";
import TheaterManagement from "./pages/Admin/Theater/TheaterManagement";
import DistrictManagement from "./pages/Admin/District/DistrictManagement";
import DeleteDistrict from "./pages/Admin/District/DeleteDistrict";
// import TheaterRoomsManagement from "./pages/Admin/Theater/TheaterRoomsManagement";
// import TheaterReports from "./pages/Admin/Theater/TheaterReports";
// import TheaterForm from "./components/admin/TheaterForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GenreManagement from "./pages/Admin/Genre/GenreManagement";
import DeletedTheater from "./pages/Admin/Theater/DeletedTheater";
// import DeleteRoom from "./pages/Admin/DeleteRoom";
import TicketOrder from "./pages/Admin/TicketOrder";
import ConcessionManagement from "./pages/Admin/Concession/ConcessionManagement";
import PromotionManagement from "./pages/Admin/Promotion/PromotionManagement";
import ArticlesManagement from "./pages/Admin/ArticlesManagement";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import MovieRevenueByDate from "./pages/Admin/Dashboard/MovieRevenueByDate";
import TheaterRevenueByDate from "./pages/Admin/Dashboard/TheaterRevenueByDate";
import ScrollToTop from "./components/ui/ScrollToTop";
import BlogListPage from "./pages/Blog/BlogListPage";
import BlogDetailPage from "./pages/Blog/BlogDetailPage";
import DistrictManagerDashboard from "./layouts/DistrictManagerDashboard";
import DeletedConcession from "./pages/Admin/Concession/DeletedConcession";
import NowPlayingPage from "./pages/User/NowPlayingPage";
import TheaterList from "./pages/TheaterList";
import TheaterDetail from "./pages/TheaterDetail";
import SpecialEvents from "./pages/SpecialEvents";
import MemberOffers from "./pages/MemberOffers";
import OfferDetail from "./pages/OfferDetail";
import EventDetail from "./pages/EventDetail";
import ScheduleManagement from "./pages/Admin/Schedule/ScheduleManagement";
import DeleteGenre from "./pages/Admin/Genre/DeleteGenre";
import TicketTypeManagement from "./pages/Admin/TicketType/TicketTypeManagement";
import DeleteTicketType from "./pages/Admin/TicketType/DeleteTicketType";
// import ConcessionManagement from "./pages/Admin/ConcessionManagement";
import PromotionDetail from "./pages/Promotion";
import React from "react";
import TheaterRoomsManagement from "./pages/Admin/Room/TheaterRoomsManagement";
import DeleteSchedule from "./pages/Admin/Schedule/DeleteSchedule";

function App() {
  const location = useLocation();

  // Reset toast khi chuyển trang
  React.useEffect(() => {
    console.log("App.jsx - Route changed to:", location.pathname);
    // toast.dismiss();
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-stone-100">
        <ScrollToTop />
        <Routes>
          {/* Route for MainLayout */}
          <Route path="/" element={<MainLayout />}>
            {/* Index route for the home page */}
            <Route index element={<HomePage />} />

            {/* Define routes for other pages that use MainLayout */}
            <Route path="login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/redirect" element={<MoMoRedirect />} />
            <Route path="/movie/:id" element={<DetailMoviePage />} />
            <Route path="/tin-dien-anh" element={<BlogListPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            <Route path="/phim-dang-chieu" element={<NowPlayingPage />} />
            <Route path="/he-thong-rap" element={<TheaterList />} />
            <Route path="/rap/:slug" element={<TheaterDetail />} />
            <Route path="/su-kien-dac-biet" element={<SpecialEvents />} />
            <Route path="/uu-dai-thanh-vien" element={<MemberOffers />} />
            <Route path="/uu-dai-thanh-vien/:slug" element={<OfferDetail />} />
            <Route path="/su-kien-dac-biet/:slug" element={<EventDetail />} />
            <Route path="/promotion/:id" element={<PromotionDetail />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="movies" element={<MovieManagement />} />
            <Route path="movies/deleted" element={<DeletedMovies />} />
            <Route path="user" element={<UserManagement />} />
            <Route path="showtime" element={<ShowtimeManagement />} />
            <Route path="theater" element={<TheaterManagement />} />
            <Route path="district" element={<DistrictManagement />} />
            <Route path="district_delete" element={<DeleteDistrict />} />
            {/* <Route path="theater_rooms" element={<TheaterRoomsManagement />} /> */}
            {/* <Route path="theater_reports" element={<TheaterReports />} /> */}
            <Route path="delete_cinema" element={<DeletedTheater />} />
            <Route path="genre" element={<GenreManagement />} />
            <Route path="genre_delete" element={<DeleteGenre />} />
            <Route path="ticket_order" element={<TicketOrder />} />
            {/* <Route path="delete_room" element={<DeleteRoom />} /> */}
            <Route path="concession" element={<ConcessionManagement />} />
            <Route path="ticket_type" element={<TicketTypeManagement />} />
            <Route path="ticket_type-delete" element={<DeleteTicketType />} />
            <Route path="delete_concession" element={<DeletedConcession />} />
            <Route path="promotion" element={<PromotionManagement />} />
            <Route path="articles" element={<ArticlesManagement />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard_movie" element={<MovieRevenueByDate />} />
            <Route
              path="dashboard_theater"
              element={<TheaterRevenueByDate />}
            />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="schedule_delete" element={<DeleteSchedule />} />
            <Route path="promotion" element={<PromotionManagement />} />
            {/* Add more admin routes here as needed */}
          </Route>

          {/* Manage Routes */}
          <Route
            path="/manage"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "showtime_manager",
                  "booking_manager",
                  "order_manager",
                  "ticket_manager",
                  "cinema_manager",
                  "admin",
                ]}
              >
                <ManageLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/manage/ticket_order" replace />}
            />

            {/* Dashboard Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard_movie" element={<MovieRevenueByDate />} />
            <Route
              path="dashboard_theater"
              element={<TheaterRevenueByDate />}
            />

            {/* Booking Manager Routes */}
            <Route path="ticket_order" element={<TicketOrder />} />
            <Route path="booking_management" element={<TicketOrder />} />
            <Route path="booking_reports" element={<Dashboard />} />

            {/* Showtime Manager Routes */}
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="schedule_delete" element={<DeleteSchedule />} />
            <Route path="showtime" element={<ShowtimeManagement />} />
            <Route
              path="showtime_management"
              element={<ShowtimeManagement />}
            />
            <Route path="theater" element={<TheaterManagement />} />
            <Route path="theater_rooms" element={<TheaterRoomsManagement />} />
            {/* <Route path="theater_reports" element={<TheaterReports />} /> */}

            {/* Shared Routes for both roles */}
            <Route path="movies" element={<MovieManagement />} />
            <Route path="user" element={<UserManagement />} />
            <Route path="genre" element={<GenreManagement />} />
            <Route path="concession" element={<ConcessionManagement />} />
            <Route path="ticket_type" element={<TicketTypeManagement />} />
            <Route path="promotion" element={<PromotionManagement />} />
            <Route path="articles" element={<ArticlesManagement />} />
          </Route>

          {/* District Manager Route */}
          <Route
            path="/district_manager"
            element={
              <ProtectedRoute allowedRoles={["district_manager"]}>
                <DistrictManagerDashboard />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/district_manager/dashboard" replace />}
            />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="theater" element={<TheaterManagement />} />
            <Route path="movies" element={<MovieManagement />} />
            <Route path="user" element={<UserManagement />} />
            <Route path="showtime" element={<ShowtimeManagement />} />
            <Route path="genre" element={<GenreManagement />} />
            <Route path="genre_delete" element={<DeleteGenre />} />
            <Route path="concession" element={<ConcessionManagement />} />
            <Route path="ticket_order" element={<TicketOrder />} />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="schedule/deleted" element={<DeleteSchedule />} />
            <Route path="promotion" element={<PromotionManagement />} />
            <Route path="delete_cinema" element={<DeletedTheater />} />
          </Route>

          {/* Finance Manager Routes - Future expansion */}
          <Route
            path="/finance"
            element={
              <ProtectedRoute allowedRoles={["finance_manager", "admin"]}>
                <ManageLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/finance/revenue" replace />} />
            <Route path="revenue" element={<Dashboard />} />
            <Route path="payment" element={<TicketOrder />} />
            <Route path="expenses" element={<Dashboard />} />
          </Route>

          {/* Content Manager Routes - Future expansion */}
          <Route
            path="/content"
            element={
              <ProtectedRoute allowedRoles={["content_manager", "admin"]}>
                <ManageLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/content/articles" replace />}
            />
            <Route path="articles" element={<ArticlesManagement />} />
            <Route path="banner" element={<ArticlesManagement />} />
            <Route path="news" element={<ArticlesManagement />} />
          </Route>
        </Routes>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 10001 }}
      />
    </AuthProvider>
  );
}

export default App;
