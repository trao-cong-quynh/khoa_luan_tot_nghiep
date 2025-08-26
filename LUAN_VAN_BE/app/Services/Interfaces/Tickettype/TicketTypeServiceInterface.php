<?php

namespace App\Services\Interfaces\Tickettype;

interface TicketTypeServiceInterface
{
    public function getAll();

    public function insert(array $request);

    public function update(string $id, array $request);
    public function delete(string $id);

    public function restore(string $id);

    public function getlistRestore();
}
