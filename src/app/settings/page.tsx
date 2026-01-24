'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Moon, Sun, Languages, Shield, User, Bell, Lock } from 'lucide-react';

export default function SettingsPage() {
    const { t, language, setLanguage, theme, setTheme } = useSettings();
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

    const sections = [
        {
            title: t('profile') || 'Profile Settings',
            icon: User,
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--soft-text-sub)] uppercase">Full Name</label>
                        <div className="p-3 bg-white rounded-[8px] font-bold text-[var(--soft-text-main)] border border-transparent">
                            {user?.firstName} {user?.lastName}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[var(--soft-text-sub)] uppercase">Email Address</label>
                        <div className="p-3 bg-white rounded-[8px] font-bold text-[var(--soft-text-main)] border border-transparent">
                            {user?.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: t('appearance') || 'Appearance',
            icon: theme === 'dark' ? Moon : Sun,
            content: (
                <div className="flex gap-4">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 p-4 rounded-[12px] border-2 transition-all flex flex-col items-center gap-2 ${theme !== 'dark' && theme !== 'night' ? 'bg-white border-[var(--soft-primary)] shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                    >
                        <Sun size={24} className={theme !== 'dark' && theme !== 'night' ? 'text-[var(--soft-primary)]' : 'text-[var(--soft-text-sub)]'} />
                        <span className="text-xs font-bold">Light</span>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 p-4 rounded-[12px] border-2 transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'bg-white border-[var(--soft-primary)] shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                    >
                        <Moon size={24} className={theme === 'dark' ? 'text-[var(--soft-primary)]' : 'text-[var(--soft-text-sub)]'} />
                        <span className="text-xs font-bold">Dark</span>
                    </button>
                    <button
                        onClick={() => setTheme('night')}
                        className={`flex-1 p-4 rounded-[12px] border-2 transition-all flex flex-col items-center gap-2 ${theme === 'night' ? 'bg-white border-[var(--soft-primary)] shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                    >
                        <Shield size={24} className={theme === 'night' ? 'text-[var(--soft-primary)]' : 'text-[var(--soft-text-sub)]'} />
                        <span className="text-xs font-bold">Night</span>
                    </button>
                </div>
            )
        },
        {
            title: t('security') || 'Security',
            icon: Lock,
            content: (
                <div className="p-4 bg-red-50 rounded-[12px] border border-red-100 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-red-800 text-sm">Account Protection</p>
                        <p className="text-xs text-red-600">Password last changed 30 days ago.</p>
                    </div>
                    <button className="px-4 py-2 bg-white text-red-600 text-xs font-bold rounded-[6px] shadow-sm hover:bg-red-50 transition-colors">
                        Reset Password
                    </button>
                </div>
            )
        }
    ];

    return (
        <AppShell user={user}>
            <div className="space-y-8 pb-32">

                {/* HERO */}
                <header className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-[var(--soft-text-main)]">
                        Platform Configuration
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        Manage your preferences and security settings.
                    </p>
                </header>

                <div className="max-w-3xl space-y-6">
                    {sections.map((section, i) => (
                        <div key={i} className="card-soft">
                            <div className="card-soft-inner">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="icon-soft !bg-[var(--soft-bg-badge)] !text-[var(--soft-text-main)]">
                                        <section.icon size={14} />
                                    </div>
                                    <h2 className="text-lg font-bold text-[var(--soft-text-main)]">{section.title}</h2>
                                </div>
                                {section.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppShell>
    );
}
