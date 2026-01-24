'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from '@/lib/types';
import { Thermometer, Droplets, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

const createStatusIcon = (status: string) => {
    const colors: Record<string, { bg: string; border: string }> = {
        HEALTHY: { bg: '#10b981', border: '#059669' },
        WARNING: { bg: '#f59e0b', border: '#d97706' },
        NOT_HEALTHY: { bg: '#ef4444', border: '#dc2626' },
        OFFLINE: { bg: '#6b7280', border: '#4b5563' },
        UNKNOWN: { bg: '#6b7280', border: '#4b5563' },
    };

    const color = colors[status] || colors.UNKNOWN;

    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color.bg};
        border: 3px solid ${color.border};
        border-radius: 50%;
        box-shadow: 0 0 10px ${color.bg}80;
        position: relative;
      ">
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color.border};
        "></div>
      </div>
    `,
        iconSize: [24, 32],
        iconAnchor: [12, 32],
        popupAnchor: [0, -32],
    });
};

interface DeviceMapProps {
    markers: MapMarker[];
    center?: [number, number];
    zoom?: number;
    height?: string;
}

function MapController({ markers }: { markers: MapMarker[] }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const resizeObserver = new ResizeObserver(() => {
            try {
                map.invalidateSize();
            } catch (err) { }
        });

        const container = map.getContainer();
        resizeObserver.observe(container);

        if (markers.length > 0) {
            const updateBounds = () => {
                try {
                    if (map && (map as any)._mapPane) {
                        map.invalidateSize();
                        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                        if (bounds.isValid()) {
                            map.fitBounds(bounds, { padding: [40, 40], animate: false });
                        }
                    }
                } catch (err) { }
            };

            const timer = setTimeout(updateBounds, 300);
            return () => {
                clearTimeout(timer);
                resizeObserver.disconnect();
            };
        }

        return () => resizeObserver.disconnect();
    }, [markers, map]);

    return null;
}

export default function DeviceMap({
    markers,
    center = [28.0339, 1.6596],
    zoom = 5,
    height = '500px'
}: DeviceMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div
                className="bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ height }}
            >
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="leaflet-outer-container relative" style={{ height }}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
                scrollWheelZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapController markers={markers} />

                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={[marker.lat, marker.lng]}
                        icon={createStatusIcon(marker.status)}
                    >
                        <Popup className="premium-popup">
                            <div className="min-w-[200px] p-2 font-sans">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-black text-slate-800 text-sm tracking-tight truncate pr-2">
                                        {marker.facilityName || marker.deviceId}
                                    </h3>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                                        {marker.type}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Temp</p>
                                        <p className="text-sm font-black text-slate-800">{marker.temp !== null ? `${marker.temp.toFixed(1)}°C` : '--'}</p>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hum</p>
                                        <p className="text-sm font-black text-blue-600">{marker.humidity !== null ? `${marker.humidity.toFixed(0)}%` : '--'}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/devices/${marker.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10"
                                >
                                    Details <ExternalLink size={12} />
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Legend - Standardized with UI */}
            <div className="absolute bottom-6 right-6 z-[1000] bg-white rounded-xl p-4 shadow-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Live Status</p>
                <div className="space-y-2">
                    {[
                        { label: 'Healthy', color: 'bg-green-500' },
                        { label: 'Warning', color: 'bg-amber-500' },
                        { label: 'Critical', color: 'bg-red-500' },
                        { label: 'Offline', color: 'bg-slate-400' },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color} ring-4 ring-opacity-10 ring-current`} />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
