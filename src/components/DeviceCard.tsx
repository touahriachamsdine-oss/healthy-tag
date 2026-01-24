'use client';

import {
    Thermometer,
    Droplets,
    MapPin,
    Clock,
    Server
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSettings } from '@/context/SettingsContext';
import { Card } from '@/components/layout/Card';
import { Row } from '@/components/layout/Row';
import { Stack } from '@/components/layout/Stack';

interface DeviceCardProps {
    device: any;
    onClick?: () => void;
}

const statusConfig = {
    HEALTHY: { label: 'Healthy', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
    WARNING: { label: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
    NOT_HEALTHY: { label: 'Critical', color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' },
    OFFLINE: { label: 'Offline', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
    UNKNOWN: { label: 'Unknown', color: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

export default function DeviceCard({ device, onClick }: DeviceCardProps) {
    const { t } = useSettings();
    // Default to unknown if status not found
    const status = statusConfig[device.healthStatus as keyof typeof statusConfig] || statusConfig.UNKNOWN;

    const tempColor = device.lastTempValue !== null
        ? device.lastTempValue > device.tempMax
            ? 'text-red-600'
            : device.lastTempValue < device.tempMin
                ? 'text-blue-600'
                : 'text-emerald-600'
        : 'text-[var(--text-muted)]';

    return (
        <Card
            padding={5}
            className={`cursor-pointer hover:shadow-md transition-all group bg-[var(--bg-surface)] hover:border-blue-200`}
        >
            <div onClick={onClick}>
                <Stack gap={5}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <Stack gap={1} className="min-w-0 flex-1">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit border ${status.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${device.healthStatus === 'NOT_HEALTHY' ? 'animate-pulse' : ''}`} />
                                {t(device.healthStatus?.toLowerCase() || 'offline')}
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] truncate leading-tight group-hover:text-blue-600 transition-colors pt-1">
                                {device.facility?.name || device.deviceId}
                            </h3>
                            {/* DEDICATED ID DISPLAY */}
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <Server size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                                    {device.deviceId}
                                </span>
                            </div>
                        </Stack>
                        <div className="shrink-0 w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-body)] flex items-center justify-center text-[var(--text-secondary)] text-lg">
                            {device.type === 'FRIDGE' ? '🧊' : '❄️'}
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-md)] border border-[var(--border-color)]">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5 mb-1">
                                <Thermometer size={12} /> Temp
                            </p>
                            <p className={`text-xl font-black ${tempColor} tabular-nums`}>
                                {device.lastTempValue !== null ? `${device.lastTempValue.toFixed(1)}°` : '--'}
                            </p>
                        </div>
                        <div className="p-3 bg-[var(--bg-body)] rounded-[var(--radius-md)] border border-[var(--border-color)]">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5 mb-1">
                                <Droplets size={12} /> Hum
                            </p>
                            <p className="text-xl font-black text-blue-600 tabular-nums">
                                {device.lastHumidityValue !== null ? `${device.lastHumidityValue.toFixed(0)}%` : '--'}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] truncate">
                            <MapPin size={14} className="text-[var(--text-muted)] shrink-0" />
                            <span className="truncate">{device.baladiya?.name || 'Unknown'}, {device.wilaya?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                            <Clock size={12} />
                            {device.lastSeenAt ? formatDistanceToNow(new Date(device.lastSeenAt), { addSuffix: true }) : 'Never'}
                        </div>
                    </div>
                </Stack>
            </div>
        </Card>
    );
}
