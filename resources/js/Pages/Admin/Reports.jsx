import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    FileText, Download, Calendar, Filter, FileSpreadsheet,
    AlertTriangle, Wind, ThermometerSun, CheckCircle2, TrendingUp, Activity, MapPin
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

export default function Reports() {
    const [dateRange, setDateRange] = useState('Last 7 Days');
    const [selectedArea, setSelectedArea] = useState('All Areas');

    // Simulated 7-Day Air Quality Data (MQ135 & MQ136)
    const aqiData = [
        { day: 'Mon', tumalim: 45, brgy7: 52 },
        { day: 'Tue', tumalim: 48, brgy7: 65 },
        { day: 'Wed', tumalim: 50, brgy7: 85 },
        { day: 'Thu', tumalim: 65, brgy7: 115 }, // Smog/Vog Spike
        { day: 'Fri', tumalim: 55, brgy7: 90 },
        { day: 'Sat', tumalim: 45, brgy7: 75 },
        { day: 'Sun', tumalim: 42, brgy7: 60 },
    ];

    // Simulated 7-Day Heat Index Data (DHT22)
    const heatData = [
        { day: 'Mon', tumalim: 32, brgy7: 33 },
        { day: 'Tue', tumalim: 33, brgy7: 34 },
        { day: 'Wed', tumalim: 35, brgy7: 36 },
        { day: 'Thu', tumalim: 36, brgy7: 39 }, // Heatwave
        { day: 'Fri', tumalim: 35, brgy7: 38 },
        { day: 'Sat', tumalim: 34, brgy7: 35 },
        { day: 'Sun', tumalim: 32, brgy7: 33 },
    ];

    // Simulated Database Logs
    const recentLogs = [
        { id: 'LOG-802', date: 'Oct 24, 14:30', location: 'Brgy 7 Poblacion', sensor: 'MQ136 Gas', reading: '115 AQI', status: 'Danger' },
        { id: 'LOG-801', date: 'Oct 24, 13:15', location: 'Brgy 7 Poblacion', sensor: 'DHT22 Heat', reading: '39°C', status: 'Warning' },
        { id: 'LOG-800', date: 'Oct 24, 12:00', location: 'Tumalim Node', sensor: 'System', reading: 'Normal Sync', status: 'Safe' },
        { id: 'LOG-799', date: 'Oct 23, 09:45', location: 'Tumalim Node', sensor: 'MQ135 AQI', reading: '50 AQI', status: 'Safe' },
        { id: 'LOG-798', date: 'Oct 23, 08:30', location: 'Brgy 7 Poblacion', sensor: 'System', reading: 'Normal Sync', status: 'Safe' },
    ];

    return (
        <AdminLayout>
            <Head title="Analytics & Reports" />

            {/* Page Header with Controls */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-stone-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <FileText size={16} className="text-stone-400" /> Export historical data and analyze municipality trends
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Location Filter */}
                    <div className="px-4 py-2.5 bg-white rounded-full border border-stone-200 shadow-sm flex items-center gap-2 cursor-pointer hover:border-stone-300 transition-colors">
                        <MapPin size={16} className="text-stone-400" />
                        <select className="bg-transparent border-none text-sm font-bold text-stone-700 outline-none cursor-pointer">
                            <option>All Areas</option>
                            <option>Brgy 7 Poblacion</option>
                            <option>Brgy Tumalim</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="px-4 py-2.5 bg-white rounded-full border border-stone-200 shadow-sm flex items-center gap-2 cursor-pointer hover:border-stone-300 transition-colors">
                        <Calendar size={16} className="text-stone-400" />
                        <select className="bg-transparent border-none text-sm font-bold text-stone-700 outline-none cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>

                    {/* Main Export Action */}
                    <button className="px-6 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-colors flex items-center gap-2">
                        <Download size={16} /> Export Full PDF
                    </button>
                </div>
            </div>

            {/* Weekly KPI Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <SummaryCard title="Peak Air Pollution" value="115" unit="AQI" desc="Recorded on Thursday, Brgy 7" icon={Wind} color="rose" />
                <SummaryCard title="Peak Heat Index" value="39°C" unit="Max" desc="Recorded on Thursday, Brgy 7" icon={ThermometerSun} color="amber" />
                <SummaryCard title="Total Alerts Sent" value="12" unit="SMS" desc="Across all monitoring nodes" icon={AlertTriangle} color="stone" />
                <SummaryCard title="System Reliability" value="99.9%" unit="Uptime" desc="ESP32 Grid Power Active" icon={Activity} color="emerald" />
            </div>

            {/* Dual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                {/* Air Quality Bar Chart */}
                <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="font-bold text-stone-800 tracking-tight text-lg">Air Quality Index (AQI) Trends</h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">MQ135 & MQ136 Sensors</p>
                        </div>
                        <button className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 transition-colors">
                            <Download size={16} />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aqiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={6}>
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

                                <Bar dataKey="tumalim" name="Tumalim" fill="#059669" radius={[4, 4, 0, 0]} barSize={14} />
                                <Bar dataKey="brgy7" name="Brgy 7 Poblacion" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heat Index Line Chart */}
                <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="font-bold text-stone-800 tracking-tight text-lg">Heat Index & Temperature</h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">DHT22 Sensors</p>
                        </div>
                        <button className="p-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 transition-colors">
                            <Download size={16} />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
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

                                <Line type="monotone" dataKey="tumalim" name="Tumalim" stroke="#059669" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="brgy7" name="Brgy 7 Poblacion" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Comprehensive Data Table */}
            <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
                    <div>
                        <h2 className="font-bold text-stone-800 tracking-tight">Raw Database Logs</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Detailed event history for exports</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-stone-200 hover:border-stone-300 rounded-xl text-xs font-bold text-stone-600 transition-colors flex items-center gap-2 shadow-sm">
                            <FileSpreadsheet size={14} /> CSV
                        </button>
                        <div className="relative">
                            <input type="text" placeholder="Search logs..." className="text-sm bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-100 font-medium text-stone-700 w-full sm:w-64 shadow-sm transition-all" />
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-stone-50 border-b border-stone-200">
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Log ID</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Timestamp</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Location</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Hardware Source</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Sensor Reading</th>
                                <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Threat Level</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {recentLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-stone-50/80 transition-colors">
                                    <td className="py-4 px-6 text-xs font-black text-stone-400">{log.id}</td>
                                    <td className="py-4 px-6 text-sm font-bold text-stone-700">{log.date}</td>
                                    <td className="py-4 px-6 text-sm font-black text-stone-900">{log.location}</td>
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
                <div className="p-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <span className="text-xs font-bold text-stone-400">Showing 1 to 5 of 2,401 recorded logs</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-400 hover:bg-stone-50 transition-colors">Prev</button>
                        <button className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold shadow-sm">1</button>
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors">2</button>
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors">3</button>
                        <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
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
        <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-stone-200/50 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <TrendingUp size={16} className="text-stone-300" />
            </div>
            <div>
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