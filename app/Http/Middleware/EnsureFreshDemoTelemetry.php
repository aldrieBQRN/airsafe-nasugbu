<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\DemoTelemetryService;

class EnsureFreshDemoTelemetry
{
    /**
     * Handle an incoming web request.
     *
     * Ensures whenever a portfolio visitor accesses the site,
     * past data beyond 30 days is pruned and fresh telemetry is present.
     */
    public function handle(Request $request, Closure $next): Response
    {
        DemoTelemetryService::ensureFreshData();

        return $next($request);
    }
}
