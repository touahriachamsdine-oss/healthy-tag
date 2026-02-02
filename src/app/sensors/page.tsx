'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
                        const isHealthy = device.healthStatus === 'HEALTHY';

                        return (
                            <div key={device.id} className={`bg-white rounded-[28px] p-6 shadow-sm transition-all hover:shadow-xl border-2 ${isHealthy ? 'border-transparent' : 'border-rose-100 bg-rose-50/20'}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${isLive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <Radio size={28} className={isLive ? 'animate-pulse' : ''} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--soft-text-main)] font-mono text-lg">{device.deviceId}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {isLive ? t('online') : t('offline')}
                                                </span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest ${isHealthy ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {isHealthy ? 'HEALTHY' : 'ALERT'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {isLive && (
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[var(--soft-bg-inner)] rounded-[20px] p-5 flex flex-col items-center justify-center gap-1 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-sm transition-all">
                                        <Thermometer size={16} className="text-indigo-400" />
                                        <span className="text-2xl font-black text-[var(--soft-text-main)] tracking-tighter">{device.lastTempValue?.toFixed(1) || '--'}°</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('temp')}</span>
                                    </div>
                                    <div className="bg-[var(--soft-bg-inner)] rounded-[20px] p-5 flex flex-col items-center justify-center gap-1 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-sm transition-all">
                                        <Droplets size={16} className="text-blue-400" />
                                        <span className="text-2xl font-black text-[var(--soft-text-main)] tracking-tighter">{device.lastHumidityValue?.toFixed(0) || '--'}%</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('hum')}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 font-medium">
                                    <div className="flex items-center justify-between text-[11px] text-[var(--soft-text-sub)] bg-[var(--soft-bg-inner)] px-5 py-3 rounded-2xl">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="opacity-60" />
                                            <span>Synced</span>
                                        </div>
                                        <span suppressHydrationWarning className="font-bold">
                                            {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                        </span>
                                    </div>

                                    <Link
                                        href={`/devices?id=${device.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-2xl text-[11px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all uppercase tracking-widest shadow-sm"
                                    >
                                        Inspect Telemetry
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </Stack>
        </AppShell>
    );
}
