'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Thermometer,
    Map as MapIcon,
    Bell,
    FileText,
    Building2,
    Users,
    Settings,
    LogOut,
    Sun,
    Moon,
    Shield,
    Languages,
    Activity
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface SidebarProps {
    userRole?: string;
    userName?: string;
    scopeName?: string;
    isEmbedded?: boolean;
}

export default function Sidebar({ userRole, userName, scopeName, isEmbedded = false }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { t, theme, setTheme, setLanguage, language } = useSettings();

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', { method: 'POST' });
            if (res.ok) {
                router.push('/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, path: '/dashboard', label: t('dashboard') },
        { id: 'sensors', icon: Activity, path: '/sensors', label: t('sensors') },
        { id: 'devices', icon: Thermometer, path: '/devices', label: t('devices') },
        { id: 'map', icon: MapIcon, path: '/map', label: t('map') },
        { id: 'alerts', icon: Bell, path: '/alerts', label: t('alerts') },
        { id: 'reports', icon: FileText, path: '/reports', label: t('reports') },
        { id: 'facilities', icon: Building2, path: '/facilities', label: t('facilities') },
        { id: 'users', icon: Users, path: '/users', label: t('users') },
        { id: 'settings', icon: Settings, path: '/settings', label: t('settings') },
    ];

    return (
        <div
            className={`
                h-full flex flex-col p-4
                bg-[var(--soft-bg-card)]
                transition-all duration-300
                ${isEmbedded ? '' : 'w-[var(--sidebar-width)] fixed inset-y-0 z-[3000]'}
                ${language === 'ar' ? 'rtl' : 'ltr'}
            `}
        >
            {/* Inner Container for "Card" feel */}
            <div className="flex-1 flex flex-col card-soft-inner !p-4 !bg-[var(--soft-bg-inner)] !rounded-[var(--radius-inner)] h-full border-0 shadow-inner">

                {/* BRAND HEADER */}
                <div className="flex items-center gap-4 mb-10 px-2 mt-2">
                    <div className="icon-soft !w-12 !h-12 !bg-[var(--soft-primary)] !rounded-2xl shadow-lg shadow-indigo-500/20">
                        <Thermometer size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-[var(--soft-text-main)] tracking-tight leading-tight">Healthy Tag</h1>
                        <div className="flex items-center gap-1.5">
                            <Shield size={10} className="text-[var(--soft-primary)]" />
                            <span className="text-[10px] font-bold text-[var(--soft-text-sub)] uppercase tracking-widest">{scopeName || 'Enterprise'}</span>
                        </div>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`
                                    flex items-center gap-3.5 px-4 py-3.5 rounded-[var(--radius-btn)] transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-[var(--soft-bg-card)] text-[var(--soft-primary)] shadow-sm font-bold border-l-4 border-[var(--soft-primary)]'
                                        : 'text-[var(--soft-text-sub)] hover:bg-[var(--soft-bg-badge)] hover:text-[var(--soft-primary)]'
                                    }
                                    ${isActive && language === 'ar' ? 'border-l-0 border-r-4' : ''}
                                `}
                            >
                                <item.icon
                                    size={20}
                                    className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[var(--soft-primary)]' : 'text-[var(--soft-text-muted)] group-hover:text-[var(--soft-primary)]'}`}
                                />
                                <span className="text-[15px] tracking-wide">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER & CONTROLS */}
                <div className="mt-8 pt-6 border-t border-[var(--soft-text-muted)]/20 space-y-5">

                    {/* Quick Settings Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Theme Toggle */}
                        <div className="flex bg-[var(--soft-bg-card)] rounded-[var(--radius-btn)] p-1 shadow-sm border border-[var(--border-subtle)]">
                            <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${theme !== 'dark' && theme !== 'night' ? 'bg-[var(--soft-bg-inner)] text-[var(--soft-primary)] shadow-sm' : 'text-[var(--soft-text-muted)] hover:text-[var(--soft-text-main)]'}`}>
                                <Sun size={16} />
                            </button>
                            <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-[var(--soft-bg-inner)] text-[var(--soft-primary)] shadow-sm' : 'text-[var(--soft-text-muted)] hover:text-[var(--soft-text-main)]'}`}>
                                <Moon size={16} />
                            </button>
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'fr' : language === 'fr' ? 'ar' : 'en')}
                            className="flex items-center justify-center gap-2 py-2 bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-btn)] text-xs font-bold text-[var(--soft-text-main)] shadow-sm hover:border-[var(--soft-primary)] hover:text-[var(--soft-primary)] transition-all uppercase"
                        >
                            <Languages size={14} />
                            {language}
                        </button>
                    </div>

                    {/* USER PROFILE */}
                    <div className="flex items-center gap-4 bg-[var(--soft-bg-card)] p-3 rounded-[var(--radius-inner)] border border-[var(--border-subtle)] shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--soft-primary)] to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/20">
                            {userName ? userName.charAt(0) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--soft-text-main)] truncate leading-none mb-1">{userName || 'User'}</p>
                            <p className="text-[11px] font-medium text-[var(--soft-text-sub)] truncate uppercase tracking-tighter opacity-80">{userRole || 'Administrator'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-[var(--soft-text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
