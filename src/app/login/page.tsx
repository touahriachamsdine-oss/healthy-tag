'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Globe } from 'lucide-react';

export default function LoginPage() {
    const { t, language, setLanguage } = useSettings();
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
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-['Outfit']">
            {/* STUNNING VISUAL FOUNDATION */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />

            <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 animate-fade-in">

                {/* LEFT SIDE: BRAND EXPERIENCE */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-indigo-600 to-blue-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 shadow-xl">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
                            Secure <br />Intelligence.
                        </h2>
                        <p className="text-indigo-100 text-lg font-medium max-w-xs leading-relaxed opacity-80">
                            National-grade cold chain monitoring and real-time compliance analytics.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-500 bg-indigo-400" />
                            ))}
                        </div>
                        <p className="text-sm font-bold text-indigo-100 uppercase tracking-widest">
                            Trusted by Institutions
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </div>

                {/* RIGHT SIDE: AUTHENTICATION FORM */}
                <div className="p-8 lg:p-20 bg-[var(--soft-bg-card)]">
                    <div className="max-w-md mx-auto">

                        {/* Header & Language Toggle */}
                        <div className="flex items-center justify-between mb-12">
                            <div className="lg:hidden flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="font-black text-xl tracking-tighter text-[var(--soft-text-main)]">Healthy Tag</span>
                            </div>

                            <div className="flex gap-2">
                                {['en', 'fr', 'ar'].map((lng) => (
                                    <button
                                        key={lng}
                                        onClick={() => setLanguage(lng as any)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${language === lng
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                    >
                                        {lng}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-3xl font-black text-[var(--soft-text-main)] tracking-tight mb-3">
                                Welcome Back
                            </h1>
                            <p className="text-[var(--soft-text-sub)] font-medium">
                                {t('signInDesc')}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-[0.2em] pl-1">
                                    {t('email')}
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-muted)] group-focus-within:text-indigo-600 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-[var(--soft-text-main)] outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                                        placeholder="admin@healthytag.dz"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between pl-1">
                                    <label className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-[0.2em]">
                                        {t('password')}
                                    </label>
                                    <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline transition-all">
                                        {t('forgotPassword')}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--soft-text-muted)] group-focus-within:text-indigo-600 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-[var(--soft-text-main)] outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
                                >
                                    <span className="text-md font-black tracking-wide">
                                        {isLoading ? t('processing') : t('signIn')}
                                    </span>
                                    {!isLoading && <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />}
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-3 opacity-50">
                            <ShieldCheck size={16} className="text-[var(--soft-text-muted)]" />
                            <span className="text-[10px] font-black text-[var(--soft-text-sub)] uppercase tracking-widest">
                                {t('securityNotice')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
