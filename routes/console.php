<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Automatically simulate new IoT sensor pings every 5 minutes (for active dashboard testing)
Schedule::command('telemetry:simulate')->everyFiveMinutes();

// Automatically purge sensor readings older than 30 days every night at midnight
Schedule::command('model:prune')->dailyAt('00:00');

