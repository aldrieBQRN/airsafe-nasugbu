import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Wind, ThermometerSun, MapPin, PhoneCall,
    AlertCircle, CheckCircle2, Info, Navigation,
    ArrowRight, ShieldCheck, Zap, SignalHigh, AlertTriangle, LogIn, WifiOff
} from 'lucide-react';

export default function PublicAdvisory({ liveData }) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Auto-polling for public live updates (Every 10 seconds)
    useEffect(() => {
        const dataPoller = setInterval(() => {
            router.reload({
                only: ['liveData'],
                preserveState: true,
                preserveScroll: true
            });
        }, 10000);
        return () => clearInterval(dataPoller);
    }, []);

    // Dynamic data with fallback for testing
    const displayData = liveData?.length > 0 ? liveData : [
        { id: '1', name: 'Brgy 7 (Poblacion)', aqi: 112, heat: 39, status: 'Danger', time: '2 mins ago', isOffline: false },
        { id: '2', name: 'Barangay Papaya', aqi: 42, heat: 33, status: 'Safe', time: 'Just now', isOffline: false }
    ];

    const currentData = displayData[selectedIndex] || displayData[0];
    const isDanger = currentData.aqi > 100 || currentData.heat > 38;
    const isOffline = currentData.isOffline || currentData.status === 'Offline';

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
                        {/* Live Update Indicator */}
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

                        {/* Official Login Button */}
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-stone-800 transition-colors active:scale-95"
                        >
                            <LogIn size={14} /> <span className="hidden sm:inline">Official Login</span><span className="sm:hidden">Login</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-8 md:pt-16">

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
                                    ? "We've detected levels that may be harmful to your health. Please review the safety advice."
                                    : "Environmental conditions are excellent in your area today. Enjoy your day!")}
                        </p>

                        {/* Dynamic Barangay Selection Buttons */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
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
                                label="Air Pollution Index"
                                value={isOffline ? '--' : currentData.aqi}
                                unit="AQI" limit={100} icon={isOffline ? WifiOff : Wind}
                                color={isOffline ? 'stone' : (currentData.aqi > 100 ? 'rose' : 'emerald')}
                                advice={isOffline ? "No Data" : (currentData.aqi > 100 ? "Wear a mask" : "Safe air")}
                                isOffline={isOffline}
                            />
                            <PublicReadingCard
                                label="Heat Index"
                                value={isOffline ? '--' : `${currentData.heat}°C`}
                                unit="Heat" limit={38} icon={isOffline ? WifiOff : ThermometerSun}
                                color={isOffline ? 'stone' : (currentData.heat > 38 ? 'amber' : 'emerald')}
                                advice={isOffline ? "No Data" : (currentData.heat > 38 ? "Avoid sun" : "Normal temp")}
                                isOffline={isOffline}
                            />
                        </div>

                        {/* Bento Style Safety Instruction */}
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-stone-200/60">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-6 flex-1">
                                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={16} /> Protective Actions
                                    </h3>
                                    <InstructionItem text="Wear a face mask to filter dust and vog" active={!isOffline && currentData.aqi > 100} />
                                    <InstructionItem text="Drink water every 30 minutes" active={!isOffline && currentData.heat > 35} />
                                    <InstructionItem text="Keep pets and elders indoors" active={!isOffline && isDanger} />
                                </div>
                                <div className="hidden md:block w-px h-32 bg-stone-100"></div>
                                <div className="md:w-48 space-y-4">
                                    <div className={`flex items-center gap-3 ${isOffline ? 'text-stone-400' : 'text-emerald-600'}`}>
                                        <Zap size={18} fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Grid Powered</span>
                                    </div>
                                    <div className={`flex items-center gap-3 ${isOffline ? 'text-stone-400' : 'text-blue-600'}`}>
                                        {isOffline ? <WifiOff size={18} /> : <SignalHigh size={18} />}
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                            {isOffline ? 'No Link' : 'Cellular Link'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report & Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button className="py-6 rounded-[2rem] border-2 border-dashed border-stone-300 text-stone-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-stone-400 hover:text-stone-600 transition-all">
                                <AlertTriangle size={18} /> Report Hazard
                            </button>

                            <a href="tel:0917000000" className="bg-stone-900 rounded-[2rem] p-6 text-white flex items-center justify-between group active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                        <PhoneCall size={18} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 leading-none mb-1">MDRRMO Help</p>
                                        <p className="text-sm font-bold text-white leading-none">Call Support</p>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-stone-600 group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </div>
                </div>

                <footer className="mt-16 text-center lg:text-left border-t border-stone-200 pt-8">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <span>Updated {currentData.time}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Official Data Source: Nasugbu MDRRMO</span>
                        <span className="hidden sm:inline">•</span>
                        <span>System ID: AIRSAFE-NSG-01</span>
                    </p>
                </footer>
            </main>
        </div>
    );
}

// ==========================================
// RESPONSIVE SUB-COMPONENTS
// ==========================================

function BrgyPill({ name, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold transition-all border ${active ? 'bg-white border-stone-800 text-stone-900 shadow-sm' : 'bg-transparent border-stone-200 text-stone-400 hover:border-stone-400 hover:bg-white/50'}`}
        >
            {name}
        </button>
    );
}

function PublicReadingCard({ label, value, limit, icon: Icon, color, advice, isOffline }) {
    const colorStyles = {
        emerald: 'text-emerald-600',
        rose: 'text-rose-600',
        amber: 'text-amber-600',
        stone: 'text-stone-400'
    };

    const numericValue = parseInt(value) || 0;
    const percentage = isOffline ? 0 : Math.min((numericValue / (limit * 1.5)) * 100, 100);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl border ${isOffline ? 'bg-stone-50 border-stone-100 text-stone-400' : `bg-stone-50 border-stone-100 ${colorStyles[color]}`}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{label}</p>
                        <h3 className={`text-4xl font-black leading-none ${isOffline ? 'text-stone-300' : 'text-stone-900'}`}>{value}</h3>
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

function InstructionItem({ text, active }) {
    return (
        <div className={`flex items-center gap-4 transition-all ${active ? 'opacity-100' : 'opacity-20'}`}>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-stone-900' : 'bg-stone-300'}`}></div>
            <p className={`text-base font-bold ${active ? 'text-stone-800' : 'text-stone-400'}`}>{text}</p>
        </div>
    );
}