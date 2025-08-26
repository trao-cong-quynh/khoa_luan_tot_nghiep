import React, { useState } from "react";
import { useGetPhimClientUS } from "../../api/homePage/queries";
import Banner from "../../components/layout/banner";
import QuickBookingSection from "../../components/ui/QuickBookingSection";
import MovieList from "../../layouts/Home/MovieList";
import NewsSection from "../../layouts/Home/NewsSection";
import PromotionSection from "../../layouts/Home/PromotionSection";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchModal from "../../components/ui/SearchModal";

import { useMediaQuery } from "react-responsive";

function HomePage() {
  const { data: moviesData, isLoading, error } = useGetPhimClientUS();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);

  const isLargeScreen = useMediaQuery({ minWidth: 1024 });
  const isMediumScreen = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isSmallScreen = useMediaQuery({ minWidth: 640, maxWidth: 767 });
  const isExtraSmallScreen = useMediaQuery({ maxWidth: 639 });
  let moviesToDisplay = 8;
  if (isExtraSmallScreen) {
    moviesToDisplay = 6;
  } else if (isSmallScreen) {
    moviesToDisplay = 9;
  } else if (isMediumScreen) {
    moviesToDisplay = 9;
  } else if (isLargeScreen) {
    moviesToDisplay = 8;
  }
  React.useEffect(() => {
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
      // Xóa state để toast không lặp lại khi F5
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) {
    return <div>Đang tải phim...</div>;
  }

  if (error) {
    // console.error("Error fetching movies:", error);
    // return <div>Lỗi: {error.message}</div>;
  }

  const movies = moviesData?.data?.movies || [];
  const handleSeeMore = () => {
    navigate("/phim-dang-chieu");
  };

  return (
    <>
      <div className="w-full bg-[#f5f5f5] min-h-screen mt-12">
        <Banner />
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 lg:px-8">
          <QuickBookingSection />
        </div>
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 lg:px-8">
          <MovieList
            movies={movies.slice(0, moviesToDisplay)}
            showSeeMore={movies.length > 8}
            onSeeMore={handleSeeMore}
          />
          {/* <NewsSection /> */}
          <PromotionSection />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </>
  );
}

export default HomePage;
