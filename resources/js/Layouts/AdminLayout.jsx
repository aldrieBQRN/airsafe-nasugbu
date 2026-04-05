import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, RadioTower, Map as MapIcon, FileText,
    Bell, Menu, X, Search, Settings, LogOut, ChevronDown,
    Wind, ChevronRight, Command, ShieldCheck, Fingerprint
} from 'lucide-react';

export default function AdminLayout({ children }) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [isExiting, setIsExiting] = useState(false); // New state for logout feel

    const navLinks = [
        { name: 'Overview', icon: LayoutDashboard, route: '/admin/dashboard' },
        { name: 'Sensor Nodes', icon: RadioTower, route: '/admin/nodes' },
        { name: 'Live Map', icon: MapIcon, route: '/admin/map' },
        { name: 'Analytics', icon: FileText, route: '/admin/reports' },
    ];

    const activePage = navLinks.find(link => url.startsWith(link.route))?.name || 'Dashboard';

    // Enhanced Mock Logout
    const handleLogout = () => {
        setIsExiting(true);
        // Short delay to simulate a secure session termination
        setTimeout(() => {
            router.visit('/login'); // Redirects to Login Page
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
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-900 shadow-md">
                        <Wind size={20} className="text-white" strokeWidth={2} />
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
                                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${isActive ? 'bg-stone-100 text-stone-900' : 'hover:bg-stone-50 text-stone-500 hover:text-stone-800'}`}
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

            <div className="flex-1 flex flex-col h-screen w-full relative">

                <header className="h-24 bg-[#F7F7F5]/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0">

                    <div className="flex items-center gap-4 flex-1">
                        <button className="lg:hidden p-2 text-stone-500 hover:bg-stone-200/50 rounded-xl" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>

                        <div className="hidden lg:flex items-center gap-2 text-sm font-bold text-stone-400">
                            <span className="hover:text-stone-800 cursor-pointer transition-colors">Nasugbu</span>
                            <ChevronRight size={14} />
                            <span className="text-stone-800 border-b-2 border-stone-800 pb-0.5">{activePage}</span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 ml-8 bg-white border border-stone-200/80 hover:border-stone-300 focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-100 px-4 py-2.5 rounded-full w-80 transition-all shadow-sm">
                            <Search size={16} className="text-stone-400" />
                            <input type="text" placeholder="Search parameters..." className="bg-transparent border-none outline-none text-sm w-full text-stone-700 placeholder:text-stone-400 font-medium" />
                            <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 px-2 py-1 rounded-full text-[10px] font-bold text-stone-500">
                                <Command size={10} /> K
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-colors">
                            <ShieldCheck size={16} className="text-stone-300" />
                            Export Log
                        </button>

                        <button className="relative p-3 text-stone-500 hover:text-stone-900 hover:bg-white rounded-full transition-all border border-transparent hover:border-stone-200 hover:shadow-sm">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="w-px h-8 bg-stone-200 hidden md:block mx-1"></div>

                        <div className="relative">
                            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-3 p-1 pr-4 rounded-full hover:bg-white transition-colors border border-transparent hover:border-stone-200 hover:shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center overflow-hidden">
                                    <span className="text-sm font-black text-stone-700">MO</span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-stone-800 leading-none mb-1">Commander</p>
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-none">MDRRMO</p>
                                </div>
                                <ChevronDown size={14} className={`text-stone-400 hidden md:block ml-1 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-stone-100 py-2 z-50">
                                    <Link href="#" className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">
                                        <Settings size={16} className="text-stone-400" /> System Params
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
                    <div className="max-w-[1600px] mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}