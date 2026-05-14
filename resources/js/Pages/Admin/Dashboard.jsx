import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Activity, ThermometerSun, AlertTriangle, SignalHigh, Map as MapIcon,
    Cpu, HardDrive, Wind
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Smooth animation that prevents the map from "shaking" on click
function MapAutoCenter({ center }) {
    const map = useMap();
    const lastProcessedCenter = useRef(null);

    useEffect(() => {
        if (center && JSON.stringify(center) !== JSON.stringify(lastProcessedCenter.current)) {
            const isMobile = window.innerWidth < 768;
            const latOffset = isMobile ? 0.003 : 0.0015;

            const targetLat = parseFloat(center[0]) + latOffset;
            const targetLng = parseFloat(center[1]);

            lastProcessedCenter.current = center;
            map.flyTo([targetLat, targetLng], 15, {
                animate: true,
                duration: 1.2,
                easeLinearity: 0.25
            });
        }
    }, [center, map]);
    return null;
}

export default function Dashboard({ nodesData, chartData, recentLogs, kpis }) {
    const { serverTime } = usePage().props;

    // PERSISTENCE: Prevents "Gone then Show" flickering by keeping the last valid data in memory
    const lastNodes = useRef(nodesData || []);
    if (nodesData && nodesData.length > 0) { lastNodes.current = nodesData; }
    const devices = lastNodes.current;

    const lastChart = useRef(chartData || []);
    if (chartData && chartData.length > 0) { lastChart.current = chartData; }
    const stableChartData = lastChart.current;

    const [timeOffset] = useState(() => {
        const clientTime = new Date().getTime();
        const trueServerTime = serverTime ? new Date(serverTime).getTime() : clientTime;
        return trueServerTime - clientTime;
    });

    // TRUE 24-HOUR PEAK LOGIC (Fetched directly from Laravel Database)
    const peakAqi = kpis?.peakAqi || 0;
    const peakHeat = Number(kpis?.peakHeat || 0).toFixed(1);

    // Displays the name of the device that recorded the peak today
    const aqiTrend = kpis?.peakAqiDevice || "No Data";
    const heatTrend = kpis?.peakHeatDevice || "No Data";

    const [currentTime, setCurrentTime] = useState(new Date(new Date().getTime() + timeOffset));
    const [mapFocus, setMapFocus] = useState(null);

    // Auto-focus map on the first device found
    useEffect(() => {
        if (devices.length > 0 && !mapFocus) {
            setMapFocus([parseFloat(devices[0].latitude), parseFloat(devices[0].longitude)]);
        }
    }, [devices]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date(new Date().getTime() + timeOffset)), 1000);

        // 30-Second Sync with overlapping protection
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing) return;
            isRefreshing = true;
            router.reload({
                only: ['nodesData', 'chartData', 'recentLogs', 'kpis'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 30000);

        return () => { clearInterval(timer); clearInterval(dataPoller); };
    }, [timeOffset]);

    const getCeramicPin = (aqi, isOffline) => {
        let color = isOffline ? 'bg-stone-400' : (aqi > 100 ? 'bg-rose-600' : (aqi > 50 ? 'bg-amber-500' : 'bg-emerald-600'));
        return L.divIcon({
            className: 'clear-marker',
            html: `<div class="w-4 h-4 rounded-full ${color} ring-[3px] ring-white shadow-sm transition-transform hover:scale-110"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    return (
        <AdminLayout>
            <Head title="TRIVORA Dashboard" />

            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-5">
                <div>
                    <div className="flex items-center gap-2.5 mb-2">
                        <span className={`h-2 w-2 rounded-full ${devices.some(d => d.status === 'online') ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500">Live Municipality Telemetry</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter leading-none">Nasugbu Monitoring</h1>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border md:border-none border-stone-200 w-full md:w-auto">
                    <div className="text-left md:text-right">
                        {/* FIXED: Formatted Date to e.g., "Tue, May 5, 2026" */}
                        <div className="text-base md:text-xl font-bold text-stone-800 tabular-nums leading-none mb-1">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">System Date</span>
                    </div>
                    <div className="h-8 w-px bg-stone-200"></div>
                    <div className="text-right">
                        <div className="text-base md:text-xl font-bold text-stone-800 tabular-nums leading-none mb-1">
                            {currentTime.toLocaleTimeString('en-US', { hour12: true })}
                        </div>
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Real-Time</span>
                    </div>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <EditorialMetric title="Peak Pollution" value={peakAqi} unit="AQI" icon={Wind} color={peakAqi > 100 ? "rose" : "emerald"} trend={aqiTrend} />
                <EditorialMetric title="Highest Heat" value={`${peakHeat}°`} unit="C" icon={ThermometerSun} color={parseFloat(peakHeat) > 38 ? "rose" : "emerald"} isAlert={parseFloat(peakHeat) > 38} trend={heatTrend} />
                <EditorialMetric title="Network Status" value={devices.filter(d => d.status === 'online').length + '/' + devices.length} unit="Online" icon={SignalHigh} color="stone" trend="Nodes Active" />
                <EditorialMetric title="Active Alerts" value={devices.filter(d => d.status === 'online' && (d.sensors.aqi > 100 || d.sensors.heat_index > 38)).length} unit="Areas" icon={AlertTriangle} color="amber" trend="Status Check" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-stone-200/60 h-[500px] relative overflow-hidden">
                        <div className="rounded-[2rem] overflow-hidden h-full">
                            <MapContainer center={[14.0748, 120.6793]} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <MapAutoCenter center={mapFocus} />
                                {devices.map(node => (
                                    <Marker
                                        key={node.id}
                                        position={[parseFloat(node.latitude), parseFloat(node.longitude)]}
                                        icon={getCeramicPin(node.sensors?.aqi || 0, node.status === 'offline')}
                                        eventHandlers={{ click: () => setMapFocus([parseFloat(node.latitude), parseFloat(node.longitude)]) }}
                                    >
                                        <Popup autoPan={false} className="rounded-xl overflow-hidden">
                                            <div className="p-4 min-w-[200px]">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-black text-stone-900 text-xs">{node.name}</h3>
                                                    {node.status === 'offline' && <span className="text-[8px] font-bold text-stone-400 uppercase">Offline</span>}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] font-bold uppercase">
                                                        <span className="text-stone-400 tracking-widest">Air Quality</span>
                                                        <span className={node.status === 'offline' ? 'text-stone-400' : 'text-emerald-600'}>{Math.round(node.sensors?.aqi || 0)} AQI</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-bold uppercase">
                                                        <span className="text-stone-400 tracking-widest">Heat Index</span>
                                                        <span className={node.status === 'offline' ? 'text-stone-400' : 'text-amber-500'}>{Number(node.sensors?.heat_index || 0).toFixed(1)}°C</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[2.5rem] border border-stone-200/60 p-7 h-[500px] flex flex-col">
                        <h2 className="font-bold text-stone-800 uppercase text-xs tracking-widest mb-6 border-b pb-4">Hardware Inventory</h2>
                        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
                            {devices.map(node => (
                                <SpecSheetCard key={node.id} name={node.name} data={node.sensors} isOffline={node.status === 'offline'} signal={node.signal} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-2">
                    <CeramicAnalyticsChart chartData={stableChartData} devices={devices} height="h-[420px]" />
                </div>

                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[2.5rem] border border-stone-200/60 p-7 h-[420px] flex flex-col">
                        <h2 className="font-bold text-stone-800 uppercase text-xs tracking-widest mb-6 border-b pb-4">Activity Log</h2>
                        <div className="space-y-5 overflow-y-auto flex-1">
                            {recentLogs && recentLogs.length > 0 ? recentLogs.map((log, i) => (
                                <LogEntry key={i} time={log.time} location={log.sensor} message={log.message} isAlert={log.isAlert} />
                            )) : (
                                <>
                                    <LogEntry time="Live" location="System" message="Real-time telemetry link operational. No hazards detected." />
                                    {devices.filter(d => d.status === 'offline').map(d => (
                                        <LogEntry key={d.id} time="Warning" location={d.name} message="Gateway connection lost." isAlert />
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function CeramicAnalyticsChart({ chartData, devices, height }) {
    const formattedData = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map(entry => {
            const transformed = { ...entry };
            devices.forEach(device => {
                transformed[`${device.name} - AQI`] = entry.aqi || 0;
                transformed[`${device.name} - Heat Index`] = entry.heat_index || 0;
            });
            return transformed;
        });
    }, [chartData, devices]);

    const aqiColors = ['#e11d48', '#3b82f6'];
    const heatColors = ['#f59e0b', '#10b981'];

    return (
        <div className={`bg-white p-8 rounded-[2.5rem] border border-stone-200/60 ${height} flex flex-col`}>
            <div className="mb-6">
                <h2 className="font-black text-stone-900 text-lg uppercase tracking-widest leading-none">Active Telemetry</h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase italic mt-1">24-Hour Database Stream</p>
            </div>
            <div className="flex-1 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                        <XAxis dataKey="time" tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={35} />

                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '10px' }}
                            formatter={(value, name) => {
                                if (name.includes('Heat Index')) {
                                    return [`${Number(value).toFixed(1)}°C`, name];
                                }
                                return [`${Math.round(value)} AQI`, name];
                            }}
                        />

                        <ReferenceLine y={100} stroke="#e11d48" strokeDasharray="3 3" label={{ position: 'top', value: 'AQI LIMIT', fill: '#e11d48', fontSize: 8 }} />
                        <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'bottom', value: 'HEAT LIMIT', fill: '#f59e0b', fontSize: 8 }} />
                        {devices.map((device, idx) => [
                            <Area key={`${device.id}-aqi`} dataKey={`${device.name} - AQI`} stroke={aqiColors[idx % 2]} fill={aqiColors[idx % 2]} fillOpacity={0.05} strokeWidth={2} isAnimationActive={false} connectNulls={true} />,
                            <Area key={`${device.id}-heat`} dataKey={`${device.name} - Heat Index`} stroke={heatColors[idx % 2]} fill={heatColors[idx % 2]} fillOpacity={0.05} strokeWidth={2} isAnimationActive={false} connectNulls={true} />
                        ])}
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', paddingTop: '20px' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function EditorialMetric({ title, value, unit, icon: Icon, color, trend }) {
    const colorMap = { emerald: 'text-emerald-600', rose: 'text-rose-600', stone: 'text-stone-400', amber: 'text-amber-500' };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200/50 shadow-sm transition-all hover:border-stone-300">
            <div className="flex justify-between items-start mb-6">
                <Icon size={20} className={colorMap[color]} />
                <span className="text-[9px] font-black tracking-widest text-stone-400 uppercase bg-stone-50 px-2 py-1 rounded border border-stone-100">{trend}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-4xl font-black text-stone-900 tracking-tighter leading-none">{value}</h3>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{unit}</span>
            </div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">{title}</p>
        </div>
    );
}

function SpecSheetCard({ name, data, isOffline, signal }) {
    return (
        <div className={`p-4 rounded-2xl border transition-all ${isOffline ? 'bg-stone-50 grayscale' : 'bg-stone-50/50 hover:bg-white hover:shadow-sm'}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-[10px] uppercase text-stone-900 truncate pr-4">{name}</h4>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${isOffline ? 'bg-stone-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{isOffline ? 'OFF' : 'ON'}</div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-stone-200 rounded-xl overflow-hidden border border-stone-200 mb-3">
                <div className="bg-white p-2 text-center">
                    <span className="text-[7px] font-bold text-stone-400 uppercase block">AQI</span>
                    <strong className={`text-lg font-black ${isOffline ? 'text-stone-400' : 'text-stone-800'}`}>{Math.round(data?.aqi || 0)}</strong>
                </div>
                <div className="bg-white p-2 text-center">
                    <span className="text-[7px] font-bold text-stone-400 uppercase block">HEAT</span>
                    <strong className={`text-lg font-black ${isOffline ? 'text-stone-400' : 'text-amber-500'}`}>{Number(data?.heat_index || 0).toFixed(1)}</strong>
                </div>
            </div>
            <div className="flex items-center gap-3 px-1">
                <div className="flex-1 bg-stone-200 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${isOffline ? 0 : (signal || 90)}%` }}></div>
                </div>
                <span className="text-[8px] font-black text-stone-400">{isOffline ? '0%' : (signal || 90) + '%'}</span>
            </div>
        </div>
    );
}

function LogEntry({ time, location, message, isAlert }) {
    return (
        <div className="flex gap-4 items-start">
            <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isAlert ? 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)]' : 'bg-stone-300'}`}></div>
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <strong className="text-[11px] font-black text-stone-900 tracking-tight uppercase leading-none">{location}</strong>
                    <span className="text-[8px] font-bold text-stone-400 uppercase">{time}</span>
                </div>
                <p className="text-[10px] text-stone-500 leading-relaxed font-medium">{message}</p>
            </div>
        </div>
    );
}