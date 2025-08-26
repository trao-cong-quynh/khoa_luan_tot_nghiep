<?php

namespace App\Mail;

use App\Models\Bookings;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Support\Facades\Storage;
use Log;
class OrderConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;
    public $booking;

    /**
     * Create a new message instance.
     */
    public function __construct(Bookings $booking)
    {
        $this->booking = $booking;
        $this->booking->load([
            'users',
            'show_times.movies',
            'show_times.theater_rooms.cinemas',
            'booked_tickets.seats',
            'booked_tickets.ticket_types',
            'booking_concessions.concessions',
        ]);


    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Xác nhận Đặt vé Xem Phim - ' . $this->booking->show_times->movies->movie_name,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $qrCodeFullPath = null;
        if ($this->booking->qr_code_path) {
            $relativePath = str_replace('/storage/', '', $this->booking->qr_code_path);
            if (Storage::disk('public')->exists($relativePath)) {
                $qrCodeFullPath = Storage::disk('public')->path($relativePath);
            } else {
                Log::warning('QR Code file NOT FOUND at path: ' . Storage::disk('public')->path($relativePath));
            }
        }
        Log::debug('Đường dẫn ảnh QR trong Mailable (trong content):', ['qr_path' => $qrCodeFullPath]);
        return new Content(
            view: 'emails/order_confirmation',
            with: [
                'booking' => $this->booking,
                'qrCodeFullPath' => $qrCodeFullPath,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachemts = [];
        $qrCodeFullPathForAttachment = null;

        if ($this->booking->qr_code_path) {
            $relativePath = str_replace('/storage/', '', $this->booking->qr_code_path);
            if (Storage::disk('public')->exists($relativePath)) {
                $qrCodeFullPathForAttachment = Storage::disk('public')->path($relativePath);
            }
        }

        if ($qrCodeFullPathForAttachment) {
            $attachemts[] = Attachment::fromPath($qrCodeFullPathForAttachment)
                ->as('qr_code_booking_' . $this->booking->booking_id . '.png')
                ->withMime('image/png');
        }
        return $attachemts;
    }
}







