'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { Users, UserPlus, Search, Mail, Shield, ChevronRight } from 'lucide-react';

export default function UsersPage() {
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
                        Team Management
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        Control access permissions and user roles.
                    </p>
                </header>

                <div className="card-soft">
                    <div className="card-soft-inner min-h-[500px] flex flex-col">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className={`absolute top-1/2 -translate-y-1/2 text-[var(--soft-text-sub)] ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                <input
                                    type="text"
                                    placeholder="Find team members..."
                                    className={`w-full h-12 bg-white rounded-[var(--radius-btn)] border border-transparent focus:border-[var(--soft-primary)] outline-none text-[var(--soft-text-main)] transition-colors shadow-sm ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                />
                            </div>
                            <button className="btn-soft px-6 h-12">
                                <UserPlus size={18} />
                                <span className="text-sm font-semibold">Invite User</span>
                            </button>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {[
                                { name: 'John Doe', email: 'john@healthytag.dz', role: 'Super Admin', scope: 'National', status: 'Online' },
                                { name: 'Sarah Ahmed', email: 'sarah@healthytag.dz', role: 'Manager', scope: 'Alger', status: 'Offline' },
                            ].map((member, i) => (
                                <div key={i} className="flex items-center p-4 bg-white rounded-[12px] shadow-sm hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-[var(--soft-bg-badge)] text-[var(--soft-text-main)] flex items-center justify-center font-bold text-sm mr-4">
                                        {member.name.charAt(0)}
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="md:col-span-2">
                                            <p className="font-bold text-[var(--soft-text-main)]">{member.name}</p>
                                            <p className="text-xs text-[var(--soft-text-sub)]">{member.email}</p>
                                        </div>

                                        <div>
                                            <span className="badge-soft !text-[10px] uppercase !py-1 !px-2">{member.role}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${member.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className="text-xs font-medium text-[var(--soft-text-sub)]">{member.status}</span>
                                        </div>
                                    </div>

                                    <button className="w-8 h-8 flex items-center justify-center text-[var(--soft-text-sub)] hover:text-[var(--soft-primary)] transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
