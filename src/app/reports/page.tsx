'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import { FileText, Download, PieChart, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/layout/Card';
import { Stack } from '@/components/layout/Stack';

export default function ReportsPage() {
    const { t } = useSettings();
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

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

    const reportTypes = [
        { title: 'Temperature Compliance', icon: PieChart, desc: 'Detailed analysis of temperature maintenance across units.', key: 'temp_compliance' },
        { title: 'Alarm History', icon: FileText, desc: 'Complete log of all high and low temperature excursions.', key: 'alarm_history' },
        { title: 'Asset Inventory', icon: FileSpreadsheet, desc: 'Summary of all registered monitoring hardware and locations.', key: 'asset_inventory' },
    ];

    return (
        <AppShell user={user}>
            <Stack gap={8}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-[var(--space-6)] border-b border-[var(--border-color)] pb-[var(--space-6)]">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-blue-600">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-[var(--radius-md)]">
                                <FileText size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                ANALYTICS & COMPLIANCE
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--text-primary)] leading-tight">{t('reports')}</h1>
                            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-xl leading-relaxed">{t('generateReports')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-6)]">
                    {reportTypes.map((report, i) => (
                        <Card key={i} className="flex flex-col items-center text-center !p-10 bg-[var(--bg-surface)] hover:shadow-lg transition-all">
                            <div className="w-20 h-20 rounded-[var(--radius-xl)] bg-[var(--bg-body)] border border-[var(--border-color)] flex items-center justify-center mb-8 text-blue-600">
                                <report.icon size={40} />
                            </div>
                            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4">{report.title}</h3>
                            <p className="text-sm font-medium text-[var(--text-secondary)] mb-10 leading-relaxed">{report.desc}</p>
                            <button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-[var(--radius-md)] font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                                <Download size={18} />
                                {t('exportPDF') || 'Export PDF'}
                            </button>
                        </Card>
                    ))}
                </div>
            </Stack>
        </AppShell>
    );
}
