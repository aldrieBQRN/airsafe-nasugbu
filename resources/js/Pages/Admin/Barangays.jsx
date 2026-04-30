import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Swal from 'sweetalert2';
import {
    Building2, Plus, User, Phone,
    Trash2, Edit3, X, ShieldCheck
} from 'lucide-react';

// Official list of all 42 Barangays in Nasugbu, Batangas
const NASUGBU_BARANGAYS = [
    "Apacible", "Balaytigui", "Banilad", "Barangay 1 (Poblacion)", "Barangay 2 (Poblacion)",
    "Barangay 3 (Poblacion)", "Barangay 4 (Poblacion)", "Barangay 5 (Poblacion)", "Barangay 6 (Poblacion)",
    "Barangay 7 (Poblacion)", "Barangay 8 (Poblacion)", "Barangay 9 (Poblacion)", "Barangay 10 (Poblacion)",
    "Barangay 11 (Poblacion)", "Barangay 12 (Poblacion)", "Bilaran", "Bucana", "Bulihan", "Bunducan",
    "Butas", "Calayo", "Catandaan", "Dayap", "Kayatba", "Kaylaway", "Kayrilaw", "Latag", "Looc",
    "Lumbangan", "Malapad na Bato", "Mataas na Pulo", "Maugat", "Munting Indang", "Natipuan",
    "Pantalan", "Papaya", "Putat", "Reparo", "Talangan", "Tumalim", "Utod", "Wawa"
].sort();

export default function Barangays({ barangays: initialBarangays }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // PERSISTENCE GUARD: Synchronizes the list with the latest database state
    const lastBarangays = useRef(initialBarangays || []);
    useEffect(() => {
        if (initialBarangays) {
            lastBarangays.current = initialBarangays;
        }
    }, [initialBarangays]);

    const barangays = lastBarangays.current;

    const { data, setData, post, patch, delete: destroy, reset, processing, errors, clearErrors } = useForm({
        id: '', name: '', captain_name: '', contact_number: ''
    });

    /**
     * DYNAMIC DROPDOWN FILTER:
     * Prevents duplication by removing already registered barangays from the selection list.
     * When in Edit Mode, it allows the current barangay to remain in the list.
     */
    const availableBarangayList = useMemo(() => {
        const registeredNames = barangays.map(b => b.name);
        return NASUGBU_BARANGAYS.filter(name =>
            !registeredNames.includes(name) || (editMode && name === data.name)
        );
    }, [barangays, editMode, data.name]);

    // 1-SECOND SILENT SYNC: Automatically pauses if the modal is open
    useEffect(() => {
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing || isModalOpen) return;
            isRefreshing = true;

            router.reload({
                only: ['barangays'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 1000);

        return () => clearInterval(dataPoller);
    }, [isModalOpen]);

    const openCreateModal = () => {
        reset();
        clearErrors();
        setEditMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (b) => {
        clearErrors();
        setData({
            id: b.id,
            name: b.name,
            captain_name: b.captain_name || '',
            contact_number: b.contact_number || ''
        });
        setEditMode(true);
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();

        const options = {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setIsModalOpen(false);
                router.reload({ only: ['barangays'] });

                Swal.fire({
                    title: 'System Updated',
                    text: `Barangay ${data.name} record processed.`,
                    icon: 'success',
                    confirmButtonColor: '#1c1917',
                    borderRadius: '1.25rem'
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Action Failed',
                    text: 'Please review selection errors.',
                    icon: 'error',
                    confirmButtonColor: '#e11d48'
                });
            }
        };

        if (editMode) {
            patch(route('admin.barangays.update', data.id), options);
        } else {
            post(route('admin.barangays.store'), options);
        }
    };

    const handleDelete = (b) => {
        Swal.fire({
            title: 'Remove Area?',
            text: `Confirm deletion of ${b.name}? This action is permanent.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#a8a29e',
            confirmButtonText: 'Yes, remove',
            borderRadius: '1.25rem'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.barangays.destroy', b.id), {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        router.reload({ only: ['barangays'] });
                        Swal.fire('Purged', 'The record was removed.', 'success');
                    },
                    onError: (err) => {
                        Swal.fire('Denied', err.message || 'Active sensors are still linked here.', 'error');
                    }
                });
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Barangay Management" />

            <div className="mb-6 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 px-1">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-none uppercase">Barangay Jurisdictions</h1>
                    <p className="text-sm md:text-base text-stone-500 font-medium mt-2 flex items-center gap-2">
                        <Building2 size={16} className="text-stone-400 shrink-0" /> Manage administrative areas and emergency contacts
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="w-full md:w-auto px-6 py-3.5 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} /> Add Barangay
                </button>
            </div>

            {barangays.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {barangays.map(b => (
                        <div key={b.id} className="bg-white border border-stone-200 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 hover:border-stone-400 transition-all shadow-sm group">
                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                {/* FIXED: Removed group-hover from icon container */}
                                <div className="p-2.5 md:p-3 bg-stone-50 rounded-xl md:rounded-2xl text-stone-900 border border-stone-100 transition-colors">
                                    <Building2 size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openEditModal(b)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900 transition-colors"><Edit3 size={18} /></button>
                                    <button onClick={() => handleDelete(b)} className="p-2 hover:bg-rose-50 rounded-full text-stone-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-stone-900 mb-1 uppercase tracking-tight leading-none">{b.name}</h3>
                            <div className="flex items-center gap-2 mb-4 md:mb-6">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest">{b.devices_count || 0} Active Sensors</span>
                            </div>

                            <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t border-stone-100">
                                <div className="flex items-center gap-3">
                                    <User size={14} className="text-stone-400 shrink-0" />
                                    <span className="text-xs md:text-sm font-bold text-stone-700 truncate">{b.captain_name || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={14} className="text-stone-400 shrink-0" />
                                    <span className="text-xs md:text-sm font-bold text-stone-700 truncate">{b.contact_number || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-10 md:p-20 text-center border-2 border-dashed border-stone-200 mt-6">
                    <Building2 size={48} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-lg md:text-xl font-black text-stone-400 uppercase">No Data Found</h3>
                </div>
            )}

            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-stone-200 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-none">{editMode ? 'Edit Area' : 'New Area'}</h2>
                                <p className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Jurisdiction System</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); reset(); }} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500"><X size={20}/></button>
                        </div>
                        <form onSubmit={submit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Barangay Name (Nasugbu)</label>
                                {/* UPDATED: Replaced Text Input with filtered Dropdown */}
                                <select
                                    className={`w-full mt-1.5 sm:mt-2 bg-stone-50 border rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-all text-sm font-bold ${errors.name ? 'border-rose-500' : 'border-stone-200'}`}
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                >
                                    <option value="">Select Barangay...</option>
                                    {availableBarangayList.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1.5 ml-1">{errors.name}</p>}
                                <p className="text-[8px] font-bold text-stone-400 uppercase mt-2 ml-1">Only unregistered areas are shown.</p>
                            </div>
                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Captain Name</label>
                                <input
                                    type="text"
                                    className="w-full mt-1.5 sm:mt-2 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 text-sm font-bold"
                                    placeholder="Full Name"
                                    value={data.captain_name}
                                    onChange={e => setData('captain_name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Contact Number</label>
                                <input
                                    type="text"
                                    className="w-full mt-1.5 sm:mt-2 bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-stone-900 text-sm font-bold"
                                    placeholder="+63 9xx..."
                                    value={data.contact_number}
                                    onChange={e => setData('contact_number', e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={processing} className="w-full bg-stone-900 text-white font-black py-4 rounded-xl sm:rounded-[1.5rem] hover:bg-stone-800 disabled:opacity-50 transition-all mt-4 text-xs uppercase shadow-md active:scale-95">
                                {editMode ? 'Save Changes' : 'Register Barangay'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </AdminLayout>
    );
}