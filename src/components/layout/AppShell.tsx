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
        <div
            className="flex min-h-screen bg-[var(--bg-body)] text-[var(--soft-text-main)] transition-colors duration-300 overflow-x-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Sidebar - Fixed Position */}
            <aside
                className={`
                    fixed inset-y-0 z-[3000] w-[var(--sidebar-width)]
                    transition-all duration-300 ease-in-out
                    ${isRTL ? 'right-0 border-l border-[var(--border-subtle)]' : 'left-0 border-r border-[var(--border-subtle)]'}
                `}
            >
                <Sidebar
                    userRole={user?.role}
                    userName={`${user?.firstName || 'User'} ${user?.lastName || ''}`}
                    scopeName={scopeName}
                    isEmbedded={true}
                />
            </aside>

            {/* Main Content Area */}
            <main
                className={`
                    flex-1 min-w-0 flex flex-col relative z-0 box-border
                    transition-all duration-300 ease-in-out
                `}
                style={{
                    [isRTL ? 'paddingRight' : 'paddingLeft']: 'var(--sidebar-width)',
                }}
            >
                <div className="w-full max-w-[var(--max-content-width)] mx-auto p-6 md:p-10 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
