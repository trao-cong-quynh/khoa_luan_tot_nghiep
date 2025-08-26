import React from "react";
import { useGetPhimUS } from "../../api/homePage/queries";
import MovieList from "../../layouts/Home/MovieList";

function NowPlayingPage() {
  const { data: moviesData, isLoading, error } = useGetPhimUS();
  if (isLoading) return <div>Đang tải phim...</div>;
  if (error) return <div>Lỗi: {error.message}</div>;
  const movies = moviesData?.data?.movies || [];
  return (
    <div className="pt-8 mt-5">
      <MovieList movies={movies} />
    </div>
  );
}

export default NowPlayingPage;
