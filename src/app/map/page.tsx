'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Layers, Info } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

// Layout Primitives (Used for consistent structure)
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/layout/Card';
import { Row } from '@/components/layout/Row';

// Legend Component
function MapLegend() {
    const { t } = useSettings();
    return (
        <div className="absolute bottom-6 left-6 z-[1000] bg-[var(--soft-bg-card)]/90 backdrop-blur-md p-4 rounded-[var(--radius-outer)] border border-[var(--border-subtle)] shadow-xl w-64">
            <h4 className="text-[10px] font-black text-[var(--soft-text-main)] uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                <Layers size={14} className="text-indigo-600" /> {t('networkStatus')}
            </h4>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--soft-text-sub)]">{t('healthy')} (<span className="text-emerald-500">2°C-8°C</span>)</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--soft-text-sub)]">{t('warnings')} ({t('deviation')})</span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--soft-text-sub)]">{t('critical')} ({t('unsafe')})</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--soft-text-sub)]">{t('offlineNoData')}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-start gap-2 text-[10px] text-[var(--soft-text-muted)] leading-relaxed font-medium">
                    <Info size={12} className="shrink-0 mt-0.5 text-indigo-400" />
                    <span>{t('mapLegendInfo')}</span>
                </div>
            </div>
        </div>
    );
}

const DeviceMap = dynamic(() => import('@/components/DeviceMap'), {
    ssr: false,
    loading: () => <div className="h-full bg-[var(--bg-body)] flex items-center justify-center rounded-2xl"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>,
});

export default function MapPage() {
    const { t } = useSettings();
    const [user, setUser] = useState<any>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }

                const mapRes = await fetch('/api/dashboard/map');
                if (mapRes.ok) {
                    const mapData = await mapRes.json();
                    setMarkers(mapData.data);
                }
            } catch (error) {
                console.error('Failed to fetch map data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <AppShell user={user}>
            <div className="flex flex-col h-[calc(100vh-theme(spacing.8))] gap-[var(--space-6)]">
                {/* Header */}
                <Row justify="between" align="center" className="shrink-0 mb-4">
                    <Row gap={4}>
                        <Link href="/dashboard" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] text-[var(--soft-text-sub)] hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--soft-text-main)] tracking-tight leading-none">{t('map')}</h2>
                            <p className="text-[10px] font-black text-[var(--soft-text-muted)] uppercase tracking-widest mt-2">
                                <span className="text-indigo-600">{markers.length}</span> {t('activeMarkers')}
                            </p>
                        </div>
                    </Row>

                    <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-[var(--soft-bg-card)] rounded-full border border-[var(--border-subtle)] shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-[var(--soft-text-main)] uppercase tracking-[0.1em]">{t('liveGPSFeed')}</span>
                    </div>
                </Row>

                {/* Map Container */}
                <Card padding={0} className="flex-1 min-h-0 overflow-hidden relative border border-[var(--border-subtle)] rounded-[var(--radius-outer)] shadow-xl bg-[var(--soft-bg-inner)]">
                    <DeviceMap markers={markers} height="100%" />
                    <MapLegend />
                </Card>
            </div>
        </AppShell>
    );
}
