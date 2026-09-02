<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Device;
use App\Models\SensorReading;
use App\Services\DemoTelemetryService;
use Carbon\Carbon;

class SimulateTelemetry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telemetry:simulate 
                            {--device= : Specific device ID (e.g. NODE-001)} 
                            {--backfill= : Number of days to backfill historical data (e.g. 30)}
                            {--interval=30 : Interval in minutes for backfill}
                            {--sync : Run complete demo synchronization & 30-day prune}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate realistic simulated IoT air quality and climate sensor data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if ($this->option('sync')) {
            $this->info('Running automatic Demo Telemetry synchronization & 30-day purge...');
            DemoTelemetryService::ensureFreshData();
            $this->info('Demo telemetry synchronized successfully!');
            return Command::SUCCESS;
        }

        $deviceId = $this->option('device');
        $backfillDays = $this->option('backfill');

        $devices = $deviceId 
            ? Device::where('id', $deviceId)->get() 
            : Device::all();

        if ($devices->isEmpty()) {
            $this->warn('No matching devices found. Initializing default device...');
            DemoTelemetryService::ensureFreshData();
            $devices = Device::all();
        }

        if ($backfillDays) {
            $this->handleBackfill($devices, (int) $backfillDays, (int) $this->option('interval'));
        } else {
            $this->handleLivePing($devices);
        }

        return Command::SUCCESS;
    }

    /**
     * Generate a single real-time simulated telemetry tick.
     */
    protected function handleLivePing($devices)
    {
        $now = Carbon::now();
        $this->info("Simulating live telemetry ping at {$now->toDateTimeString()}...");

        foreach ($devices as $device) {
            $data = DemoTelemetryService::generateRealisticData($now->hour);

            // Update heartbeat & online status
            $device->update([
                'last_seen' => $now,
                'status' => 'online',
            ]);

            // Save reading
            SensorReading::create([
                'device_id' => $device->id,
                'temperature' => $data['temperature'],
                'humidity' => $data['humidity'],
                'heat_index' => $data['heat_index'],
                'aqi' => $data['aqi'],
                'hazardous_gas_level' => $data['hazardous_gas_level'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $this->line("  [✓] {$device->name} ({$device->id}): {$data['temperature']}°C | {$data['humidity']}% Hum | Heat Idx {$data['heat_index']}°C | AQI {$data['aqi']} | Gas {$data['hazardous_gas_level']} ppm");
        }

        $this->info('Live simulation complete.');
    }

    /**
     * Backfill historical sensor data for the last X days.
     */
    protected function handleBackfill($devices, int $days, int $intervalMinutes)
    {
        $days = min(max($days, 1), 30); // Cap at 30 days retention
        $start = Carbon::now()->subDays($days);
        $end = Carbon::now();

        $this->info("Backfilling {$days} days of telemetry (every {$intervalMinutes} mins)...");

        foreach ($devices as $device) {
            $cursor = $start->copy();
            $batch = [];
            $count = 0;

            while ($cursor->lte($end)) {
                $data = DemoTelemetryService::generateRealisticData($cursor->hour);

                $batch[] = [
                    'device_id' => $device->id,
                    'temperature' => $data['temperature'],
                    'humidity' => $data['humidity'],
                    'heat_index' => $data['heat_index'],
                    'aqi' => $data['aqi'],
                    'hazardous_gas_level' => $data['hazardous_gas_level'],
                    'created_at' => $cursor->copy(),
                    'updated_at' => $cursor->copy(),
                ];

                $count++;
                $cursor->addMinutes($intervalMinutes);

                if (count($batch) >= 400) {
                    SensorReading::insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                SensorReading::insert($batch);
            }

            // Update device status to online
            $device->update([
                'last_seen' => $end,
                'status' => 'online',
            ]);

            $this->line("  [✓] Backfilled {$count} records for {$device->name} ({$device->id})");
        }

        $this->info('Backfill complete!');
    }
}
