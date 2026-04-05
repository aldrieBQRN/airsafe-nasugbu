import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Map as MapIcon, LineChart, RadioTower,
    Bell, Menu, X, Search, Settings, LogOut, ChevronDown,
    ShieldAlert, ChevronRight, Command, ShieldCheck, Fingerprint
} from 'lucide-react';

export default function BarangayLayout({ children, brgyName = "Brgy 7 (Poblacion)" }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false);


    // Navigation specific to the Barangay Official
    const navLinks = [
        { name: 'Local Overview', icon: LayoutDashboard, route: '/admin/barangay' },
        { name: 'Interactive Map', icon: MapIcon, route: '/admin/barangay/map' },
        { name: 'Trend Analysis', icon: LineChart, route: '/admin/barangay/reports' }, // <-- Fixed this route
        { name: 'Local Hardware', icon: RadioTower, route: '/admin/barangay/nodes' },
    ];

    const activePage = navLinks.find(link => url.startsWith(link.route))?.name || 'Local Overview';

    const handleLogout = () => {
        setIsExiting(true);
        setTimeout(() => {
            router.visit('/login');
        }, 600);
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5] font-sans flex text-stone-800 selection:bg-stone-200 selection:text-stone-900">

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Crisp White Sidebar (Matches AdminLayout exactly) */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200/80 transform transition-transform duration-300 ease-out lg:transform-none flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <div className="flex items-center gap-4 h-24 px-8 border-b border-stone-100">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-900 shadow-md">
                        <ShieldAlert size={20} className="text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-stone-900 leading-none">AirSafe</h1>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Local Portal</p>
                    </div>
                    <button className="lg:hidden ml-auto text-stone-400 hover:text-stone-800 p-2" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 pl-2">Tactical Menu</div>

                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = url === link.route || (url.startsWith(link.route) && link.route !== '/admin/barangay');

                        return (
                            <Link
                                key={link.name}
                                href={link.route}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative ${isActive ? 'bg-stone-100 text-stone-900' : 'hover:bg-stone-50 text-stone-500 hover:text-stone-800'}`}
                            >
                                {/* The signature vertical active indicator */}
                                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-stone-900 rounded-r-full"></div>}
                                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'} />
                                <span className="font-semibold text-sm tracking-wide">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-stone-100">
                    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/60 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-stone-100">
                            <Fingerprint size={16} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-stone-800">Connection Secured</p>
                            <p className="text-[10px] text-stone-500 font-medium">Local Gateway Active</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen w-full relative">

                {/* Blended Header (Matches AdminLayout exactly) */}
                <header className="h-24 bg-[#F7F7F5]/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">

                    <div className="flex items-center gap-4 flex-1">
                        <button className="lg:hidden p-2 text-stone-500 hover:bg-stone-200/50 rounded-xl" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>

                        <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-stone-400">
                            <span className="hover:text-stone-800 cursor-pointer transition-colors">{brgyName}</span>
                            <ChevronRight size={14} />
                            <span className="text-stone-800 border-b-2 border-stone-800 pb-0.5">{activePage}</span>
                        </div>

                        {/* Minimal Search Bar */}
                        <div className="hidden md:flex items-center gap-2 ml-8 bg-white border border-stone-200/80 hover:border-stone-300 focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-100 px-4 py-2.5 rounded-full w-80 transition-all shadow-sm">
                            <Search size={16} className="text-stone-400" />
                            <input type="text" placeholder="Search local parameters..." className="bg-transparent border-none outline-none text-sm w-full text-stone-700 placeholder:text-stone-400 font-medium" />
                            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-1 rounded-full text-[10px] font-bold text-stone-500">
                                <Command size={10} /> K
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-4">
                        <button className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-colors">
                            <ShieldCheck size={16} className="text-stone-300" />
                            Issue Alert
                        </button>

                        <button className="relative p-3 text-stone-500 hover:text-stone-900 hover:bg-white rounded-full transition-all border border-transparent hover:border-stone-200 hover:shadow-sm">
                            <Bell size={20} />
                        </button>

                        <div className="w-px h-8 bg-stone-200 hidden md:block mx-1"></div>

                        {/* Minimal Profile Dropdown */}
                        <div className="relative">
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-white transition-colors border border-transparent hover:border-stone-200 hover:shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center overflow-hidden">
                                    <span className="text-sm font-black text-stone-700">B7</span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-stone-800 leading-none mb-1">Local Official</p>
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none">Barangay Admin</p>
                                </div>
                                <ChevronDown size={14} className={`text-stone-400 hidden md:block ml-1 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-stone-100 py-2 z-50">
                                    <Link href="#" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">
                                        <Settings size={16} className="text-stone-400" /> Alert Settings
                                    </Link>
                                    <div className="my-1 border-t border-stone-50"></div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={isExiting}
                                        className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-bold transition-colors text-left ${isExiting ? 'text-stone-300' : 'text-rose-600 hover:bg-rose-50'}`}
                                    >
                                        <LogOut size={16} /> {isExiting ? 'Terminating...' : 'Disconnect'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 lg:px-10 custom-scrollbar relative z-0">
                    <div className="max-w-[1600px] mx-auto pb-10 mt-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}