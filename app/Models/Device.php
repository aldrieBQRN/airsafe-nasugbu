<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Device extends Model
{
    use HasFactory;

    // Primary Key Configuration for Hardware IDs
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'barangay_id',
        'name',
        'location',
        'latitude',
        'longitude',
        'api_token',
        'status',
        'last_seen'
    ];

    /**
     * Relationship: Each device belongs to one Barangay.
     */
    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }

    /**
     * Relationship: All historical readings for this node.
     */
    public function readings()
    {
        return $this->hasMany(SensorReading::class);
    }

    /**
     * Relationship: The absolute latest reading (Critical for Performance)
     * This enables Device::with('latestReading') to work in your web.php routes.
     */
    public function latestReading()
    {
        return $this->hasOne(SensorReading::class)->latestOfMany();
    }
}
