import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    Activity, ThermometerSun, AlertTriangle, SignalHigh, Map as MapIcon,
    RefreshCw, Cpu, HardDrive, Plug, Layers, Wind
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function BarangayDashboard({ liveData }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Extract only the local data for Barangay 7
    const localData = liveData?.brgy7 || { aqi: 112, heat_index: 39, signal: 92 };
    const isDanger = localData.aqi > 100 || localData.heat_index > 38;

    // Map configuration focused strictly on Brgy 7
    const mapCenter = [14.0694, 120.6351];
    const nodes = [
        { id: 'brgy7', name: 'Brgy 7 Local Sensor', position: [14.0694, 120.6351], data: localData }
    ];

    // Premium Map Pin
    const getCeramicPin = (aqi) => {
        let color = 'bg-emerald-600';
        let pulse = 'bg-emerald-400';
        if (aqi > 100) { color = 'bg-rose-600'; pulse = 'bg-rose-400'; }
        else if (aqi > 50) { color = 'bg-amber-500'; pulse = 'bg-amber-400'; }

        return L.divIcon({
            className: 'clear-marker',
            html: `
                <div class="relative flex items-center justify-center w-8 h-8">
                    <div class="absolute inset-0 rounded-full opacity-40 animate-ping ${pulse}"></div>
                    <div class="w-4 h-4 rounded-full ${color} ring-[3px] ring-white shadow-sm z-10"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
    };

    return (
        <BarangayLayout brgyName="Brgy. 7 (Poblacion)">
            <Head title="Local Dashboard | AirSafe" />

            {/* Header (Mirrors Admin Dashboard but Localized) */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Local Node Connected</span>
                    </div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight">Barangay 7 Monitoring</h1>
                </div>
                <div className="flex items-center gap-5">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-stone-800 tabular-nums leading-none mb-1">
                            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Time</span>
                    </div>
                    <div className="h-10 w-px bg-stone-200"></div>
                    <div className="px-4 py-2 bg-white rounded-full border border-stone-200 shadow-sm flex items-center gap-2">
                        <RefreshCw size={14} className="text-stone-500 animate-spin-slow" style={{animationDuration: '4s'}}/>
                        <span className="text-xs font-bold text-stone-600">Updating Live</span>
                    </div>
                </div>
            </div>

            {/* Localized Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <EditorialMetric title="Current Air Quality" value={localData.aqi} unit="AQI" icon={Wind} color={localData.aqi > 100 ? "rose" : "emerald"} isAlert={localData.aqi > 100} trend={localData.aqi > 100 ? "Hazard" : "Safe"} />
                <EditorialMetric title="Current Heat Index" value={`${localData.heat_index}°`} unit="C" icon={ThermometerSun} color={localData.heat_index > 38 ? "amber" : "emerald"} isAlert={localData.heat_index > 38} trend={localData.heat_index > 38 ? "Extreme" : "Normal"} />
                <EditorialMetric title="Gateway Status" value="Online" unit="ESP32" icon={SignalHigh} color="stone" trend={`${localData.signal}% Signal`} />
                <EditorialMetric title="Local Alerts" value={isDanger ? "1" : "0"} unit="Active" icon={AlertTriangle} color={isDanger ? "rose" : "stone"} isAlert={isDanger} trend={isDanger ? "Check Logs" : "All Clear"} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Center Map and Chart Column */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Local Map Box (Zoomed in to Brgy 7) */}
                    <div className="bg-white p-2 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 flex flex-col relative h-[500px]">
                        <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-stone-100 flex items-center gap-2">
                            <MapIcon size={16} className="text-stone-600" />
                            <h2 className="font-bold text-sm text-stone-800">Local Area Map</h2>
                        </div>

                        <div className="absolute top-6 right-6 z-[400] bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-1">
                            <button className="p-2 bg-stone-100 rounded-xl text-stone-800 hover:bg-stone-200 transition-colors" title="Air Quality View">
                                <Layers size={16} />
                            </button>
                            <button className="p-2 bg-transparent rounded-xl text-stone-400 hover:text-stone-800 transition-colors" title="Heat View">
                                <ThermometerSun size={16} />
                            </button>
                        </div>

                        <div className="rounded-[1.5rem] overflow-hidden w-full h-full relative z-0">
                            {/* Zoom is higher (15) because it's local */}
                            <MapContainer center={mapCenter} zoom={15} zoomControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#F7F7F5' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap" />
                                {nodes.map(node => (
                                    <Marker key={node.id} position={node.position} icon={getCeramicPin(node.data.aqi)}>
                                        <Popup className="rounded-2xl shadow-xl border-0 overflow-hidden p-0 m-0">
                                            <div className="font-sans min-w-[240px] bg-white">
                                                <div className="bg-stone-50 border-b border-stone-100 px-5 py-3">
                                                    <strong className="block text-sm text-stone-800 font-bold">{node.name}</strong>
                                                </div>
                                                <div className="p-5 space-y-5">
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                                                            <span>Air Pollution (AQI)</span>
                                                            <span className={node.data.aqi > 100 ? 'text-rose-600' : 'text-emerald-600'}>{node.data.aqi}</span>
                                                        </div>
                                                        <div className="w-full bg-stone-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${node.data.aqi > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(node.data.aqi, 100)}%` }}></div></div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                                                            <span>Heat Index</span>
                                                            <span className="text-amber-500">{node.data.heat_index}°C</span>
                                                        </div>
                                                        <div className="w-full bg-stone-100 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${(node.data.heat_index / 50) * 100}%` }}></div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                    <CeramicAnalyticsChart />
                </div>

                {/* Right Column: Local Device Status & Logs */}
                <div className="space-y-8 flex flex-col">

                    {/* Local Device Status Box */}
                    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                            <div className="p-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-600"><Cpu size={18} /></div>
                            <h2 className="font-bold text-stone-800 tracking-tight">Hardware Health</h2>
                        </div>
                        <div className="space-y-4">
                            {/* Only showing the Brgy 7 Sensor */}
                            <SpecSheetCard name="Brgy 7 Gateway Node" data={localData} />
                        </div>
                    </div>

                    {/* Local Activity Log */}
                    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-6 flex-1">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-600"><HardDrive size={18} /></div>
                                <h2 className="font-bold text-stone-800 tracking-tight">Local Activity</h2>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {localData.aqi > 100 && (
                                <LogEntry time="Just now" location="System" message="Air quality threshold breached. SMS warning dispatched to Captain." isAlert={true} />
                            )}
                            <LogEntry time="2 hours ago" location="Sensor 02" message="Routine self-calibration completed for MQ135." isAlert={false} />
                            <LogEntry time="4 hours ago" location="Gateway" message="LTE cellular connection stabilized at 92% strength." isAlert={false} />
                        </div>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}

// ==========================================
// SIMPLE SUB-COMPONENTS
// ==========================================

function EditorialMetric({ title, value, unit, icon: Icon, color, isAlert, trend }) {
    const colorMap = {
        stone: 'text-stone-600',
        emerald: 'text-emerald-600',
        rose: 'text-rose-600',
        amber: 'text-amber-500'
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-stone-200/50 hover:border-stone-300 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <Icon size={22} strokeWidth={2} className={`${colorMap[color]} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">{trend}</span>
            </div>
            <div>
                <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-4xl font-black text-stone-900 tracking-tight">{value}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isAlert ? 'text-rose-500' : 'text-stone-400'}`}>{unit}</span>
                </div>
                <p className="text-sm font-semibold text-stone-500">{title}</p>
            </div>
        </div>
    );
}

function SpecSheetCard({ name, data }) {
    const isDanger = data.aqi > 100;
    return (
        <div className="p-4 bg-[#F7F7F5] rounded-2xl border border-stone-200/80 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm text-stone-900">{name}</h4>
                <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${isDanger ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isDanger ? 'Warning' : 'Normal'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-stone-200 rounded-xl overflow-hidden mb-3 border border-stone-200">
                <div className="bg-white p-3">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Air Quality</span>
                    <strong className={`text-xl leading-none font-black ${isDanger ? 'text-rose-600' : 'text-stone-800'}`}>{data.aqi}</strong>
                </div>
                <div className="bg-white p-3">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Heat Index</span>
                    <strong className="text-xl leading-none font-black text-amber-600">{data.heat_index}°C</strong>
                </div>
            </div>

            <div className="flex gap-4 px-1 pt-2">
                <div className="flex-1 flex items-center gap-2" title="Power Source">
                    <Plug size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-0.5">Grid AC</span>
                </div>
                <div className="flex-1 flex items-center gap-2" title="Cellular Signal">
                    <SignalHigh size={14} className="text-blue-600" />
                    <div className="flex-1 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.signal || 85}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogEntry({ time, location, message, isAlert }) {
    return (
        <div className="flex gap-4 group">
            <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${isAlert ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)]' : 'bg-stone-300'}`}></div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <strong className="text-sm text-stone-900 tracking-tight">{location}</strong>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{time}</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">{message}</p>
            </div>
        </div>
    );
}

// Chart Data specifically filtered for the local barangay
const localChartData = [
    { time: '00:00', aqi: 55 },
    { time: '04:00', aqi: 62 },
    { time: '08:00', aqi: 85 },
    { time: '12:00', aqi: 115 }, // Peak Pollution Time
    { time: '16:00', aqi: 95 },
    { time: '20:00', aqi: 75 },
    { time: '24:00', aqi: 60 },
];

function CeramicAnalyticsChart() {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="font-bold text-stone-800 text-lg tracking-tight">Local AQI Trend (24h)</h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-1">Recorded pollution levels in Brgy 7</p>
                </div>
            </div>
            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={localChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="terracotta" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 11, fontWeight: 'bold' }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e7e5e4', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}
                            itemStyle={{ fontWeight: 'bold', color: '#1c1917' }}
                            labelStyle={{ color: '#78716c', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
                        />
                        <ReferenceLine y={100} stroke="#e11d48" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'DANGER ZONE', fill: '#e11d48', fontSize: 10, fontWeight: 800 }} />
                        <Area type="monotone" dataKey="aqi" name="Brgy 7 AQI" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#terracotta)" activeDot={{ r: 5, strokeWidth: 0, fill: '#e11d48' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}