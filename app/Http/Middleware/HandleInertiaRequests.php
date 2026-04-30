<?php

namespace App\Http\Middleware;

use App\Models\Device;
use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $alerts = [];
        $user = $request->user();

        if ($user) {
            // 1. Determine which devices this user is allowed to monitor
            $deviceIds = [];

            // Map the role permissions
            if ($user->role === 'admin') {
                $deviceIds = Device::pluck('id')->toArray();
            } elseif ($user->role === 'official' && $user->barangay_id) {
                $deviceIds = Device::where('barangay_id', $user->barangay_id)->pluck('id')->toArray();
            }

            if (!empty($deviceIds)) {
                // 2. Check for Offline Devices (No heartbeat in 5 minutes)
                $offlineDevices = Device::whereIn('id', $deviceIds)
                    ->where(function ($q) {
                        $q->whereNull('last_seen')
                            ->orWhere('last_seen', '<', Carbon::now()->subMinutes(5));
                    })->get();

                foreach ($offlineDevices as $device) {
                    $alerts[] = [
                        'id' => 'offline-' . $device->id,
                        'type' => 'offline',
                        'title' => 'Node Offline',
                        'message' => $device->name . ' lost connection to the server.',
                        'time' => $device->last_seen ? Carbon::parse($device->last_seen)->diffForHumans() : 'Unknown',
                        'read' => false,
                    ];
                }

                // 3. Check for Recent Sensor Breaches (Last 12 Hours)
                $recentCriticalReadings = SensorReading::with('device')
                    ->whereIn('device_id', $deviceIds)
                    ->where('created_at', '>=', Carbon::now()->subHours(12))
                    ->where(function ($query) {
                        $query->where('aqi', '>', 100)
                            ->orWhere('heat_index', '>', 38)
                            ->orWhere('hazardous_gas_level', '>', 1000);
                    })
                    ->latest()
                    ->take(5) // Prevent performance hits by limiting to top 5
                    ->get();

                foreach ($recentCriticalReadings as $reading) {
                    // Determine severity
                    $type = 'warning';
                    $title = 'Elevated Threat Level';

                    if ($reading->aqi > 150 || $reading->heat_index > 40) {
                        $type = 'danger';
                        $title = 'Critical Hazard Alert';
                    }

                    // Determine which sensor tripped the alarm
                    $threatDetail = '';
                    if ($reading->aqi > 100) $threatDetail = round($reading->aqi) . ' AQI';
                    elseif ($reading->heat_index > 38) $threatDetail = round($reading->heat_index, 1) . '°C';
                    elseif ($reading->hazardous_gas_level > 1000) $threatDetail = 'High Gas Levels';

                    $alerts[] = [
                        'id' => 'alert-' . $reading->id,
                        'type' => $type,
                        'title' => $title,
                        'message' => ($reading->device->name ?? 'Unknown Node') . ' recorded ' . $threatDetail,
                        'time' => $reading->created_at->diffForHumans(),
                        'read' => false,
                    ];
                }
            }
        }

        // 4. Send the top 5 most recent alerts to the React frontend
        $finalAlerts = collect($alerts)
            ->sortByDesc('time') // Sort to put newest on top
            ->take(5)
            ->values()
            ->toArray();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            // Inject the absolute server time for the frontend to sync with
            'serverTime' => now()->toIso8601String(),
            // Inject the dynamic hardware alerts
            'alerts' => $finalAlerts,
        ];
    }
}
