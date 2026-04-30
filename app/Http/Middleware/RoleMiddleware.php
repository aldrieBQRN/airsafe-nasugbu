<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Guard against unauthenticated users to prevent a "call to a member function role on null" error
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // 2. Existing role check
        if ($request->user()->role !== $role) {
            return $request->user()->role === 'admin'
                ? redirect()->route('admin.dashboard')
                : redirect()->route('barangay.dashboard');
        }

        return $next($request);
    }
}
