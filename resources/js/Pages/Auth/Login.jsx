import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import {
    Wind, Lock, Mail, ArrowRight,
    ChevronLeft, AlertCircle
} from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleSignIn = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#0F1115] font-sans text-stone-800 flex flex-col lg:flex-row overflow-x-hidden">
            <Head title="Official Login | AirSafe" />

            {/* --- LEFT SIDE / MOBILE HEADER --- */}
            <div className="w-full lg:w-1/2 bg-[#0F1115] p-8 lg:p-20 flex flex-col justify-center lg:justify-between relative min-h-[35vh] lg:min-h-screen overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                     style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className={`relative z-10 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 lg:-translate-x-10 lg:translate-y-0'}`}>
                    <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-12">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Wind size={20} className="text-white lg:w-6 lg:h-6" />
                        </div>
                        <h1 className="text-xl lg:text-2xl font-black text-white tracking-widest uppercase">AirSafe</h1>
                    </div>

                    <h2 className="text-4xl lg:text-7xl font-black text-white leading-[1.1] mb-4 lg:mb-8 tracking-tighter">
                        Monitoring <br className="hidden lg:block" />
                        <span className="text-emerald-400">Nasugbu</span> <br className="hidden lg:block" />
                        Air Quality.
                    </h2>

                    <p className="text-stone-400 text-sm lg:text-lg font-medium max-w-md leading-relaxed hidden sm:block">
                        Authorized portal for Barangay Officials. Real-time pollution tracking and response management.
                    </p>
                </div>

                <div className="hidden lg:flex relative z-10 items-center gap-2 text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Connection Secured
                </div>
            </div>

            {/* --- RIGHT SIDE / APP SHEET --- */}
            <div className="flex-1 bg-white lg:bg-[#F7F7F5] rounded-t-[2.5rem] lg:rounded-none -mt-10 lg:mt-0 relative z-20 flex flex-col justify-center px-6 py-10 md:px-16 lg:px-20 xl:px-32">

                <div className={`max-w-md w-full mx-auto transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-stone-900 mb-6 lg:mb-8 transition-colors group">
                        <ChevronLeft size={14} className="group-hover:-translate-x-1" /> Back
                    </Link>

                    <div className="mb-8 lg:mb-10">
                        <h3 className="text-2xl lg:text-3xl font-black text-stone-900 tracking-tight mb-2 uppercase">Official Login</h3>
                        <p className="text-stone-500 text-sm lg:text-base font-medium">Please enter your system credentials.</p>
                    </div>

                    {/* Error Handling */}
                    {errors.email && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={18} />
                            {errors.email}
                        </div>
                    )}

                    <form onSubmit={handleSignIn} className="space-y-4 lg:space-y-5">
                        <div className="group">
                            <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 ml-1 group-focus-within:text-stone-900 transition-colors">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    autoComplete="username"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full h-14 lg:h-16 bg-stone-50 lg:bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-stone-100 focus:border-stone-900 transition-all outline-none"
                                    placeholder="admin@airsafe.ph"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 ml-1 group-focus-within:text-stone-900 transition-colors">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full h-14 lg:h-16 bg-stone-50 lg:bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-stone-100 focus:border-stone-900 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2 lg:pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-14 lg:h-16 bg-stone-900 text-white rounded-2xl font-black text-xs lg:text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-stone-800 active:scale-[0.97] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {processing ? 'Verifying...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 lg:mt-12 text-center">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            © 2026 AIRSAFE SYSTEM • NASUGBU, BATANGAS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}