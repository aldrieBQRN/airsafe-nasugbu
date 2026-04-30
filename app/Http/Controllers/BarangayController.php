<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarangayController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Barangays', [
            'barangays' => Barangay::withCount('devices')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:barangays,name',
            'captain_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
        ]);

        Barangay::create($validated);
        return back();
    }

    public function update(Request $request, $id)
    {
        $barangay = Barangay::findOrFail($id);
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:barangays,name,' . $id,
            'captain_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $barangay->update($validated);
        return back();
    }

    public function destroy($id)
    {
        $barangay = Barangay::findOrFail($id);
        // Safety: Don't delete if sensors are still assigned
        if ($barangay->devices()->count() > 0) {
            return back()->withErrors(['message' => 'Cannot delete. Sensors are still linked to this area.']);
        }
        $barangay->delete();
        return back();
    }
}
