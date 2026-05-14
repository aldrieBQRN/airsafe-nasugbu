import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Swal from 'sweetalert2';
import {
    Users, Plus, Mail, ShieldCheck, UserCog,
    Trash2, Edit3, X, Building2, KeyRound
} from 'lucide-react';

export default function UserManagement({ users: initialUsers, barangays }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // PERSISTENCE GUARD: Ensures the UI is always in sync with the newest server data
    const lastUsers = useRef(initialUsers || []);
    useEffect(() => {
        if (initialUsers) {
            lastUsers.current = initialUsers;
        }
    }, [initialUsers]);

    const users = lastUsers.current;

    const { data, setData, post, patch, delete: destroy, reset, processing, errors, clearErrors } = useForm({
        id: '', name: '', email: '', password: '', role: 'official', barangay_id: ''
    });

    // 1-SECOND SILENT SYNC: Automatically pauses if the modal is open to protect inputs
    useEffect(() => {
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing || isModalOpen) return;
            isRefreshing = true;

            router.reload({
                only: ['users'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 30000);

        return () => clearInterval(dataPoller);
    }, [isModalOpen]);

    /**
     * TRIGGER: Open Modal for New Personnel
     * Explicitly wipes the form state clean.
     */
    const openCreateModal = () => {
        reset(); // CRITICAL FIX: Clears values from any previous edit/add session
        clearErrors();
        setEditMode(false);
        setIsModalOpen(true);
    };

    /**
     * TRIGGER: Open Modal for Editing Credentials
     */
    const openEditModal = (user) => {
        clearErrors();
        setData({
            id: user.id,
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            barangay_id: user.barangay_id || ''
        });
        setEditMode(true);
        setIsModalOpen(true);
    };

    /**
     * ACTION: Silent Add/Update with Form Reset
     */
    const submit = (e) => {
        e.preventDefault();

        const options = {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset(); // CRITICAL FIX: Ensures the next "Add" click starts with an empty form
                clearErrors();
                setIsModalOpen(false);

                // FORCED SILENT FETCH: Immediately update the user list
                router.reload({ only: ['users'] });

                Swal.fire({
                    title: 'System Updated',
                    text: `Account for ${data.name} has been processed successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#1c1917',
                    borderRadius: '1.25rem'
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Action Failed',
                    text: 'Please review the form for validation errors.',
                    icon: 'error',
                    confirmButtonColor: '#e11d48'
                });
            }
        };

        if (editMode) {
            patch(route('admin.users.update', data.id), options);
        } else {
            post(route('admin.users.store'), options);
        }
    };

    /**
     * ACTION: Revoke Access
     */
    const handleDelete = (user) => {
        Swal.fire({
            title: 'Revoke Access?',
            text: `Remove system access for ${user.name}? This action is permanent.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#a8a29e',
            confirmButtonText: 'Yes, revoke access',
            borderRadius: '1.25rem'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.users.destroy', user.id), {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['users'] });
                        Swal.fire('Access Revoked', 'The account has been removed from the system.', 'success');
                    },
                    onError: (err) => {
                        Swal.fire('Denied', err.message || 'Cannot delete your own active account.', 'error');
                    }
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Access Management" />

            {/* HEADER: Standardized with icon-subtext style */}
            <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-1">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-none uppercase">Access Control</h1>
                    <p className="text-sm md:text-base text-stone-500 font-medium mt-2 flex items-center gap-2">
                        <Users size={16} className="text-stone-400 shrink-0" /> Manage system administrators and barangay officials
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="w-full md:w-auto px-6 py-3.5 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} /> Add Personnel
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                {users.map(u => (
                    <div key={u.id} className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] p-5 md:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-stone-400 transition-all shadow-sm group">
                        <div className="flex items-center gap-4 md:gap-5 w-full overflow-hidden">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 shrink-0 ${u.role === 'admin' ? 'bg-stone-900 border-stone-100 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                {u.role === 'admin' ? <ShieldCheck size={20} className="md:w-6 md:h-6" /> : <UserCog size={20} className="md:w-6 md:h-6" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-lg md:text-xl font-black text-stone-900 tracking-tight truncate uppercase leading-none">{u.name}</h3>
                                    <span className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${u.role === 'admin' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                        {u.role === 'admin' ? 'Admin' : 'Official'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <span className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-stone-500 truncate italic lowercase">
                                        <Mail size={12} className="text-stone-400 shrink-0"/> {u.email}
                                    </span>
                                    {u.role === 'official' && (
                                        <span className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-stone-700 truncate uppercase tracking-tighter">
                                            <Building2 size={12} className="text-stone-400 shrink-0"/> {u.barangay ? u.barangay.name : 'Unassigned'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 md:pt-0 border-stone-100">
                            <button onClick={() => openEditModal(u)} className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-600 transition-colors flex justify-center"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(u)} className="flex-1 sm:flex-none p-2.5 sm:p-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl text-rose-600 transition-colors flex justify-center"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Logic using createPortal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-stone-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-none">{editMode ? 'Edit Account' : 'New Personnel'}</h2>
                                <p className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Access Management System</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); reset(); }} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"><X size={20}/></button>
                        </div>

                        <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Access Level</label>
                                <select
                                    className="w-full mt-1.5 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 font-bold text-sm text-stone-700 transition-shadow"
                                    value={data.role}
                                    onChange={e => setData('role', e.target.value)}
                                    required
                                >
                                    <option value="official">Barangay Official</option>
                                    <option value="admin">MDRRMO Admin</option>
                                </select>
                            </div>

                            {data.role === 'official' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Assigned Jurisdiction</label>
                                    <select
                                        className={`w-full mt-1.5 bg-stone-50 border rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 text-sm font-bold text-stone-700 transition-shadow ${errors.barangay_id ? 'border-rose-500' : 'border-stone-200'}`}
                                        value={data.barangay_id}
                                        onChange={e => setData('barangay_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Barangay...</option>
                                        {barangays.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {errors.barangay_id && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">{errors.barangay_id}</p>}
                                </div>
                            )}

                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full mt-1.5 sm:mt-2 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 font-bold text-sm transition-shadow uppercase"
                                    placeholder="Juan Dela Cruz"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Email Address (Login ID)</label>
                                <input
                                    type="email"
                                    className={`w-full mt-1.5 sm:mt-2 bg-stone-50 border rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 font-bold text-sm transition-shadow lowercase ${errors.email ? 'border-rose-500' : 'border-stone-200'}`}
                                    placeholder="official@airsafe.ph"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                                    {editMode ? 'New Password (Optional)' : 'Default Password'}
                                </label>
                                <div className="relative mt-1.5">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                                    <input
                                        type="password"
                                        className={`w-full bg-stone-50 border rounded-xl sm:rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-stone-900 font-bold text-sm transition-shadow ${errors.password ? 'border-rose-500' : 'border-stone-200'}`}
                                        placeholder="••••••••"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required={!editMode}
                                    />
                                </div>
                                {errors.password && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">{errors.password}</p>}
                            </div>

                            <button type="submit" disabled={processing} className="w-full bg-stone-900 text-white font-black py-4 rounded-xl sm:rounded-[1.5rem] hover:bg-stone-800 disabled:opacity-50 transition-all mt-4 text-xs uppercase tracking-widest active:scale-95 shadow-md">
                                {editMode ? 'Update Credentials' : 'Register Personnel Record'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </AdminLayout>
    );
}