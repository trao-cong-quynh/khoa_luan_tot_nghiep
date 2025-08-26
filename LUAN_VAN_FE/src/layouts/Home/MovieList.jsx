import React from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../../components/ui/MovieCard";
import { imagePhim } from "../../Utilities/common";

function MovieList({ movies = [], showSeeMore = false, onSeeMore }) {
  const navigate = useNavigate();

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="max-w-screen-xl w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-6 text-center">DANH SÁCH PHIM</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <MovieCard
              key={movie.movie_id}
              image={
                movie.poster_url
                  ? `${imagePhim}${movie.poster_url}`
                  : "/placeholder.jpg"
              }
              title={movie.movie_name}
              category={
                movie.genres?.map((g) => g.genre_name).join(", ") || "N/A"
              }
              country={movie.country}
              trailerUrl={movie.trailer_url}
              onBuyTicket={() => handleMovieClick(movie.movie_id)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Không có phim nào được tìm thấy.
          </p>
        )}
      </div>

      {showSeeMore && (
        <div className="flex justify-center mt-6">
          <button
            className="py-2 px-6 rounded cursor-pointer font-bold transition"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "var(--color-hover)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "var(--color-primary)";
              e.target.style.color = "white";
            }}
            onClick={onSeeMore}
          >
            Xem thêm &gt;
          </button>
        </div>
      )}
    </div>
  );
}

export default MovieList;
