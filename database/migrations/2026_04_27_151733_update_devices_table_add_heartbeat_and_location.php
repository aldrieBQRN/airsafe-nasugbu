<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Add last_seen for the heartbeat logic
            if (!Schema::hasColumn('devices', 'last_seen')) {
                $table->timestamp('last_seen')->nullable()->after('status');
            }

            // Add location for the registration logic
            if (!Schema::hasColumn('devices', 'location')) {
                $table->string('location')->nullable()->after('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn(['last_seen', 'location']);
        });
    }
};
