<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Dynamically locate the Laravel core directory (Supports Local Laragon, Root, and InfinityFree Split Core)
if (file_exists(__DIR__ . '/airsafe-core/bootstrap/app.php')) {
    $corePath = __DIR__ . '/airsafe-core';
} elseif (file_exists(__DIR__ . '/../airsafe-core/bootstrap/app.php')) {
    $corePath = __DIR__ . '/../airsafe-core';
} elseif (file_exists(__DIR__ . '/../bootstrap/app.php')) {
    $corePath = __DIR__ . '/..';
} else {
    $corePath = __DIR__;
}

// Load env.php if provided on shared hosting
if (file_exists($envFile = $corePath . '/env.php')) {
    $envConfig = require $envFile;
    if (is_array($envConfig)) {
        foreach ($envConfig as $key => $value) {
            if ($value === true) $val = 'true';
            elseif ($value === false) $val = 'false';
            elseif ($value === null) $val = 'null';
            else $val = (string)$value;
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
            putenv("{$key}={$val}");
        }
    }
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $corePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $corePath . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once $corePath . '/bootstrap/app.php';

$app->handleRequest(Request::capture());

