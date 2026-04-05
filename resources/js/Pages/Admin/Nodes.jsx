import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    RadioTower, Plus, Plug, SignalHigh, Cpu,
    Settings, RotateCw, Power, CheckCircle2, AlertCircle, Wind, ThermometerSun
} from 'lucide-react';

export default function Nodes({ nodesData }) {
    // Updated database records matching your SIM + Grid Power hardware
    const devices = nodesData || [
        {
            id: 'NODE-001',
            name: 'Tumalim Sensor',
            location: 'Barangay Tumalim Hall',
            status: 'online',
            uptime: '45 days, 12 hrs',
            powerSource: 'Grid AC (220V)',
            network: 'Smart SIM - LTE',
            signal: 85,
            lastSync: 'Just now',
            sensors: { aqi: 45, heat: 34 },
            components: [
                { name: 'ESP32 Gateway', status: 'ok' },
                { name: 'Cellular SIM Module', status: 'ok' },
                { name: 'MQ135 (Air Quality)', status: 'ok' },
                { name: 'MQ136 (Hazardous Gas)', status: 'ok' },
                { name: 'DHT22 (Temperature)', status: 'ok' }
            ]
        },
        {
            id: 'NODE-002',
            name: 'Brgy 7 Sensor',
            location: 'Poblacion Covered Court',
            status: 'warning',
            uptime: '12 days, 4 hrs',
            powerSource: 'Grid AC (220V)',
            network: 'Globe SIM - LTE',
            signal: 92,
            lastSync: '2 mins ago',
            sensors: { aqi: 112, heat: 39 },
            components: [
                { name: 'ESP32 Gateway', status: 'ok' },
                { name: 'Cellular SIM Module', status: 'ok' },
                { name: 'MQ135 (Air Quality)', status: 'warning' },
                { name: 'MQ136 (Hazardous Gas)', status: 'warning' },
                { name: 'DHT22 (Temperature)', status: 'ok' }
            ]
        }
    ];

    return (
        <AdminLayout>
            <Head title="Manage Sensor Devices" />

            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight">Sensor Devices</h1>
                    <p className="text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <RadioTower size={16} className="text-stone-400" /> Manage physical hardware deployed in Nasugbu
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="px-5 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-colors flex items-center gap-2">
                        <Plus size={16} /> Add New Device
                    </button>
                </div>
            </div>

            {/* Device Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {devices.map(device => (
                    <DeviceCard key={device.id} device={device} />
                ))}
            </div>

        </AdminLayout>
    );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function DeviceCard({ device }) {
    const isWarning = device.status === 'warning';

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-6 flex flex-col relative overflow-hidden group">

            {/* Warning Glow Effect if device detects danger */}
            {isWarning && <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 blur-3xl rounded-full"></div>}

            {/* Card Header */}
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isWarning ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Cpu size={28} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-stone-900 tracking-tight">{device.name}</h2>
                        <p className="text-sm font-semibold text-stone-500">{device.location}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Device ID</span>
                    <span className="text-xs font-black text-stone-700 bg-stone-100 px-2 py-1 rounded-md">{device.id}</span>
                </div>
            </div>

            {/* Current Readings Summary */}
            <div className="grid grid-cols-2 gap-px bg-stone-200 rounded-2xl overflow-hidden mb-6 border border-stone-200 relative z-10">
                <div className="bg-stone-50 p-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1"><Wind size={12}/> Air Quality</span>
                        <span className={`text-[10px] font-bold uppercase ${isWarning ? 'text-rose-500' : 'text-emerald-500'}`}>{isWarning ? 'Danger' : 'Safe'}</span>
                    </div>
                    <strong className={`text-2xl font-black ${isWarning ? 'text-rose-600' : 'text-stone-800'}`}>{device.sensors.aqi}</strong>
                </div>
                <div className="bg-stone-50 p-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1"><ThermometerSun size={12}/> Heat Index</span>
                        <span className="text-[10px] font-bold uppercase text-amber-500">Warning</span>
                    </div>
                    <strong className="text-2xl font-black text-amber-600">{device.sensors.heat}°C</strong>
                </div>
            </div>

            {/* Component Health List */}
            <div className="mb-6 relative z-10">
                <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 pl-1">Hardware Components</h3>
                <div className="space-y-2">
                    {device.components.map((comp, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-stone-100 bg-white">
                            <span className="text-sm font-bold text-stone-700">{comp.name}</span>
                            {comp.status === 'ok' ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle2 size={12}/> Working</span>
                            ) : (
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-2 py-1 rounded-md"><AlertCircle size={12}/> Alert</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Status & Controls */}
            <div className="mt-auto pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">

                {/* Power & Network Stats (UPDATED FOR SIM & GRID) */}
                <div className="flex gap-6">
                    <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Power Source</span>
                        <div className="flex items-center gap-2 text-stone-800 bg-stone-100 px-2 py-1 rounded-md">
                            <Plug size={14} className="text-emerald-600" />
                            <strong className="text-[11px] font-black">{device.powerSource}</strong>
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Cellular Link</span>
                        <div className="flex items-center gap-2 text-stone-800 bg-stone-100 px-2 py-1 rounded-md">
                            <SignalHigh size={14} className="text-blue-600" />
                            <strong className="text-[11px] font-black">{device.network} ({device.signal}%)</strong>
                        </div>
                    </div>
                </div>

                {/* Device Action Buttons */}
                <div className="flex gap-2">
                    <button className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 transition-colors" title="Device Settings">
                        <Settings size={18} />
                    </button>
                    <button className="p-2.5 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl text-stone-600 hover:text-amber-600 transition-colors" title="Restart / Reboot Device">
                        <RotateCw size={18} />
                    </button>
                    <button className="p-2.5 bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-xl text-stone-600 hover:text-rose-600 transition-colors" title="Turn Off Device">
                        <Power size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}