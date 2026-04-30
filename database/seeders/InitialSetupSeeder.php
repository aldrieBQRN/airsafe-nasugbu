<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Barangay;
use App\Models\User;
use App\Models\Device;
use Illuminate\Support\Facades\Hash;

class InitialSetupSeeder extends Seeder
{
    /**
     * Run the TRIVORA initial setup seeder.
     */
    public function run(): void
    {
        $this->command->info("Initializing TRIVORA system setup...");

        // 1. Create Brgy 7 (Primary Test Jurisdiction)
        $brgy7 = Barangay::create([
            'name' => 'Brgy 7',
            'captain_name' => 'Juan Dela Cruz',
            'contact_number' => '+639123456789',
        ]);

        // 2. Generate 10 System Administrators (MDRRMO Level)
        $this->command->info("Creating 10 System Administrators...");

        // Main Admin
        User::create([
            'name' => 'John Aldrie Baquiran', // Project Lead
            'email' => 'admin@airsafe.ph',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        for ($i = 1; $i <= 9; $i++) {
            User::create([
                'name' => "MDRRMO Commander $i",
                'email' => "commander$i@trivora.ph",
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]);
        }

        // 3. Generate 42 Barangay Officials (Linked to Brgy 7)
        $this->command->info("Creating 42 Brgy 7 Officials...");

        // Main Official
        User::create([
            'name' => 'Brgy 7 Lead Official',
            'email' => 'official@brgy7.ph',
            'password' => Hash::make('password123'),
            'role' => 'official',
            'barangay_id' => $brgy7->id,
        ]);

        for ($j = 1; $j <= 41; $j++) {
            User::create([
                'name' => "Brgy 7 Officer $j",
                'email' => "officer$j@brgy7.ph",
                'password' => Hash::make('password123'),
                'role' => 'official',
                'barangay_id' => $brgy7->id,
            ]);
        }

        // 4. Create Hardware Node with specific Auth Token
        Device::create([
            'id' => 'NODE-001',
            'name' => 'Brgy 7 Gateway',
            'location' => 'Poblacion Covered Court',
            'latitude' => 14.0694,
            'longitude' => 120.6351,
            'barangay_id' => $brgy7->id,
            'api_token' => 'AIRSAFE-AUTH-9928', // Matches your ESP32 configuration
        ]);

        $this->command->info("Initial Setup Complete: 52 Users and 1 Hardware Node generated.");
    }
}
