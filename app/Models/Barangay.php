<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'captain_name', 'contact_number'];

    public function devices()
    {
        return $this->hasMany(Device::class);
    }
}
