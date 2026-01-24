'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Building2, Plus, Search, MapPin, ChevronRight, Server } from 'lucide-react';

export default function FacilitiesPage() {
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
                        {t('facilitiesNetwork')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        {t('facilitiesDesc')}
                    </p>
                </header>

                {/* Facilities List (Using Soft Card Style) */}
                <div className="card-soft">
                    <div className="card-soft-inner min-h-[500px] flex flex-col">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className={`absolute top-1/2 -translate-y-1/2 text-[var(--soft-text-sub)] ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                <input
                                    type="text"
                                    placeholder={t('searchFacilities')}
                                    className={`w-full h-12 bg-[var(--soft-bg-card)] rounded-[var(--radius-btn)] border border-transparent focus:border-[var(--soft-primary)] outline-none text-[var(--soft-text-main)] transition-colors shadow-sm ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                />
                            </div>
                            <button className="btn-soft px-6 h-12">
                                <Plus size={18} />
                                <span className="text-sm font-semibold">{t('newFacility')}</span>
                            </button>
                        </div>

                        <div className="flex-1 space-y-4">
                            {[
                                { name: 'CHU Mustapha Pacha', type: 'hospital', location: "Sidi M'Hamed, Alger", status: 'active', badge: 'hub' },
                                { name: 'Pharmacie Centrale', type: 'warehouse', location: "Oran Centre, Oran", status: 'active', badge: 'storage' },
                                { name: 'EPH Rouiba', type: 'clinic', location: "Rouiba, Alger", status: 'warnings', badge: 'remote' },
                            ].map((fac, i) => (
                                <div key={i} className="flex items-center p-4 bg-[var(--soft-bg-card)] rounded-[12px] shadow-sm hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-[var(--soft-primary)]/20">
                                    {/* Icon */}
                                    <div className="icon-soft !w-12 !h-12 !bg-[var(--soft-bg-badge)] text-[var(--soft-text-main)] mr-4">
                                        <Building2 size={20} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[var(--soft-text-main)] text-lg">{fac.name}</h3>
                                                <span className="badge-soft !text-[10px] !py-1 !px-2 uppercase">{t(fac.badge)}</span>
                                            </div>
                                            <p className="text-xs text-[var(--soft-text-sub)] uppercase tracking-wider">{t(fac.type)}</p>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-[var(--soft-text-sub)]">
                                            <MapPin size={16} />
                                            {fac.location}
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${fac.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {t(fac.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-8 h-8 rounded-full bg-[var(--soft-bg-inner)] flex items-center justify-center text-[var(--soft-primary)]">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
