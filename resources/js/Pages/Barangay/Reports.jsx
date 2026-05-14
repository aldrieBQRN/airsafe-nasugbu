import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    FileText, Download, Calendar,
    AlertTriangle, Wind, ThermometerSun, TrendingUp, Activity, ChevronDown
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

export default function BarangayReports({ brgyName, historicalAqi, historicalHeat, deviceNames, kpis, filters }) {
    const [dateRange, setDateRange] = useState(filters?.range || '7');
    const chartColors = ['#e11d48', '#059669', '#f59e0b', '#3b82f6'];

    const handleFilterChange = (value) => {
        setDateRange(value);
        router.get(route('barangay.reports'), { range: value }, { preserveState: true, replace: true });
    };

    return (
        <BarangayLayout brgyName={brgyName || "Local Area"}>
            <Head title={`Trend Analysis | ${brgyName || 'AirSafe'}`} />

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Analytics & Reports</h1>
                    <p className="text-sm sm:text-base text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <FileText size={16} className="text-stone-400 shrink-0" /> Export historical data and analyze local environmental trends
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Date Filter */}
                    <div className="relative w-full sm:w-auto">
                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                        <select
                            className="w-full sm:w-auto h-12 bg-white border border-stone-200 rounded-full shadow-sm hover:border-stone-300 focus:ring-0 transition-colors text-sm font-bold text-stone-700 cursor-pointer pl-11 pr-10 appearance-none"
                            value={dateRange}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Weekly KPI Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <SummaryCard title="Peak Air Pollution" value={Math.round(kpis?.peakAqi || 0)} unit="AQI" desc={`Recorded in last ${dateRange} days`} icon={Wind} color="rose" />
                <SummaryCard title="Peak Heat Index" value={`${Number(kpis?.peakHeat || 0).toFixed(1)}°C`} unit="Max" desc={`Recorded in last ${dateRange} days`} icon={ThermometerSun} color="amber" />
                {/* FIXED: Changed unit to Alerts */}
                <SummaryCard title="Total Local Alerts" value={kpis?.alertsSent || 0} unit="Alerts" desc="Danger threshold breaches" icon={AlertTriangle} color="stone" />
                <SummaryCard title="Node Reliability" value="99.9%" unit="Uptime" desc="Active Connection" icon={Activity} color="emerald" />
            </div>

            {/* Dual Charts Grid */}
            <div className="grid grid-cols-1 gap-6 md:gap-8 pb-8">

                {/* Air Quality Bar Chart */}
                <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-200/60 p-5 sm:p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="font-bold text-stone-800 tracking-tight text-lg leading-tight">Local AQI Trends</h2>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">MQ135 & MQ136 Sensors</p>
                        </div>
                    </div>
                    <div className="h-[300px] md:h-[380px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historicalAqi} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} />

                                {/* FIXED: Added formatter to clean up hover values */}
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '16px', fontWeight: 'bold' }}
                                    formatter={(value, name) => [`${Math.round(value)} AQI`, name]}
                                />

                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} iconType="circle" />
                                <ReferenceLine y={100} stroke="#e11d48" strokeDasharray="3 3" ifOverflow="extendDomain" label={{ position: 'insideTopLeft', value: 'Danger Limit', fill: '#e11d48', fontSize: 10, fontWeight: 800 }} />

                                {/* FIXED: Updated maxBarSize to 60 for thicker bars */}
                                {deviceNames?.map((name, index) => (
                                    <Bar key={name} dataKey={name} name={name} fill={chartColors[index % chartColors.length]} radius={[6, 6, 0, 0]} maxBarSize={60} isAnimationActive={false} />
                                ))}
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
                    </div>
                    <div className="h-[300px] md:h-[380px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalHeat} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} domain={[25, 45]} tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 'bold' }} />

                                {/* FIXED: Added formatter to lock Heat Index decimals to exactly 1 */}
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '16px', fontWeight: 'bold' }}
                                    formatter={(value, name) => [`${Number(value).toFixed(1)}°C`, name]}
                                />

                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} iconType="circle" />
                                <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Heat Advisory', fill: '#f59e0b', fontSize: 10, fontWeight: 800 }} />

                                {deviceNames?.map((name, index) => (
                                    <Line key={name} type="monotone" dataKey={name} name={name} stroke={chartColors[index % chartColors.length]} strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 7 }} isAnimationActive={false} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </BarangayLayout>
    );
}

function SummaryCard({ title, value, unit, desc, icon: Icon, color }) {
    const colorMap = { emerald: 'text-emerald-600 bg-emerald-50', rose: 'text-rose-600 bg-rose-50', amber: 'text-amber-600 bg-amber-50', stone: 'text-stone-700 bg-stone-100' };
    return (
        <div className="bg-white p-5 sm:p-6 rounded-[1.25rem] sm:rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-stone-200/50 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorMap[color]}`}><Icon size={20} strokeWidth={2.5} /></div>
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