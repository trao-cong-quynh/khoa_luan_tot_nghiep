<?php

namespace App\Services\Interfaces\Concession;
use Illuminate\Http\UploadedFile;
interface ConcessionServiceInterface
{
    public function getAll();

    public function insert(array $request, ?UploadedFile $image = null);
    public function update(string $id, array $request, ?UploadedFile $image = null);
    public function delete(string $id);
    public function retore(string $id);
    public function getConcession(string $id);
    public function getListConcessionDeleted();
}
