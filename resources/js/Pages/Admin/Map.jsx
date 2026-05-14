import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import {
    Map as MapIcon, Wind, ThermometerSun, Navigation, X, SignalHigh, Plug
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// FALLBACK: Only used if database is empty
const NASUGBU_CENTER = [14.0748, 120.6793];

/**
 * CAMERA ENGINE: Handles smooth transitions.
 * Prevents "auto-snapping" while exploring by using a manual recenter trigger.
 */
function MapController({ activeNode, activeNodeId, devicesCenter, recenterTrigger }) {
    const map = useMap();
    const lastFocusedId = useRef(null);
    const lastTrigger = useRef(0);

    useEffect(() => {
        // 1. PIN FOCUS: Move camera only if a NEW node is selected
        if (activeNode && activeNodeId !== lastFocusedId.current) {
            const isMobile = window.innerWidth < 768;
            const latOffset = isMobile ? 0.003 : 0.0015;

            const targetLat = parseFloat(activeNode.latitude) + latOffset;
            const targetLng = parseFloat(activeNode.longitude);

            if (!isNaN(targetLat)) {
                map.flyTo([targetLat, targetLng], 15, { animate: true, duration: 1.2 });
                lastFocusedId.current = activeNodeId;
            }
        }

        // 2. MANUAL RECENTER: Only snaps back when the Navigation button is clicked
        if (recenterTrigger > lastTrigger.current) {
            map.flyTo(devicesCenter, 13, { animate: true, duration: 1.5 });
            lastTrigger.current = recenterTrigger;
            lastFocusedId.current = null;
        }
    }, [activeNode, activeNodeId, devicesCenter, recenterTrigger, map]);

    return null;
}

export default function LiveMap({ nodesData }) {
    const [activeNodeId, setActiveNodeId] = useState(null);
    const [activeLayer, setActiveLayer] = useState('aqi');
    const [recenterTrigger, setRecenterTrigger] = useState(0);

    // PERSISTENCE: Keeps markers visible during background AJAX syncs
    const lastNodes = useRef(nodesData || []);
    if (nodesData && nodesData.length > 0) { lastNodes.current = nodesData; }

    // COORDINATE GUARD: Filters out nodes with missing GPS data
    const nodes = useMemo(() => {
        return lastNodes.current.filter(n =>
            n.latitude !== null &&
            n.longitude !== null &&
            !isNaN(parseFloat(n.latitude))
        );
    }, [lastNodes.current]);

    // DYNAMIC CENTERING: Calculates the average middle point of all hardware
    const devicesCenter = useMemo(() => {
        if (nodes.length === 0) return NASUGBU_CENTER;
        const avgLat = nodes.reduce((sum, n) => sum + parseFloat(n.latitude), 0) / nodes.length;
        const avgLng = nodes.reduce((sum, n) => sum + parseFloat(n.longitude), 0) / nodes.length;
        return [avgLat, avgLng];
    }, [nodes]);

    // 1-Second Background Sync (Silent AJAX)
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
        }, 30000);
        return () => clearInterval(dataPoller);
    }, []);

    const liveActiveNode = nodes.find(n => n.id === activeNodeId);
    const isNodeOffline = liveActiveNode?.status === 'offline' || liveActiveNode?.isOffline;

    const getCeramicPin = (node) => {
        const isSelected = activeNodeId === node.id;
        const isOffline = node.status === 'offline' || node.isOffline;
        let color = isOffline ? 'bg-stone-400' : (activeLayer === 'aqi'
            ? (node.aqi > 100 ? 'bg-rose-600' : (node.aqi > 50 ? 'bg-amber-500' : 'bg-emerald-600'))
            : (node.heat_index > 38 ? 'bg-rose-600' : (node.heat_index > 32 ? 'bg-amber-500' : 'bg-emerald-600'))
        );

        return L.divIcon({
            className: 'clear-marker',
            html: `<div class="w-4 h-4 rounded-full ${color} ring-[3px] ring-white shadow-md ${isSelected ? 'scale-125 ring-offset-2' : ''} transition-all duration-300"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    return (
        <AdminLayout>
            <Head title="Deployment Map" />

            <div className="mb-6 md:mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 px-1">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight leading-none uppercase">Live Map</h1>
                    <p className="text-sm md:text-base text-stone-500 font-medium flex items-center gap-2 mt-2">
                        <MapIcon size={16} className="text-stone-400 shrink-0" /> Interactive hardware deployment and spatial monitoring
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-sm border border-stone-200/60 relative h-[calc(100vh-13rem)] md:h-[calc(100vh-16rem)] overflow-hidden">
                <MapContainer
                    center={devicesCenter}
                    zoom={13}
                    zoomControl={false}
                    attributionControl={false}
                    style={{ height: '100%', width: '100%', backgroundColor: '#F7F7F5' }}
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

                    <MapController
                        activeNode={liveActiveNode}
                        activeNodeId={activeNodeId}
                        devicesCenter={devicesCenter}
                        recenterTrigger={recenterTrigger}
                    />

                    {nodes.map(node => (
                        <Marker
                            key={node.id}
                            position={[parseFloat(node.latitude), parseFloat(node.longitude)]}
                            icon={getCeramicPin(node)}
                            eventHandlers={{ click: () => setActiveNodeId(node.id) }}
                        />
                    ))}
                </MapContainer>

                {/* LEGEND: Term updated to "Safe" for system consistency */}
                <div className="absolute bottom-6 left-4 z-[400] bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-stone-200 w-40 md:w-44 pointer-events-none">
                    <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2 border-b pb-1.5">{activeLayer === 'aqi' ? 'AQI Levels' : 'Heat Exposure'}</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="text-[10px] font-bold text-stone-700">Safe Range</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-[10px] font-bold text-stone-700">Warning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-600"></div>
                            <span className="text-[10px] font-bold text-stone-700">Danger</span>
                        </div>
                        <div className="flex items-center gap-2 border-t pt-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-stone-400"></div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Offline</span>
                        </div>
                    </div>
                </div>

                {/* LAYER CONTROLS */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3">
                    <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg border border-stone-200 flex flex-col gap-1">
                        <button onClick={() => setActiveLayer('aqi')} className={`p-3 rounded-xl transition-all ${activeLayer === 'aqi' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-800'}`}><Wind size={20} /></button>
                        <button onClick={() => setActiveLayer('heat')} className={`p-3 rounded-xl transition-all ${activeLayer === 'heat' ? 'bg-amber-500 text-white shadow-md' : 'text-stone-400 hover:text-stone-800'}`}><ThermometerSun size={20} /></button>
                    </div>
                    <button
                        onClick={() => { setActiveNodeId(null); setRecenterTrigger(prev => prev + 1); }}
                        className="bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg border border-stone-200 text-stone-600 hover:text-stone-900 transition-all"
                    >
                        <Navigation size={20} />
                    </button>
                </div>

                {/* SIDE PANEL */}
                {liveActiveNode && (
                    <div className="fixed md:absolute bottom-0 left-0 right-0 md:bottom-auto md:top-6 md:left-6 md:right-auto z-[1001] w-full md:w-80 bg-white/95 backdrop-blur-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl border md:border border-stone-200 overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="px-6 py-5 flex justify-between items-start border-b border-stone-100">
                            <div className="min-w-0 flex-1 pr-2">
                                <h3 className="text-xl font-black text-stone-900 uppercase truncate leading-tight">{liveActiveNode.name}</h3>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1 truncate">{liveActiveNode.location}</p>
                            </div>
                            <button onClick={() => setActiveNodeId(null)} className="p-2 bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                             <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl text-center border bg-stone-50 border-stone-100 shadow-inner">
                                    <span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">AQI Status</span>
                                    <strong className={`text-2xl font-black ${isNodeOffline ? 'text-stone-300' : (liveActiveNode.aqi > 100 ? 'text-rose-600' : 'text-stone-800')}`}>{isNodeOffline ? '--' : (liveActiveNode.aqi || 0)}</strong>
                                </div>
                                <div className="p-4 rounded-2xl text-center border bg-stone-50 border-stone-100 shadow-inner">
                                    <span className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Heat Index</span>
                                    <strong className={`text-2xl font-black ${isNodeOffline ? 'text-stone-300' : (liveActiveNode.heat_index > 38 ? 'text-amber-600' : 'text-stone-800')}`}>{isNodeOffline ? '--' : Number(liveActiveNode.heat_index || 0).toFixed(1)}°C</strong>
                                </div>
                             </div>
                             <div className="pt-4 border-t border-stone-100 space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-stone-400 uppercase tracking-widest text-[9px] font-black">Link Stability</span>
                                    <div className="flex items-center gap-1.5">
                                        <SignalHigh size={12} className={isNodeOffline ? 'text-stone-300' : 'text-blue-500'} />
                                        <span className={`text-xs font-black ${isNodeOffline ? 'text-stone-400' : 'text-stone-800'}`}>
                                            {isNodeOffline ? '0%' : (liveActiveNode.signal || 92) + '% Strength'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-stone-400 uppercase tracking-widest text-[9px] font-black">Power Grid</span>
                                    <div className="flex items-center gap-1.5">
                                        <Plug size={12} className={isNodeOffline ? 'text-stone-300' : 'text-emerald-500'} />
                                        <span className={`text-xs font-black ${isNodeOffline ? 'text-stone-400' : 'text-stone-800'}`}>
                                            {isNodeOffline ? 'No Power' : (liveActiveNode.powerSource || 'Main Infrastructure')}
                                        </span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}