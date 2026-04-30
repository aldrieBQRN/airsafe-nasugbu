<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table 1: The Barangays
        Schema::create('barangays', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Example: "Brgy 7 Poblacion"
            $table->string('captain_name')->nullable();
            $table->string('contact_number')->nullable(); // For SMS Alerts later
            $table->timestamps();
        });

        // Table 2: The Physical ESP32 Devices
        Schema::create('devices', function (Blueprint $table) {
            $table->string('id')->primary(); // Example: "NODE-001"
            $table->foreignId('barangay_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Example: "Covered Court Gateway"
            $table->string('api_token'); // Secret key to prevent fake data submissions
            $table->string('status')->default('active');
            $table->timestamps();
        });

        // Table 3: The Sensor Telemetry Data
        Schema::create('sensor_readings', function (Blueprint $table) {
            $table->id();
            $table->string('device_id');
            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');

            // DHT22 Data
            $table->float('temperature');
            $table->float('humidity');
            $table->float('heat_index');

            // MQ135 & MQ136 Data
            $table->integer('aqi');
            $table->integer('hazardous_gas_level');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sensor_readings');
        Schema::dropIfExists('devices');
        Schema::dropIfExists('barangays');
    }
};
