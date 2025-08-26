<?php

namespace App\Services\Interfaces\Booking;

interface BookingServiceInterface
{
    public function createBooking(array $request, string $method);
    public function update(string $id, array $request);

    public function getAll();

    public function getDetail(string $id);

    public function getListBookingwithDistrict(array $district);

    public function getListBookingwithCinema(string $id);

    public function getListBookingwithUser(string $id);

    public function approveCounterBooking(string $id);


}
