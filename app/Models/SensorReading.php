<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Builder;

class SensorReading extends Model
{
    use HasFactory, Prunable;

    protected $guarded = [];

    /**
     * Get the prunable model query.
     * Keeps sensor readings from the last 30 days and prunes older records.
     */
    public function prunable(): Builder
    {
        return static::where('created_at', '<=', now()->subDays(30));
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}

