<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmergencyAlert extends Mailable
{
    use Queueable, SerializesModels;

    public $device;
    public $reading;

    // Pass the hardware data and the dangerous reading into the email
    public function __construct($device, $reading)
    {
        $this->device = $device;
        $this->reading = $reading;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'URGENT: AirSafe Environmental Alert',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.emergency_alert', // This points to the visual template
        );
    }
}
