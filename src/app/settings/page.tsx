'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import {
    Moon, Sun, Languages, Shield, User,
    Lock, Check, Globe, Layout, Palette,
    Monitor, ChevronRight, Save, Key,
    CreditCard, Bell, RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
    const { t, language, setLanguage, theme, setTheme } = useSettings();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('appearance');

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

    const sidebarItems = [
        { id: 'profile', icon: User, label: t('profile') },
        { id: 'appearance', icon: Palette, label: t('appearance') },
        { id: 'security', icon: Lock, label: t('security') },
    ];

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    return (
        <AppShell user={user}>
            <div className="max-w-6xl mx-auto pb-32">

                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-[var(--soft-text-main)] tracking-tight">
                        {t('platformConfig')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)] mt-2 font-medium">
                        {t('preferences')}
                    </p>
                </header>

                <div className="grid grid-cols-12 gap-8">

                    {/* Settings Sidebar */}
                    <aside className="col-span-12 lg:col-span-3 space-y-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`
                                    w-full flex items-center justify-between p-4 rounded-2xl transition-all
                                    ${activeSection === item.id
                                        ? 'bg-[var(--soft-primary)] text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-[var(--soft-text-sub)] hover:bg-[var(--soft-bg-badge)]'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} />
                                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                                </div>
                                {activeSection === item.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <main className="col-span-12 lg:col-span-9">

                        {activeSection === 'profile' && (
                            <div className="card-soft animate-fade-in">
                                <div className="card-soft-inner !p-8">
                                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                        <User className="text-[var(--soft-primary)]" />
                                        {t('profile')}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1">{t('firstName')}</label>
                                            <div className="p-4 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-2xl font-bold text-sm text-[var(--soft-text-main)] shadow-sm">
                                                {user?.firstName}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1">{t('lastName')}</label>
                                            <div className="p-4 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-2xl font-bold text-sm text-[var(--soft-text-main)] shadow-sm">
                                                {user?.lastName}
                                            </div>
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1">{t('email')}</label>
                                            <div className="p-4 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-2xl font-bold text-sm text-[var(--soft-text-main)] shadow-sm">
                                                {user?.email}
                                            </div>
                                        </div>
                                        <div className="col-span-full space-y-2">
                                            <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1">{t('roleScope')}</label>
                                            <div className="flex items-center gap-2">
                                                <span className="badge-soft !bg-[var(--soft-primary-light)] !text-[var(--soft-primary)] !border-[var(--soft-primary)]/20">
                                                    {user?.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="card-soft animate-fade-in">
                                <div className="card-soft-inner !p-8">
                                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                        <Palette className="text-[var(--soft-primary)]" />
                                        {t('appearance')}
                                    </h3>

                                    {/* Theme Grid */}
                                    <div className="mb-10">
                                        <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1 mb-4 block">
                                            {t('visualAesthetic')}
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'light', label: t('light'), icon: Sun, color: 'bg-white' },
                                                { id: 'dark', label: t('dark'), icon: Moon, color: 'bg-slate-900' },
                                                { id: 'night', label: t('night'), icon: Monitor, color: 'bg-black' }
                                            ].map((m) => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setTheme(m.id as any)}
                                                    className={`
                                                        p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group
                                                        ${theme === m.id
                                                            ? 'bg-[var(--soft-bg-card)] border-[var(--soft-primary)] shadow-xl scale-[1.02]'
                                                            : 'bg-transparent border-[var(--border-subtle)] hover:border-[var(--soft-primary)]/40 hover:scale-[1.01]'}
                                                    `}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl ${m.color} flex items-center justify-center shadow-inner`}>
                                                        <m.icon className={theme === m.id ? 'text-white' : 'text-slate-400'} size={20} />
                                                    </div>
                                                    <span className="text-sm font-black tracking-wide uppercase">{m.label}</span>
                                                    {theme === m.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--soft-primary)] animate-pulse" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Language Section */}
                                    <div>
                                        <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1 mb-4 block">
                                            {t('language')}
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { id: 'en', label: 'English', flag: '🇬🇧' },
                                                { id: 'fr', label: 'Français', flag: '🇫🇷' },
                                                { id: 'ar', label: 'العربية', flag: '🇩🇿' }
                                            ].map((l) => (
                                                <button
                                                    key={l.id}
                                                    onClick={() => setLanguage(l.id as any)}
                                                    className={`
                                                        px-6 py-3 rounded-2xl border-2 font-bold text-sm transition-all flex items-center gap-3
                                                        ${language === l.id
                                                            ? 'bg-[var(--soft-primary)] text-white border-[var(--soft-primary)] shadow-lg shadow-indigo-500/20'
                                                            : 'bg-[var(--soft-bg-card)] border-[var(--border-subtle)] text-[var(--soft-text-main)] hover:border-[var(--soft-primary)]/40'}
                                                    `}
                                                >
                                                    <span className="text-lg">{l.flag}</span>
                                                    {l.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="card-soft animate-fade-in">
                                <div className="card-soft-inner !p-8">
                                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                        <Lock className="text-[var(--soft-primary)]" />
                                        {t('security')}
                                    </h3>

                                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                                <Shield size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-[var(--soft-text-main)]">{t('accountProtection')}</p>
                                                <p className="text-xs text-[var(--soft-text-sub)]">{t('securityNotice')}</p>
                                            </div>
                                        </div>
                                        <button className="btn-soft !bg-rose-500 hover:!bg-rose-600 px-6 py-3 whitespace-nowrap">
                                            {t('resetPassword')}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Key size={18} className="text-[var(--soft-text-sub)]" />
                                                <span className="text-sm font-bold">Two-Factor Authentication</span>
                                            </div>
                                            <div className="w-12 h-6 bg-[var(--soft-bg-badge)] rounded-full relative">
                                                <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <CreditCard size={18} className="text-[var(--soft-text-sub)]" />
                                                <span className="text-sm font-bold">Regional Access Tokens</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-emerald-500">Generated</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </AppShell>
    );
}
