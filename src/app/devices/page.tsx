'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSettings } from '@/context/SettingsContext';
import {
    Search, Plus, Filter, List, Grid,
    Settings2, History, AlertTriangle,
    CheckCircle2, X, Save, MoreVertical, Trash2,
    Smartphone, Server, ShieldCheck, MapPin, ChevronDown
} from 'lucide-react';

// Layout Primitives (Simplified Import)
import { Stack } from '@/components/layout/Stack';

export default function DevicesPage() {
    const { t, language } = useSettings();
    const isRTL = language === 'ar';

    const [user, setUser] = useState<any>(null);
    const [devices, setDevices] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('list');

    // UI States
    const [selectedDevice, setSelectedDevice] = useState<any>(null);
    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const [editValues, setEditValues] = useState({ targetTemp: 4, tempMin: 2, tempMax: 8 });
    const [pendingChanges, setPendingChanges] = useState<Record<string, { tempMin: number, tempMax: number }>>({});

    // Registration Modal States
    const [showRegister, setShowRegister] = useState(false);
    const [newDevice, setNewDevice] = useState({
        deviceId: '',
        type: 'FRIDGE',
        facilityId: '',
        targetTemp: 4,
        tempMin: 2,
        tempMax: 8
    });
    const [registerError, setRegisterError] = useState('');

    const fetchData = async () => {
        try {
            const userRes = await fetch('/api/auth/me');
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.user);
            }

            const [devicesRes, facilitiesRes] = await Promise.all([
                fetch('/api/dashboard/devices?limit=100'),
                fetch('/api/devices')
            ]);

            if (devicesRes.ok) {
                const devicesData = await devicesRes.json();
                setDevices(devicesData.data);
            }

            if (facilitiesRes.ok) {
                const facilitiesData = await facilitiesRes.json();
                setFacilities(facilitiesData.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleReset = async (id: string) => {
        if (!confirm('Turn this device back to Healthy status?')) return;
        try {
            const res = await fetch(`/api/devices/${id}/reset`, { method: 'POST' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Reset failed:', error);
        }
    };

    const handleToggleHealth = async (device: any) => {
        const newStatus = device.healthStatus === 'HEALTHY' ? 'NOT_HEALTHY' : 'HEALTHY';
        const msg = newStatus === 'HEALTHY' ? 'Change to Healthy status?' : 'Force Not Healthy status?';
        if (!confirm(msg)) return;

        try {
            const res = await fetch(`/api/devices/${device.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ healthStatus: newStatus })
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this device? This will also remove all its telemetry data.')) return;
        try {
            const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };



    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegisterError('');
        setIsSaving(true);

        try {
            const res = await fetch('/api/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDevice)
            });
            const data = await res.json();
            if (data.success) {
                setShowRegister(false);
                setNewDevice({
                    deviceId: '',
                    type: 'FRIDGE',
                    facilityId: '',
                    targetTemp: 4,
                    tempMin: 2,
                    tempMax: 8
                });
                fetchData();
            } else {
                setRegisterError(data.error || 'Failed to register device');
            }
        } catch (error) {
            setRegisterError('Network error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchLogs = async (id: string) => {
        setSelectedDevice(devices.find(d => d.id === id));
        setShowLogs(true);
        try {
            const res = await fetch(`/api/devices/${id}/readings?limit=50`);
            const data = await res.json();
            if (data.success) setLogs(data.data);
        } catch (error) {
            console.error('Logs fetch failed:', error);
        }
    };

    const handleInlineSave = async (id: string) => {
        const changes = pendingChanges[id];
        if (!changes) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/devices/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(changes)
            });
            if (res.ok) {
                const newPending = { ...pendingChanges };
                delete newPending[id];
                setPendingChanges(newPending);
                fetchData();
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`/api/devices/${editingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editValues)
            });
            if (res.ok) {
                setEditingId(null);
                fetchData();
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const openEdit = (device: any) => {
        setEditingId(device.id);
        setEditValues({
            targetTemp: device.targetTemp || 4,
            tempMin: device.tempMin || 2,
            tempMax: device.tempMax || 8
        });
    };

    const filteredDevices = devices.filter(d =>
        d.deviceId.toLowerCase().includes(search.toLowerCase()) ||
        d.facility?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading && !user) return <div className="min-h-screen bg-[var(--bg-body)]" />;

    return (
        <AppShell user={user}>
            <Stack gap={8} className="pb-32">

                {/* HERO */}
                <header className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-bold text-[var(--soft-text-main)]">
                        Fleet Intelligence
                    </h1>
                    <p className="text-[var(--soft-text-sub)]">
                        Manage {devices.length} active hardware nodes.
                    </p>
                </header>

                <div className="card-soft">
                    <div className="card-soft-inner min-h-[500px] flex flex-col">

                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[300px]">
                                <Search className={`absolute top-1/2 -translate-y-1/2 text-[var(--soft-text-sub)] ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
                                <input
                                    type="text"
                                    placeholder={t('searchDevices')}
                                    className={`w-full h-12 bg-white rounded-[var(--radius-btn)] border border-transparent focus:border-[var(--soft-primary)] outline-none text-[var(--soft-text-main)] transition-colors shadow-sm ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-3">
                                {/* View Toggle (Soft Switch) */}
                                <div className="bg-white p-1 rounded-[var(--radius-btn)] flex items-center shadow-sm h-12">
                                    <button
                                        onClick={() => setView('list')}
                                        className={`p-2.5 rounded-[4px] transition-all ${view === 'list' ? 'bg-[var(--soft-bg-inner)] text-[var(--soft-text-main)]' : 'text-[var(--soft-text-sub)] hover:text-[var(--soft-text-main)]'}`}
                                    >
                                        <List size={20} />
                                    </button>
                                    <button
                                        onClick={() => setView('grid')}
                                        className={`p-2.5 rounded-[4px] transition-all ${view === 'grid' ? 'bg-[var(--soft-bg-inner)] text-[var(--soft-text-main)]' : 'text-[var(--soft-text-sub)] hover:text-[var(--soft-text-main)]'}`}
                                    >
                                        <Grid size={20} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowRegister(true)}
                                    className="btn-soft px-6 h-12"
                                >
                                    <Plus size={18} />
                                    <span className="text-sm font-semibold">{t('addDevice')}</span>
                                </button>
                            </div>
                        </div>

                        {/* DATA DISPLAY */}
                        <div className="flex-1">
                            {view === 'list' ? (
                                <div className="bg-white rounded-[var(--radius-inner)] shadow-sm overflow-hidden">
                                    {/* List Header */}
                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[var(--soft-bg-inner)] text-xs font-bold text-[var(--soft-text-sub)] uppercase">
                                        <div className="col-span-3">{t('device')}</div>
                                        <div className="col-span-3">{t('location')}</div>
                                        <div className="col-span-1 text-center">{t('temp')}</div>
                                        <div className="col-span-1 text-center">{t('min')}</div>
                                        <div className="col-span-1 text-center">{t('max')}</div>
                                        <div className="col-span-2 text-center">{t('status')}</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {/* List Body */}
                                    <div className="divide-y divide-[var(--soft-bg-inner)]">
                                        {filteredDevices.map(device => (
                                            <div key={device.id} className="grid grid-cols-12 gap-4 items-center px-6 py-5 hover:bg-[var(--soft-bg-inner)]/30 transition-colors group">
                                                {/* ID & Icon */}
                                                <div className="col-span-3 flex items-center gap-4">
                                                    <div className="icon-soft !w-10 !h-10 !bg-[var(--soft-bg-inner)] !text-[var(--soft-primary)]">
                                                        <Server size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--soft-text-main)] text-sm font-mono">{device.deviceId}</p>
                                                        <p className="text-[10px] uppercase font-bold text-[var(--soft-text-sub)]">{device.type}</p>
                                                    </div>
                                                </div>

                                                {/* Location */}
                                                <div className="col-span-3">
                                                    <p className="font-bold text-[var(--soft-text-main)] text-sm truncate">{device.facility?.name || 'Unassigned'}</p>
                                                    <div className="flex items-center gap-1 text-[var(--soft-text-sub)] mt-0.5">
                                                        <MapPin size={10} />
                                                        <span className="text-[10px]">{device.wilaya?.name}</span>
                                                    </div>
                                                </div>

                                                {/* Temp */}
                                                <div className="col-span-1 text-center">
                                                    <span className={`text-lg font-bold tabular-nums ${(device.lastTempValue > device.tempMax || device.lastTempValue < device.tempMin) ? 'text-red-500' : 'text-[var(--soft-text-main)]'}`}>
                                                        {device.lastTempValue?.toFixed(1) || '--'}°
                                                    </span>
                                                </div>

                                                {/* Min */}
                                                <div className="col-span-1 text-center">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-16 h-8 bg-slate-50 rounded-lg text-center font-bold text-xs border border-transparent focus:border-[var(--soft-primary)] outline-none"
                                                        value={pendingChanges[device.id]?.tempMin ?? device.tempMin}
                                                        onChange={e => setPendingChanges({
                                                            ...pendingChanges,
                                                            [device.id]: {
                                                                tempMax: pendingChanges[device.id]?.tempMax ?? device.tempMax,
                                                                tempMin: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                    />
                                                </div>

                                                {/* Max */}
                                                <div className="col-span-1 text-center">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-16 h-8 bg-slate-50 rounded-lg text-center font-bold text-xs border border-transparent focus:border-[var(--soft-primary)] outline-none"
                                                        value={pendingChanges[device.id]?.tempMax ?? device.tempMax}
                                                        onChange={e => setPendingChanges({
                                                            ...pendingChanges,
                                                            [device.id]: {
                                                                tempMin: pendingChanges[device.id]?.tempMin ?? device.tempMin,
                                                                tempMax: parseFloat(e.target.value)
                                                            }
                                                        })}
                                                    />
                                                </div>

                                                {/* Status */}
                                                <div className="col-span-2 flex justify-center items-center gap-2">
                                                    {device.healthStatus === 'NOT_HEALTHY' || (device.lastTempValue !== null && (device.lastTempValue > device.tempMax || device.lastTempValue < device.tempMin)) ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="badge-soft !bg-red-50 !text-red-600 flex items-center gap-1">
                                                                <AlertTriangle size={10} />
                                                                {t('critical')}
                                                            </div>
                                                            <button
                                                                onClick={() => handleToggleHealth(device)}
                                                                className="text-[10px] font-bold text-[var(--soft-primary)] hover:underline"
                                                            >
                                                                Fix Manual
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="badge-soft !bg-emerald-50 !text-emerald-600 flex items-center gap-1">
                                                                <CheckCircle2 size={10} />
                                                                {t('healthy')}
                                                            </div>
                                                            <button
                                                                onClick={() => handleToggleHealth(device)}
                                                                className="text-[10px] font-bold text-red-500 hover:underline"
                                                            >
                                                                Force Alert
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>


                                                {/* Actions */}
                                                <div className="col-span-1 flex justify-end items-center gap-2 relative">
                                                    {pendingChanges[device.id] && (
                                                        <button
                                                            onClick={() => handleInlineSave(device.id)}
                                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-lg shadow-emerald-200 animate-bounce"
                                                            title="Save changes"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => fetchLogs(device.id)}
                                                        className="btn-soft !px-3 !py-1.5 !text-[10px] !bg-[var(--soft-bg-inner)] !text-[var(--soft-primary)] hover:!bg-[var(--soft-primary)] hover:!text-white transition-all shadow-sm"
                                                    >
                                                        {t('logs')}
                                                    </button>

                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === device.id ? null : device.id)}
                                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>

                                                        {activeDropdown === device.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden py-1">
                                                                    <button
                                                                        onClick={() => { openEdit(device); setActiveDropdown(null); }}
                                                                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                                    >
                                                                        <Settings2 size={14} /> {t('edit')}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => { handleDelete(device.id); setActiveDropdown(null); }}
                                                                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 size={14} /> {t('delete')}
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredDevices.map(device => (
                                        <div key={device.id} className={`bg-white rounded-[16px] p-2 hover:shadow-md transition-all group ${device.healthStatus === 'NOT_HEALTHY' ? 'shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'shadow-sm'}`}>
                                            <div className="bg-[var(--soft-bg-inner)] rounded-[12px] p-5 h-full relative overflow-hidden">
                                                {/* Status Dot */}
                                                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${device.healthStatus === 'NOT_HEALTHY' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />

                                                <div className="flex flex-col h-full justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[var(--soft-primary)] shadow-sm">
                                                                <Server size={14} />
                                                            </div>
                                                            <span className="font-mono font-bold text-[var(--soft-text-main)] text-sm">{device.deviceId}</span>
                                                        </div>
                                                        <p className="text-xs text-[var(--soft-text-sub)] flex items-center gap-1 truncate">
                                                            <MapPin size={10} />
                                                            {device.facility?.name}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleHealth(device)}
                                                                className={`p-2 rounded-lg transition-all ${device.healthStatus === 'NOT_HEALTHY' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                                                                title={device.healthStatus === 'NOT_HEALTHY' ? "Set Healthy" : "Set Alert"}
                                                            >
                                                                {device.healthStatus === 'NOT_HEALTHY' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                                                            </button>
                                                            <button onClick={() => fetchLogs(device.id)} className="btn-soft !px-3 !py-1.5 !text-xs !bg-white !text-[var(--soft-primary)] hover:!bg-[var(--soft-primary)] hover:!text-white shadow-sm">
                                                                {t('logs')}
                                                            </button>

                                                            <div className="relative">
                                                                <button
                                                                    onClick={() => setActiveDropdown(activeDropdown === device.id ? null : device.id)}
                                                                    className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 bg-white/50"
                                                                >
                                                                    <MoreVertical size={16} />
                                                                </button>

                                                                {activeDropdown === device.id && (
                                                                    <>
                                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden py-1">
                                                                            <button
                                                                                onClick={() => { openEdit(device); setActiveDropdown(null); }}
                                                                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                                                                            >
                                                                                <Settings2 size={14} /> {t('edit')}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { handleDelete(device.id); setActiveDropdown(null); }}
                                                                                className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                                                            >
                                                                                <Trash2 size={14} /> {t('delete')}
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Stack>

            {showRegister && (
                /* Re-styled Modal */
                <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/30 backdrop-blur-md p-4 transition-all duration-300">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col transform transition-all scale-100">
                        <div className="px-16 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-[var(--soft-text-main)] text-2xl !pl-6">{t('registerNewNode')}</h3>
                            <button onClick={() => setShowRegister(false)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleRegister} className="p-12 flex flex-col gap-8">

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('identity')}</label>
                                <input required type="text" placeholder={t('serialNumber')} className="w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none px-6 font-mono text-lg transition-all" value={newDevice.deviceId} onChange={e => setNewDevice({ ...newDevice, deviceId: e.target.value.toUpperCase() })} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('type')}</label>
                                    <div className="relative">
                                        <select className="appearance-none w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none px-6 font-bold text-slate-700 transition-all cursor-pointer" value={newDevice.type} onChange={e => setNewDevice({ ...newDevice, type: e.target.value })}>
                                            <option value="FRIDGE">{t('fridge')}</option>
                                            <option value="FREEZER">{t('freezer')}</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('location')}</label>
                                    <div className="relative">
                                        <select required className="appearance-none w-full h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white outline-none px-6 font-bold text-slate-700 transition-all cursor-pointer" value={newDevice.facilityId} onChange={e => setNewDevice({ ...newDevice, facilityId: e.target.value })}>
                                            <option value="">{t('select')}</option>
                                            {facilities.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-6">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <ShieldCheck size={18} />
                                    <p className="text-xs font-black uppercase tracking-widest">{t('parameters')}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase text-center block">{t('target')}</label>
                                        <input type="number" step="0.1" className="w-full h-12 rounded-xl bg-white text-center font-bold text-slate-700 border-2 border-transparent focus:border-indigo-500 transition-all outline-none" value={newDevice.targetTemp} onChange={e => setNewDevice({ ...newDevice, targetTemp: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase text-center block">{t('min')}</label>
                                        <input type="number" step="0.1" className="w-full h-12 rounded-xl bg-white text-center font-bold text-slate-700 border-2 border-transparent focus:border-indigo-500 transition-all outline-none" value={newDevice.tempMin} onChange={e => setNewDevice({ ...newDevice, tempMin: parseFloat(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase text-center block">{t('max')}</label>
                                        <input type="number" step="0.1" className="w-full h-12 rounded-xl bg-white text-center font-bold text-slate-700 border-2 border-transparent focus:border-indigo-500 transition-all outline-none" value={newDevice.tempMax} onChange={e => setNewDevice({ ...newDevice, tempMax: parseFloat(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <button type="button" onClick={() => setShowRegister(false)} className="flex-1 h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                                <button type="submit" className="flex-[2] h-14 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all">Register Device</button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
            {/* Configuration Modal removed as requested to use inline editing */}

            {/* Logs Modal */}
            {showLogs && (
                <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-[var(--soft-text-main)] text-xl">Telemetry Logs</h3>
                                <p className="text-xs text-slate-400 font-mono">{selectedDevice?.deviceId}</p>
                            </div>
                            <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-red-500"><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="space-y-4">
                                {logs.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400">No logs found for this period.</div>
                                ) : (
                                    logs.map((log: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${log.healthStatus === 'HEALTHY' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{log.temperature.toFixed(1)}°C</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black">{new Date(log.deviceTimestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right text-[10px] font-mono text-slate-300">
                                                {log.latitude?.toFixed(4)}, {log.longitude?.toFixed(4)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
