'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Activity, Radio, Wifi, WifiOff, Thermometer, Droplets, Clock } from 'lucide-react';
import { Stack } from '@/components/layout/Stack';

export default function SensorsPage() {
    const { t } = useSettings();
    const [user, setUser] = useState<any>(null);
    const [devices, setDevices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const userRes = await fetch('/api/auth/me');
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
            }

            const devicesRes = await fetch('/api/dashboard/devices?limit=100');
            if (devicesRes.ok) {
                const data = await devicesRes.json();
                setDevices(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch sensors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, []);

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    return (
        <AppShell user={user}>
            <Stack gap={8} className="pb-32">

                {/* Header */}
                <header className="flex flex-col gap-2 mb-4">
                    <h1 className="text-3xl font-bold text-[var(--soft-text-main)] flex items-center gap-3">
                        <Activity className="text-[var(--soft-primary)]" />
                        {t('sensorState')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        Real-time telemetry and connectivity status.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {devices.map((device) => {
                        const lastSeen = device.lastSeenAt ? new Date(device.lastSeenAt).getTime() : 0;
                        const now = Date.now();
                        const diffMins = (now - lastSeen) / 60000;
                        const isLive = diffMins < 5; // Considered "Live" if seen in last 5 mins

                        return (
                            <div key={device.id} className={`bg-white rounded-[24px] p-6 shadow-sm transition-all hover:shadow-md border border-transparent ${isLive ? 'hover:border-emerald-200' : 'hover:border-red-100'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${isLive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <Radio size={24} className={isLive ? 'animate-pulse' : ''} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--soft-text-main)] font-mono">{device.deviceId}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {isLive ? t('online') : t('offline')}
                                            </span>
                                        </div>
                                    </div>
                                    {isLive && (
                                        <span className="flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[var(--soft-bg-inner)] rounded-[16px] p-4 flex flex-col items-center justify-center gap-2">
                                        <Thermometer size={18} className="text-[var(--soft-text-sub)]" />
                                        <span className="text-xl font-bold text-[var(--soft-text-main)]">{device.lastTempValue?.toFixed(1) || '--'}°C</span>
                                    </div>
                                    <div className="bg-[var(--soft-bg-inner)] rounded-[16px] p-4 flex flex-col items-center justify-center gap-2">
                                        <Droplets size={18} className="text-[var(--soft-text-sub)]" />
                                        <span className="text-xl font-bold text-[var(--soft-text-main)]">{device.lastHumidityValue?.toFixed(0) || '--'}%</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-[var(--soft-text-sub)] font-medium bg-[var(--soft-bg-inner)] px-4 py-3 rounded-[12px]">
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>Last seen:</span>
                                    </div>
                                    <span suppressHydrationWarning>
                                        {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleTimeString() : 'Never'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Stack>
        </AppShell>
    );
}
