<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Portal (Home)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Public/Advisory');
})->name('home');

/*
|--------------------------------------------------------------------------
| Authorized Panels (MDRRMO & Barangay)
|--------------------------------------------------------------------------
| Note: Middleware 'auth' is removed for the mock-login demo.
| This allows our React 'router.visit' to work without a database session.
*/

Route::prefix('admin')->group(function () {

    // ==========================================
    // MAIN ADMIN / MDRRMO ROUTES
    // ==========================================

    // MDRRMO Main Dashboard
    Route::get('/dashboard', function () {
        $liveSensorData = [
            'tumalim' => [
                'aqi' => rand(40, 60),
                'heat_index' => rand(32, 36),
            ],
            'brgy7' => [
                'aqi' => rand(90, 120),
                'heat_index' => rand(38, 42),
            ]
        ];

        return Inertia::render('Admin/Dashboard', [
            'liveData' => $liveSensorData
        ]);
    })->name('admin.dashboard');

    // Hardware Management (All Nodes)
    Route::get('/nodes', function () {
        return Inertia::render('Admin/Nodes');
    })->name('admin.nodes');

    // Data Analytics
    Route::get('/reports', function () {
        return Inertia::render('Admin/Reports');
    })->name('admin.reports');

    // Live Geospatial Map
    Route::get('/map', function () {
        return Inertia::render('Admin/Map');
    })->name('admin.map');


    // ==========================================
    // BARANGAY OFFICIAL ROUTES
    // ==========================================

    // Barangay Official Tactical View
    Route::get('/barangay', function () {
        // Pass simulated live data specifically for Brgy 7
        $liveSensorData = [
            'brgy7' => [
                'aqi' => rand(90, 120),
                'heat_index' => rand(38, 42),
            ]
        ];

        return Inertia::render('Barangay/Dashboard', [
            'liveData' => $liveSensorData
        ]);
    })->name('barangay.dashboard');

    // Barangay Specific Hardware Nodes
    Route::get('/barangay/nodes', function () {
        return Inertia::render('Barangay/Nodes');
    })->name('barangay.nodes');

    // Barangay Specific Interactive Map
    Route::get('/barangay/map', function () {
        return Inertia::render('Barangay/Map');
    })->name('barangay.map');

    // Trend Analysis & Reports
    Route::get('/barangay/reports', function () {
        return Inertia::render('Barangay/Reports');
    })->name('barangay.reports');
});

/*
|--------------------------------------------------------------------------
| Standard Laravel Breeze Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
