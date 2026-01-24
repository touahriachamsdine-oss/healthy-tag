'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { useSettings } from '@/context/SettingsContext';

interface AppShellProps {
    children: React.ReactNode;
    user: any;
}

export function AppShell({ children, user }: AppShellProps) {
    const scopeName = user?.role === 'SUPER_ADMIN' ? 'National' : user?.wilaya || user?.baladiya;
    const { language } = useSettings();
    const isRTL = language === 'ar';

    return (
        <div className="flex min-h-screen bg-[var(--bg-body)] text-[var(--soft-text-main)] transition-colors duration-300">
            {/* Sidebar - Fixed Position */}
            <aside
                className={`
                    fixed inset-y-0 z-[3000] w-[var(--sidebar-width)] 
                    ${isRTL ? 'right-0' : 'left-0'}
                `}
            >
                <Sidebar
                    userRole={user?.role}
                    userName={`${user?.firstName || 'User'} ${user?.lastName || ''}`}
                    scopeName={scopeName}
                    isEmbedded={true}
                />
            </aside>

            {/* Main Content Area - Explicitly Padded via Tailwind */}
            <main
                className={`
                    flex-1 min-w-0 flex flex-col relative z-0 box-border
                    transition-all duration-300
                `}
                style={{
                    marginLeft: isRTL ? 0 : '280px',
                    marginRight: isRTL ? '280px' : 0
                }}
            >
                <div className="w-full max-w-[var(--max-content-width)] mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
