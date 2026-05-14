import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Database, Search, FileSpreadsheet, AlertTriangle,
    ThermometerSun, CheckCircle2, Filter, Calendar, MapPin, Clock
} from 'lucide-react';

export default function Logs({ logs, filters }) {
    // 1. Local state matching the system-wide filter standard
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [dateFilter, setDateFilter] = useState(filters?.date || 'all');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');

    // 2. Guards for background sync
    const isInitialRender = useRef(true);
    const syncPausedUntil = useRef(0); // Timestamp until which sync is disabled

    /**
     * SILENT FILTER ENGINE
     * Updates data without full page reload and locks background sync.
     */
    const applyFilters = (newSearch, newDate, newStatus) => {
        // Lock background sync for 3 seconds during interaction
        syncPausedUntil.current = Date.now() + 3000;

        router.get(route('admin.logs'),
            { search: newSearch, date: newDate, status: newStatus },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['logs', 'filters'],
            }
        );
    };

    /**
     * 1-SECOND SILENT BACKGROUND REFRESH
     * Only executes if the system isn't currently being filtered by the user.
     */
    useEffect(() => {
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            // Respect the interaction lock
            if (Date.now() < syncPausedUntil.current || isRefreshing) return;

            isRefreshing = true;
            router.reload({
                only: ['logs'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 30000); // High-frequency 1-second sync

        return () => clearInterval(dataPoller);
    }, []);

    // SEARCH DEBOUNCE (300ms)
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const debounceTimer = setTimeout(() => {
            applyFilters(searchQuery, dateFilter, statusFilter);
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);


    return (
        <AdminLayout>
            <Head title="System Logs" />

            <div className="mb-6 md:mb-10 px-1 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-none uppercase">Sensor Logs</h1>
                    <p className="text-sm md:text-base text-stone-500 font-medium flex items-center gap-2 mt-2 uppercase tracking-wide">
                        <Database size={16} className="text-stone-400 shrink-0" /> Historical trends and system KPIs
                    </p>
                </div>

            </div>

            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden flex flex-col min-h-[60vh]">

                {/* Search & Filter Bar */}
                <div className="p-4 md:p-6 border-b border-stone-100 bg-stone-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full lg:max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search Node or Location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-white border border-stone-200 rounded-2xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-stone-100 text-sm font-medium text-stone-700 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 w-full sm:w-auto">
                            <div className="relative h-12 bg-white border border-stone-200 rounded-2xl shadow-sm flex items-center px-3 gap-2 hover:border-stone-400 transition-all">
                                <Filter size={16} className="text-stone-400 shrink-0" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        applyFilters(searchQuery, dateFilter, e.target.value);
                                    }}
                                    className="bg-transparent border-none text-[11px] md:text-sm font-bold text-stone-700 outline-none cursor-pointer w-full h-full"
                                >
                                    <option value="all">All Levels</option>
                                    <option value="danger">Danger</option>
                                    <option value="warning">Warning</option>
                                    <option value="safe">Safe</option>
                                </select>
                            </div>

                            <div className="relative h-12 bg-white border border-stone-200 rounded-2xl shadow-sm flex items-center px-3 gap-2 hover:border-stone-400 transition-all">
                                <Calendar size={16} className="text-stone-400 shrink-0" />
                                <select
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        applyFilters(searchQuery, e.target.value, statusFilter);
                                    }}
                                    className="bg-transparent border-none text-[11px] md:text-sm font-bold text-stone-700 outline-none cursor-pointer w-full h-full"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="7">7 Days</option>
                                    <option value="30">30 Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE VIEW: CARD LAYOUT */}
                <div className="block lg:hidden p-4 space-y-4 flex-grow bg-stone-50/30">
                    {logs.data.length > 0 ? logs.data.map((log) => (
                        <div key={log.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm active:scale-[0.98] transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[9px] font-black text-stone-400 uppercase font-mono">{log.id}</span>
                                    <h3 className="text-sm font-black text-stone-900 uppercase mt-0.5">{log.device_name}</h3>
                                </div>
                                <StatusPill status={log.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-px bg-stone-100 rounded-xl overflow-hidden border border-stone-100 mb-4">
                                <div className="bg-white p-3">
                                    <span className="text-[9px] font-bold text-stone-400 uppercase block mb-0.5">AQI Reading</span>
                                    <strong className={`text-base font-black ${parseInt(log.aqi) > 100 ? 'text-rose-600' : 'text-stone-800'}`}>{log.aqi}</strong>
                                </div>
                                <div className="bg-white p-3 border-l border-stone-100">
                                    <span className="text-[9px] font-bold text-stone-400 uppercase block mb-0.5">Heat Index</span>
                                    <strong className={`text-base font-black ${parseFloat(log.heat_index) > 38 ? 'text-amber-600' : 'text-stone-800'}`}>{log.heat_index}</strong>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border-t border-stone-50 pt-3">
                                <div className="flex items-center gap-2 text-stone-500">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-bold uppercase">{log.date}</span>
                                </div>
                                <div className="flex items-center gap-2 text-stone-500">
                                    <MapPin size={12} />
                                    <span className="text-[10px] font-bold uppercase truncate">{log.location}</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center opacity-40 uppercase font-black text-xs tracking-widest">No logs found</div>
                    )}
                </div>

                {/* DESKTOP VIEW: TABLE LAYOUT */}
                <div className="hidden lg:block overflow-x-auto flex-grow">
                    {logs.data.length > 0 ? (
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200">
                                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-stone-400">Log ID</th>
                                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-stone-400">Timestamp</th>
                                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-stone-400">Device</th>
                                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-stone-400 text-center">AQI</th>
                                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-black text-stone-400 text-center">Heat</th>
                                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest font-bold text-stone-400">Threat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-stone-50/80 transition-colors group">
                                        <td className="py-4 px-6 text-xs font-black text-stone-400 font-mono">{log.id}</td>
                                        <td className="py-4 px-6 text-xs font-bold text-stone-700 whitespace-nowrap uppercase tracking-tight">{log.date}</td>
                                        <td className="py-4 px-6 text-sm font-black text-stone-900 uppercase tracking-tight">{log.device_name}</td>
                                        <td className={`py-4 px-6 text-sm font-black text-center ${parseInt(log.aqi) > 100 ? 'text-rose-600' : 'text-stone-800'}`}>{log.aqi}</td>
                                        <td className={`py-4 px-6 text-sm font-black text-center ${parseFloat(log.heat_index) > 38 ? 'text-amber-600' : 'text-stone-800'}`}>{log.heat_index}</td>
                                        <td className="py-4 px-6"><StatusPill status={log.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-stone-400 text-center uppercase tracking-widest">
                            <Database size={48} className="mb-4 text-stone-200" />
                            <p className="font-black text-stone-500 text-sm">Telemetry history empty</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {logs.total > 0 && (
                    <div className="p-5 md:p-6 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-stone-50/30">
                        <span className="text-[11px] md:text-xs font-bold text-stone-500 uppercase tracking-wide">
                            Showing <strong className="text-stone-900">{logs.from}</strong> to <strong className="text-stone-900">{logs.to}</strong> of <strong className="text-stone-900">{logs.total}</strong> entries
                        </span>

                        <div className="flex gap-1.5 flex-wrap justify-center">
                            {logs.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    disabled={!link.url || link.active}
                                    className={`min-w-[40px] h-10 px-3 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${
                                        link.active ? 'bg-stone-900 text-white shadow-md' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 shadow-sm active:scale-90'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function StatusPill({ status }) {
    if (status === 'Danger') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200"><AlertTriangle size={10} strokeWidth={3} /> Danger</span>;
    if (status === 'Warning') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200"><ThermometerSun size={10} strokeWidth={3} /> Warning</span>;
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 size={10} strokeWidth={3} /> Safe</span>;
}