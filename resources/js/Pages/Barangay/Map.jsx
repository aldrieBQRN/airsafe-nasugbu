import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import BarangayLayout from '../../Layouts/BarangayLayout';
import {
    Map as MapIcon, Layers, ThermometerSun, Wind,
    AlertTriangle, X, Navigation, Cpu, SignalHigh, Plug, CheckCircle2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function LocalMap({ nodesData }) {
    const [activeNode, setActiveNode] = useState(null);
    const [activeLayer, setActiveLayer] = useState('aqi'); // 'aqi' or 'heat'

    // Simulated node data filtered specifically for Barangay 7
    const nodes = nodesData || [
        {
            id: 'NODE-002',
            name: 'Brgy 7 Sensor',
            location: 'Poblacion Covered Court',
            position: [14.0694, 120.6351],
            aqi: 112,
            heat_index: 39,
            status: 'Danger',
            signal: 92,
            power: 'Grid AC',
            details: 'MQ136 triggered! High concentration of hazardous gas detected.'
        }
    ];

    // Center map specifically on Barangay 7
    const mapCenter = [14.0694, 120.6351];

    // Dynamic Pin that changes size if it is selected, and color based on danger level
    const getCeramicPin = (node) => {
        const isSelected = activeNode?.id === node.id;

        let color = 'bg-emerald-600';
        let pulse = 'bg-emerald-400';

        if (node.aqi > 100) { color = 'bg-rose-600'; pulse = 'bg-rose-400'; }
        else if (node.aqi > 50) { color = 'bg-amber-500'; pulse = 'bg-amber-400'; }

        const size = isSelected ? 'w-5 h-5' : 'w-4 h-4';
        const ring = isSelected ? 'ring-4' : 'ring-[3px]';

        return L.divIcon({
            className: 'clear-marker',
            html: `
                <div class="relative flex items-center justify-center w-8 h-8 transition-all duration-300">
                    <div class="absolute inset-0 rounded-full opacity-40 animate-ping ${pulse}"></div>
                    <div class="${size} rounded-full ${color} ${ring} ring-white shadow-md z-10 transition-all duration-300"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

    return (
        <BarangayLayout brgyName="Brgy. 7 (Poblacion)">
            <Head title="Local Sensor Map | AirSafe" />

            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">Barangay Area Map</h1>
                    <p className="text-sm sm:text-base text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <MapIcon size={16} className="text-stone-400" /> Interactive local sensor tracking for Barangay 7
                    </p>
                </div>
            </div>

            {/* Massive Map Container */}
            <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-stone-200/60 flex flex-col relative h-[calc(100vh-14rem)] min-h-[500px] overflow-hidden">

                {/* Floating Map Controls (Top Right) */}
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-[400] flex flex-col gap-3">
                    <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-[1.5rem] shadow-lg border border-stone-200/80 flex flex-col gap-1">
                        <button
                            onClick={() => setActiveLayer('aqi')}
                            className={`p-3 rounded-xl transition-all flex items-center justify-center group ${activeLayer === 'aqi' ? 'bg-stone-900 text-white shadow-md' : 'bg-transparent text-stone-400 hover:text-stone-800 hover:bg-stone-100'}`}
                            title="Air Quality Layer"
                        >
                            <Wind size={20} className={activeLayer === 'aqi' ? '' : 'group-hover:scale-110 transition-transform'} />
                        </button>
                        <button
                            onClick={() => setActiveLayer('heat')}
                            className={`p-3 rounded-xl transition-all flex items-center justify-center group ${activeLayer === 'heat' ? 'bg-amber-500 text-white shadow-md' : 'bg-transparent text-stone-400 hover:text-stone-800 hover:bg-stone-100'}`}
                            title="Heat Index Layer"
                        >
                            <ThermometerSun size={20} className={activeLayer === 'heat' ? '' : 'group-hover:scale-110 transition-transform'} />
                        </button>
                    </div>

                    <button
                        className="bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg border border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all flex items-center justify-center"
                        title="Recenter Map"
                    >
                        <Navigation size={20} />
                    </button>
                </div>

                {/* Floating Node Details Panel (Appears on click) */}
                {activeNode && (
                    <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-auto z-[400] sm:w-80 bg-white/95 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-stone-200/80 flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-300">

                        {/* Panel Header */}
                        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-100 flex justify-between items-start bg-stone-50/50">
                            <div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 sm:mb-3 border ${activeNode.status === 'Danger' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                    {activeNode.status === 'Danger' ? <AlertTriangle size={10} strokeWidth={3}/> : <CheckCircle2 size={10} strokeWidth={3}/>}
                                    {activeNode.status}
                                </span>
                                <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">{activeNode.name}</h3>
                                <p className="text-[10px] sm:text-xs font-bold text-stone-400 mt-1">{activeNode.location}</p>
                            </div>
                            <button onClick={() => setActiveNode(null)} className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Telemetry Data */}
                        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-sm">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Air Quality</span>
                                    <strong className={`text-2xl sm:text-3xl font-black tracking-tighter ${activeNode.aqi > 100 ? 'text-rose-600' : 'text-stone-800'}`}>{activeNode.aqi}</strong>
                                </div>
                                <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-sm">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">Heat Index</span>
                                    <strong className="text-2xl sm:text-3xl font-black tracking-tighter text-amber-500">{activeNode.heat_index}°</strong>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-stone-100">
                                <p className="text-[11px] sm:text-xs font-medium text-stone-600 leading-relaxed">
                                    {activeNode.details}
                                </p>
                            </div>

                            {/* Hardware Status */}
                            <div className="pt-3 sm:pt-4 border-t border-stone-100">
                                <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 sm:mb-3">Hardware Connection</span>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white border border-stone-200 rounded-xl p-2.5 sm:p-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <SignalHigh size={14} className="text-blue-500" />
                                            <span className="text-[10px] sm:text-xs font-bold text-stone-700">Cellular Link</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-black text-stone-900">{activeNode.signal}%</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white border border-stone-200 rounded-xl p-2.5 sm:p-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Plug size={14} className="text-emerald-500" />
                                            <span className="text-[10px] sm:text-xs font-bold text-stone-700">Power Source</span>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-black text-stone-900">{activeNode.power}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="px-5 sm:px-6 py-3 sm:py-4 bg-stone-900">
                            <button className="w-full py-2.5 sm:py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl text-[10px] sm:text-xs font-bold transition-colors flex items-center justify-center gap-2">
                                <Cpu size={14} /> View Hardware Diagnostics
                            </button>
                        </div>
                    </div>
                )}

                {/* Leaflet Map Layer */}
                <div className="w-full h-full relative z-0">
                    <MapContainer center={mapCenter} zoom={15} zoomControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%', backgroundColor: '#F7F7F5' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap" />

                        {nodes.map(node => (
                            <Marker
                                key={node.id}
                                position={node.position}
                                icon={getCeramicPin(node)}
                                eventHandlers={{
                                    click: () => setActiveNode(node),
                                }}
                            />
                        ))}
                    </MapContainer>
                </div>
            </div>
        </BarangayLayout>
    );
}