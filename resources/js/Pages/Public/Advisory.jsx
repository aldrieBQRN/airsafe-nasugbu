import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Wind, ThermometerSun, MapPin, PhoneCall,
    CheckCircle2, ArrowRight, ShieldCheck, LogIn, WifiOff, CalendarDays
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function PublicAdvisory({ liveData, historicalData }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Auto-polling for public live updates (Every 30 seconds)
    useEffect(() => {
        const dataPoller = setInterval(() => {
            router.reload({
                only: ['liveData', 'historicalData'],
                preserveState: true,
                preserveScroll: true
            });
        }, 30000);
        return () => clearInterval(dataPoller);
    }, []);

    // Dynamic data with fallback for testing
    const displayData = liveData?.length > 0 ? liveData : [
        { id: '1', name: 'Brgy 7 (Poblacion)', aqi: 112, heat: 39, status: 'Danger', time: '2 mins ago', isOffline: false },
        { id: '2', name: 'Barangay Papaya', aqi: 42, heat: 33, status: 'Safe', time: 'Just now', isOffline: false }
    ];

    // Mock 7-day trend data (Backend will overwrite this when connected)
    const trendData = historicalData?.length > 0 ? historicalData : [
        { day: 'Apr 29', aqi: 42, heat: 31.5 },
        { day: 'Apr 30', aqi: 48, heat: 33.2 },
        { day: 'May 1', aqi: 55, heat: 34.0 },
        { day: 'May 2', aqi: 110, heat: 38.5 }, // Simulated spike
        { day: 'May 3', aqi: 85, heat: 36.1 },
        { day: 'May 4', aqi: 40, heat: 32.0 },
        { day: 'May 5', aqi: 38, heat: 31.0 },
    ];

    const currentData = displayData[selectedIndex] || displayData[0];
    const isOffline = currentData.isOffline || currentData.status === 'Offline';

    // Specific hazard flags
    const hasBadAqi = currentData.aqi > 100;
    const hasBadHeat = currentData.heat > 38;
    const isDanger = hasBadAqi || hasBadHeat;

    // Dynamic Instructions based on exact conditions
    const getInstructions = () => {
        if (isOffline) {
            return [
                { text: "Awaiting sensor connection...", active: false },
                { text: "Data will automatically refresh", active: false },
                { text: "Follow normal safety protocols", active: false }
            ];
        }

        let instructions = [];

        if (hasBadAqi && hasBadHeat) {
            instructions = [
                { text: "Extreme Hazard: Stay indoors if possible", active: true },
                { text: "Wear N95 masks to filter hazardous air", active: true },
                { text: "Drink water frequently to prevent heatstroke", active: true }
            ];
        } else if (hasBadAqi) {
            instructions = [
                { text: "Poor Air Quality: Keep windows closed", active: true },
                { text: "Wear a face mask if going outdoors", active: true },
                { text: "Sensitive groups should limit exertion", active: true }
            ];
        } else if (hasBadHeat) {
            instructions = [
                { text: "High Heat: Avoid direct sunlight exposure", active: true },
                { text: "Drink water every 30 minutes", active: true },
                { text: "Watch pets and elders for heat exhaustion", active: true }
            ];
        } else {
            instructions = [
                { text: "Perfect day for outdoor activities", active: true, safeMode: true },
                { text: "Safe to open windows for fresh air", active: true, safeMode: true },
                { text: "Maintain normal daily hydration", active: true, safeMode: true }
            ];
        }
        return instructions;
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5] font-sans text-stone-800 pb-32 md:pb-12">
            <Head title="AirSafe Nasugbu | Public Safety" />

            {/* Responsive Header with Official Login Link */}
            <header className="sticky top-0 z-50 bg-[#F7F7F5]/80 backdrop-blur-lg border-b border-stone-200/50 px-6 py-4 md:py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-stone-900 flex items-center justify-center shadow-sm">
                            <Wind size={18} className="text-white" />
                        </div>
                        <h1 className="text-lg md:text-xl font-black tracking-tighter">AirSafe</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-stone-200 shadow-sm">
                            {isOffline ? (
                                <div className="w-2 h-2 rounded-full bg-stone-300"></div>
                            ) : (
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isDanger ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                            )}
                            <span className="text-[10px] font-black uppercase text-stone-600 tracking-widest">
                                {isOffline ? 'System Offline' : 'Live Updates'}
                            </span>
                        </div>

                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-stone-800 transition-colors active:scale-95"
                        >
                            <LogIn size={14} /> <span className="hidden sm:inline">Official Login</span><span className="sm:hidden">Login</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-16">

                {/* Grid Container for Desktop Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Hero & Selection */}
                    <section className="lg:col-span-5 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-200/50 text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                            <MapPin size={12} /> Nasugbu, Batangas
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-stone-900 tracking-tighter leading-[0.85] mb-6 uppercase">
                            {isOffline ? 'Data\nPending' : (isDanger ? 'Stay\nCautious' : 'You Are\nSafe')}
                        </h2>

                        <p className="text-stone-500 font-medium text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                            {isOffline
                                ? "We are currently trying to establish a connection with the local sensors. Please check back shortly."
                                : (isDanger
                                    ? `We've detected levels that may be harmful to your health. Please review the protective actions below.`
                                    : "Environmental conditions are excellent in your area today. Enjoy your day!")}
                        </p>

                        {/* Dynamic Barangay Selection Buttons */}
                        <div className="flex overflow-x-auto lg:flex-wrap items-center justify-center lg:justify-start gap-3 mb-10 pb-4 snap-x hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                            {displayData.map((node, index) => (
                                <BrgyPill
                                    key={node.id}
                                    name={node.name}
                                    active={selectedIndex === index}
                                    onClick={() => setSelectedIndex(index)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Right Column: Cards & Data */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PublicReadingCard
                                label="Air Pollution (AQI)"
                                value={isOffline ? '--' : currentData.aqi}
                                unit="AQI" limit={100} icon={isOffline ? WifiOff : Wind}
                                color={isOffline ? 'stone' : (hasBadAqi ? 'rose' : 'emerald')}
                                advice={isOffline ? "No Data" : (hasBadAqi ? "Unhealthy Air Quality" : "Good Air Quality")}
                                isOffline={isOffline}
                            />
                            <PublicReadingCard
                                label="Heat Index"
                                value={isOffline ? '--' : `${currentData.heat}°C`}
                                unit="Heat" limit={38} icon={isOffline ? WifiOff : ThermometerSun}
                                color={isOffline ? 'stone' : (hasBadHeat ? 'amber' : 'emerald')}
                                advice={isOffline ? "No Data" : (hasBadHeat ? "Extreme Heat Danger" : "Normal Temperature")}
                                isOffline={isOffline}
                            />
                        </div>

                        {/* CURRENT STATUS CARD (Moved to be first) */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-stone-200/60">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={16} /> {isOffline ? 'System Status' : (isDanger ? 'Protective Actions' : 'Current Status')}
                                </h3>

                                <div className="space-y-4">
                                    {getInstructions().map((inst, i) => (
                                        <InstructionItem key={i} text={inst.text} active={inst.active} safeMode={inst.safeMode} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 7-DAY TREND CHART (Moved to be second) */}
                        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-stone-200/60">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500">
                                    <CalendarDays size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">7-Day Trend</h3>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mt-1">Past week history</p>
                                </div>
                            </div>

                            <div className="h-[200px] w-full -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAqiPublic" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.15}/><stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorHeatPublic" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 10, fontWeight: 'bold' }} width={35} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px', fontWeight: 'bold' }}
                                            formatter={(value, name) => {
                                                if (name.includes('Heat Index')) return [`${Number(value).toFixed(1)}°C`, 'Heat Index'];
                                                return [`${Math.round(value)} AQI`, 'Air Quality'];
                                            }}
                                            labelStyle={{ display: 'none' }}
                                        />

                                        <ReferenceLine y={100} stroke="#e11d48" strokeDasharray="3 3" />
                                        <ReferenceLine y={38} stroke="#f59e0b" strokeDasharray="3 3" />

                                        <Area type="monotone" dataKey="aqi" name="Air Quality (AQI)" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorAqiPublic)" isAnimationActive={false} />
                                        <Area type="monotone" dataKey="heat" name="Heat Index (°C)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorHeatPublic)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Report & Contact */}
                        <div>
                            <a href="tel:09175089911" className="w-full bg-stone-900 rounded-[2rem] p-6 text-white flex items-center justify-between group active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                        <PhoneCall size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 leading-none mb-1">MDRRMO Nasugbu Help</p>
                                        <p className="text-sm font-bold text-white leading-none">Call Emergency Support</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-stone-600 group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </div>
                </div>

                <footer className="mt-16 text-center lg:text-left border-t border-stone-200 pt-8 pb-8">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4">
                        <span>Updated {currentData.time}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Official Data Source: Nasugbu MDRRMO</span>
                    </p>
                </footer>
            </main>
        </div>
    );
}

function BrgyPill({ name, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`whitespace-nowrap flex-shrink-0 px-6 py-3 rounded-full text-xs font-bold transition-all border snap-center ${active ? 'bg-white border-stone-800 text-stone-900 shadow-sm' : 'bg-transparent border-stone-200 text-stone-400 hover:border-stone-400 hover:bg-white/50'}`}
        >
            {name}
        </button>
    );
}

function PublicReadingCard({ label, value, limit, icon: Icon, color, advice, isOffline }) {
    const colorStyles = { emerald: 'text-emerald-600', rose: 'text-rose-600', amber: 'text-amber-600', stone: 'text-stone-400' };
    const numericValue = parseInt(value) || 0;
    const percentage = isOffline ? 0 : Math.min((numericValue / (limit * 1.5)) * 100, 100);

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${isOffline ? 'bg-stone-50 border-stone-100 text-stone-400' : `bg-stone-50 border-stone-100 ${colorStyles[color]}`}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
                        <h3 className={`text-3xl sm:text-4xl font-black leading-none ${isOffline ? 'text-stone-300' : 'text-stone-900'}`}>{value}</h3>
                    </div>
                </div>
            </div>
            <div className="mt-auto">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${colorStyles[color]}`}>{advice}</span>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${color === 'rose' ? 'bg-rose-500' : color === 'amber' ? 'bg-amber-500' : (isOffline ? 'bg-transparent' : 'bg-emerald-500')}`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

function InstructionItem({ text, active, safeMode }) {
    return (
        <div className={`flex items-start gap-4 transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className="mt-1">
                {safeMode ? (
                     <CheckCircle2 size={16} className="text-emerald-500" />
                ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-stone-900 mt-1"></div>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-stone-300 mt-1"></div>
                )}
            </div>
            <p className={`text-sm sm:text-base font-bold ${active ? 'text-stone-800' : 'text-stone-400'}`}>{text}</p>
        </div>
    );
}