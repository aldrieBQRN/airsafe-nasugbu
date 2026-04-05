import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    Wind, Lock, Mail, ArrowRight,
    ChevronLeft, Activity, RadioTower,
    Cpu, ShieldCheck, Wifi
} from 'lucide-react';

export default function Login() {
    const { data, setData, processing } = useForm({
        email: '',
        password: '',
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSignIn = (e) => {
        e.preventDefault();

        // SIMPLIFIED LOGIN CREDENTIALS
        const accounts = {
            mdrrmo: {
                email: 'admin@nasugbu.gov.ph',
                password: 'password123',
                path: '/admin/dashboard'
            },
            barangay: {
                email: 'brgy7@nasugbu.gov.ph',
                password: 'password123',
                path: '/admin/barangay'
            }
        };

        if (data.email === accounts.mdrrmo.email && data.password === accounts.mdrrmo.password) {
            router.visit(accounts.mdrrmo.path);
        } else if (data.email === accounts.barangay.email && data.password === accounts.barangay.password) {
            router.visit(accounts.barangay.path);
        } else {
            alert("Login failed. Please check your email and password.");
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F5] font-sans text-stone-800 flex flex-col lg:flex-row">
            <Head title="Official Login | AirSafe" />

            {/* --- LEFT SIDE: THE SYSTEM VIBE (Hidden on Mobile) --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0F1115] p-12 xl:p-20 flex-col justify-between relative overflow-hidden">

                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                     style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className={`relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Wind size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-widest uppercase">AirSafe</h1>
                    </div>

                    <h2 className="text-5xl xl:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                        Monitoring <br />
                        <span className="text-emerald-400">Nasugbu</span> <br />
                        Air Quality.
                    </h2>

                    <p className="text-stone-400 text-lg font-medium max-w-md leading-relaxed">
                        Authorized login for Barangay Officials and Municipal responders. Track air pollution and heat index in real-time.
                    </p>

                    {/* Simple Hardware Stats */}
                    <div className="mt-12 flex flex-wrap gap-4">
                        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-3 text-emerald-400 mb-1">
                                <Cpu size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sensors</span>
                            </div>
                            <p className="text-white font-bold">Devices Online</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-3 text-blue-400 mb-1">
                                <Wifi size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Network</span>
                            </div>
                            <p className="text-white font-bold">Signal: Strong</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Connection Secured
                </div>
            </div>

            {/* --- RIGHT SIDE: THE LOGIN FORM (Responsive) --- */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20 xl:px-32 relative bg-white lg:bg-[#F7F7F5]">

                <div className={`max-w-md w-full mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

                    {/* Mobile Only Header */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                            <Wind size={20} className="text-white" />
                        </div>
                        <h1 className="text-xl font-black text-stone-900 uppercase tracking-tighter">AirSafe</h1>
                    </div>

                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 mb-8 transition-colors group">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1" /> Back to Advisory
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <h3 className="text-3xl font-black text-stone-900 tracking-tight mb-2 uppercase">Official Login</h3>
                        <p className="text-stone-500 font-medium">Please enter your work email and password.</p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 ml-1 group-focus-within:text-stone-900 transition-colors">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full bg-white lg:bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-stone-100 focus:border-stone-900 transition-all outline-none shadow-sm"
                                    placeholder="official@nasugbu.gov.ph"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 ml-1 group-focus-within:text-stone-900 transition-colors">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full bg-white lg:bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-stone-100 focus:border-stone-900 transition-all outline-none shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-stone-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                        >
                            Login <ArrowRight size={18} />
                        </button>
                    </form>

                    {/* Quick Login Reference for Presentation */}
                    <div className="mt-10 p-5 bg-stone-100 rounded-2xl border border-stone-200 shadow-inner">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={16} className="text-stone-400" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Demo Login</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Main Admin</p>
                                <p className="text-xs font-black text-stone-800">admin@nasugbu.gov.ph</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase mb-0.5">Barangay Official</p>
                                <p className="text-xs font-black text-stone-800">brgy7@nasugbu.gov.ph</p>
                            </div>
                        </div>
                        <p className="mt-4 pt-3 border-t border-stone-200 text-center text-[10px] text-stone-500 font-bold">Password: <span className="bg-white px-2 py-0.5 rounded text-stone-900">password123</span></p>
                    </div>

                    <p className="mt-8 text-center text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                        AirSafe Nasugbu
                    </p>
                </div>
            </div>
        </div>
    );
}