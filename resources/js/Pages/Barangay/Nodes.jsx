import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    RadioTower, Plug, SignalHigh, Cpu,
    CheckCircle2, AlertCircle, Wind, ThermometerSun, ShieldAlert, WifiOff
} from 'lucide-react';

export default function BarangayNodes({ nodesData, brgyName }) {
    // 1-Second Background Sync with Network Lock (Matches Dashboard & Map logic)
    useEffect(() => {
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing) return;
            isRefreshing = true;

            router.reload({
                only: ['nodesData'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 1000);

        return () => clearInterval(dataPoller);
    }, []);

    const nodes = nodesData || [];

    return (
        <BarangayLayout brgyName={brgyName || "Local Jurisdiction"}>
            <Head title={`Local Hardware | ${brgyName || 'TRIVORA'}`} />

            {/* Tactical Page Header */}
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight uppercase leading-none">Sensor Device</h1>
                    <p className="text-xs md:text-sm text-stone-500 font-bold flex items-center gap-2 mt-3 uppercase tracking-widest">
                        <RadioTower size={16} className="text-stone-400 shrink-0" />
                        Managing deployed physical sensors in {brgyName}
                    </p>
                </div>
            </div>

            {/* Render all local hardware nodes */}
            <div className="w-full flex flex-col gap-6 md:gap-8">
                {nodes.length > 0 ? (
                    nodes.map((device) => (
                        <DeviceCard key={device.id} device={device} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200/60 shadow-sm">
                        <RadioTower size={48} className="text-stone-300 mb-4" />
                        <h3 className="text-lg font-black text-stone-700 uppercase tracking-widest">No Hardware Deployed</h3>
                        <p className="text-xs font-bold text-stone-400 mt-2 uppercase tracking-widest text-center">There are no gateway nodes registered to this barangay.</p>
                    </div>
                )}
            </div>

        </BarangayLayout>
    );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function DeviceCard({ device }) {
    const isWarning = device.status === 'warning' || device.status === 'danger' || device.status === 'Danger' || device.status === 'Warning';
    const isOffline = device.status === 'offline' || device.status === 'Offline';

    return (
        <div className={`bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border transition-colors p-5 sm:p-8 flex flex-col relative overflow-hidden group w-full ${isOffline ? 'border-stone-200 opacity-90' : 'border-stone-200/60'}`}>

            {/* Warning Glow Effect if device detects danger */}
            {isWarning && !isOffline && <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/40 blur-3xl rounded-full pointer-events-none"></div>}

            {/* Card Header - Full Width */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-stone-100 relative z-10">
                <div className="flex items-center gap-4 md:gap-5">
                    <div className={`p-3 md:p-4 rounded-2xl shrink-0 shadow-sm border ${
                        isOffline ? 'bg-stone-100 text-stone-500 border-stone-200'
                        : (isWarning ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                    }`}>
                        {isOffline ? <WifiOff size={32} strokeWidth={2} className="md:w-9 md:h-9" /> : (isWarning ? <ShieldAlert size={32} strokeWidth={2} className="md:w-9 md:h-9" /> : <Cpu size={32} strokeWidth={2} className="md:w-9 md:h-9" />)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1 md:mb-1.5">
                            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight leading-tight uppercase">{device.name}</h2>
                            {isOffline && <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-stone-200 text-stone-600 px-2 py-1 rounded-md">Offline</span>}
                        </div>
                        <p className="text-xs md:text-sm font-bold text-stone-500 uppercase tracking-widest">{device.location}</p>
                    </div>
                </div>
                {/* Device ID */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100 mt-2 sm:mt-0">
                    <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest sm:mb-1.5">Device Identification</span>
                    <span className="text-xs md:text-sm font-black text-stone-700 bg-stone-100 border border-stone-200 px-3 md:px-4 py-1.5 md:py-2 rounded-lg">{device.id}</span>
                </div>
            </div>

            {/* Internal 3-Column Grid for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">

                {/* Column 1: Current Readings */}
                <div className="flex flex-col gap-3 md:gap-4 h-full">
                    <h3 className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Environmental Telemetry</h3>
                    <div className="flex-1 flex flex-col gap-px bg-stone-200 rounded-2xl md:rounded-[1.5rem] overflow-hidden border border-stone-200">
                        <div className="bg-stone-50 p-5 md:p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Wind size={14}/> Air Quality
                                </span>
                                <span className={`text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                                    isOffline ? 'bg-stone-200 text-stone-500' : (device.sensors.aqi > 100 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600')
                                }`}>
                                    {isOffline ? 'Offline' : (device.sensors.aqi > 100 ? 'Danger' : 'Safe')}
                                </span>
                            </div>
                            {/* FIXED: Display actual value even if offline, let styling indicate state */}
                            <strong className={`text-4xl md:text-5xl font-black leading-none ${isOffline ? 'text-stone-400' : (device.sensors.aqi > 100 ? 'text-rose-600' : 'text-stone-800')}`}>
                                {device.sensors.aqi}
                            </strong>
                        </div>
                        <div className="bg-stone-50 p-5 md:p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <ThermometerSun size={14}/> Heat Index
                                </span>
                                <span className={`text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                                    isOffline ? 'bg-stone-200 text-stone-500' : (device.sensors.heat > 38 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')
                                }`}>
                                    {isOffline ? 'Offline' : (device.sensors.heat > 38 ? 'Warning' : 'Normal')}
                                </span>
                            </div>
                            {/* FIXED: Display actual value even if offline */}
                            <strong className={`text-4xl md:text-5xl font-black leading-none ${isOffline ? 'text-stone-400' : (device.sensors.heat > 38 ? 'text-amber-600' : 'text-stone-800')}`}>
                                {device.sensors.heat}°C
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Column 2: Component Health List */}
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3 md:mb-4 pl-1 pr-1">
                        <h3 className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">Hardware Sub-Systems</h3>
                        <span className="text-[8px] md:text-[9px] font-bold text-stone-400 uppercase">Last Sync: {device.lastSync}</span>
                    </div>
                    <div className="space-y-2 md:space-y-3 flex-1 bg-stone-50/50 p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] border border-stone-100">
                        {device.components.map((comp, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 md:p-3.5 rounded-xl md:rounded-2xl border border-stone-200/60 bg-white shadow-sm">
                                <span className="text-xs md:text-sm font-bold text-stone-700 uppercase tracking-tight">{comp.name}</span>
                                {comp.status === 'ok' ? (
                                    <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 md:py-1.5 rounded-md">
                                        <CheckCircle2 size={12}/> Normal
                                    </span>
                                ) : (
                                    <span className={`flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 md:py-1.5 rounded-md border ${
                                        comp.status === 'error' ? 'text-stone-500 bg-stone-100 border-stone-200' : 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse'
                                    }`}>
                                        <AlertCircle size={12}/> {comp.status === 'error' ? 'Offline' : 'Alert'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 3: Stats & Actions (Controls Removed) */}
                <div className="flex flex-col h-full">
                    <h3 className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 md:mb-4 pl-1">System Links & Status</h3>

                    <div className="flex flex-col gap-3 md:gap-4 flex-1">
                        <div className="flex flex-col h-1/2">
                            <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 md:mb-2 pl-1">Power Source</span>
                            <div className="flex-1 flex items-center gap-3 md:gap-4 text-stone-800 bg-stone-50 border border-stone-200 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] shadow-sm">
                                <Plug size={24} className={isOffline ? 'text-stone-400' : 'text-emerald-600'} shrink-0="true" />
                                <strong className={`text-sm md:text-base font-black uppercase tracking-widest truncate ${isOffline && 'text-stone-500'}`}>{device.powerSource}</strong>
                            </div>
                        </div>
                        <div className="flex flex-col h-1/2">
                            <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1.5 md:mb-2 pl-1">Cellular Link</span>
                            <div className="flex-1 flex items-center justify-between text-stone-800 bg-stone-50 border border-stone-200 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] shadow-sm">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <SignalHigh size={24} className={isOffline ? 'text-stone-400' : 'text-blue-600'} shrink-0="true" />
                                    <strong className={`text-sm md:text-base font-black uppercase tracking-widest truncate ${isOffline && 'text-stone-500'}`}>{device.network}</strong>
                                </div>
                                <span className={`text-xs md:text-sm font-black px-2 md:px-3 py-1 md:py-1.5 rounded-lg ${isOffline ? 'bg-stone-200 text-stone-500' : 'bg-blue-50 text-blue-600'}`}>
                                    {isOffline ? '0%' : `${device.signal}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}