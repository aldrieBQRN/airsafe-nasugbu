<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Barangay;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceController extends Controller
{
    /**
     * Register a new hardware node.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|string|unique:devices,id',
            'barangay_id' => 'required|exists:barangays,id',
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        Device::create([
            'id' => $validated['id'],
            'barangay_id' => $validated['barangay_id'],
            'name' => $validated['name'],
            'location' => $validated['location'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'api_token' => 'AIRSAFE-AUTH-9928', // Reverted back to your hardware's exact key
            'status' => 'offline'
        ]);

        return back();
    }

    /**
     * Update the configuration of an existing node.
     */
    public function update(Request $request, $id)
    {
        $device = Device::findOrFail($id);

        // 2. Add barangay_id to the validation rules
        $validated = $request->validate([
            'barangay_id' => 'required|exists:barangays,id',
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        // 3. Update the foreign key along with the other details
        $device->update([
            'barangay_id' => $validated['barangay_id'],
            'name' => $validated['name'],
            'location' => $validated['location'],
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
        ]);

        return back();
    }

    /**
     * Unregister a hardware node from the system.
     */
    public function destroy($id)
    {
        $device = Device::findOrFail($id);

        // This will remove the device record.
        // If your migration has onDelete('cascade'), sensor_readings will also be deleted.
        $device->delete();

        return back();
    }
}
