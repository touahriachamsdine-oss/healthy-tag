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
    return (
        <div className="absolute bottom-6 left-6 z-[1000] bg-[var(--bg-surface)]/90 backdrop-blur-md p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-xl w-64">
            <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers size={14} className="text-blue-500" /> Network Status
            </h4>
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Healthy (<span className="text-emerald-500 font-bold">2°C-8°C</span>)</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Warning (Deviation)</span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Critical (Unsafe)</span>
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Offline/No Data</span>
                    <span className="w-3 h-3 rounded-full bg-slate-400"></span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
                <div className="flex items-start gap-2 text-[10px] text-[var(--text-muted)] leading-relaxed">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    <span>Real-time telemetry update frequency: 15min. Click markers for detailed drill-down.</span>
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
    }, []);

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <AppShell user={user}>
            <div className="flex flex-col h-[calc(100vh-theme(spacing.8))] gap-[var(--space-6)]">
                {/* Header */}
                <Row justify="between" align="center" className="shrink-0">
                    <Row gap={4}>
                        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-body)] transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight leading-none">{t('map')}</h2>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">{markers.length} {t('activeMarkers')}</p>
                        </div>
                    </Row>

                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--bg-surface)] rounded-full border border-[var(--border-color)] shadow-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Live GPS Feed</span>
                    </div>
                </Row>

                {/* Map Container */}
                <Card padding={0} className="flex-1 min-h-0 overflow-hidden relative border border-[var(--border-color)]">
                    <DeviceMap markers={markers} height="100%" />
                    <MapLegend />
                </Card>
            </div>
        </AppShell>
    );
}
