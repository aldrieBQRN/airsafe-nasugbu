<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\SensorReading;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\EmergencyAlert;
use Carbon\Carbon;

class TelemetryController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validate the incoming data from the ESP32
        $validated = $request->validate([
            'device_id' => 'required|string|exists:devices,id',
            'api_token' => 'required|string',
            'temperature' => 'required|numeric',
            'humidity' => 'required|numeric',
            'heat_index' => 'required|numeric',
            'aqi' => 'required|integer',
            'hazardous_gas_level' => 'required|integer',
        ]);

        // 2. Authenticate the Hardware
        $device = Device::with('barangay')->where('id', $validated['device_id'])
            ->where('api_token', $validated['api_token'])
            ->first();

        if (!$device) {
            return response()->json(['message' => 'Unauthorized Hardware Access'], 401);
        }

        // 3. HEARTBEAT LOGIC: Update "Last Seen" and Force Status to Online
        // This ensures the dashboard knows the hardware is currently alive.
        $device->update([
            'last_seen' => now(),
            'status' => 'online'
        ]);

        // 4. Save the Telemetry Data
        $reading = SensorReading::create([
            'device_id' => $device->id,
            'temperature' => $validated['temperature'],
            'humidity' => $validated['humidity'],
            'heat_index' => $validated['heat_index'],
            'aqi' => $validated['aqi'],
            'hazardous_gas_level' => $validated['hazardous_gas_level'],
        ]);

        // 5. EMAIL ALERT LOGIC
        // Check if AQI is dangerous OR Heat Index is extreme
        if ($reading->aqi > 100 || $reading->heat_index > 38) {
            $this->sendEmergencyEmail($device, $reading);
        }

        return response()->json([
            'message' => 'Telemetry saved successfully',
            'data' => $reading
        ], 201);
    }

    /**
     * Helper function to send Email Warning
     */
    private function sendEmergencyEmail($device, $reading)
    {
        $targetEmail = 'admin@nasugbu.gov.ph';

        try {
            Mail::to($targetEmail)->send(new EmergencyAlert($device, $reading));
            Log::info("Emergency Email sent successfully for " . $device->barangay->name);
        } catch (\Exception $e) {
            Log::error("Email Sending Failed: " . $e->getMessage());
        }
    }
}
