import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import Swal from 'sweetalert2';
import {
    MapContainer, TileLayer, Marker, useMapEvents, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    RadioTower, Plus, Plug, SignalHigh, Cpu, X, Trash2,
    Settings, RotateCw, CheckCircle2, Wind, WifiOff, Building2
} from 'lucide-react';

// Leaflet Icon Fix for React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapFocusHandler({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

export default function Nodes({ nodesData, barangays }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // PERSISTENCE: Keeps nodes visible even during the 1s background reload
    const lastNodes = useRef(nodesData || []);
    if (nodesData && nodesData.length > 0) { lastNodes.current = nodesData; }
    const devices = lastNodes.current;

    const registerForm = useForm({
        id: '',
        name: '',
        location: '',
        latitude: 14.0748,
        longitude: 120.6793,
        barangay_id: ''
    });

    const editForm = useForm({
        id: '',
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        barangay_id: ''
    });

    // UPGRADED: 1-Second Database Polling with "Silent Sync" logic
    useEffect(() => {
        let isRefreshing = false;
        const dataPoller = setInterval(() => {
            if (isRefreshing) return;
            isRefreshing = true;

            router.reload({
                only: ['nodesData'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { isRefreshing = false; }
            });
        }, 1000); // Sync every 1 second

        return () => clearInterval(dataPoller);
    }, []);

    const notifySuccess = (msg) => {
        Swal.fire({
            title: 'Success',
            text: msg,
            icon: 'success',
            confirmButtonColor: '#1c1917',
            borderRadius: '1.5rem'
        });
    };

    const openEditModal = (device) => {
        editForm.setData({
            id: device.id,
            name: device.name,
            location: device.location,
            latitude: device.latitude,
            longitude: device.longitude,
            barangay_id: device.barangay_id || ''
        });
        setIsEditModalOpen(true);
    };

    const submitRegistration = (e) => {
        e.preventDefault();
        registerForm.post(route('admin.devices.store'), {
            onSuccess: () => {
                setIsModalOpen(false);
                registerForm.reset();
                notifySuccess('New sensor node deployed successfully.');
            },
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        editForm.patch(route('admin.devices.update', editForm.data.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                notifySuccess('Hardware configuration updated.');
            },
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Unregister Node?',
            text: `You are removing ${editForm.data.name} from the system.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#a8a29e',
            confirmButtonText: 'Yes, unregister',
            borderRadius: '1.5rem'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.devices.destroy', editForm.data.id), {
                    onSuccess: () => {
                        setIsEditModalOpen(false);
                        Swal.fire({ title: 'Removed', icon: 'success', confirmButtonColor: '#1c1917' });
                    },
                });
            }
        });
    };

    function RegisterLocationPicker() {
        useMapEvents({
            click(e) {
                registerForm.setData(prev => ({
                    ...prev,
                    latitude: e.latlng.lat.toFixed(6),
                    longitude: e.latlng.lng.toFixed(6)
                }));
            },
        });
        return registerForm.data.latitude ? <Marker position={[registerForm.data.latitude, registerForm.data.longitude]} /> : null;
    }

    function EditLocationPicker() {
        useMapEvents({
            click(e) {
                editForm.setData(prev => ({
                    ...prev,
                    latitude: e.latlng.lat.toFixed(6),
                    longitude: e.latlng.lng.toFixed(6)
                }));
            },
        });
        return editForm.data.latitude ? <Marker position={[editForm.data.latitude, editForm.data.longitude]} /> : null;
    }

    const availableBarangays = barangays || [];

    return (
        <AdminLayout>
            <Head title="Infrastructure Management" />

            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Sensor Devices</h1>
                    <p className="text-sm md:text-base text-stone-500 font-medium flex items-center gap-2 mt-1 md:mt-2">
                        <RadioTower size={16} className="text-emerald-500 shrink-0" /> Live infrastructure health & diagnostics
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto px-5 py-3 md:py-2.5 bg-stone-900 text-white text-sm font-bold rounded-full shadow-md hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={16} /> Add New Device
                </button>
            </div>

            {devices.length > 0 ? (
                <div className={`grid grid-cols-1 ${devices.length === 1 ? 'xl:grid-cols-1' : 'xl:grid-cols-2'} gap-4 md:gap-8`}>
                    {devices.map(device => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onSettingsClick={() => openEditModal(device)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-10 md:p-20 text-center border-2 border-dashed border-stone-200">
                    <Cpu size={48} className="mx-auto text-stone-300 mb-4" />
                    <h3 className="text-lg md:text-xl font-bold text-stone-400">No Hardware Found</h3>
                    <p className="text-sm text-stone-400 mt-1">Register your first sensor node to start monitoring.</p>
                </div>
            )}

            {/* PORTAL: REGISTRATION */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[85vh] sm:h-[550px] rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col lg:flex-row">
                        <div className="w-full h-48 sm:h-64 lg:h-full lg:w-3/5 relative shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200">
                            <MapContainer center={[14.0748, 120.6793]} zoom={14} zoomControl={false} className="h-full w-full">
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <RegisterLocationPicker />
                            </MapContainer>
                            <div className="absolute top-3 left-3 right-3 lg:hidden z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-center shadow-sm text-[10px] font-bold text-stone-600">
                                Tap map to set device location
                            </div>
                        </div>
                        <div className="w-full lg:w-2/5 h-full flex flex-col bg-white overflow-hidden">
                            <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 shrink-0">
                                <h3 className="text-lg sm:text-xl font-black text-stone-900">Register Node</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-1.5 sm:p-2 hover:bg-stone-200 rounded-full text-stone-500"><X size={18} /></button>
                            </div>
                            <form onSubmit={submitRegistration} className="p-5 sm:p-8 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
                                <div>
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Serial ID</label>
                                    <input type="text" className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" placeholder="NODE-001" value={registerForm.data.id} onChange={e => registerForm.setData('id', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Assign Barangay</label>
                                    <select
                                        className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow"
                                        value={registerForm.data.barangay_id}
                                        onChange={e => registerForm.setData('barangay_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Location...</option>
                                        {availableBarangays.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Device Name</label>
                                    <input type="text" className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" placeholder="Brgy 7 Sensor" value={registerForm.data.name} onChange={e => registerForm.setData('name', e.target.value)} required />
                                </div>
                                <div className="pb-2">
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Specific Location</label>
                                    <input type="text" className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" placeholder="Covered Court" value={registerForm.data.location} onChange={e => registerForm.setData('location', e.target.value)} required />
                                </div>
                                <button type="submit" disabled={registerForm.processing} className="w-full bg-stone-900 text-white text-sm font-black py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg flex items-center justify-center gap-2 sm:gap-3 hover:bg-stone-800 disabled:opacity-50 mt-2 sm:mt-4 transition-colors">
                                    Confirm Registration <CheckCircle2 size={18} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* PORTAL: EDIT SETTINGS */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[85vh] sm:h-[550px] rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col lg:flex-row">
                        <div className="w-full h-48 sm:h-64 lg:h-full lg:w-3/5 relative shrink-0 border-b lg:border-b-0 lg:border-r border-stone-200">
                            <MapContainer center={[editForm.data.latitude || 14.0748, editForm.data.longitude || 120.6793]} zoom={15} zoomControl={false} className="h-full w-full">
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                <MapFocusHandler center={[editForm.data.latitude, editForm.data.longitude]} />
                                <EditLocationPicker />
                            </MapContainer>
                            <div className="absolute top-3 left-3 right-3 lg:hidden z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-xl text-center shadow-sm text-[10px] font-bold text-stone-600">
                                Tap map to update device location
                            </div>
                        </div>
                        <div className="w-full lg:w-2/5 h-full flex flex-col bg-white overflow-hidden">
                            <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 shrink-0">
                                <div>
                                    <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">Edit Node</h3>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{editForm.data.id}</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 sm:p-2 hover:bg-stone-200 rounded-full text-stone-500"><X size={18} /></button>
                            </div>
                            <form onSubmit={submitUpdate} className="p-5 sm:p-8 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
                                <div>
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Assigned Barangay</label>
                                    <select
                                        className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow"
                                        value={editForm.data.barangay_id}
                                        onChange={e => editForm.setData('barangay_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Location...</option>
                                        {availableBarangays.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Friendly Name</label>
                                    <input type="text" className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 sm:mb-1.5 ml-1">Specific Location</label>
                                    <input type="text" className="w-full text-sm bg-stone-50 border border-stone-200 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-stone-900 transition-shadow" value={editForm.data.location} onChange={e => editForm.setData('location', e.target.value)} required />
                                </div>
                                <div className="flex flex-col gap-2.5 sm:gap-3 pt-2 sm:pt-4">
                                    <button type="submit" disabled={editForm.processing} className="w-full bg-stone-900 text-white text-sm font-black py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] shadow-lg hover:bg-stone-800 disabled:opacity-50 transition-all">
                                        Update Configuration
                                    </button>
                                    <button type="button" onClick={handleDelete} className="w-full bg-rose-50 text-rose-600 text-sm font-bold py-3 sm:py-4 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors">
                                        Unregister Device <Trash2 size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AdminLayout>
    );
}

function DeviceCard({ device, onSettingsClick }) {
    const isOffline = device.status === 'offline';

    // MATCHED WITH TELEMETRY CONTROLLER SCHEMA
    const aqi = device.sensors?.aqi ?? 0;
    const heat = device.sensors?.heat ?? 0;

    const isWarning = !isOffline && (aqi > 100 || heat > 38);
    const [isReloading, setIsReloading] = useState(false);

    const handleManualSync = () => {
        setIsReloading(true);
        router.reload({
            only: ['nodesData'],
            preserveScroll: true,
            onFinish: () => setTimeout(() => setIsReloading(false), 600)
        });
    };

    return (
        <div className={`bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_4px_25px_rgba(0,0,0,0.03)] border p-5 sm:p-7 flex flex-col relative overflow-hidden group ${isOffline ? 'border-stone-300 bg-stone-50/50' : 'border-stone-200/60'}`}>
            {isOffline && <div className="absolute top-0 right-0 w-full h-full bg-stone-100/30 pointer-events-none z-20"></div>}

            <div className="flex flex-row justify-between items-start mb-4 sm:mb-6 relative z-10 gap-3">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                    <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 ${isOffline ? 'bg-stone-200 text-stone-500' : (isWarning ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600')}`}>
                        {isOffline ? <WifiOff size={20} className="sm:w-7 sm:h-7" /> : <Cpu size={20} className="sm:w-7 sm:h-7 animate-pulse" strokeWidth={2} />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                            <h2 className={`text-lg sm:text-xl font-black tracking-tight truncate ${isOffline ? 'text-stone-500' : 'text-stone-900'}`}>{device.name}</h2>
                            <span className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded text-[9px] sm:text-[10px] font-bold text-stone-500 font-mono shrink-0">{device.id}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold text-stone-500 truncate">
                             <Building2 size={12} className="sm:w-3.5 sm:h-3.5 text-stone-400 shrink-0" />
                             <span className="truncate">{device.barangay_name || 'Unassigned'} • {device.location}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                    <span className={`text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-md border ${isOffline ? 'bg-stone-200 text-stone-600 border-stone-300' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>{isOffline ? 'OFFLINE' : 'ONLINE'}</span>
                </div>
            </div>

            <div className={`grid grid-cols-2 gap-px rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 border relative z-10 ${isOffline ? 'bg-stone-300 border-stone-300 opacity-70' : 'bg-stone-200 border-stone-200'}`}>
                <div className={`${isOffline ? 'bg-stone-100' : 'bg-stone-50'} p-3 sm:p-4 text-center`}>
                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Air Quality</span>
                    <strong className={`text-xl sm:text-2xl font-black ${isOffline ? 'text-stone-400' : (aqi > 100 ? 'text-rose-600' : 'text-stone-800')}`}>{isOffline ? '--' : Math.round(aqi)}</strong>
                </div>
                <div className={`${isOffline ? 'bg-stone-100' : 'bg-stone-50'} p-3 sm:p-4 text-center`}>
                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-0.5 sm:mb-1">Heat Index</span>
                    <strong className={`text-xl sm:text-2xl font-black ${isOffline ? 'text-stone-400' : (heat > 38 ? 'text-amber-600' : 'text-stone-800')}`}>{isOffline ? '--' : Number(heat).toFixed(1)}{!isOffline && '°C'}</strong>
                </div>
            </div>

            <div className="mb-4 sm:mb-6 relative z-10">
                <h3 className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 sm:mb-3 pl-1 text-center font-mono">Hardware Component Health</h3>
                <div className="space-y-1.5 sm:space-y-2">
                    {device.components?.map((comp, idx) => (
                        <div key={idx} className={`flex justify-between items-center p-2.5 sm:p-3 rounded-lg sm:rounded-xl border ${isOffline ? 'border-stone-200 bg-stone-100' : 'border-stone-100 bg-white'}`}>
                            <span className={`text-[10px] sm:text-xs font-bold ${isOffline ? 'text-stone-400' : 'text-stone-700 uppercase tracking-tight'}`}>{comp.name}</span>
                            {comp.status === 'ok' && !isOffline ? (
                                <span className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-1 rounded-md border border-emerald-100"><CheckCircle2 size={10} className="sm:w-3 sm:h-3"/> <span className="hidden sm:inline">Operating</span></span>
                            ) : (
                                <span className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase text-stone-500 bg-stone-200 px-1.5 sm:px-2 py-1 rounded-md"><WifiOff size={10} className="sm:w-3 sm:h-3"/> <span className="hidden sm:inline">Lost Link</span></span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-auto pt-4 sm:pt-6 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex flex-row gap-3 sm:gap-6 w-full sm:w-auto">
                    <div className={`flex-1 sm:flex-none ${isOffline ? 'opacity-50' : ''}`}>
                        <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Power Source</span>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-stone-800 bg-stone-100 px-2 py-1.5 sm:py-1 rounded-md border border-stone-200">
                            <Plug size={12} className={`sm:w-3.5 sm:h-3.5 ${isOffline ? 'text-stone-500' : 'text-emerald-600'}`} />
                            <strong className="text-[9px] sm:text-[11px] font-black truncate">
                                {isOffline ? 'No Power' : 'Grid AC'}
                            </strong>
                        </div>
                    </div>
                    <div className={`flex-1 sm:flex-none ${isOffline ? 'opacity-50' : ''}`}>
                        <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Signal</span>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 text-stone-800 bg-stone-100 px-2 py-1.5 sm:py-1 rounded-md border border-stone-200">
                            <SignalHigh size={12} className={`sm:w-3.5 sm:h-3.5 ${isOffline ? 'text-stone-500' : 'text-blue-600'}`} />
                            <strong className="text-[9px] sm:text-[11px] font-black">
                                Link ({device.signal || 92}%)
                            </strong>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                    <button
                        onClick={onSettingsClick}
                        className="flex-1 sm:flex-none p-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-stone-900 shadow-sm transition-all hover:border-stone-400 flex justify-center"
                        title="Hardware Settings"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={handleManualSync}
                        disabled={isReloading}
                        className="flex-1 sm:flex-none p-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:text-amber-600 shadow-sm transition-all hover:border-amber-200 disabled:opacity-50 flex justify-center"
                        title="Manual Telemetry Sync"
                    >
                        <RotateCw size={18} className={isReloading ? 'animate-spin text-amber-600' : ''} />
                    </button>
                </div>
            </div>
        </div>
    );
}