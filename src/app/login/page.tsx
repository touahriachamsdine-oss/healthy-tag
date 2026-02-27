'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { t } = useSettings();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    router.push('/dashboard');
                } else {
                    setError(data.error || t('invalidCredentials'));
                }
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.error || t('invalidCredentials'));
            }
        } catch (err: any) {
            setError(t('systemError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-body)] relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--soft-primary)] opacity-[0.03] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 opacity-[0.05] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <div className="card-soft !p-2">
                    <div className="card-soft-inner !p-10">

                        {/* Logo / Header */}
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 bg-[var(--soft-primary-light)] rounded-3xl flex items-center justify-center text-[var(--soft-primary)] mb-6 shadow-inner">
                                <ShieldCheck size={32} />
                            </div>
                            <h1 className="text-3xl font-black text-[var(--soft-text-main)] tracking-tight mb-2">
                                Healthy Tag
                            </h1>
                            <p className="text-sm font-medium text-[var(--soft-text-sub)] uppercase tracking-[0.2em]">
                                {t('signInDesc')}
                            </p>
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-shake">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest pl-1">
                                    {t('email')}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-muted)]" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="input-soft !pl-12"
                                        placeholder="admin@healthytag.dz"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest">
                                        {t('password')}
                                    </label>
                                    <button type="button" className="text-[10px] font-black text-[var(--soft-primary)] uppercase tracking-widest hover:underline">
                                        {t('forgotPassword')}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-muted)]" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="input-soft !pl-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-soft w-full h-14 !rounded-2xl shadow-xl shadow-indigo-500/20 group"
                                >
                                    <span className="font-bold tracking-wide">{isLoading ? t('processing') : t('signIn')}</span>
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 pt-8 border-t border-[var(--border-subtle)] flex items-center justify-center gap-3 opacity-60">
                            <ShieldCheck size={14} className="text-[var(--soft-text-muted)]" />
                            <span className="text-[10px] font-bold text-[var(--soft-text-sub)] uppercase tracking-tighter">
                                {t('securityNotice')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
