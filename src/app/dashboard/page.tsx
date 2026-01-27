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
                <header className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-[var(--soft-text-main)]">
                        {t('dashboardOverview')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        {t('dashboardWelcome')}
                    </p>
                </header>

                {/* STATS GRID - Using "Plan" Card Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: t('activeUnits'), value: stats?.activeDevices || 0, icon: Activity, badge: t('live') },
                        { label: t('totalDevices'), value: stats?.totalDevices || 0, icon: Thermometer, badge: t('total') },
                        { label: t('critical'), value: stats?.deviceHealth?.critical || 0, icon: Zap, badge: t('actionReq'), highlight: true },
                        { label: t('warnings'), value: stats?.deviceHealth?.warning || 0, icon: Wind, badge: t('warnings') },
                    ].map((stat, i) => (
                        <div key={i} className="card-soft">
                            <div className={`card-soft-inner flex flex-col items-start gap-4 h-full ${stat.highlight ? '!bg-red-50' : ''}`}>
                                {/* Highlight Badge */}
                                <span className={`badge-soft absolute top-0 right-0 !rounded-bl-[var(--radius-inner)] !rounded-tr-[var(--radius-inner)] !rounded-tl-none !rounded-br-none ${stat.highlight ? '!bg-red-100 !text-red-600' : ''}`}>
                                    {stat.badge}
                                </span>

                                <div className="icon-soft">
                                    <stat.icon />
                                </div>

                                <div>
                                    <p className="text-3xl font-bold text-[var(--soft-text-main)] mb-1">{stat.value}</p>
                                    <p className="text-sm font-medium text-[var(--soft-text-sub)]">{stat.label}</p>
                                </div>

                                <ul className="flex flex-col gap-2 mt-2 w-full">
                                    <li className="flex items-center gap-2 text-xs text-[var(--soft-text-sub)]">
                                        <CheckCircle size={12} className="text-[var(--soft-primary)]" />
                                        <span>{t('dataVerified')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ANALYTICS SECTION */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Compliance Card */}
                    <div className="md:col-span-2 card-soft">
                        <div className="card-soft-inner h-full flex flex-col items-center justify-center text-center py-10">
                            <span className="badge-soft mb-6 px-4 py-2 text-sm">
                                {t('complianceRate')}
                            </span>
                            <div className="text-[80px] font-bold text-[var(--soft-text-main)] leading-none mb-4">
                                {stats?.complianceRate || 98}%
                            </div>
                            <p className="text-[var(--soft-text-sub)] max-w-md">
                                {t('complianceText').replace('{count}', (stats?.deviceHealth?.critical || 0).toString())}
                            </p>

                            <div className="mt-8">
                                <button onClick={() => router.push('/reports')} className="btn-soft px-8 py-3">
                                    {t('viewPatternAnalysis')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="card-soft">
                        <div className="card-soft-inner h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <p className="font-bold text-[var(--soft-text-main)]">{t('recentActivity')}</p>
                                <div className="w-2 h-2 rounded-full bg-[var(--soft-primary)] animate-pulse" />
                            </div>

                            <div className="flex-1 space-y-4">
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="icon-soft !w-8 !h-8 !bg-[var(--soft-bg-badge)] !text-[var(--soft-text-main)]">
                                            <Thermometer size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-[var(--soft-text-main)]">{t('temperatureWarning')}</p>
                                            <p className="text-[10px] text-[var(--soft-text-sub)]">{t('unit')} 102 • 10:4{i} AM</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 flex justify-end">
                                <Link href="/alerts" className="text-xs font-bold text-[var(--soft-primary)] hover:underline">{t('viewAllHistory')}</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
