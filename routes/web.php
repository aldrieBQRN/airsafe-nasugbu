<?php

use App\Http\Controllers\BarangayController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\OfficialController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Models\Barangay;
use App\Models\Device;
use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Portal (Nasugbu Citizens)
|--------------------------------------------------------------------------
*/

// Add this temporarily to refresh your settings online
Route::get('/clear-cache', function () {
    Artisan::call('config:cache');
    return "Cache Cleared!";
});

Route::get('/clear-prod', function () {
    Artisan::call('config:cache');
    Artisan::call('view:cache');
    Artisan::call('route:cache');
    return "AirSafe Production Cache Optimized!";
});

Route::get('/', function () {
    // Optimization: Eager load the latest reading to avoid N+1 queries
    $devices = Device::with(['barangay', 'latestReading'])->get();

    $liveSensorData = $devices->map(function ($device) {
        $latest = $device->latestReading;

        // 5-minute timeout for public view
        $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInMinutes(now()) > 5;
        $name = $device->barangay ? $device->barangay->name : ($device->location ?? 'Unknown Area');

        return [
            'id' => $device->id,
            'name' => $name,
            'aqi' => $isOffline ? 0 : round($latest->aqi ?? 0),
            'heat' => $isOffline ? 0 : round($latest->heat_index ?? 0, 1),
            'status' => $isOffline ? 'Offline' : (($latest && ($latest->aqi > 100 || $latest->heat_index > 38)) ? 'Danger' : 'Safe'),
            'time' => $latest ? $latest->created_at->diffForHumans() : 'Awaiting Data',
            'isOffline' => $isOffline
        ];
    });

    return Inertia::render('Public/Advisory', [
        'liveData' => $liveSensorData
    ]);
})->name('home');

/*
|--------------------------------------------------------------------------
| Admin Panel: MDRRMO / System Administrator
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {

    // 1. Overview & Real-time Telemetry
    Route::get('/dashboard', function () {
        // OPTIMIZED: Fetch all devices with their latest reading in ONE query
        $devices = Device::with('latestReading')->get()->map(function ($device) {
            $latest = $device->latestReading;
            // 15-second heartbeat check
            $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInSeconds(now()) > 15;

            return [
                'id' => $device->id,
                'name' => $device->name,
                'latitude' => $device->latitude,
                'longitude' => $device->longitude,
                'status' => $isOffline ? 'offline' : 'online',
                'sensors' => [
                    'aqi' => $latest->aqi ?? 0,
                    'heat_index' => $latest->heat_index ?? 0,
                ],
                'powerSource' => $isOffline ? 'No Power' : 'Main Power (Grid)',
                'signal' => $isOffline ? 0 : 92,
            ];
        });

        // Fetch last 24 hours for the chart in 12-hour format
        $chartData = SensorReading::where('created_at', '>=', now()->subHours(24))
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($reading) {
                return [
                    'time' => $reading->created_at->format('h:i A'),
                    'aqi' => $reading->aqi,
                    'heat_index' => $reading->heat_index,
                ];
            });

        // Fetch recent activities for the feed
        $recentLogs = SensorReading::with('device')
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($reading) {
                $isAlert = $reading->aqi > 100 || $reading->heat_index > 38;
                return [
                    'time' => $reading->created_at->diffForHumans(),
                    'sensor' => $reading->device->name ?? 'System',
                    'message' => $isAlert ? "Critical Alert: Hazard threshold breached!" : "Routine data sync successful.",
                    'isAlert' => $isAlert
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'nodesData' => $devices,
            'chartData' => $chartData,
            'recentLogs' => $recentLogs,
        ]);
    })->name('admin.dashboard');

    // 2. Hardware & Infrastructure Management
    Route::get('/nodes', function () {
        // OPTIMIZED: Added latestReading to the eager loading
        $devices = Device::with(['barangay', 'latestReading'])->get()->map(function ($device) {
            $latest = $device->latestReading;
            $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInSeconds(now()) > 15;

            return [
                'id' => $device->id,
                'name' => $device->name,
                'location' => $device->location,
                'barangay_id' => $device->barangay_id,
                'barangay_name' => $device->barangay ? $device->barangay->name : 'Unassigned',
                'latitude' => $device->latitude,
                'longitude' => $device->longitude,
                'status' => $isOffline ? 'offline' : 'online',
                'powerSource' => $isOffline ? 'No Power' : 'Main Power (Grid)',
                'network' => 'Telemetry Link',
                'signal' => $isOffline ? 0 : 92,
                'sensors' => [
                    'aqi' => $latest->aqi ?? 0,
                    'heat' => $latest->heat_index ?? 0,
                    'temp' => $latest->temperature ?? 0,
                    'hum' => $latest->humidity ?? 0,
                    'gas' => $latest->hazardous_gas_level ?? 0,
                ],
                'components' => [
                    ['name' => 'ESP32 Controller', 'status' => $isOffline ? 'offline' : 'ok'],
                    ['name' => 'DHT22 Sensor', 'status' => $isOffline ? 'offline' : 'ok'],
                    ['name' => 'MQ135 Gas Sensor', 'status' => $isOffline ? 'offline' : 'ok'],
                    ['name' => 'MQ136 Gas Sensor', 'status' => $isOffline ? 'offline' : 'ok'],
                ]
            ];
        });

        return Inertia::render('Admin/Nodes', [
            'nodesData' => $devices,
            'barangays' => Barangay::all(['id', 'name'])
        ]);
    })->name('admin.nodes');

    // 3. Jurisdiction / Barangay Management (CRUD)
    Route::get('/barangays', [BarangayController::class, 'index'])->name('admin.barangays.index');
    Route::post('/barangays', [BarangayController::class, 'store'])->name('admin.barangays.store');
    Route::patch('/barangays/{id}', [BarangayController::class, 'update'])->name('admin.barangays.update');
    Route::delete('/barangays/{id}', [BarangayController::class, 'destroy'])->name('admin.barangays.destroy');

    // 4. Device Configuration Actions (CRUD)
    Route::post('/devices', [DeviceController::class, 'store'])->name('admin.devices.store');
    Route::patch('/devices/{id}', [DeviceController::class, 'update'])->name('admin.devices.update');
    Route::delete('/devices/{id}', [DeviceController::class, 'destroy'])->name('admin.devices.destroy');

    // 5. User Management
    Route::get('/users', [UserController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [UserController::class, 'store'])->name('admin.users.store');
    Route::patch('/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');

    // 6. Live Map Visualization
    Route::get('/map', function () {
        // OPTIMIZED: Fetch all devices with their latest reading in ONE query
        $devices = Device::with('latestReading')->get()->map(function ($device) {
            $latest = $device->latestReading;

            // 15-second heartbeat check
            $isOffline = !$device->last_seen || Carbon::parse($device->last_seen)->diffInSeconds(now()) > 15;

            return [
                'id' => $device->id,
                'name' => $device->name,
                'location' => $device->location,
                'latitude' => $device->latitude,
                'longitude' => $device->longitude,
                'aqi' => $latest->aqi ?? 0,
                'heat_index' => $latest->heat_index ?? 0,
                'status' => $isOffline ? 'offline' : 'online',
                'isOffline' => $isOffline
            ];
        });

        return Inertia::render('Admin/Map', [
            'nodesData' => $devices
        ]);
    })->name('admin.map');

    // 7. Analytics & Reporting
    Route::get('/reports', [ReportController::class, 'index'])->name('admin.reports');

    // 8. Historical Logs & Data Export
    Route::get('/logs', [LogController::class, 'index'])->name('admin.logs');
});

/*
|--------------------------------------------------------------------------
| Official Panel: Barangay Level Monitoring
|--------------------------------------------------------------------------
*/

Route::prefix('barangay-panel')->middleware(['auth', 'role:official'])->group(function () {
    Route::get('/dashboard', [OfficialController::class, 'dashboard'])->name('barangay.dashboard');
    Route::get('/map', [OfficialController::class, 'map'])->name('barangay.map');
    Route::get('/reports', [OfficialController::class, 'reports'])->name('barangay.reports');
    Route::get('/logs', [OfficialController::class, 'logs'])->name('barangay.logs');
    Route::get('/nodes', [OfficialController::class, 'nodes'])->name('barangay.nodes');
});

/*
|--------------------------------------------------------------------------
| Shared Account Management
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
