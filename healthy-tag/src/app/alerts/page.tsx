'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Bell, Filter, CheckCircle2, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

export default function AlertsPage() {
    const { t, language } = useSettings();
    const isRTL = language === 'ar';
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    return (
        <AppShell user={user}>
            <div className="space-y-8 pb-32">

                {/* HERO */}
                <header className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-[var(--soft-text-main)]">
                        {t('systemNotifications')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        {t('systemNotificationsDesc')}
                    </p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Main Feed */}
                    <div className="xl:col-span-3 card-soft">
                        <div className="card-soft-inner min-h-[600px] flex flex-col">
                            <div className="flex items-center justify-between mb-6 border-b border-[var(--soft-text-sub)]/10 pb-4">
                                <div className="flex items-center gap-2 text-[var(--soft-text-main)] font-bold">
                                    <Bell size={20} className="text-[var(--soft-primary)]" />
                                    <span>{t('activeAlerts')}</span>
                                </div>
                                <button className="text-xs font-bold text-[var(--soft-text-sub)] hover:text-[var(--soft-primary)]">
                                    {t('markAllRead')}
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { level: 'critical', msg: 'Freezer #04 Temperature High (> -15°C)', time: '10 mins ago', icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-50' },
                                    { level: 'warnings', msg: 'Door Open Timeout - Unit #12', time: '25 mins ago', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                                    { level: 'info', msg: 'System Maintenance Scheduled', time: '2 hours ago', icon: Info, color: 'text-blue-500', bg: 'bg-blue-50' },
                                ].map((alert, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-[var(--soft-bg-card)] rounded-[12px] shadow-sm border-l-4 border-transparent hover:border-[var(--soft-primary)] transition-all">
                                        <div className={`w-10 h-10 rounded-full ${alert.bg} flex items-center justify-center ${alert.color} shrink-0`}>
                                            <alert.icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-[var(--soft-text-main)] text-sm">{alert.msg}</h4>
                                                <span className="text-[10px] uppercase font-bold text-[var(--soft-text-sub)]">{alert.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${alert.bg} ${alert.color}`}>
                                                    {t(alert.level)}
                                                </span>
                                                <span className="text-xs text-[var(--soft-text-sub)]">
                                                    • Mustapha Pacha Hospital
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
