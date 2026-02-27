'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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

    const isRTL = language === 'ar';

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Language Picker */}
                <div className="flex justify-center gap-3 mb-8">
                    {['en', 'fr', 'ar'].map((lng) => (
                        <button
                            key={lng}
                            onClick={() => setLanguage(lng as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all border ${language === lng
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                                : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                        >
                            {lng}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                            Healthy Tag
                        </h1>
                        <p className="text-sm font-medium text-slate-500">
                            {t('signInDesc')}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                {t('email')}
                            </label>
                            <div className="relative group">
                                <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
                                <input
                                    type="email"
                                    required
                                    className={`w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl ${isRTL ? 'pr-14 pl-5' : 'pl-14 pr-5'} text-sm font-bold text-slate-700 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm`}
                                    placeholder="admin@healthytag.dz"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {t('password')}
                                </label>
                                <button type="button" className="text-[10px] font-black text-indigo-600 uppercase hover:underline">
                                    {t('forgotPassword')}
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors`} size={18} />
                                <input
                                    type="password"
                                    required
                                    className={`w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl ${isRTL ? 'pr-14 pl-5' : 'pl-14 pr-5'} text-sm font-bold text-slate-700 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm`}
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
                                className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 group"
                            >
                                <span className="font-bold tracking-wide">
                                    {isLoading ? t('processing') : t('signIn')}
                                </span>
                                {!isLoading && (
                                    <ArrowRight size={20} className={`transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-center gap-3 opacity-40">
                        <ShieldCheck size={14} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            {t('securityNotice')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
