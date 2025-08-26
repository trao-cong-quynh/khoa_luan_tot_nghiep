import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaSearch, FaFilter } from "react-icons/fa";
import {
  useSearchMoviesUS,
  useSearchMoviesPublicUS,
  useGetAllGenresUS,
} from "../../api/homePage/queries";
import { imagePhim } from "../../Utilities/common";
import { useAuth } from "../../contexts/AuthContext"; // Import useAuth để lấy trạng thái đăng nhập

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth(); // Lấy trạng thái đăng nhập
  const [searchQuery, setSearchQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Lấy danh sách thể loại
  const { data: genresData } = useGetAllGenresUS();
  const genres = genresData?.data || [];

  // Tạo search params - chỉ gửi các tham số có giá trị
  const searchParams = {};
  if (searchQuery) searchParams.search = searchQuery;
  if (ageFilter) searchParams.age_rating = ageFilter;
  if (genreFilter) searchParams.genre_id = genreFilter;
  if (statusFilter) searchParams.status = statusFilter;

  // Gọi hàm tìm kiếm phù hợp với trạng thái đăng nhập
  const {
    data: searchResults,
    isLoading,
    error,
  } = isLoggedIn
    ? useSearchMoviesUS(searchParams, { enabled: isOpen })
    : useSearchMoviesPublicUS(searchParams, { enabled: isOpen });

  const movies =
    searchResults?.data?.movies?.movies || searchResults?.data?.movies || [];

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    onClose();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setAgeFilter("");
    setGenreFilter("");
    setStatusFilter("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      // Trigger search
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-bold">Tìm kiếm phim</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phim theo tên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 cursor-pointer ${
                showFilters
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <FaFilter />
              <span>Bộ lọc</span>
            </button> */}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ tuổi tối đa
                </label>
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  className="w-full p-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Tất cả độ tuổi</option>
                  <option value="12">12+</option>
                  <option value="13">13+</option>
                  <option value="16">16+</option>
                  <option value="18">18+</option>
                </select>
              </div>

              {/* Thể loại */}
              {/* Vẫn giữ nguyên logic bạn đã viết cho phần này */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thể loại
                </label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full p-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Tất cả thể loại</option>
                  {genres.map((genre) => (
                    <option key={genre.genre_id} value={genre.genre_id}>
                      {genre.genre_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 text-black border border-gray-300 rounded-lg 
                  focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="Đang chiếu">Đang chiếu</option>
                  <option value="Sắp chiếu">Sắp chiếu</option>
                </select>
              </div>
            </div>
          )}

          {/* Clear filters button */}
          {(searchQuery || ageFilter || genreFilter || statusFilter) && (
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Lỗi: {error.message}</p>
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {movies.map((movie) => (
                <div
                  key={movie.movie_id}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleMovieClick(movie.movie_id)}
                >
                  <div className="relative">
                    <img
                      src={
                        movie.poster_url
                          ? `${imagePhim}${movie.poster_url}`
                          : "/placeholder.jpg"
                      }
                      alt={movie.movie_name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {movie.age_rating}+
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {movie.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-600 font-semibold text-lg mb-2 line-clamp-2">
                      {movie.movie_name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {movie.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{movie.duration} phút</span>
                      <span>{movie.country}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        {movie.genres?.map((g) => g.genre_name).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || ageFilter || genreFilter || statusFilter
                  ? "Không tìm thấy phim phù hợp với bộ lọc"
                  : "Nhập từ khóa để tìm kiếm phim"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
