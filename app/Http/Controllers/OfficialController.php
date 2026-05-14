<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Device;
use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OfficialController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        // Ensure the official has an assigned barangay
        if (!$user->barangay_id) {
            abort(403, 'Unauthorized: No assigned jurisdiction.');
        }

        // OPTIMIZED: Eager load latestReading alongside the barangay
        $device = Device::with(['barangay', 'latestReading'])->where('barangay_id', $user->barangay_id)->first();

        $localData = null;
        $chartData = [];
        $recentLogs = [];

        if ($device) {
            // OPTIMIZED: Use the pre-loaded relationship instead of a new query
            $latest = $device->latestReading;

            $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInMinutes(now()) > 5;

            $localData = [
                'id' => $device->id,
                'name' => $device->name,
                'latitude' => $device->latitude ?? 14.0748,
                'longitude' => $device->longitude ?? 120.6793,
                'status' => $isOffline ? 'offline' : 'online',
                'aqi' => $latest ? round($latest->aqi) : 0,
                'heat_index' => $latest ? round($latest->heat_index, 1) : 0,
                'signal' => $isOffline ? 0 : 92,
            ];

            // 2. Fetch exact points (h:i A) instead of grouping by hour
            $chartData = SensorReading::where('device_id', $device->id)
                ->where('created_at', '>=', now()->subHours(24))
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($reading) {
                    return [
                        'time' => $reading->created_at->format('h:i A'),
                        'aqi' => $reading->aqi,
                        'heat_index' => $reading->heat_index,
                    ];
                });

            // 3. Get recent activity logs for this specific device
            $recentLogs = SensorReading::where('device_id', $device->id)
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($reading) {
                    $isAlert = $reading->aqi > 100 || $reading->heat_index > 38 || $reading->hazardous_gas_level > 1000;

                    return [
                        'id' => 'LOG-' . $reading->id,
                        'time' => $reading->created_at->diffForHumans(),
                        'sensor' => $reading->heat_index > 38 ? 'DHT22 Temp/Hum' : 'MQ135/136 Gas',
                        'message' => $isAlert
                            ? "Threshold breached! Peak recorded: " . ($reading->aqi > 100 ? $reading->aqi . " AQI" : $reading->heat_index . "°C")
                            : "Routine sync completed. All readings stable.",
                        'isAlert' => $isAlert
                    ];
                });
        }

        return Inertia::render('Barangay/Dashboard', [
            'brgyName' => $device ? $device->barangay->name : 'Unassigned Area',
            'localData' => $localData,
            'chartData' => $chartData,
            'recentLogs' => $recentLogs
        ]);
    }

    public function map()
    {
        $user = Auth::user();

        if (!$user->barangay_id) {
            abort(403, 'Unauthorized: No assigned jurisdiction.');
        }

        $barangay = Barangay::find($user->barangay_id);

        // OPTIMIZED: Added latestReading to avoid N+1 inside the loop
        $devices = Device::with('latestReading')->where('barangay_id', $user->barangay_id)->get()->map(function ($device) {
            $latest = $device->latestReading;

            // Allow 5 minutes of missed heartbeats before marking as Offline
            $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInMinutes(now()) > 5;

            $status = 'Active';
            $details = 'Telemetry link stable. All environmental sensors reporting normal levels.';

            if ($isOffline) {
                $status = 'Offline';
                $details = 'STATUS ALERT: Node is currently offline. Cannot establish connection with the remote gateway.';
            } elseif ($latest) {
                if ($latest->aqi > 100 || $latest->heat_index > 38 || $latest->hazardous_gas_level > 1000) {
                    $status = 'Danger';
                    $details = 'CRITICAL: High threat levels detected in the area. Advise immediate action.';
                } elseif ($latest->aqi > 50 || $latest->heat_index > 32) {
                    $status = 'Warning';
                    $details = 'WARNING: Elevated readings detected. Monitor closely.';
                }
            }

            return [
                'id' => $device->id,
                'name' => $device->name,
                'location' => $device->location,
                'position' => [$device->latitude ?? 14.0748, $device->longitude ?? 120.6793],
                'aqi' => $isOffline ? '--' : ($latest->aqi ?? 0),
                'heat_index' => $isOffline ? '--' : ($latest->heat_index ?? 0),
                'status' => $status,
                'signal' => $isOffline ? 0 : 92,
                'power' => $isOffline ? 'No Power' : 'Main Power (Grid)',
                'details' => $details
            ];
        });

        return Inertia::render('Barangay/Map', [
            'nodesData' => $devices,
            'brgyName' => $barangay->name ?? 'Unassigned Area'
        ]);
    }

    public function nodes()
    {
        $user = Auth::user();

        if (!$user->barangay_id) {
            abort(403, 'Unauthorized: No assigned jurisdiction.');
        }

        $barangay = Barangay::find($user->barangay_id);

        // OPTIMIZED: Added latestReading
        $devices = Device::with('latestReading')->where('barangay_id', $user->barangay_id)->get()->map(function ($device) {
            $latest = $device->latestReading;
            $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInMinutes(now()) > 5;

            $status = 'ok';
            if ($isOffline) {
                $status = 'offline';
            } elseif ($latest) {
                if ($latest->aqi > 100 || $latest->heat_index > 38 || $latest->hazardous_gas_level > 1000) {
                    $status = 'danger';
                } elseif ($latest->aqi > 50 || $latest->heat_index > 32) {
                    $status = 'warning';
                }
            }

            return [
                'id' => $device->id,
                'name' => $device->name,
                'location' => $device->location ?? 'Unspecified Location',
                'status' => $status,
                'powerSource' => $isOffline ? 'No Power' : 'Grid AC (220V)',
                'network' => 'LTE Cellular',
                'signal' => $isOffline ? 0 : 92,
                'lastSync' => $latest ? $latest->created_at->diffForHumans() : 'Never',
                'sensors' => [
                    'aqi' => $latest ? round($latest->aqi) : 0,
                    'heat' => $latest ? round($latest->heat_index, 1) : 0,
                ],
                'components' => [
                    ['name' => 'ESP32 Microcontroller', 'status' => $isOffline ? 'error' : 'ok'],
                    ['name' => 'LTE Cellular Module', 'status' => $isOffline ? 'error' : 'ok'],
                    ['name' => 'MQ135 (Air Quality)', 'status' => ($latest && $latest->aqi > 100) ? 'warning' : ($isOffline ? 'error' : 'ok')],
                    ['name' => 'MQ136 (Hazardous Gas)', 'status' => ($latest && $latest->hazardous_gas_level > 1000) ? 'warning' : ($isOffline ? 'error' : 'ok')],
                    ['name' => 'DHT22 (Temperature)', 'status' => ($latest && $latest->heat_index > 38) ? 'warning' : ($isOffline ? 'error' : 'ok')]
                ]
            ];
        });

        return Inertia::render('Barangay/Nodes', [
            'nodesData' => $devices,
            'brgyName' => $barangay->name ?? 'Unassigned Area'
        ]);
    }

    public function reports(Request $request)
    {
        $user = Auth::user();
        if (!$user->barangay_id) abort(403, 'Unauthorized');

        $barangay = Barangay::find($user->barangay_id);
        $devices = Device::where('barangay_id', $user->barangay_id)->get();
        $deviceNames = $devices->pluck('name')->toArray();

        $range = $request->input('range', '7');
        $daysToLoop = $range === '30' ? 29 : 6;

        $historicalAqi = [];
        $historicalHeat = [];

        for ($i = $daysToLoop; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);

            // CHANGED: Universally format as Month and Day (e.g., "May 4") for both 7 and 30 day views
            $dayLabel = $date->format('M j');

            $aqiEntry = ['day' => $dayLabel];
            $heatEntry = ['day' => $dayLabel];

            foreach ($devices as $device) {
                $maxReading = SensorReading::where('device_id', $device->id)
                    ->whereDate('created_at', $date->toDateString())
                    ->select(
                        DB::raw('MAX(aqi) as max_aqi'),
                        DB::raw('MAX(heat_index) as max_heat')
                    )->first();

                $aqiEntry[$device->name] = $maxReading->max_aqi ? round($maxReading->max_aqi) : 0;
                $heatEntry[$device->name] = $maxReading->max_heat ? round($maxReading->max_heat, 1) : 0;
            }

            $historicalAqi[] = $aqiEntry;
            $historicalHeat[] = $heatEntry;
        }

        $startDate = Carbon::now()->subDays($daysToLoop);
        $kpiQuery = SensorReading::whereIn('device_id', $devices->pluck('id'))->where('created_at', '>=', $startDate);

        return Inertia::render('Barangay/Reports', [
            'brgyName' => $barangay->name,
            'deviceNames' => $deviceNames,
            'historicalAqi' => $historicalAqi,
            'historicalHeat' => $historicalHeat,
            'kpis' => [
                'peakAqi' => (clone $kpiQuery)->max('aqi') ?? 0,
                'peakHeat' => (clone $kpiQuery)->max('heat_index') ?? 0,
                'alertsSent' => (clone $kpiQuery)->where(function ($q) {
                    $q->where('aqi', '>', 100)->orWhere('heat_index', '>', 38)->orWhere('hazardous_gas_level', '>', 1000);
                })->count(),
            ],
            'filters' => ['range' => $range]
        ]);
    }

    public function logs(Request $request)
    {
        $user = Auth::user();
        if (!$user->barangay_id) abort(403, 'Unauthorized');

        $barangay = Barangay::find($user->barangay_id);
        $deviceIds = Device::where('barangay_id', $user->barangay_id)->pluck('id');

        $search = $request->input('search');
        $dateFilter = $request->input('date', 'all');
        $statusFilter = $request->input('status', 'all');

        // Scoped strictly to this official's hardware
        $query = SensorReading::with('device')->whereIn('device_id', $deviceIds)->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('device', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")->orWhere('location', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($dateFilter !== 'all') {
            if ($dateFilter === 'today') $query->whereDate('created_at', Carbon::today());
            elseif ($dateFilter === '7') $query->where('created_at', '>=', Carbon::now()->subDays(7));
            elseif ($dateFilter === '30') $query->where('created_at', '>=', Carbon::now()->subDays(30));
        }

        if ($statusFilter !== 'all') {
            if ($statusFilter === 'danger') {
                $query->where(function ($q) {
                    $q->where('aqi', '>', 100)->orWhere('heat_index', '>', 38)->orWhere('hazardous_gas_level', '>', 1000);
                });
            } elseif ($statusFilter === 'warning') {
                $query->where(function ($q) {
                    $q->where('aqi', '>', 50)->orWhere('heat_index', '>', 32);
                })
                    ->where('aqi', '<=', 100)->where('heat_index', '<=', 38)->where('hazardous_gas_level', '<=', 1000);
            } elseif ($statusFilter === 'safe') {
                $query->where('aqi', '<=', 50)->where('heat_index', '<=', 32)->where('hazardous_gas_level', '<=', 1000);
            }
        }

        $logs = $query->paginate(15)->onEachSide(1)->withQueryString()->through(function ($reading) {
            $status = 'Safe';
            if ($reading->aqi > 100 || $reading->heat_index > 38 || $reading->hazardous_gas_level > 1000) $status = 'Danger';
            elseif ($reading->aqi > 50 || $reading->heat_index > 32) $status = 'Warning';

            return [
                'id' => 'LOG-' . $reading->id,
                'date' => $reading->created_at->format('M d, Y - h:i A'),
                'location' => $reading->device->location ?? 'Unknown',
                'device_name' => $reading->device->name ?? 'Unknown Device',
                'aqi' => round($reading->aqi) . ' AQI',
                'heat_index' => round($reading->heat_index, 1) . '°C',
                'status' => $status,
            ];
        });

        return Inertia::render('Barangay/Logs', [
            'brgyName' => $barangay->name,
            'logs' => $logs,
            'filters' => ['search' => $search, 'date' => $dateFilter, 'status' => $statusFilter]
        ]);
    }
}
