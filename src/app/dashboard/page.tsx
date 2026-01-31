'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Thermometer, Activity, Zap, Wind, TrendingUp, Users, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
    const { t } = useSettings();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }
                const statsRes = await fetch('/api/dashboard/stats');
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        // Auto-refresh stats every 10 seconds
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    return (
        <AppShell user={user}>
            <div className="space-y-8 pb-32">

                {/* HERO */}
                <header className="flex flex-col gap-1 mb-10">
                    <h1 className="text-4xl font-extrabold text-[var(--soft-text-main)] tracking-tight">
                        {t('dashboardOverview')}
                    </h1>
                    <div className="flex items-center gap-2 text-[var(--soft-text-sub)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--soft-success)] animate-pulse" />
                        <p className="font-medium">{t('dashboardWelcome')}</p>
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: t('activeUnits'), value: (stats?.healthyDevices || 0) + (stats?.warningDevices || 0), icon: Activity, badge: t('live'), color: 'indigo' },
                        { label: t('totalDevices'), value: stats?.totalDevices || 0, icon: Thermometer, badge: t('total'), color: 'slate' },
                        { label: t('critical'), value: stats?.unhealthyDevices || 0, icon: Zap, badge: t('actionReq'), color: 'rose', highlight: true },
                        { label: t('warnings'), value: stats?.warningDevices || 0, icon: Wind, badge: t('warnings'), color: 'amber' },
                    ].map((stat, i) => (
                        <div key={i} className="card-soft group cursor-default">
                            <div className="flex flex-col gap-5 h-full relative z-10 transition-transform duration-300 group-hover:scale-[1.02]">
                                <div className="flex items-center justify-between">
                                    <div className={`icon-soft !w-12 !h-12 !rounded-2xl transition-colors duration-300 ${stat.highlight ? '!bg-rose-50 !text-rose-600' : ''}`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <span className={`badge-soft font-bold text-[10px] ${stat.highlight ? '!bg-rose-100 !text-rose-600 !border-rose-200' : ''}`}>
                                        {stat.badge}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-4xl font-bold text-[var(--soft-text-main)] tracking-tighter transition-all group-hover:tracking-normal">{stat.value}</p>
                                    <p className="text-sm font-bold text-[var(--soft-text-sub)] uppercase tracking-widest opacity-70">{stat.label}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="w-5 h-5 rounded-full border-2 border-[var(--soft-bg-card)] bg-[var(--soft-bg-badge)]" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-[var(--soft-text-muted)]">{t('dataVerified')}</span>
                                </div>
                            </div>
                            {/* Decorative background shape */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${stat.highlight ? 'bg-rose-600' : 'bg-indigo-600'}`} />
                        </div>
                    ))}
                </div>

                {/* ANALYTICS SECTION */}
                <div className="grid lg:grid-cols-12 gap-8 mt-12">
                    {/* Compliance Card */}
                    <div className="lg:col-span-8 card-soft !p-1 bg-gradient-to-br from-[var(--soft-primary)] via-indigo-600 to-indigo-800">
                        <div className="bg-[var(--soft-bg-card)] rounded-[var(--radius-inner)] h-full p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="bg-indigo-50 text-indigo-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-8 inline-block shadow-sm">
                                    {t('complianceRate')}
                                </span>
                                <div className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--soft-text-main)] to-[var(--soft-text-sub)] leading-none mb-6 tracking-tighter">
                                    {stats?.complianceRate || 98}%
                                </div>
                                <p className="text-lg text-[var(--soft-text-sub)] max-w-lg mx-auto font-medium leading-relaxed">
                                    {t('complianceText').replace('{count}', (stats?.deviceHealth?.critical || 0).toString())}
                                </p>

                                <div className="mt-10">
                                    <button onClick={() => router.push('/reports')} className="btn-soft px-10 py-4 text-md shadow-lg shadow-indigo-500/30">
                                        {t('viewPatternAnalysis')}
                                        <TrendingUp size={18} className="rtl:rotate-180" />
                                    </button>
                                </div>
                            </div>

                            {/* Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-black opacity-[0.02] pointer-events-none select-none">
                                {stats?.complianceRate || 98}%
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-4 card-soft bg-[var(--soft-bg-inner)]">
                        <div className="h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-[var(--soft-primary)] rounded-full" />
                                    <p className="text-xl font-bold text-[var(--soft-text-main)]">{t('recentActivity')}</p>
                                </div>
                                <button className="p-2 hover:bg-[var(--soft-bg-card)] rounded-xl transition-colors text-[var(--soft-text-muted)]">
                                    <Activity size={20} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <div key={i} className="flex items-start gap-4 group p-1 rounded-xl transition-all">
                                        <div className="icon-soft !w-10 !h-10 !bg-white !text-indigo-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
                                            <Thermometer size={18} />
                                        </div>
                                        <div className="flex-1 border-b border-[var(--border-subtle)] pb-4 group-last:border-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold text-[var(--soft-text-main)] group-hover:text-[var(--soft-primary)] transition-colors">{t('temperatureWarning')}</p>
                                                <span className="text-[10px] font-bold text-[var(--soft-text-muted)]">10:4{i} AM</span>
                                            </div>
                                            <p className="text-xs font-bold text-[var(--soft-text-sub)] opacity-80">{t('unit')} 102 • Wilaya Algiers</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Link href="/alerts" className="btn-soft !bg-[var(--soft-bg-card)] !text-indigo-600 border border-indigo-100 hover:!bg-indigo-50 w-full">
                                    {t('viewAllHistory')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
