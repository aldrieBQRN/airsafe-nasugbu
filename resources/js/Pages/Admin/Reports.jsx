import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    FileText, Download, Calendar, MapPin,
    AlertTriangle, Wind, ThermometerSun, TrendingUp, Activity
} from 'lucide-react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

export default function Reports({ historicalAqi, historicalHeat, deviceNames, kpis, barangays, filters }) {
    const [dateRange, setDateRange] = useState(filters?.range || '7');
    const [selectedArea, setSelectedArea] = useState(filters?.area || 'all');

    const chartColors = ['#e11d48', '#059669', '#f59e0b', '#3b82f6', '#8b5cf6'];

    // UPGRADED: 30-Second Background Database Sync
    useEffect(() => {
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing) return;
            isRefreshing = true;

            router.reload({
                only: ['historicalAqi', 'historicalHeat', 'kpis'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 30000); // Live sync every 30 seconds

        return () => clearInterval(dataPoller);
    }, [dateRange, selectedArea]);

    const handleFilterChange = (type, value) => {
        let newRange = dateRange;
        let newArea = selectedArea;

        if (type === 'range') {
            newRange = value;
            setDateRange(value);
        } else {
            newArea = value;
            setSelectedArea(value);
        }

        router.get(route('admin.reports'), { range: newRange, area: newArea }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <AdminLayout>
            <Head title="Analytics & Reports" />

            {/* Header Section */}
            <div className="mb-6 md:mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 print:hidden">
                <div className="px-1">
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-none uppercase">Analytics & Reports</h1>
                    <p className="text-sm md:text-base text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <FileText size={16} className="text-stone-400 shrink-0" /> Historical trends and system KPIs
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full sm:w-auto">
                        <div className="h-[46px] px-4 bg-white rounded-2xl md:rounded-full border border-stone-200 shadow-sm flex items-center gap-2 hover:border-stone-400 transition-all">
                            <MapPin size={16} className="text-stone-400 shrink-0" />
                            <select
                                className="bg-transparent border-none text-[11px] md:text-sm font-bold text-stone-700 outline-none cursor-pointer w-full h-full"
                                value={selectedArea}
                                onChange={(e) => handleFilterChange('area', e.target.value)}
                            >
                                <option value="all">All Areas</option>
                                {barangays?.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-[46px] px-4 bg-white rounded-2xl md:rounded-full border border-stone-200 shadow-sm flex items-center gap-2 hover:border-stone-400 transition-all">
                            <Calendar size={16} className="text-stone-400 shrink-0" />
                            <select
                                className="bg-transparent border-none text-[11px] md:text-sm font-bold text-stone-700 outline-none cursor-pointer w-full h-full"
                                value={dateRange}
                                onChange={(e) => handleFilterChange('range', e.target.value)}
                            >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-8">
                <SummaryCard title="Peak Air Pollution" value={Math.round(kpis?.peakAqi || 0)} unit="AQI" desc={`Last ${dateRange} days`} icon={Wind} color="rose" />
                <SummaryCard title="Peak Heat Index" value={`${Number(kpis?.peakHeat || 0).toFixed(1)}°`} unit="C" desc={`Last ${dateRange} days`} icon={ThermometerSun} color="amber" />
                {/* FIXED: Removed SMS and changed unit to "Alerts" */}
                <SummaryCard title="Alerts Dispatched" value={kpis?.alertsSent || 0} unit="Alerts" desc="Danger threshold breaches" icon={AlertTriangle} color="stone" />
                <SummaryCard title="System Uptime" value="99.9%" unit="Rel." desc="Sensor Grid Active" icon={Activity} color="emerald" />
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-8 pb-8">

                {/* Air Quality Distribution */}
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200 p-5 md:p-8 hover:border-stone-300 transition-all shadow-sm">
                    <div className="mb-6 md:mb-8">
                        <h2 className="font-black text-stone-900 tracking-tight text-base md:text-lg uppercase">AQI Distribution</h2>
                        <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">MQ135 & MQ136 Historical Data</p>
                    </div>
                    <div className="h-[300px] md:h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={historicalAqi} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} width={45} />
                                <RechartsTooltip
                                    cursor={{fill: '#f5f5f4'}}
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #e7e5e4' }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} iconType="circle" />

                                <ReferenceLine
                                    y={100}
                                    stroke="#e11d48"
                                    strokeDasharray="4 4"
                                    ifOverflow="extendDomain"
                                    label={{ position: 'insideTopLeft', value: 'DANGER THRESHOLD', fill: '#e11d48', fontSize: 9, fontWeight: 900 }}
                                />

                                {/* FIXED: Removed fixed barSize={12} and added maxBarSize={60} so bars are thick and responsive */}
                                {deviceNames?.map((name, index) => (
                                    <Bar
                                        key={name}
                                        dataKey={name}
                                        name={name}
                                        fill={chartColors[index % chartColors.length]}
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={60}
                                        isAnimationActive={false}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Heat Trends */}
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200 p-5 md:p-8 hover:border-stone-300 transition-all shadow-sm">
                    <div className="mb-6 md:mb-8">
                        <h2 className="font-black text-stone-900 tracking-tight text-base md:text-lg uppercase">Heat & Temp Trends</h2>
                        <p className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">DHT22 sensor historical logs</p>
                    </div>
                    <div className="h-[300px] md:h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalHeat} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} domain={[20, 'auto']} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} width={45} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '16px', border: '1px solid #e7e5e4' }}
                                    itemStyle={{ fontWeight: 'bold', fontSize: '11px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} iconType="circle" />

                                <ReferenceLine
                                    y={38}
                                    stroke="#f59e0b"
                                    strokeDasharray="4 4"
                                    ifOverflow="extendDomain"
                                    label={{ position: 'insideTopLeft', value: 'HEAT ADVISORY', fill: '#f59e0b', fontSize: 9, fontWeight: 900 }}
                                />

                                {deviceNames?.map((name, index) => (
                                    <Line key={name} type="monotone" dataKey={name} name={name} stroke={chartColors[index % chartColors.length]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function SummaryCard({ title, value, unit, desc, icon: Icon, color }) {
    const colorMap = {
        emerald: 'text-emerald-600 bg-emerald-50',
        rose: 'text-rose-600 bg-rose-50',
        amber: 'text-amber-600 bg-amber-50',
        stone: 'text-stone-700 bg-stone-100'
    };

    return (
        <div className="bg-white p-5 md:p-6 rounded-3xl md:rounded-[1.5rem] border border-stone-200 flex flex-col hover:border-stone-400 transition-all shadow-sm group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                <TrendingUp size={16} className="text-stone-300" />
            </div>
            <div>
                <div className="flex items-baseline gap-2 mb-0.5 md:mb-1">
                    <h3 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight leading-none">{value}</h3>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400 leading-none">{unit}</span>
                </div>
                <p className="text-[11px] md:text-sm font-bold text-stone-800 leading-tight">{title}</p>
                <p className="text-[9px] md:text-[10px] font-semibold text-stone-500 mt-1">{desc}</p>
            </div>
        </div>
    );
}