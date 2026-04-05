import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Activity, ThermometerSun, AlertTriangle, SignalHigh, Map as MapIcon,
    RefreshCw, Cpu, HardDrive, Plug, Layers
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function Dashboard({ liveData }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulated data from your ESP32 devices
    const data = liveData || {
        tumalim: { aqi: 45, heat_index: 34, signal: 85 },
        brgy7: { aqi: 112, heat_index: 39, signal: 92 }
    };

    const mapCenter = [14.0748, 120.6793];
    const nodes = [
        { id: 'tumalim', name: 'Barangay Tumalim', position: [14.0801, 120.7235], data: data.tumalim },
        { id: 'brgy7', name: 'Barangay 7 (Poblacion)', position: [14.0694, 120.6351], data: data.brgy7 }
    ];

    // Simple Map Pin
    const getCeramicPin = (aqi) => {
        let color = 'bg-emerald-600';
        let pulse = 'bg-emerald-400';
        if (aqi > 100) { color = 'bg-rose-600'; pulse = 'bg-rose-400'; }
        else if (aqi > 50) { color = 'bg-amber-500'; pulse = 'bg-amber-400'; }

        return L.divIcon({
            className: 'clear-marker',
            html: `
                <div class="relative flex items-center justify-center w-6 h-6">
                    <div class="absolute inset-0 rounded-full opacity-40 animate-ping ${pulse}"></div>
                    <div class="w-3.5 h-3.5 rounded-full ${color} ring-[3px] ring-white shadow-sm z-10"></div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    };

    return (
        <AdminLayout>
            <Head title="AirSafe Dashboard" />

            {/* Simple Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Live Connection Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight">Nasugbu Monitoring</h1>
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

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                <EditorialMetric title="Average Air Quality" value="78" unit="Moderate" icon={Activity} color="emerald" trend="Normal" />
                <EditorialMetric title="Highest Heat Index" value="39°" unit="Warning" icon={ThermometerSun} color="rose" isAlert={true} trend="Hot" />
                <EditorialMetric title="Active Sensors" value="2/2" unit="Online" icon={SignalHigh} color="stone" trend="100%" />
                <EditorialMetric title="Active Alerts" value="1" unit="Area" icon={AlertTriangle} color="amber" isAlert={true} trend="Check Map" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Center Map and Chart Column */}
                <div className="xl:col-span-2 space-y-8">

                    {/* Map Box */}
                    <div className="bg-white p-2 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 flex flex-col relative h-[500px]">

                        <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-stone-100 flex items-center gap-2">
                            <MapIcon size={16} className="text-stone-600" />
                            <h2 className="font-bold text-sm text-stone-800">Live Sensor Map</h2>
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
                            <MapContainer center={mapCenter} zoom={12} zoomControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#F7F7F5' }}>
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

                {/* Right Column: Device Status & Logs */}
                <div className="space-y-8 flex flex-col">

                    {/* Device Status Box */}
                    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
                            <div className="p-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-600"><Cpu size={18} /></div>
                            <h2 className="font-bold text-stone-800 tracking-tight">Sensor Device Health</h2>
                        </div>
                        <div className="space-y-4">
                            <SpecSheetCard name="Tumalim Sensor" data={data.tumalim} />
                            <SpecSheetCard name="Brgy 7 Sensor" data={data.brgy7} />
                        </div>
                    </div>

                    {/* Simple Activity Log */}
                    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-6 flex-1">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-600"><HardDrive size={18} /></div>
                                <h2 className="font-bold text-stone-800 tracking-tight">Recent Activity</h2>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {data.brgy7.aqi > 100 && (
                                <LogEntry time="10 mins ago" location="Brgy 7" message="Air quality reached dangerous levels. Automated text message sent to Brgy Captain." isAlert={true} />
                            )}
                            <LogEntry time="1 hour ago" location="Tumalim" message="Heat index cooled down. Safety warning removed." isAlert={false} />
                            <LogEntry time="3 hours ago" location="System" message="All sensors successfully connected to the internet via SIM network." isAlert={false} />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
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

            {/* Simple Metrics */}
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

            {/* Direct Power & Cellular SIM Bars */}
            <div className="flex gap-4 px-1 pt-2">
                <div className="flex-1 flex items-center gap-2" title="Power Source">
                    <Plug size={14} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-0.5">Grid AC Power</span>
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

const chartData = [
    { time: '00:00', tumalimAqi: 40, brgy7Aqi: 55 },
    { time: '04:00', tumalimAqi: 42, brgy7Aqi: 62 },
    { time: '08:00', tumalimAqi: 48, brgy7Aqi: 85 },
    { time: '12:00', tumalimAqi: 55, brgy7Aqi: 115 }, // Peak Pollution Time
    { time: '16:00', tumalimAqi: 50, brgy7Aqi: 95 },
    { time: '20:00', tumalimAqi: 46, brgy7Aqi: 75 },
    { time: '24:00', tumalimAqi: 42, brgy7Aqi: 60 },
];

function CeramicAnalyticsChart() {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="font-bold text-stone-800 text-lg tracking-tight">24-Hour Air Quality History</h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-1">Recorded pollution levels over time</p>
                </div>
            </div>
            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="sageGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                            </linearGradient>
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

                        <Area type="monotone" dataKey="brgy7Aqi" name="Brgy 7" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#terracotta)" activeDot={{ r: 5, strokeWidth: 0, fill: '#e11d48' }} />
                        <Area type="monotone" dataKey="tumalimAqi" name="Tumalim" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#sageGreen)" activeDot={{ r: 5, strokeWidth: 0, fill: '#059669' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}