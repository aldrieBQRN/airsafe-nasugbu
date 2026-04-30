<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Barangay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth; // <-- Added this to safely handle logins
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::with('barangay')->orderBy('created_at', 'desc')->get(),
            'barangays' => Barangay::all(['id', 'name'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,official',
            'barangay_id' => 'nullable|required_if:role,official|exists:barangays,id',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'barangay_id' => $validated['role'] === 'admin' ? null : $validated['barangay_id'],
        ]);

        return back();
    }

    public function update(Request $request, $id)
    {
        // 1. Ensure $id is used as a variable here, not a method
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id, // Safe property access
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:admin,official',
            'barangay_id' => 'nullable|required_if:role,official|exists:barangays,id',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'barangay_id' => $validated['role'] === 'admin' ? null : $validated['barangay_id'],
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back();
    }

    public function destroy($id)
    {
        // 2. Safe retrieval
        $user = User::findOrFail($id);

        // 3. FIX: Using the Auth facade and checking the property $user->id (NO parentheses)
        if (Auth::id() === $user->id) {
            return back()->withErrors(['message' => 'You cannot delete your own active account.']);
        }

        $user->delete();

        return back();
    }
}
