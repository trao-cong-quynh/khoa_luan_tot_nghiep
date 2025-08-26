<?php

namespace App\Services\Interfaces\Genre;

interface GenreServiceInterface
{
    /**
     * Create a new class instance.
     */
    public function getAll();

    public function insert(array $request);

    public function update(string $id, array $request);
    public function delete(string $id);

    public function restore(string $id);

    public function getlistRestore();
}
