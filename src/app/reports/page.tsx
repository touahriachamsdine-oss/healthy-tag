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
    const [devices, setDevices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch('/api/auth/me');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData.user);
                }
                const devicesRes = await fetch('/api/dashboard/devices?limit=100');
                if (devicesRes.ok) {
                    const data = await devicesRes.json();
                    setDevices(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch report data:', error);
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
            <Stack gap={8} className="pb-32">
                {/* Header */}
                <div className="flex flex-col gap-2 mb-8 border-b border-[var(--border-subtle)] pb-8">
                    <h1 className="text-4xl font-black text-[var(--soft-text-main)] tracking-tight">{t('reports')}</h1>
                    <p className="text-[var(--soft-text-sub)] font-medium max-w-2xl">
                        Generate and download regulatory compliance documents for your cold chain storage facilities.
                    </p>
                </div>

                {/* Report Generation Center */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reportTypes.map((report, i) => (
                        <div key={i} className="card-soft group hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-100">
                            <div className="flex flex-col items-center text-center p-6">
                                <div className="w-20 h-20 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 text-indigo-600 transition-transform group-hover:scale-110 shadow-sm">
                                    <report.icon size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-[var(--soft-text-main)] mb-3">{report.title}</h3>
                                <p className="text-sm font-medium text-[var(--soft-text-sub)] mb-8 leading-relaxed opacity-80">{report.desc}</p>
                                <button className="w-full h-12 bg-[var(--soft-primary)] hover:bg-indigo-600 text-white rounded-[20px] font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                                    <Download size={18} />
                                    {t('exportPDF') || 'Export PDF'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live Asset Inventory Table */}
                <div className="mt-12 card-soft bg-[var(--soft-bg-inner)]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                            <h2 className="text-2xl font-bold text-[var(--soft-text-main)]">Asset Inventory Status</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <th className="px-6 pb-2">Device ID</th>
                                    <th className="px-6 pb-2">Facility</th>
                                    <th className="px-6 pb-2">Wilaya</th>
                                    <th className="px-6 pb-2">Status</th>
                                    <th className="px-6 pb-2">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((device) => (
                                    <tr key={device.id} className="bg-white group hover:shadow-md transition-all">
                                        <td className="px-6 py-4 rounded-l-2xl font-mono text-sm font-bold text-indigo-600 border border-r-0 border-transparent group-hover:border-indigo-50">{device.deviceId}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700 border-y border-transparent group-hover:border-indigo-50">{device.facility?.name || '---'}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-500 border-y border-transparent group-hover:border-indigo-50">{device.wilaya?.name}</td>
                                        <td className="px-6 py-4 border-y border-transparent group-hover:border-indigo-50">
                                            <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full ${device.healthStatus === 'HEALTHY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {device.healthStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 rounded-r-2xl border border-l-0 border-transparent group-hover:border-indigo-50 text-xs text-slate-400">
                                            {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Stack>
        </AppShell>
    );
}

