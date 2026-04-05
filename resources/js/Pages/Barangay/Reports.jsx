import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    FileText, Download, Calendar, Filter, FileSpreadsheet,
    AlertTriangle, Wind, ThermometerSun, CheckCircle2, TrendingUp, Activity
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

export default function BarangayReports() {
    const [dateRange, setDateRange] = useState('Last 7 Days');

    // Simulated 7-Day Air Quality Data (MQ135 & MQ136) - Brgy 7 Only
    const aqiData = [
        { day: 'Mon', aqi: 52 },
        { day: 'Tue', aqi: 65 },
        { day: 'Wed', aqi: 85 },
        { day: 'Thu', aqi: 115 }, // Smog/Vog Spike
        { day: 'Fri', aqi: 90 },
        { day: 'Sat', aqi: 75 },
        { day: 'Sun', aqi: 60 },
    ];

    // Simulated 7-Day Heat Index Data (DHT22) - Brgy 7 Only
    const heatData = [
        { day: 'Mon', heat: 33 },
        { day: 'Tue', heat: 34 },
        { day: 'Wed', heat: 36 },
        { day: 'Thu', heat: 39 }, // Heatwave
        { day: 'Fri', heat: 38 },
        { day: 'Sat', heat: 35 },
        { day: 'Sun', heat: 33 },
    ];

    // Simulated Database Logs - Filtered for Brgy 7 local hardware
    const recentLogs = [
        { id: 'LOG-802', date: 'Oct 24, 14:30', location: 'Local Node', sensor: 'MQ136 Gas', reading: '115 AQI', status: 'Danger' },
        { id: 'LOG-801', date: 'Oct 24, 13:15', location: 'Local Node', sensor: 'DHT22 Heat', reading: '39°C', status: 'Warning' },
        { id: 'LOG-798', date: 'Oct 23, 08:30', location: 'System', sensor: 'Gateway', reading: 'Normal Sync', status: 'Safe' },
        { id: 'LOG-795', date: 'Oct 22, 16:45', location: 'Local Node', sensor: 'MQ135 AQI', reading: '65 AQI', status: 'Safe' },
        { id: 'LOG-791', date: 'Oct 21, 11:20', location: 'Local Node', sensor: 'DHT22 Heat', reading: '34°C', status: 'Safe' },
    ];

    return (
        <BarangayLayout brgyName="Brgy. 7 (Poblacion)">
            <Head title="Trend Analysis & Reports | AirSafe" />

            {/* Page Header with Controls */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Trend Analysis</h1>
                    <p className="text-sm sm:text-base text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <FileText size={16} className="text-stone-400 shrink-0" /> Export historical data and analyze local environmental trends
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Date Filter */}
                    <div className="w-full sm:w-auto px-4 py-2.5 bg-white rounded-full border border-stone-200 shadow-sm flex items-center gap-2 cursor-pointer hover:border-stone-300 transition-colors">
                        <Calendar size={16} className="text-stone-400 shrink-0" />
                        <select
                            className="bg-transparent border-none text-sm font-bold text-stone-700 outline-none cursor-pointer w-full focus:ring-0"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>

                    {/* Main Export Action */}
                    <button className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 active:scale-95">
                        <Download size={16} /> Export Full PDF
                    </button>
                </div>
            </div>

            {/* Weekly KPI Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <SummaryCard title="Peak Air Pollution" value="115" unit="AQI" desc="Recorded on Thursday" icon={Wind} color="rose" />
                <SummaryCard title="Peak Heat Index" value="39°C" unit="Max" desc="Recorded on Thursday" icon={ThermometerSun} color="amber" />
                <SummaryCard title="Total Local Alerts" value="2" unit="SMS" desc="Sent to Brgy Officials" icon={AlertTriangle} color="stone" />
                <SummaryCard title="Node Reliability" value="99.9%" unit="Uptime" desc="ESP32 Gateway Active" icon={Activity} color="emerald" />
            </div>

            {/* Dual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Air Quality Bar Chart */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-5 sm:p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="font-bold text-stone-800 tracking-tight text-lg leading-tight">Local AQI Trends</h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">MQ135 & MQ136 Sensors</p>
                        </div>
                        <button className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 transition-colors shrink-0">
                            <Download size={16} />
                        </button>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aqiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} />
                                <RechartsTooltip
                                    cursor={{fill: '#f5f5f4'}}
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e7e5e4', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold', color: '#1c1917' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#78716c' }} iconType="circle" />
                                <ReferenceLine y={100} stroke="#e11d48" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Danger Limit', fill: '#e11d48', fontSize: 10, fontWeight: 800 }} />

                                <Bar dataKey="aqi" name="Brgy 7 AQI" fill="#e11d48" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heat Index Line Chart */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-5 sm:p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="font-bold text-stone-800 tracking-tight text-lg leading-tight">Heat Index Trends</h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">DHT22 Sensors</p>
                        </div>
                        <button className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 transition-colors shrink-0">
                            <Download size={16} />
                        </button>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={heatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} domain={[25, 45]} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e7e5e4', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}
                                    itemStyle={{ fontWeight: 'bold', color: '#1c1917' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#78716c' }} iconType="circle" />
                                <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Heat Advisory', fill: '#f59e0b', fontSize: 10, fontWeight: 800 }} />

                                <Line type="monotone" dataKey="heat" name="Brgy 7 Heat (°C)" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 7, fill: '#f59e0b' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Comprehensive Data Table */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-stone-50/50">
                    <div>
                        <h2 className="font-bold text-stone-800 tracking-tight">Raw Hardware Logs</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Detailed event history for local node</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="text-sm bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 font-medium text-stone-700 w-full shadow-sm transition-all"
                            />
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                        <button className="px-4 py-2.5 bg-white border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-bold text-stone-600 transition-colors flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto shrink-0">
                            <FileSpreadsheet size={14} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-200">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">Log ID</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">Timestamp</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">Hardware Source</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">Sensor Reading</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400 whitespace-nowrap">Threat Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {recentLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="py-4 px-6 text-xs font-black text-stone-400">{log.id}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-stone-700 whitespace-nowrap">{log.date}</td>
                                    <td className="py-4 px-6 text-sm font-medium text-stone-500">{log.sensor}</td>
                                    <td className="py-4 px-6 text-sm font-black text-stone-800">{log.reading}</td>
                                    <td className="py-4 px-6">
                                        <StatusPill status={log.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Visual Pagination */}
                <div className="p-4 sm:p-5 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <span className="text-[11px] sm:text-xs font-bold text-stone-400">Showing 1 to 5 of 1,245 recorded logs</span>
                    <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-400 hover:bg-stone-50 transition-colors shrink-0">Prev</button>
                        <button className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold shadow-sm shrink-0">1</button>
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors shrink-0">2</button>
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors shrink-0">3</button>
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors shrink-0">Next</button>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function SummaryCard({ title, value, unit, desc, icon: Icon, color }) {
    const colorMap = {
        emerald: 'text-emerald-600 bg-emerald-50',
        rose: 'text-rose-600 bg-rose-50',
        amber: 'text-amber-600 bg-amber-50',
        stone: 'text-stone-700 bg-stone-100'
    };

    return (
        <div className="bg-white p-5 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-stone-200/50 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <TrendingUp size={16} className="text-stone-300" />
            </div>
            <div className="mt-auto">
                <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-3xl font-black text-stone-900 tracking-tight">{value}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{unit}</span>
                </div>
                <p className="text-sm font-bold text-stone-800 leading-tight">{title}</p>
                <p className="text-[10px] font-semibold text-stone-500 mt-1">{desc}</p>
            </div>
        </div>
    );
}

function StatusPill({ status }) {
    if (status === 'Danger') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 border border-rose-200"><AlertTriangle size={10} strokeWidth={3} /> Danger</span>;
    }
    if (status === 'Warning') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200"><ThermometerSun size={10} strokeWidth={3} /> Warning</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 size={10} strokeWidth={3} /> Safe</span>;
}