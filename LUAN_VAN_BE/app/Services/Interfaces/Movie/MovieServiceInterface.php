<?php

namespace App\Services\Interfaces\Movie;

use App\Http\Requests\MovieRequest;
use App\Http\Requests\UpdateMovieRequest;

interface MovieServiceInterface
{
    public function getAll();
    public function getMovie(string $id);
    public function insert(MovieRequest $request);

    public function update(UpdateMovieRequest $request, string $id);
    public function delete(string $id);

    public function restore(string $id);
    public function getMovieRetore();

    public function getMovieWithCinemasAndShowtimes(string $id);
    public function getShowtimeSeatMap(string $id);

    public function getShowtimeSeatMapCheck(string $id, array $seatBook);

    public function getListMovieWithMovieSchedule(array $district);
    public function getListMovieToCinema(string $id);

    public function searchMovies(array $filters = []);

    public function getMoviesClient();
}
