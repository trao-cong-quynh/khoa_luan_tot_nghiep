import React, { useState, useEffect } from "react";
import { imagePhim } from "../../../Utilities/common";
import { useGetAllGenresUS } from "../../../api/homePage/queries";

// Styles
const styles = {
  label: "block text-sm font-semibold text-gray-700 mb-1",
  input:
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 font-medium transition-all duration-200",
  textarea:
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 font-medium transition-all duration-200 min-h-[120px]",
  select:
    "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 font-medium transition-all duration-200",
  button: {
    primary:
      "w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-md hover:from-blue-700 hover:to-blue-900 transition-all duration-200 transform hover:scale-[1.02] cursor-pointer",
    secondary:
      "w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-blue-700 bg-white border border-blue-300 rounded-xl hover:bg-blue-50 transition-all duration-200 cursor-pointer",
  },
};

// Initial state
const initialMovieState = {
  id: null,
  movie_name: "",
  description: "",
  duration: "",
  release_date: "",
  poster: null,
  derector: "",
  actor: "",
  status: "Đang chiếu",
  age_rating: 12,
  country: "",
  genres_ids: [],
  screening_types: [],
  trailer_url: "",
};
const MovieForm = ({
  movieToEdit,
  onSave,
  onCancel,
  isSubmitting,
  screenTypes: propScreenTypes,
}) => {
  const screeningTypes =
    Array.isArray(propScreenTypes) && propScreenTypes.length > 0
      ? propScreenTypes
      : [
          { id: 1, name: "2D" },
          { id: 2, name: "3D" },
          { id: 3, name: "4D" },
          { id: 4, name: "IMAX" },
        ];
  const [movie, setMovie] = useState(initialMovieState);
  const [isGenresDropdownOpen, setIsGenresDropdownOpen] = useState(false);
  const [isScreeningTypesDropdownOpen, setIsScreeningTypesDropdownOpen] =
    useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const { data: genresData } = useGetAllGenresUS();
  const movieGenres = Array.isArray(genresData?.data)
    ? genresData.data.map((g) => ({
        id: g.genre_id,
        name: g.genre_name,
      }))
    : [];
  // console.log("Danh sách thể loại:", movieGenres);
  useEffect(() => {
    if (movieToEdit) {
      // Chuyển đổi dữ liệu từ API sang định dạng form
      const formattedMovie = {
        id: movieToEdit.movie_id,
        movie_name: movieToEdit.movie_name,
        description: movieToEdit.description,
        duration: movieToEdit.duration,
        release_date: movieToEdit.release_date,
        poster: movieToEdit.poster_url,
        derector: movieToEdit.derector,
        actor: movieToEdit.actor || "",
        status: movieToEdit.status || "Đang chiếu",
        age_rating: parseInt(movieToEdit.age_rating) || 12,
        country: movieToEdit.country,
        genres_ids:
          movieToEdit.genres?.map((genre) => genre.genre_id).filter(Boolean) ||
          [],
        screening_types: Array.isArray(movieToEdit.screening_types)
          ? movieToEdit.screening_types
              .map((screen) =>
                Number(screen.screening_type_id || screen["screening_type_id "])
              )
              .filter(Boolean)
          : [],
        trailer_url: movieToEdit.trailer_url || "",
      };
      setMovie(formattedMovie);
    } else {
      setMovie(initialMovieState);
      setSelectedFile(null);
    }
  }, [movieToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie((prevMovie) => ({
      ...prevMovie,
      [name]: value,
    }));
  };

  const handleGenreChange = (genreId) => {
    setMovie((prevMovie) => {
      const currentGenres = prevMovie.genres_ids;
      if (currentGenres.includes(genreId)) {
        return {
          ...prevMovie,
          genres_ids: currentGenres.filter((id) => id !== genreId),
        };
      } else {
        return {
          ...prevMovie,
          genres_ids: [...currentGenres, genreId],
        };
      }
    });
  };

  const toggleGenresDropdown = () => {
    setIsGenresDropdownOpen((prev) => !prev);
  };

  const handleActorChange = (e) => {
    const { value } = e.target;
    setMovie((prevMovie) => ({
      ...prevMovie,
      actor: value,
    }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMovie((prev) => ({
        ...prev,
        poster: file,
      }));
    }
  };

  const handleScreeningTypeChange = (screeningTypeId) => {
    setMovie((prevMovie) => {
      const currentTypes = prevMovie.screening_types;
      if (currentTypes.includes(screeningTypeId)) {
        return {
          ...prevMovie,
          screening_types: currentTypes.filter((id) => id !== screeningTypeId),
        };
      } else {
        return {
          ...prevMovie,
          screening_types: [...currentTypes, screeningTypeId],
        };
      }
    });
  };

  const toggleScreeningTypesDropdown = () => {
    setIsScreeningTypesDropdownOpen((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Tạo object dữ liệu để gửi lên API
      const movieData = {
        ...(movie.id && { id: movie.id }),
        movie_name: movie.movie_name,
        description: movie.description,
        duration: parseInt(movie.duration),
        release_date: movie.release_date,
        derector: movie.derector,
        status: movie.status,
        age_rating: parseInt(movie.age_rating),
        country: movie.country,
        genres_ids: movie.genres_ids,
        // Đổi tên trường đúng chuẩn và gửi mảng
        screening_type_ids: movie.screening_types,
        trailer_url: movie.trailer_url,
      };
      // Thêm actor nếu có
      if (movie.actor) {
        movieData.actor = movie.actor;
      }
      // Thêm poster nếu có file mới
      if (selectedFile) {
        movieData.poster = selectedFile;
      } else if (movieToEdit) {
        movieData.poster = null;
      }
      // Tạo FormData đúng chuẩn cho array
      const formData = new FormData();
      Object.entries(movieData).forEach(([key, value]) => {
        if (key === "screening_type_ids" && Array.isArray(value)) {
          value.forEach((id) => formData.append("screening_type_ids[]", id));
        } else if (key === "genres_ids" && Array.isArray(value)) {
          value.forEach((id) => formData.append("genres_ids[]", id));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      onSave(formData);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!movie.movie_name) {
      newErrors.movie_name = "Tên phim là bắt buộc";
    }

    if (!movie.description) {
      newErrors.description = "Mô tả là bắt buộc";
    }

    if (!movie.duration) {
      newErrors.duration = "Thời lượng phim là bắt buộc";
    }

    if (!movie.release_date) {
      newErrors.release_date = "Ngày khởi chiếu là bắt buộc";
    }

    if (!movie.derector) {
      newErrors.derector = "Tên đạo diễn là bắt buộc";
    }

    if (!movie.country) {
      newErrors.country = "Quốc gia là bắt buộc";
    }

    if (!selectedFile && !movieToEdit) {
      newErrors.poster = "Ảnh poster là bắt buộc";
    }
    if (!movie.age_rating) {
      newErrors.age_rating = "Độ tuổi là bắt buộc";
    }
    if (!movie.genres_ids.length) {
      newErrors.genres_ids = "Vui lòng chọn ít nhất một thể loại";
    }

    if (!["Đang chiếu", "Sắp chiếu"].includes(movie.status)) {
      newErrors.status = "Trạng thái phim không hợp lệ";
    }

    if (!movie.screening_types.length) {
      newErrors.screening_types = "Vui lòng chọn ít nhất một loại chiếu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 space-y-8 bg-white rounded-2xl shadow-lg"
      encType="multipart/form-data"
    >
      <div className="border-b border-blue-100 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
          {movieToEdit ? "Chỉnh sửa phim" : "Thêm phim mới"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="form-group">
            <label className={styles.label}>Tên phim</label>
            <input
              type="text"
              name="movie_name"
              value={movie.movie_name}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.movie_name ? "border-red-500" : ""
              }`}
              required
              autoFocus
              placeholder="Nhập tên phim"
              disabled={isSubmitting}
            />
            {errors.movie_name && (
              <p className="mt-1 text-sm text-red-600">{errors.movie_name}</p>
            )}
          </div>

          <div className="form-group">
            <label className={styles.label}>Thời lượng (phút)</label>
            <input
              type="number"
              name="duration"
              value={movie.duration}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.duration ? "border-red-500" : ""
              }`}
              required
              min={1}
              placeholder="Ví dụ: 120"
              disabled={isSubmitting}
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          <div className="form-group">
            <label className={styles.label}>Ngày khởi chiếu</label>
            <input
              type="date"
              name="release_date"
              value={movie.release_date}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label className={styles.lable}>Độ tuổi</label>
            <input
              type="number"
              name="age_rating"
              value={movie.age_rating}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.age_rating ? "border-red-500" : ""
              }`}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label className={styles.label}>Quốc gia</label>
            <input
              type="text"
              name="country"
              value={movie.country}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Ví dụ: Việt Nam"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className={styles.label}>Đạo diễn</label>
            <input
              type="text"
              name="derector"
              value={movie.derector}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Nhập tên đạo diễn"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className={styles.label}>Diễn viên</label>
            <input
              type="text"
              name="actor"
              value={movie.actor}
              onChange={handleActorChange}
              className={styles.input}
              placeholder="Ví dụ: Nguyễn Văn A, Trần Thị B"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className={styles.label}>Trailer URL</label>
            <input
              type="url"
              name="trailer_url"
              value={movie.trailer_url}
              onChange={handleChange}
              className={styles.input}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="form-group relative">
            <label className={styles.label}>Thể loại</label>
            <div
              className={`${
                styles.select
              } cursor-pointer flex justify-between items-center ${
                errors.genres_ids ? "border-red-500" : ""
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isSubmitting && toggleGenresDropdown()}
            >
              <span>
                {movie.genres_ids.length > 0
                  ? movie.genres_ids
                      .map((id) => movieGenres.find((g) => g.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")
                  : "Chọn thể loại"}
              </span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            {errors.genres_ids && (
              <p className="mt-1 text-sm text-red-600">{errors.genres_ids}</p>
            )}
            {isGenresDropdownOpen && !isSubmitting && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {movieGenres.map((genre) => (
                  <label
                    key={genre.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={genre.id}
                      checked={movie.genres_ids.includes(genre.id)}
                      onChange={() => handleGenreChange(genre.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded-md focus:ring-blue-500 hidden"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-gray-700">{genre.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className={styles.label}>Loại chiếu</label>
            <div
              className={`${
                styles.select
              } cursor-pointer flex justify-between items-center ${
                errors.screening_types ? "border-red-500" : ""
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isSubmitting && toggleScreeningTypesDropdown()}
            >
              <span>
                {movie.screening_types.length > 0
                  ? movie.screening_types
                      .map(
                        (id) => screeningTypes.find((s) => s.id === id)?.name
                      )
                      .filter(Boolean)
                      .join(", ")
                  : "Chọn loại chiếu"}
              </span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            {errors.screening_types && (
              <p className="mt-1 text-sm text-red-600">
                {errors.screening_types}
              </p>
            )}
            {isScreeningTypesDropdownOpen && !isSubmitting && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {screeningTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={type.id}
                      checked={movie.screening_types.includes(type.id)}
                      onChange={() => handleScreeningTypeChange(type.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded-md focus:ring-blue-500 hidden"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2 text-gray-700">{type.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className={styles.label}>Ảnh poster</label>
            <input
              type="file"
              name="poster"
              onChange={handlePosterChange}
              className={styles.input}
              accept="image/*"
              disabled={isSubmitting}
            />
          </div>

          {(selectedFile || movie.poster) && (
            <div className="mt-2">
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : movie.poster
                    ? `${imagePhim}${movie.poster}`
                    : "/placeholder.jpg"
                }
                alt="Poster preview"
                className="h-32 w-auto object-contain rounded-lg"
              />
            </div>
          )}

          <div className="form-group">
            <label className={styles.label}>Mô tả</label>
            <textarea
              name="description"
              value={movie.description}
              onChange={handleChange}
              className={`${styles.textarea} ${
                errors.description ? "border-red-500" : ""
              }`}
              required
              placeholder="Nhập mô tả phim"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-8 mt-8">
        <button
          type="submit"
          className={styles.button.primary}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          type="reset"
          className={styles.button.secondary}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default MovieForm;
