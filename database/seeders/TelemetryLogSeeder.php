<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SensorReading;
use App\Models\Device;
use Carbon\Carbon;

class TelemetryLogSeeder extends Seeder
{
    /**
     * Run the database seeds for TRIVORA telemetry history.
     */
    public function run(): void
    {
        // Target your primary hardware node
        $device = Device::where('id', 'NODE-001')->first();

        if (!$device) {
            $this->command->error("NODE-001 not found. Please run DeviceSeeder first.");
            return;
        }

        // Time range: Exactly 2 months ago until the current moment
        $start = Carbon::now()->subMonths(2);
        $now = Carbon::now();

        $readings = [];
        $this->command->info("Generating 2-month history for " . $device->name . "...");

        while ($start->lte($now)) {
            $hour = $start->hour;

            // --- REALISTIC DATA MODELLING (Nasugbu Climate) ---

            // Temperature: Peaks between 11AM and 4PM (31-35°C), cooler at night (24-27°C)
            $baseTemp = ($hour >= 11 && $hour <= 16) ? rand(31, 35) : rand(24, 27);
            $temp = $baseTemp + (rand(0, 9) / 10);

            // Humidity: Higher in early morning, lower in mid-day heat
            $hum = ($hour >= 4 && $hour <= 8) ? rand(80, 95) : rand(60, 75);

            // AQI: Spikes during morning/evening commute times
            $isRushHour = ($hour >= 7 && $hour <= 9) || ($hour >= 17 && $hour <= 19);
            $aqi = $isRushHour ? rand(80, 120) : rand(15, 45);

            // Hazardous Gas (MQ136): Generally low, occasional random spikes for testing
            $gas = (rand(1, 100) > 98) ? rand(1000, 1500) : rand(100, 400);

            $readings[] = [
                'device_id' => $device->id,
                'temperature' => $temp,
                'humidity' => $hum,
                // Heat Index formula approximation
                'heat_index' => $temp + ($hum / 20) + (rand(0, 5) / 10),
                'aqi' => $aqi,
                'hazardous_gas_level' => $gas,
                'created_at' => $start->copy(),
                'updated_at' => $start->copy(),
            ];

            // 30-minute intervals for smooth charts without excessive DB rows
            $start->addMinutes(30);

            // Chunking inserts to prevent memory exhaustion
            if (count($readings) >= 500) {
                SensorReading::insert($readings);
                $readings = [];
            }
        }

        // Insert remaining records
        if (!empty($readings)) {
            SensorReading::insert($readings);
        }

        $this->command->info("2-month telemetry sync simulation complete!");
    }
}
