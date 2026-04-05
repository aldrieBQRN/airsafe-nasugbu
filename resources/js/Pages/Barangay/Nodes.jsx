import React from 'react';
import { Head } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    RadioTower, Plug, SignalHigh, Cpu,
    Settings, RotateCw, Power, CheckCircle2,
    AlertCircle, Wind, ThermometerSun, ShieldAlert
} from 'lucide-react';

export default function BarangayNodes({ nodesData }) {
    // Strictly filter the data so Brgy 7 only sees their own hardware
    const localDevice = {
        id: 'NODE-002',
        name: 'Brgy 7 Local Gateway',
        location: 'Poblacion Covered Court Roof',
        status: 'warning',
        uptime: '12 days, 4 hrs',
        powerSource: 'Grid AC (220V)',
        network: 'Globe SIM - LTE',
        signal: 92,
        lastSync: '2 mins ago',
        sensors: { aqi: 112, heat: 39 },
        components: [
            { name: 'ESP32 Microcontroller', status: 'ok' },
            { name: 'LTE Cellular Module', status: 'ok' },
            { name: 'MQ135 (Air Quality)', status: 'warning' },
            { name: 'MQ136 (Hazardous Gas)', status: 'warning' },
            { name: 'DHT22 (Temperature)', status: 'ok' }
        ]
    };

    return (
        <BarangayLayout brgyName="Brgy. 7 (Poblacion)">
            <Head title="Local Hardware Nodes | AirSafe" />

            {/* Tactical Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Local Hardware</h1>
                    <p className="text-sm sm:text-base text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <RadioTower size={16} className="text-stone-400 shrink-0" />
                        <span>Managing deployed physical sensors in Barangay 7</span>
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button className="w-full md:w-auto px-5 py-3 md:py-2.5 justify-center bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-2">
                        <RotateCw size={16} /> Run Diagnostics
                    </button>
                </div>
            </div>

            {/* Full-Width Device Card */}
            <div className="w-full">
                <DeviceCard device={localDevice} />
            </div>

        </BarangayLayout>
    );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function DeviceCard({ device }) {
    const isWarning = device.status === 'warning';

    return (
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-5 sm:p-8 flex flex-col relative overflow-hidden group w-full">

            {/* Warning Glow Effect if device detects danger */}
            {isWarning && <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/40 blur-3xl rounded-full pointer-events-none"></div>}

            {/* Card Header - Full Width */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8 pb-8 border-b border-stone-100 relative z-10">
                <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl shrink-0 ${isWarning ? 'bg-rose-50 text-rose-500 shadow-sm border border-rose-100' : 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100'}`}>
                        {isWarning ? <ShieldAlert size={36} strokeWidth={2} /> : <Cpu size={36} strokeWidth={2} />}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-stone-900 tracking-tight leading-tight mb-1">{device.name}</h2>
                        <p className="text-base font-semibold text-stone-500">{device.location}</p>
                    </div>
                </div>
                {/* Device ID */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100 mt-2 sm:mt-0">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest sm:mb-1">Device Identification</span>
                    <span className="text-sm font-black text-stone-700 bg-stone-100 border border-stone-200 px-4 py-2 rounded-lg">{device.id}</span>
                </div>
            </div>

            {/* Internal 3-Column Grid for Desktop (Stacks on mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

                {/* Column 1: Current Readings */}
                <div className="flex flex-col gap-4 h-full">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Environmental Telemetry</h3>
                    <div className="flex-1 flex flex-col gap-px bg-stone-200 rounded-2xl overflow-hidden border border-stone-200">
                        <div className="bg-stone-50 p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                    <Wind size={14}/> Air Quality
                                </span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isWarning ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {isWarning ? 'Danger' : 'Safe'}
                                </span>
                            </div>
                            <strong className={`text-5xl font-black leading-none ${isWarning ? 'text-rose-600' : 'text-stone-800'}`}>
                                {device.sensors.aqi}
                            </strong>
                        </div>
                        <div className="bg-stone-50 p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                    <ThermometerSun size={14}/> Heat Index
                                </span>
                                <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-600 px-2 py-0.5 rounded">
                                    Warning
                                </span>
                            </div>
                            <strong className="text-5xl font-black leading-none text-amber-600">
                                {device.sensors.heat}°C
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Column 2: Component Health List */}
                <div className="flex flex-col h-full">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">Hardware Sub-Systems</h3>
                    <div className="space-y-3 flex-1 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
                        {device.components.map((comp, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-stone-200/60 bg-white shadow-sm">
                                <span className="text-sm font-bold text-stone-700">{comp.name}</span>
                                {comp.status === 'ok' ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-md">
                                        <CheckCircle2 size={12}/> Normal
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-2 py-1.5 rounded-md animate-pulse border border-rose-100">
                                        <AlertCircle size={12}/> Alert
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: Stats & Actions */}
                <div className="flex flex-col h-full">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 pl-1">System Links & Controls</h3>

                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5">Power Source</span>
                            <div className="flex items-center gap-3 text-stone-800 bg-stone-50 border border-stone-200 p-4 rounded-xl shadow-sm">
                                <Plug size={18} className="text-emerald-600 shrink-0" />
                                <strong className="text-sm font-black truncate">{device.powerSource}</strong>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5">Cellular Link</span>
                            <div className="flex items-center justify-between text-stone-800 bg-stone-50 border border-stone-200 p-4 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <SignalHigh size={18} className="text-blue-600 shrink-0" />
                                    <strong className="text-sm font-black truncate">{device.network}</strong>
                                </div>
                                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{device.signal}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto pt-4 border-t border-stone-100">
                        <button className="flex-1 flex flex-col items-center justify-center gap-1 p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 transition-colors" title="Device Settings">
                            <Settings size={20} />
                            <span className="text-[9px] font-bold uppercase mt-1">Config</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center justify-center gap-1 p-4 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-200 rounded-xl text-stone-600 hover:text-amber-600 transition-colors" title="Restart Node">
                            <RotateCw size={20} />
                            <span className="text-[9px] font-bold uppercase mt-1">Reboot</span>
                        </button>
                        <button className="flex-1 flex flex-col items-center justify-center gap-1 p-4 bg-stone-50 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 rounded-xl text-stone-600 hover:text-rose-600 transition-colors" title="Emergency Shutdown">
                            <Power size={20} />
                            <span className="text-[9px] font-bold uppercase mt-1">Off</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}