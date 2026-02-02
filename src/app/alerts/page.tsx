'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Bell, Filter, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function AlertsPage() {
    const { t, language } = useSettings();
    const isRTL = language === 'ar';
    const [user, setUser] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterSeverity, setFilterSeverity] = useState<string[]>(['CRITICAL', 'WARNING', 'INFO']);

    const fetchAlerts = async () => {
        try {
            const userRes = await fetch('/api/auth/me');
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
            }

            const alertsRes = await fetch('/api/alerts?limit=50');
            if (alertsRes.ok) {
                const data = await alertsRes.json();
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (alertId: string, action: string) => {
        try {
            const res = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId, action })
            });
            if (res.ok) fetchAlerts();
        } catch (error) {
            console.error('Alert action failed:', error);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return { icon: AlertOctagon, color: 'text-rose-500', bg: 'bg-rose-50' };
            case 'WARNING': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' };
            default: return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' };
        }
    };

    const filteredAlerts = alerts.filter(a => filterSeverity.includes(a.severity));

    return (
        <AppShell user={user}>
            <div className="space-y-8 pb-32">
                <header className="flex flex-col gap-2 mb-8">
                    <h1 className="text-4xl font-black text-[var(--soft-text-main)] tracking-tight">
                        {t('systemNotifications')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)] font-medium">
                        Live monitoring events and hardware exceptions.
                    </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 card-soft bg-[var(--soft-bg-inner)]">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-6">
                                <div className="flex items-center gap-3 text-[var(--soft-text-main)]">
                                    <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                                    <span className="text-xl font-bold">{t('activeAlerts')}</span>
                                    <span className="badge-soft px-3 py-1 text-xs">{filteredAlerts.length}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredAlerts.length > 0 ? (
                                    filteredAlerts.map((alert) => {
                                        const config = getIcon(alert.severity);
                                        return (
                                            <div key={alert.id} className="flex gap-5 p-5 bg-white rounded-[24px] shadow-sm border border-transparent hover:border-indigo-100 hover:shadow-md transition-all group">
                                                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center ${config.color} shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                                                    <config.icon size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-[var(--soft-text-main)] text-md leading-tight">{alert.title}</h4>
                                                            <p className="text-xs text-[var(--soft-text-sub)] mt-1 opacity-80">{alert.message}</p>
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--soft-text-muted)] whitespace-nowrap bg-slate-50 px-2 py-1 rounded-md">
                                                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                                                {alert.severity}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                NODE {alert.deviceId} • {alert.facilityName || 'National Storage'}
                                                            </span>
                                                        </div>
                                                        {alert.status === 'ACTIVE' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleAction(alert.id, 'acknowledge')}
                                                                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                                                                >
                                                                    Acknowledge
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(alert.id, 'resolve')}
                                                                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all"
                                                                >
                                                                    Resolve
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">No active alerts</h3>
                                        <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1">All monitoring nodes are operating within normal environmental parameters.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Filters Panel */}
                    <div className="card-soft h-fit">
                        <div className="card-soft-inner space-y-6">
                            <div className="flex items-center gap-2 font-bold text-[var(--soft-text-main)]">
                                <Filter size={18} />
                                <span>{t('filter')}</span>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-[var(--soft-text-sub)] uppercase mb-3 block">{t('severity')}</label>
                                <div className="space-y-2">
                                    {['critical', 'warnings', 'info'].map((sev) => (
                                        <label key={sev} className="flex items-center gap-3 p-2 bg-[var(--soft-bg-card)] rounded-[8px] cursor-pointer hover:bg-[var(--soft-bg-card)]/80 transition-colors">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[var(--soft-primary)] focus:ring-[var(--soft-primary)]" defaultChecked />
                                            <span className="text-sm font-medium text-[var(--soft-text-main)]">{t(sev)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-soft w-full">
                                {t('applyFilters')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
