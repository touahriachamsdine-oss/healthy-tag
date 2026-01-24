'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
    const { t, theme, setTheme, setLanguage, language } = useSettings();

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
                ${isEmbedded ? '' : 'w-[var(--sidebar-width)] fixed inset-y-0 left-0 z-[3000]'}
            `}
        >
            {/* Inner Container for "Card" feel */}
            <div className="flex-1 flex flex-col card-soft-inner !p-4 !bg-[var(--soft-bg-inner)] !rounded-[var(--radius-inner)] h-full">

                {/* BRAND HEADER */}
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="icon-soft !w-10 !h-10 !bg-[var(--soft-primary)]">
                        <Thermometer size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--soft-text-main)] leading-none">Healthy Tag</h1>
                        <span className="text-[10px] font-semibold text-[var(--soft-text-sub)] uppercase">{scopeName || 'Enterprise'}</span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 overflow-y-auto space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-btn)] transition-all duration-200
                                    ${isActive
                                        ? 'bg-[var(--soft-bg-card)] text-[var(--soft-primary)] shadow-sm font-bold'
                                        : 'text-[var(--soft-text-sub)] hover:bg-[var(--soft-bg-badge)] hover:text-[var(--soft-text-main)]'
                                    }
                                `}
                            >
                                <item.icon
                                    size={18}
                                    className={isActive ? 'text-[var(--soft-primary)]' : 'text-[var(--soft-text-sub)]'}
                                />
                                <span className="text-sm">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER & CONTROLS */}
                <div className="mt-6 pt-6 border-t border-[var(--soft-text-sub)]/10 space-y-4">

                    {/* Theme Toggle */}
                    <div className="flex bg-[var(--soft-bg-card)] rounded-[var(--radius-btn)] p-1 shadow-sm">
                        <button onClick={() => setTheme('light')} className={`flex-1 flex items-center justify-center p-1.5 rounded-[4px] transition-all ${theme !== 'dark' && theme !== 'night' ? 'bg-[var(--soft-bg-inner)] text-[var(--soft-primary)]' : 'text-[var(--soft-text-sub)] hover:text-[var(--soft-text-main)]'}`}>
                            <Sun size={14} />
                        </button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 flex items-center justify-center p-1.5 rounded-[4px] transition-all ${theme === 'dark' ? 'bg-[var(--soft-bg-inner)] text-[var(--soft-primary)]' : 'text-[var(--soft-text-sub)] hover:text-[var(--soft-text-main)]'}`}>
                            <Moon size={14} />
                        </button>
                    </div>

                    {/* Language */}
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'fr' : language === 'fr' ? 'ar' : 'en')}
                        className="w-full py-2 bg-[var(--soft-bg-card)] rounded-[var(--radius-btn)] text-xs font-bold text-[var(--soft-text-sub)] shadow-sm hover:text-[var(--soft-primary)] transition-colors uppercase"
                    >
                        {language}
                    </button>

                    {/* USER PROFILE */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--soft-primary)] flex items-center justify-center text-white text-xs font-bold">
                            {userName ? userName.charAt(0) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[var(--soft-text-main)] truncate">{userName || 'User'}</p>
                            <p className="text-[10px] text-[var(--soft-text-sub)] truncate">{userRole || 'Admin'}</p>
                        </div>
                        <button className="text-[var(--soft-text-sub)] hover:text-red-500 transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
