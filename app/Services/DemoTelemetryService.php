<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Device;
use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class DemoTelemetryService
{
    /**
     * Ensure the portfolio site always has fresh real-time readings and 30-day history,
     * while automatically purging records older than 30 days.
     */
    public static function ensureFreshData(): void
    {
        // 1. Memory / Cache throttle: Skip heavy DB queries if verified fresh within the last 60 seconds
        if (Cache::has('airsafe_demo_is_fresh')) {
            return;
        }

        try {
            $now = Carbon::now();
            $thirtyDaysAgo = $now->copy()->subDays(30);

            // 2. Automatically delete all data older than 30 days
            SensorReading::where('created_at', '<', $thirtyDaysAgo)->delete();

            // 3. Ensure at least one default Barangay and Device exists (Fail-safe for portfolio demos)
            $devices = Device::all();
            if ($devices->isEmpty()) {
                $barangay = Barangay::firstOrCreate(
                    ['name' => 'Brgy 7'],
                    [
                        'captain_name' => 'Juan Dela Cruz',
                        'contact_number' => '+639123456789',
                    ]
                );

                Device::firstOrCreate(
                    ['id' => 'NODE-001'],
                    [
                        'name' => 'Brgy 7 Gateway',
                        'location' => 'Poblacion Covered Court',
                        'latitude' => 14.0694,
                        'longitude' => 120.6351,
                        'barangay_id' => $barangay->id,
                        'api_token' => 'AIRSAFE-AUTH-9928',
                        'status' => 'online',
                        'last_seen' => $now,
                    ]
                );

                $devices = Device::all();
            }

            // 4. Check the latest reading timestamp in the database
            $latestReading = SensorReading::latest('created_at')->first();

            if (!$latestReading) {
                // If completely empty, backfill the past 30 days ending right now
                self::backfill($devices, $thirtyDaysAgo, $now, 30);
            } else {
                $lastTimestamp = Carbon::parse($latestReading->created_at);
                $minutesStale = $lastTimestamp->diffInMinutes($now);

                if ($minutesStale > 2) {
                    if ($minutesStale > 30 * 24 * 60) {
                        // Stale by more than 30 days: full refresh
                        SensorReading::truncate();
                        self::backfill($devices, $thirtyDaysAgo, $now, 30);
                    } else {
                        // Stale by hours or days: fast-forward seamlessly up to the current minute
                        $interval = ($minutesStale > 2880) ? 60 : 30;
                        self::backfill($devices, $lastTimestamp->copy()->addMinutes($interval), $now, $interval);
                    }
                }
            }

            // 5. Keep all devices marked as online and actively seen
            Device::query()->update([
                'last_seen' => $now,
                'status' => 'online',
            ]);

            // Cache flag for 2 minutes to keep subsequent page loads ultra fast
            Cache::put('airsafe_demo_is_fresh', true, 120);

        } catch (\Exception $e) {
            // Log or ignore silently so visitor page load never breaks
            report($e);
        }
    }

    /**
     * Backfill readings between start and end timestamps in batches.
     */
    protected static function backfill($devices, Carbon $start, Carbon $end, int $intervalMinutes): void
    {
        if ($start->gte($end)) {
            $start = $end->copy();
        }

        foreach ($devices as $device) {
            $cursor = $start->copy();
            $batch = [];

            while ($cursor->lte($end)) {
                $data = self::generateRealisticData($cursor->hour);

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

                $cursor->addMinutes($intervalMinutes);

                if (count($batch) >= 400) {
                    SensorReading::insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                SensorReading::insert($batch);
            }
        }
    }

    /**
     * Generate realistic sensor metrics following Nasugbu's climate curve.
     */
    public static function generateRealisticData(int $hour): array
    {
        // Daytime peak temperature (11 AM - 3 PM) vs nighttime cooler air
        $baseTemp = ($hour >= 11 && $hour <= 15) ? rand(31, 34) : rand(25, 28);
        $temp = round($baseTemp + (rand(0, 9) / 10), 1);
        $humidity = ($hour >= 4 && $hour <= 8) ? rand(80, 95) : rand(55, 75);
        $heatIndex = round($temp + ($humidity / 20) + (rand(0, 4) / 10), 1);

        // Commute hour AQI spikes
        $isRushHour = ($hour >= 7 && $hour <= 9) || ($hour >= 17 && $hour <= 19);
        $aqi = $isRushHour ? rand(60, 110) : rand(18, 45);

        // Toxic gas sensor readings
        $gas = (rand(1, 100) > 96) ? rand(700, 1200) : rand(100, 350);

        return [
            'temperature' => $temp,
            'humidity' => $humidity,
            'heat_index' => $heatIndex,
            'aqi' => $aqi,
            'hazardous_gas_level' => $gas,
        ];
    }
}
