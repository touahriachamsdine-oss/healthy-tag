'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import {
    Users, Plus, Search, Shield, MapPin,
    Mail, User as UserIcon, X, Check,
    AlertCircle, ChevronDown, MoreVertical, Trash2, Edit
} from 'lucide-react';

export default function UsersPage() {
    const { t } = useSettings();
    const [user, setUser] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [wilayas, setWilayas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'WILAYA_ADMIN',
        wilayaId: ''
    });

    const fetchData = async () => {
        try {
            const [userRes, usersRes, wilayasRes] = await Promise.all([
                fetch('/api/auth/me'),
                fetch('/api/users'),
                fetch('/api/wilayas')
            ]);

            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
            }

            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData.data);
            }

            if (wilayasRes.ok) {
                const wilayasData = await wilayasRes.json();
                setWilayas(wilayasData.data);
            }
        } catch (error) {
            console.error('Failed to fetch users data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                setNewUser({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    role: 'WILAYA_ADMIN',
                    wilayaId: ''
                });
                fetchData();
            } else {
                setError(data.error || 'Failed to create user');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.firstName.toLowerCase().includes(search.toLowerCase()) ||
        u.lastName.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    return (
        <AppShell user={user}>
            <div className="space-y-8 pb-32">
                {/* HERO */}
                <header className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-[var(--soft-text-main)]">
                        {t('users')}
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        {t('manageUsers')}
                    </p>
                </header>

                <div className="card-soft">
                    <div className="card-soft-inner min-h-[500px] flex flex-col">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-sub)]" size={18} />
                                <input
                                    type="text"
                                    placeholder={t('searchDevices')}
                                    className="w-full h-12 bg-[var(--soft-bg-card)] rounded-[var(--radius-btn)] border border-[var(--border-subtle)] focus:border-[var(--soft-primary)] outline-none pl-12 pr-4 text-[var(--soft-text-main)] transition-colors shadow-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={() => setShowAddModal(true)}
                                className="btn-soft px-8 h-12"
                            >
                                <Plus size={18} />
                                <span className="font-semibold text-sm">{t('addRegionalAdmin')}</span>
                            </button>
                        </div>

                        {/* User List */}
                        <div className="bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-inner)] shadow-sm overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[var(--soft-bg-inner)] text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest">
                                <div className="col-span-4">{t('admin')}</div>
                                <div className="col-span-3">{t('roleScope')}</div>
                                <div className="col-span-3">{t('contact')}</div>
                                <div className="col-span-1 text-center">{t('status')}</div>
                                <div className="col-span-1"></div>
                            </div>

                            <div className="divide-y divide-[var(--border-subtle)]">
                                {filteredUsers.map((u) => (
                                    <div key={u.id} className="grid grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-[var(--soft-bg-inner)]/40 transition-colors">
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-[var(--soft-primary-light)] flex items-center justify-center text-[var(--soft-primary)]">
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--soft-text-main)] text-sm">{u.firstName} {u.lastName}</p>
                                                <p className="text-[10px] text-[var(--soft-text-sub)] font-mono uppercase">{u.id.substring(0, 8)}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex flex-col">
                                                <span className="badge-soft self-start !py-1 !px-2 mb-1 !text-[var(--soft-primary)] !border-[var(--soft-primary)]/20">
                                                    {u.role === 'SUPER_ADMIN' ? t('systemAdmin') : u.role === 'WILAYA_ADMIN' ? t('regionalAdmin') : t('localAdmin')}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--soft-text-sub)]">
                                                    <MapPin size={10} />
                                                    {u.wilaya?.name || 'National Scope'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2 text-xs text-[var(--soft-text-main)]">
                                                <Mail size={12} className="text-[var(--soft-text-muted)]" />
                                                <span className="font-medium">{u.email}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-1 flex justify-center">
                                            {u.isActive ? (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                                            )}
                                        </div>

                                        <div className="col-span-1 flex justify-end">
                                            <button className="p-2 hover:bg-[var(--soft-bg-inner)] rounded-lg text-[var(--soft-text-muted)]">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* ADD USER MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                    <div className="bg-[var(--soft-bg-card)] border border-[var(--border-subtle)] rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in">
                        <div className="px-10 py-8 border-b border-[var(--border-subtle)] flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[var(--soft-text-main)]">{t('registerNewAdmin')}</h3>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-[var(--soft-bg-inner)] flex items-center justify-center text-[var(--soft-text-sub)] hover:text-red-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-10 space-y-6">
                            {error && (
                                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 border border-rose-500/20 italic">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest px-1">{t('firstName')}</label>
                                    <input required type="text" className="w-full h-12 bg-[var(--soft-bg-inner)] rounded-2xl px-5 text-sm font-semibold text-[var(--soft-text-main)] border-2 border-transparent focus:border-[var(--soft-primary)] outline-none transition-all" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest px-1">{t('lastName')}</label>
                                    <input required type="text" className="w-full h-12 bg-[var(--soft-bg-inner)] rounded-2xl px-5 text-sm font-semibold text-[var(--soft-text-main)] border-2 border-transparent focus:border-[var(--soft-primary)] outline-none transition-all" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest px-1">{t('email')}</label>
                                <input required type="email" className="w-full h-12 bg-[var(--soft-bg-inner)] rounded-2xl px-5 text-sm font-semibold text-[var(--soft-text-main)] border-2 border-transparent focus:border-[var(--soft-primary)] outline-none transition-all" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest px-1">{t('password')}</label>
                                <input required type="password" placeholder="••••••••" className="w-full h-12 bg-[var(--soft-bg-inner)] rounded-2xl px-5 text-sm font-semibold text-[var(--soft-text-main)] border-2 border-transparent focus:border-[var(--soft-primary)] outline-none transition-all" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest px-1">Role</label>
                                    <div className="relative">
                                        <select className="appearance-none w-full h-12 bg-[var(--soft-bg-inner)] rounded-2xl px-5 text-sm font-bold text-[var(--soft-text-main)] outline-none cursor-pointer" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}>
                                            <option value="WILAYA_ADMIN">{t('regionalAdmin')}</option>
                                            <option value="BALADIYA_ADMIN">{t('localAdmin')}</option>
                                            <option value="SUPER_ADMIN">{t('systemAdmin')}</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-sub)] pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {newUser.role !== 'SUPER_ADMIN' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest px-1">{t('assignedRegion')}</label>
                                        <div className="relative">
                                            <select required={newUser.role !== 'SUPER_ADMIN'} className="appearance-none w-full h-12 bg-[var(--soft-bg-inner)] rounded-2xl px-5 text-sm font-bold text-[var(--soft-text-main)] outline-none cursor-pointer" value={newUser.wilayaId} onChange={e => setNewUser({ ...newUser, wilayaId: e.target.value })}>
                                                <option value="">{t('select')}</option>
                                                {wilayas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-sub)] pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl text-sm font-bold text-[var(--soft-text-sub)] hover:bg-[var(--soft-bg-inner)] transition-colors">{t('cancel')}</button>
                                <button type="submit" disabled={isSaving} className="flex-[2] h-14 bg-[var(--soft-primary)] text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-50">
                                    {isSaving ? t('processing') : t('registerAdmin')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
