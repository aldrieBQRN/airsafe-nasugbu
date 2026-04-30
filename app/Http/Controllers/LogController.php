<?php

namespace App\Http\Controllers;

use App\Models\SensorReading;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $dateFilter = $request->input('date', 'all');
        $statusFilter = $request->input('status', 'all');

        $query = SensorReading::with('device.barangay')->latest();

        // 1. Dynamic Search Filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('device', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%");
            });
        }

        // 2. Date Range Filter
        if ($dateFilter !== 'all') {
            if ($dateFilter === 'today') {
                $query->whereDate('created_at', Carbon::today());
            } elseif ($dateFilter === '7') {
                $query->where('created_at', '>=', Carbon::now()->subDays(7));
            } elseif ($dateFilter === '30') {
                $query->where('created_at', '>=', Carbon::now()->subDays(30));
            }
        }

        // 3. Threat Level Filter (Using exact column: hazardous_gas_level)
        if ($statusFilter !== 'all') {
            if ($statusFilter === 'danger') {
                $query->where(function ($q) {
                    $q->where('aqi', '>', 100)
                        ->orWhere('heat_index', '>', 38)
                        ->orWhere('hazardous_gas_level', '>', 1000);
                });
            } elseif ($statusFilter === 'warning') {
                $query->where(function ($q) {
                    $q->where('aqi', '>', 50)->orWhere('heat_index', '>', 32);
                })->where('aqi', '<=', 100)
                    ->where('heat_index', '<=', 38)
                    ->where('hazardous_gas_level', '<=', 1000);
            } elseif ($statusFilter === 'safe') {
                $query->where('aqi', '<=', 50)
                    ->where('heat_index', '<=', 32)
                    ->where('hazardous_gas_level', '<=', 1000);
            }
        }

        $logs = $query->paginate(15)->onEachSide(1)->withQueryString()->through(function ($reading) {
            $status = 'Safe';

            // Calculate Threat Level using correct column
            if ($reading->aqi > 100 || $reading->heat_index > 38 || $reading->hazardous_gas_level > 1000) {
                $status = 'Danger';
            } elseif ($reading->aqi > 50 || $reading->heat_index > 32) {
                $status = 'Warning';
            }

            return [
                'id' => 'LOG-' . $reading->id,
                'date' => $reading->created_at->format('M d, Y - h:i A'),
                'location' => $reading->device ? ($reading->device->barangay->name ?? $reading->device->location) : 'Unknown Area',
                'device_name' => $reading->device->name ?? 'Unknown Device',
                'aqi' => round($reading->aqi) . ' AQI',
                'heat_index' => round($reading->heat_index, 1) . '°C',
                'status' => $status,
            ];
        });

        return Inertia::render('Admin/Logs', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'date' => $dateFilter,
                'status' => $statusFilter
            ]
        ]);
    }
}
