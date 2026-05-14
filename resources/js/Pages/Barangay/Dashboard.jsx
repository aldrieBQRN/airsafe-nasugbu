import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    ThermometerSun, AlertTriangle, SignalHigh, Map as MapIcon,
    Cpu, HardDrive, Plug, Wind, WifiOff
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => { if (center) map.setView(center, zoom); }, [center, zoom, map]);
    return null;
}

export default function BarangayDashboard({ brgyName, localData, chartData, recentLogs }) {
    const { serverTime } = usePage().props;

    const [timeOffset] = useState(() => {
        const clientTime = new Date().getTime();
        const trueServerTime = serverTime ? new Date(serverTime).getTime() : clientTime;
        return trueServerTime - clientTime;
    });

    const [currentTime, setCurrentTime] = useState(new Date(new Date().getTime() + timeOffset));

    const deviceData = localData || { aqi: 0, heat_index: 0, signal: 0, status: 'offline', latitude: 14.0748, longitude: 120.6793, name: 'Unassigned Node' };
    const isDanger = deviceData.aqi > 100 || deviceData.heat_index > 38;
    const isOffline = deviceData.status === 'offline';

    const mapCenter = [deviceData.latitude, deviceData.longitude];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date(new Date().getTime() + timeOffset)), 1000);
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing) return;
            isRefreshing = true;
            router.reload({
                only: ['localData', 'chartData', 'recentLogs'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 30000);
        return () => { clearInterval(timer); clearInterval(dataPoller); };
    }, [timeOffset]);

    const getCeramicPin = (aqi) => {
        let color = isOffline ? 'bg-stone-400' : (aqi > 100 ? 'bg-rose-600' : (aqi > 50 ? 'bg-amber-500' : 'bg-emerald-600'));
        let pulse = isOffline ? 'bg-transparent' : (aqi > 100 ? 'bg-rose-400' : (aqi > 50 ? 'bg-amber-400' : 'bg-emerald-400'));

        return L.divIcon({
            className: 'clear-marker',
            html: `
                <div class="relative flex items-center justify-center w-8 h-8">
                    ${!isOffline ? `<div class="absolute inset-0 rounded-full opacity-40 animate-ping ${pulse}"></div>` : ''}
                    <div class="w-4 h-4 rounded-full ${color} ring-[3px] ring-white shadow-sm z-10"></div>
                </div>
            `,
            iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
        });
    };

    return (
        <BarangayLayout brgyName={brgyName}>
            <Head title="Local Dashboard | AirSafe" />

            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-5 px-1">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`flex h-2 w-2 rounded-full ${isOffline ? 'bg-stone-400' : 'bg-emerald-500 animate-pulse ring-2 ring-emerald-500/20'}`}></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                            {isOffline ? 'Gateway Offline' : 'Local Node Connected (1s Sync)'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-none uppercase">{brgyName} Monitoring</h1>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-5 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border md:border-none border-stone-200 shadow-sm md:shadow-none w-full md:w-auto">
                    <div className="text-left md:text-right">
                        <div className="text-base md:text-xl font-bold text-stone-800 tabular-nums leading-none mb-1">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</span>
                    </div>
                    <div className="h-8 md:h-10 w-px bg-stone-200 shrink-0"></div>
                    <div className="text-right">
                        <div className="text-base md:text-xl font-bold text-stone-800 tabular-nums leading-none mb-1">
                            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                        </div>
                        <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">System Time</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-8">
                <EditorialMetric title="Air Pollution" value={deviceData.aqi} unit="AQI" icon={Wind} color={isOffline ? "stone" : (deviceData.aqi > 100 ? "rose" : "emerald")} isAlert={deviceData.aqi > 100} trend={isOffline ? "Last Known" : (deviceData.aqi > 100 ? "Hazard" : "Safe")} />
                <EditorialMetric title="Heat Index" value={`${deviceData.heat_index}°`} unit="C" icon={ThermometerSun} color={isOffline ? "stone" : (deviceData.heat_index > 38 ? "amber" : "emerald")} isAlert={deviceData.heat_index > 38} trend={isOffline ? "Last Known" : (deviceData.heat_index > 38 ? "Warning" : "Safe")} />
                <EditorialMetric title="Gateway Link" value={isOffline ? 'Offline' : 'Online'} unit="SYS" icon={isOffline ? WifiOff : SignalHigh} color="stone" trend={isOffline ? "Connection Lost" : `${deviceData.signal}% Signal`} />
                <EditorialMetric title="Threat Level" value={isDanger ? "1" : "0"} unit="Active" icon={AlertTriangle} color={isDanger ? "rose" : "stone"} isAlert={isDanger} trend={isDanger ? "Check Logs" : "All Clear"} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-8">
                <div className="xl:col-span-2 space-y-5 md:space-y-8">
                    <div className="bg-white p-2 rounded-3xl md:rounded-[2rem] shadow-sm border border-stone-200/60 flex flex-col relative h-[350px] md:h-[500px] overflow-hidden">
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow-sm border border-stone-100 flex items-center gap-2">
                            <MapIcon size={14} className="text-stone-600 shrink-0" />
                            <h2 className="font-bold text-[10px] md:text-sm text-stone-800 uppercase tracking-widest">Local Area Map</h2>
                        </div>
                        <div className="rounded-2xl md:rounded-[1.5rem] overflow-hidden w-full h-full relative z-0">
                            <MapContainer center={mapCenter} zoom={15} zoomControl={false} attributionControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#F7F7F5' }}>
                                <ChangeView center={mapCenter} zoom={15} />
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                {localData && (
                                    <Marker position={mapCenter} icon={getCeramicPin(deviceData.aqi)}>
                                        <Popup className="rounded-2xl shadow-xl border-0 overflow-hidden p-0 m-0">
                                            <div className="font-sans min-w-[200px] md:min-w-[240px] bg-white">
                                                <div className="bg-stone-50 border-b border-stone-100 px-4 py-3 flex justify-between items-center">
                                                    <strong className="block text-xs md:text-sm text-stone-800 font-bold uppercase">{deviceData.name}</strong>
                                                    {isOffline && <span className="text-[8px] font-bold text-stone-400 uppercase">Offline</span>}
                                                </div>
                                                <div className="p-4 md:p-5 space-y-4 md:space-y-5">
                                                    <div>
                                                        <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2">
                                                            <span>Air Pollution (AQI)</span>
                                                            <span className={isOffline ? 'text-stone-500' : (deviceData.aqi > 100 ? 'text-rose-600' : 'text-emerald-600')}>{deviceData.aqi}</span>
                                                        </div>
                                                        <div className="w-full bg-stone-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${isOffline ? 'bg-stone-400' : (deviceData.aqi > 100 ? 'bg-rose-500' : 'bg-emerald-500')}`} style={{ width: `${Math.min(deviceData.aqi, 100)}%` }}></div></div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2">
                                                            <span>Heat Index</span>
                                                            <span className={isOffline ? 'text-stone-500' : 'text-amber-500'}>{deviceData.heat_index}°C</span>
                                                        </div>
                                                        <div className="w-full bg-stone-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${isOffline ? 'bg-stone-400' : 'bg-amber-400'}`} style={{ width: `${(deviceData.heat_index / 50) * 100}%` }}></div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2rem] shadow-sm border border-stone-200/60">
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                            <div>
                                <h2 className="font-bold text-stone-800 text-base md:text-lg tracking-tight uppercase">Environmental Trend (24h)</h2>
                                <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-stone-400 mt-1">Recorded pollution and heat in {brgyName}</p>
                            </div>
                        </div>
                        <div className="h-[260px] md:h-[300px] w-full -ml-4 md:ml-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/><stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorHeat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} width={40} />

                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e7e5e4' }}
                                        itemStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                                        labelStyle={{ color: '#78716c', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
                                        formatter={(value, name) => {
                                            if (name.includes('Heat Index')) {
                                                return [`${Number(value).toFixed(1)}°C`, name];
                                            }
                                            return [`${Math.round(value)} AQI`, name];
                                        }}
                                    />

                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />

                                    <ReferenceLine y={100} stroke="#e11d48" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'AQI DANGER', fill: '#e11d48', fontSize: 9, fontWeight: 800 }} />
                                    <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'HEAT DANGER', fill: '#f59e0b', fontSize: 9, fontWeight: 800 }} />

                                    <Area type="monotone" dataKey="aqi" name="Air Quality (AQI)" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" activeDot={{ r: 5, strokeWidth: 0, fill: '#e11d48' }} isAnimationActive={false} connectNulls={true} />
                                    <Area type="monotone" dataKey="heat_index" name="Heat Index (°C)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorHeat)" activeDot={{ r: 5, strokeWidth: 0, fill: '#f59e0b' }} isAnimationActive={false} connectNulls={true} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 md:space-y-8 flex flex-col">
                    <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-sm border border-stone-200/60 p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-5 md:mb-6 pb-4 border-b border-stone-100">
                            <div className="p-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-600"><Cpu size={16} /></div>
                            <h2 className="font-bold text-stone-800 tracking-tight uppercase text-[11px] md:text-sm">Hardware Health</h2>
                        </div>
                        <SpecSheetCard name={deviceData.name} data={deviceData} />
                    </div>

                    <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-sm border border-stone-200/60 p-5 md:p-6 flex-1 flex flex-col min-h-[300px]">
                        <div className="flex items-center justify-between mb-5 md:mb-6 pb-4 border-b border-stone-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-stone-50 border border-stone-100 rounded-xl text-stone-600"><HardDrive size={16} /></div>
                                <h2 className="font-bold text-stone-800 tracking-tight uppercase text-[11px] md:text-sm">Local Activity</h2>
                            </div>
                        </div>

                        <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                            {recentLogs && recentLogs.length > 0 ? (
                                recentLogs.map(log => (
                                    <LogEntry key={log.id} time={log.time} location={log.sensor} message={log.message} isAlert={log.isAlert} />
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-40 py-8">
                                    <HardDrive size={24} className="mb-2" />
                                    <p className="text-[10px] text-stone-900 font-bold uppercase tracking-widest text-center">No recent activity.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}

function EditorialMetric({ title, value, unit, icon: Icon, color, isAlert, trend }) {
    const colorMap = { stone: 'text-stone-600', emerald: 'text-emerald-600', rose: 'text-rose-600', amber: 'text-amber-500' };
    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-stone-200/50 hover:border-stone-400 transition-all group">
            <div className="flex justify-between items-start mb-4 md:mb-6">
                <Icon size={20} strokeWidth={2.5} className={`${colorMap[color]} group-hover:scale-110 transition-transform`} />
                <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 md:py-1 rounded-md ${isAlert ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-stone-50 text-stone-400 border-stone-100'}`}>{trend}</span>
            </div>
            <div>
                <div className="flex items-baseline gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                    <h3 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter leading-none">{value}</h3>
                    <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isAlert ? 'text-rose-500' : 'text-stone-400'}`}>{unit}</span>
                </div>
                <p className="text-[10px] md:text-[11px] font-bold text-stone-500 uppercase tracking-wide leading-tight">{title}</p>
            </div>
        </div>
    );
}

function SpecSheetCard({ name, data }) {
    const isDanger = data.aqi > 100;
    const isOffline = data.status === 'offline';
    return (
        <div className={`p-4 rounded-2xl border transition-all cursor-pointer ${isOffline ? 'bg-stone-50 border-stone-200 opacity-70' : 'bg-[#F7F7F5] border-stone-200/80 hover:bg-white hover:shadow-sm'}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-[11px] md:text-sm text-stone-900 uppercase tracking-tight">{name || 'No Hardware'}</h4>
                <div className={`px-2 py-1 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest ${isOffline ? 'bg-stone-200 text-stone-600' : (isDanger ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}`}>
                    {isOffline ? 'Offline' : (isDanger ? 'Warning' : 'Normal')}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-stone-200 rounded-xl overflow-hidden mb-3 border border-stone-200">
                <div className="bg-white p-3">
                    <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Air Quality</span>
                    <strong className={`text-lg md:text-xl leading-none font-black ${isOffline ? 'text-stone-400' : (isDanger ? 'text-rose-600' : 'text-stone-800')}`}>{data.aqi}</strong>
                </div>
                <div className="bg-white p-3">
                    <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Heat Index</span>
                    <strong className={`text-lg md:text-xl leading-none font-black ${isOffline ? 'text-stone-400' : 'text-amber-600'}`}>{data.heat_index}°C</strong>
                </div>
            </div>
            <div className="flex gap-2 md:gap-4 px-1 pt-2">
                <div className="flex-1 flex items-center gap-1.5 md:gap-2">
                    <Plug size={12} className={`shrink-0 ${isOffline ? 'text-stone-400' : 'text-emerald-600'}`} />
                    <span className="text-[9px] md:text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-0.5 truncate">{isOffline ? 'No Power' : 'Main Grid'}</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5 md:gap-2">
                    <SignalHigh size={12} className={`shrink-0 ${isOffline ? 'text-stone-400' : 'text-blue-600'}`} />
                    <div className="flex-1 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${isOffline ? 0 : (data.signal || 92)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogEntry({ time, location, message, isAlert }) {
    return (
        <div className="flex gap-3 md:gap-4 group">
            <div className={`mt-1.5 flex-shrink-0 w-2 h-2 rounded-full ${isAlert ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] animate-pulse' : 'bg-emerald-500'}`}></div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <strong className="text-[11px] md:text-sm text-stone-900 tracking-tight uppercase">{location}</strong>
                    <span className="text-[8px] md:text-[9px] font-bold text-stone-400 uppercase tracking-widest">{time}</span>
                </div>
                <p className="text-[10px] md:text-xs text-stone-500 leading-relaxed font-medium">{message}</p>
            </div>
        </div>
    );
}