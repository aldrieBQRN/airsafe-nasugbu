import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, RadioTower, Map as MapIcon, FileText,
    Bell, Menu, X, LogOut, ShieldAlert, ChevronRight,
    Building2, Users, Database, AlertTriangle, WifiOff, CheckCircle2
} from 'lucide-react';

export default function AdminLayout({ children, alerts = [] }) {
    const { url, props } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Dynamic Alerts Logic
    const displayAlerts = props.alerts?.length > 0 ? props.alerts : alerts;
    const unreadCount = displayAlerts.filter(alert => !alert.read).length;

    const navLinks = [
        { name: 'Overview', icon: LayoutDashboard, route: '/admin/dashboard' },
        { name: 'Live Map', icon: MapIcon, route: '/admin/map' },
        { name: 'Sensor Devices', icon: RadioTower, route: '/admin/nodes' },
        { name: 'Sensor Logs', icon: Database, route: '/admin/logs' },
        { name: 'Barangays', icon: Building2, route: '/admin/barangays' },
        { name: 'Personnel', icon: Users, route: '/admin/users' },
        { name: 'Reports', icon: FileText, route: '/admin/reports' },
    ];

    const activePage = navLinks.find(link => url.startsWith(link.route))?.name || 'Dashboard';

    // Secure Backend Logout
    const handleLogout = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.post(route('logout'));
        }, 600);
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5] font-sans flex text-stone-800 selection:bg-stone-200 selection:text-stone-900">

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Crisp White Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200/80 transform transition-transform duration-300 ease-out lg:transform-none flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <div className="flex items-center gap-4 h-24 px-8 border-b border-stone-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-900 shadow-md shrink-0">
                        <ShieldAlert size={20} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-stone-900 leading-none">AirSafe</h1>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Nasugbu Area</p>
                    </div>
                    <button className="lg:hidden ml-auto text-stone-400 hover:text-stone-800 p-2" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 pl-2">System Menu</div>

                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = url.startsWith(link.route);

                        return (
                            <Link
                                key={link.name}
                                href={link.route}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isActive ? 'bg-stone-100 text-stone-900' : 'hover:bg-stone-50 text-stone-500 hover:text-stone-800'}`}
                            >
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-stone-900 rounded-r-full"></div>}
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                                <span className="font-semibold text-sm tracking-wide">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-stone-100">
                    <button
                        onClick={handleLogout}
                        disabled={isExiting}
                        className={`w-full bg-stone-50 hover:bg-rose-50 rounded-2xl p-4 border transition-all flex items-center justify-between group ${isExiting ? 'border-stone-200 opacity-50 cursor-not-allowed' : 'border-stone-200/60 hover:border-rose-200 cursor-pointer'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl shadow-sm border transition-colors ${isExiting ? 'bg-stone-100 border-stone-200 text-stone-400' : 'bg-white border-stone-100 text-stone-600 group-hover:text-rose-600 group-hover:bg-rose-100 group-hover:border-rose-200'}`}>
                                <LogOut size={16} />
                            </div>
                            <div className="text-left">
                                <p className={`text-xs font-bold transition-colors ${isExiting ? 'text-stone-500' : 'text-stone-800 group-hover:text-rose-700'}`}>
                                    {isExiting ? 'Logging out...' : 'Log Out'}
                                </p>
                                <p className={`text-[10px] font-medium transition-colors ${isExiting ? 'text-stone-400' : 'text-stone-500 group-hover:text-rose-500'}`}>
                                    Close active session
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen w-full relative">

                {/* Header */}
                <header className="h-20 sm:h-24 bg-[#F7F7F5]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-10 z-30 sticky top-0 border-b lg:border-none border-stone-200/60">

                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <button className="lg:hidden p-2 text-stone-500 hover:bg-stone-200/50 rounded-xl -ml-2" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>

                        {/* MOBILE BRANDING (Only visible on small screens) */}
                        <div className="flex lg:hidden items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-900 shadow-sm shrink-0">
                                <ShieldAlert size={14} className="text-white" strokeWidth={2} />
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 leading-none">AirSafe</h1>
                        </div>

                        {/* DESKTOP BREADCRUMBS */}
                        <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-stone-400">
                            <span className="hover:text-stone-800 cursor-pointer transition-colors">Nasugbu</span>
                            <ChevronRight size={14} />
                            <span className="text-stone-800 border-b-2 border-stone-800 pb-0.5">{activePage}</span>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">

                        {/* Dynamic Notification Bell with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className={`relative p-2.5 sm:p-3 rounded-full transition-all border ${notificationsOpen ? 'bg-white border-stone-200 shadow-sm text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-white hover:border-stone-200 hover:shadow-sm'}`}
                            >
                                <Bell size={18} className="sm:w-5 sm:h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notification Dropdown Panel */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-3 w-[300px] sm:w-[360px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-stone-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="px-5 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                                        <h3 className="font-bold text-stone-800">System Alerts</h3>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-100 px-2 py-1 rounded-md">
                                                {unreadCount} New
                                            </span>
                                        )}
                                    </div>

                                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                        {displayAlerts.length > 0 ? (
                                            displayAlerts.map((alert) => (
                                                <div key={alert.id} className={`p-4 sm:p-5 border-b border-stone-50 hover:bg-stone-50 transition-colors flex gap-4 cursor-pointer ${alert.read ? 'opacity-60' : ''}`}>
                                                    <div className={`p-2 h-fit rounded-full shrink-0 mt-0.5 ${
                                                        alert.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                                                        alert.type === 'offline' ? 'bg-stone-100 text-stone-500' :
                                                        'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                        {alert.type === 'danger' ? <AlertTriangle size={16} /> :
                                                         alert.type === 'offline' ? <WifiOff size={16} /> :
                                                         <CheckCircle2 size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-stone-800 leading-tight mb-1">{alert.title}</p>
                                                        <p className="text-xs text-stone-500 leading-snug mb-2">{alert.message}</p>
                                                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{alert.time}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center">
                                                <Bell size={24} className="text-stone-300 mb-2" />
                                                <p className="text-sm font-bold text-stone-500">No system alerts</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3 bg-stone-50 border-t border-stone-100">
                                        <Link href="/admin/logs" className="block w-full text-center py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors">
                                            View All Hardware Logs
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 sm:h-8 bg-stone-200 hidden sm:block mx-1"></div>

                        {/* Static Profile Display */}
                        <div className="flex items-center gap-2 sm:gap-3 p-1 pr-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center overflow-hidden shrink-0">
                                <span className="text-xs sm:text-sm font-black text-stone-700">MO</span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-bold text-stone-800 leading-none mb-1">Commander</p>
                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none">MDRRMO</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 custom-scrollbar relative z-0">
                    <div className="max-w-[1600px] mx-auto pb-10 mt-6 sm:mt-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}