import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

// Simulated 24-hour historical data for Nasugbu
const historicalData = [
    { time: '00:00', tumalimAqi: 40, brgy7Aqi: 55, heatIndex: 28 },
    { time: '04:00', tumalimAqi: 42, brgy7Aqi: 60, heatIndex: 27 },
    { time: '08:00', tumalimAqi: 48, brgy7Aqi: 85, heatIndex: 31 },
    { time: '12:00', tumalimAqi: 55, brgy7Aqi: 115, heatIndex: 39 }, // Peak Vog & Heat
    { time: '16:00', tumalimAqi: 50, brgy7Aqi: 95, heatIndex: 37 },
    { time: '20:00', tumalimAqi: 45, brgy7Aqi: 70, heatIndex: 32 },
    { time: '24:00', tumalimAqi: 42, brgy7Aqi: 60, heatIndex: 29 },
];

export default function AnalyticsChart() {
    const [activeTab, setActiveTab] = useState('aqi');

    // Custom tooltips to match our Tailwind styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 min-w-[200px]">
                    <p className="font-bold text-slate-800 border-b pb-2 mb-2">{label} Hours</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center gap-4 py-1">
                            <span className="text-sm font-medium" style={{ color: entry.color }}>
                                {entry.name}:
                            </span>
                            <span className="font-bold text-slate-900">
                                {entry.value} {activeTab === 'heat' ? '°C' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">24-Hour Environmental Trends</h2>
                    <p className="text-sm text-slate-500">Historical data from deployed sensor nodes</p>
                </div>

                {/* Toggle between AQI and Heat Index */}
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('aqi')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'aqi' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        AQI Levels
                    </button>
                    <button
                        onClick={() => setActiveTab('heat')}
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'heat' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Heat Index
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />

                        {/* Render lines conditionally based on the active tab */}
                        {activeTab === 'aqi' ? (
                            <>
                                <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Danger Limit', fill: '#ef4444', fontSize: 12 }} />
                                <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Warning Limit', fill: '#f97316', fontSize: 12 }} />

                                <Line
                                    type="monotone"
                                    dataKey="brgy7Aqi"
                                    name="Brgy 7 (Poblacion)"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="tumalimAqi"
                                    name="Tumalim"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </>
                        ) : (
                            <>
                                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Extreme Danger', fill: '#ef4444', fontSize: 12 }} />
                                <Line
                                    type="monotone"
                                    dataKey="heatIndex"
                                    name="Average Heat Index"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}