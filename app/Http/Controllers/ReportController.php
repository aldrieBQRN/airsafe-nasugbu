<?php

namespace App\Http\Controllers;

use App\Models\SensorReading;
use App\Models\Device;
use App\Models\Barangay;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->input('range', '7');
        $area = $request->input('area', 'all');

        $deviceQuery = Device::query();
        if ($area !== 'all') {
            $deviceQuery->where('barangay_id', $area);
        }
        $devices = $deviceQuery->get();
        $deviceNames = $devices->pluck('name')->toArray();

        $historicalAqi = [];
        $historicalHeat = [];

        $daysToLoop = $range === '30' ? 29 : 6;

        for ($i = $daysToLoop; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayLabel = $range === '30' ? $date->format('M d') : $date->format('D');

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

        $kpiQuery = SensorReading::where('created_at', '>=', $startDate);
        if ($area !== 'all') {
            $deviceIds = $devices->pluck('id')->toArray();
            $kpiQuery->whereIn('device_id', $deviceIds);
        }

        return Inertia::render('Admin/Reports', [
            'historicalAqi' => $historicalAqi,
            'historicalHeat' => $historicalHeat,
            'deviceNames' => $deviceNames,
            'kpis' => [
                'peakAqi' => (clone $kpiQuery)->max('aqi') ?? 0,
                'peakHeat' => (clone $kpiQuery)->max('heat_index') ?? 0,
                // Using correct column: hazardous_gas_level
                'alertsSent' => (clone $kpiQuery)->where(function ($q) {
                    $q->where('aqi', '>', 100)
                        ->orWhere('heat_index', '>', 38)
                        ->orWhere('hazardous_gas_level', '>', 1000);
                })->count(),
            ],
            'barangays' => Barangay::all(['id', 'name']),
            'filters' => ['range' => $range, 'area' => $area]
        ]);
    }
}
