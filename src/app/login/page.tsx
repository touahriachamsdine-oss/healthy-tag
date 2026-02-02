'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';

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
                    setError(data.error || 'Invalid credentials');
                }
            } else {
                try {
                    const data = await response.json();
                    setError(data.error || `Error ${response.status}: Service unavailable.`);
                } catch (e) {
                    setError(`Error ${response.status}: Service unavailable.`);
                }
            }
        } catch (err: any) {
            setError(`Connection failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Exactly recreating the style structure from snippet, but adapting for Next.js functionality */}
            <div className="neo-card flex flex-col items-start gap-5 w-full max-w-[400px]">
                <div className="flex flex-col mb-4">
                    <p className="text-[20px] font-[700] mb-[15px] flex flex-col text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-DelaGothicOne), Courier, monospace' }}>
                        Healthy Tag,
                        <span className="text-[17px] font-[600] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-SpaceMono), Courier, monospace' }}>
                            Sign in to your account
                        </span>
                    </p>
                </div>


                {/* Actual Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    {error && (
                        <div className="p-3 border-2 border-[var(--neo-main)] bg-red-100 text-red-600 font-bold text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                            ⚠️ {error}
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Work Email"
                        className="neo-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="neo-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="neo-btn w-full justify-between px-6">
                        {isLoading ? 'Loading...' : 'Continue'}
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 17 5-5-5-5" /><path d="m13 17 5-5-5-5" /></svg>
                    </button>
                </form>

            </div>
        </div>
    );
}
