import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Thermometer,
    Droplets,
    Search,
    MapPin,
    Bell,
    Plus,
    History,
    ShieldCheck,
    ShieldAlert,
    ChevronRight,
    Filter,
    Menu,
    Sun,
    Moon
} from 'lucide-react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons using CDN to guarantee they show up
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- API CONFIG ---
const API_BASE = import.meta.env.VITE_API_URL || 'api';

const translations = {
    en: {
        dashboard: "Dashboard", liveMap: "Live Map", admins: "Admins", logs: "System Logs", logout: "Logout",
        totalFreezers: "Total Freezers", healthy: "Healthy", unhealthy: "Needs Check",
        search: "Search freezers...", searchAdmins: "Search admins...", hello: "Hello",
        name: "Freezer Name", location: "Location", status: "Status", temp: "Temp", range: "Limit Range", actions: "Actions",
        back: "Back", updateSuccess: "Range updated", save: "Save", state: "State (Wilaya)", baladiya: "Town (Baladiya)",
        minTemp: "Min Temp", maxTemp: "Max Temp", settings: "Settings", history: "Health History",
        registerAdmin: "Register New Admin", adminDesc: "Admins manage regional freezers.",
        fullName: "Full Name", email: "Email", password: "Password", createAccount: "Create Admin Account",
        viewDetails: "View Details"
    },
    fr: {
        dashboard: "Tableau de Bord", liveMap: "Carte en Direct", admins: "Administrateurs", logs: "Journaux Système", logout: "Déconnexion",
        totalFreezers: "Total Congélateurs", healthy: "Sain", unhealthy: "Attention",
        search: "Rechercher...", searchAdmins: "Rechercher...", hello: "Bonjour",
        name: "Nom du Congélateur", location: "Emplacement", status: "Statut", temp: "Temp", range: "Plage Limite", actions: "Actions",
        back: "Retour", updateSuccess: "Plage mise à jour", save: "Enregistrer", state: "État (Wilaya)", baladiya: "Commune (Baladiya)",
        minTemp: "Temp Min", maxTemp: "Temp Max", settings: "Réglages", history: "Historique de Santé",
        registerAdmin: "Enregistrer un Admin", adminDesc: "Les admins gèrent les régions.",
        fullName: "Nom Complet", email: "Email", password: "Mot de passe", createAccount: "Créer le compte",
        viewDetails: "Voir Détails"
    },
    ar: {
        dashboard: "لوحة التحكم", liveMap: "الخريطة الحية", admins: "المشرفين", logs: "سجلات النظام", logout: "خروج",
        totalFreezers: "إجمالي الثلاجات", healthy: "سليم", unhealthy: "تحذير",
        search: "بحث...", searchAdmins: "بحث عن مشرف...", hello: "مرحباً",
        name: "اسم الثلاجة", location: "الموقع", status: "الحالة", temp: "الحرارة", range: "نطاق الحدود", actions: "إجراءات",
        back: "رجوع", updateSuccess: "تم التحديث", save: "حفظ", state: "الولاية", baladiya: "البلدية",
        minTemp: "أدنى حرارة", maxTemp: "أقصى حرارة", settings: "الإعدادات", history: "سجل الحالة",
        registerAdmin: "تسجيل مشرف جديد", adminDesc: "المشرفون يديرون المناطق.",
        fullName: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور", createAccount: "إنشاء حساب مشرف",
        viewDetails: "عرض التفاصيل"
    }
};

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard'); // dashboard, logs, admins, settings
    const [displayMode, setDisplayMode] = useState('list'); // grid, list, or map
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [lang, setLang] = useState('en');
    const [theme, setTheme] = useState('dark');

    const t = translations[lang];

    useEffect(() => {
        document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);

    // Login State
    const [authData, setAuthData] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // Dashboard Data
    const [freezers, setFreezers] = useState([]);
    const [selectedFreezer, setSelectedFreezer] = useState(null);
    const [filters, setFilters] = useState({ state: '', baladiya: '' });

    useEffect(() => {
        if (token) {
            fetchUser();
            fetchFreezers();
        }
    }, [token, filters]);

    const fetchUser = async () => {
        // In real app, verify token and get user profile
        // For now, decode from token or localStorage
        const savedUser = JSON.parse(localStorage.getItem('user'));
        if (savedUser) setUser(savedUser);
    };

    const fetchFreezers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/freezers`, {
                headers: { Authorization: `Bearer ${token}` },
                params: filters
            });
            setFreezers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/auth/login`, authData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUser(res.data.user);
            setLoginError('');
        } catch (err) {
            setLoginError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setUser(null);
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md p-8 glass-card">
                    <div className="flex justify-center mb-8">
                        <div className="p-3 bg-indigo-600 rounded-2xl">
                            <Thermometer className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-center">Healthy Tag Monitor</h2>
                    <p className="mb-8 text-center text-slate-400">Sign in to monitor vaccine & food health</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-300">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="admin@octenium.com"
                                value={authData.email}
                                onChange={e => setAuthData({ ...authData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-slate-300">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="••••••••"
                                value={authData.password}
                                onChange={e => setAuthData({ ...authData, password: e.target.value })}
                                required
                            />
                        </div>
                        {loginError && <p className="text-sm text-red-500">{loginError}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 font-semibold text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
            <div className={`flex min-h-screen ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Sidebar */}
                <aside className={`fixed inset-y-0 sidebar-fixed bg-sidebar z-50 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center h-20 px-6 mb-4">
                            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
                                <Thermometer className="w-6 h-6 text-white" />
                            </div>
                            {isSidebarOpen && <span className="ml-3 text-xl font-bold tracking-tight">HEALTHY TAG</span>}
                        </div>

                        <nav className="flex-1 px-4 space-y-2">
                            <NavItem
                                icon={<LayoutDashboard />}
                                label={t.dashboard}
                                active={view === 'dashboard'}
                                expanded={isSidebarOpen}
                                onClick={() => { setView('dashboard'); setSelectedFreezer(null); }}
                            />
                            {user?.role === 'SUPER_ADMIN' && (
                                <NavItem
                                    icon={<Users />}
                                    label={t.admins}
                                    active={view === 'admins'}
                                    expanded={isSidebarOpen}
                                    onClick={() => setView('admins')}
                                />
                            )}
                            <NavItem
                                icon={<MapPin />}
                                label={t.liveMap}
                                active={view === 'map'}
                                expanded={isSidebarOpen}
                                onClick={() => setView('map')}
                            />
                            <NavItem
                                icon={<History />}
                                label={t.logs}
                                active={view === 'logs'}
                                expanded={isSidebarOpen}
                                onClick={() => setView('logs')}
                            />
                        </nav>

                        <div className="p-4 border-t border-white/10">
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full p-3 transition rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500"
                            >
                                <LogOut className="w-5 h-5" />
                                {isSidebarOpen && <span className="ml-3 font-medium">{t.logout}</span>}
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 ${lang === 'ar' ? (isSidebarOpen ? 'mr-64' : 'mr-20') : (isSidebarOpen ? 'ml-64' : 'ml-20')}`}>
                    {/* Header */}
                    <header className={`h-20 flex items-center justify-between px-8 border-b sticky top-0 z-40 backdrop-blur-md ${theme === 'dark' ? 'bg-slate-950/50 border-white/5' : 'bg-white/80 border-slate-200'}`}>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition md:hidden">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold">{t[view]}</h2>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className={`p-2 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>

                            {/* Language Picker */}
                            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                                {['en', 'fr', 'ar'].map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setLang(l)}
                                        className={`px-2 py-1 text-[10px] font-bold rounded uppercase transition ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center space-x-3 border-l border-white/10 pl-6">
                                <div className={`text-right ${lang === 'ar' ? 'ml-3' : ''}`}>
                                    <p className="text-sm font-bold">{user?.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                                    {user?.name?.[0]}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dynamic Content */}
                    <div className="p-8">
                        {view === 'dashboard' && (
                            selectedFreezer ? (
                                <FreezerDetail
                                    freezer={selectedFreezer}
                                    token={token}
                                    onBack={() => { setSelectedFreezer(null); fetchFreezers(); }}
                                />
                            ) : (
                                <DashboardView
                                    freezers={freezers}
                                    user={user}
                                    filters={filters}
                                    setFilters={setFilters}
                                    displayMode={displayMode}
                                    setDisplayMode={setDisplayMode}
                                    onSelectFreezer={(id) => {
                                        const d = freezers.find(x => x.deviceId === id);
                                        setSelectedFreezer(d);
                                    }}
                                    token={token}
                                    onUpdate={fetchFreezers}
                                    t={t}
                                />
                            )
                        )}

                        {view === 'admins' && <AdminManagement token={token} t={t} />}

                        {view === 'map' && (
                            <div className="glass-card p-6 h-[600px]">
                                <h2 className="text-xl font-semibold mb-6">{t.liveMap}</h2>
                                <MapContainer center={[36.7538, 3.0588]} zoom={6} className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {freezers.map(freezer => (
                                        freezer.lat && freezer.lng && (
                                            <Marker key={freezer.id} position={[freezer.lat, freezer.lng]}>
                                                <Popup className="custom-popup">
                                                    <div className="p-2">
                                                        <p className="font-bold text-slate-900">{freezer.name}</p>
                                                        <p className="text-xs text-slate-600 mb-2">{freezer.state}, {freezer.baladiya}</p>
                                                        <div className={`text-[10px] font-bold uppercase inline-block px-2 py-0.5 rounded-full ${freezer.isHealthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {freezer.isHealthy ? t.healthy : t.unhealthy}
                                                        </div>
                                                        <button
                                                            onClick={() => { setView('dashboard'); setSelectedFreezer(freezer); }}
                                                            className="block w-full mt-3 text-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                                        >
                                                            {t.viewDetails} →
                                                        </button>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )
                                    ))}
                                </MapContainer>
                            </div>
                        )}

                        {view === 'logs' && (
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-semibold mb-6">{t.logs}</h2>
                                <div className="space-y-4">
                                    {freezers.map(freezer => (
                                        <div key={freezer.id} className="p-4 bg-slate-900/50 rounded-xl border border-white/5 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{freezer.name}</p>
                                                <p className="text-xs text-slate-500">{freezer.deviceId} - {freezer.state}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm ${freezer.isHealthy ? 'text-green-500' : 'text-red-500'}`}>
                                                    {freezer.isHealthy ? t.healthy : t.unhealthy}
                                                </p>
                                                <p className="text-xs text-slate-600">Last: {format(new Date(freezer.lastSeen), 'PPp')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div >
        </div >
    );
}

// --- SUB-VIEWS ---

function DashboardView({ freezers, user, filters, setFilters, displayMode, setDisplayMode, onSelectFreezer, token, onUpdate, t }) {
    const healthyCount = freezers.filter(f => f.isHealthy).length;
    const unhealthyCount = freezers.length - healthyCount;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title={t.totalFreezers} value={freezers.length} icon={<LayoutDashboard className="text-indigo-400" />} />
                <StatCard title={t.healthy} value={healthyCount} icon={<ShieldCheck className="text-green-400" />} color="text-green-400" />
                <StatCard title={t.unhealthy} value={unhealthyCount} icon={<ShieldAlert className="text-red-400" />} color="text-red-400" />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-wrap gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-400">{t.location}:</span>
                </div>
                <select
                    className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-indigo-500 focus:outline-none"
                    value={filters.state}
                    onChange={e => setFilters({ ...filters, state: e.target.value })}
                >
                    <option value="">{t.state}</option>
                    <option value="Algiers">Algiers</option>
                    <option value="Oran">Oran</option>
                    <option value="Constantine">Constantine</option>
                </select>

                <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10 ml-auto mr-auto md:mr-0">
                    <button
                        onClick={() => setDisplayMode('list')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${displayMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setDisplayMode('grid')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition ${displayMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        Cards
                    </button>
                </div>
            </div>

            {/* View Rendering */}
            {displayMode === 'list' && (
                <div className="glass-card overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">{t.name}</th>
                                <th className="px-6 py-4">{t.location}</th>
                                <th className="px-6 py-4">{t.status}</th>
                                <th className="px-6 py-4">{t.temp}</th>
                                <th className="px-6 py-4">{t.range}</th>
                                <th className="px-6 py-4 text-right">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {freezers.map(freezer => (
                                <FreezerRow key={freezer.id} freezer={freezer} token={token} onUpdate={onUpdate} onSelect={() => onSelectFreezer(freezer.deviceId)} t={t} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {displayMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freezers.map(freezer => (
                        <div
                            key={freezer.id}
                            onClick={() => onSelectFreezer(freezer.deviceId)}
                            className={`glass-card p-6 cursor-pointer group ${freezer.isHealthy ? 'status-glow-healthy' : 'status-glow-unhealthy'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition duration-500">
                                    <Thermometer className="w-6 h-6" />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${freezer.isHealthy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {freezer.isHealthy ? t.healthy : t.unhealthy}
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1 group-hover:text-indigo-400 transition">{freezer.name}</h3>
                            <div className="flex items-center text-xs text-slate-500 mb-4">
                                <MapPin className="w-3 h-3 mr-1" />
                                {freezer.state}, {freezer.baladiya}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 mb-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t.temp}</p>
                                    <p className="text-xl font-bold">24.5°C</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t.range}</p>
                                    <p className="text-sm font-medium">{freezer.tempMin}° - {freezer.tempMax}°</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>ID: {freezer.deviceId}</span>
                                <span>{format(new Date(freezer.lastSeen), 'HH:mm')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function FreezerRow({ freezer, token, onUpdate, onSelect, t }) {
    const [range, setRange] = useState({ min: freezer.tempMin, max: freezer.tempMax });
    const [loading, setLoading] = useState(false);

    const handleQuickUpdate = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            await axios.patch(`${API_BASE}/freezers/${freezer.deviceId}/range`, {
                tempMin: range.min,
                tempMax: range.max
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onUpdate();
        } catch (err) {
            alert('Error updating range');
        } finally {
            setLoading(false);
        }
    };

    return (
        <tr className="hover:bg-white/5 transition group cursor-pointer" onClick={onSelect}>
            <td className="px-6 py-4">
                <span className="font-bold block">{freezer.name}</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono">{freezer.deviceId}</span>
            </td>
            <td className="px-6 py-4">
                <div className="text-xs">
                    <p className="font-medium">{freezer.baladiya}</p>
                    <p className="text-slate-500">{freezer.state}</p>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${freezer.isHealthy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {freezer.isHealthy ? t.healthy : t.unhealthy}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-lg font-bold">24.5°C</span>
            </td>
            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        value={range.min}
                        onChange={(e) => setRange({ ...range, min: e.target.value })}
                        className="w-16 bg-slate-900 border border-white/10 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 text-white"
                    />
                    <span className="text-slate-600">-</span>
                    <input
                        type="number"
                        value={range.max}
                        onChange={(e) => setRange({ ...range, max: e.target.value })}
                        className="w-16 bg-slate-900 border border-white/10 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 text-white"
                    />
                    <button
                        onClick={handleQuickUpdate}
                        disabled={loading}
                        className="ml-2 p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg hover:bg-indigo-600 hover:text-white transition"
                        title={t.save}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full"></div> : <ShieldCheck className="w-4 h-4" />}
                    </button>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    className="p-2 transition rounded-lg hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
}

function FreezerDetail({ freezer, token, onBack }) {
    const [data, setData] = useState([]);
    const [range, setRange] = useState({ min: freezer.tempMin, max: freezer.tempMax });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, [freezer]);

    const fetchLogs = async () => {
        try {
            const res = await axios.get(`${API_BASE}/freezers/${freezer.deviceId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Reverse logs for chart display (chronological)
            setData(res.data.logs.reverse().map(l => ({
                time: format(new Date(l.timestamp), 'HH:mm'),
                temp: l.temperature,
                hum: l.humidity
            })));
        } catch (err) { console.error(err); }
    };

    const handleUpdateRange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.patch(`${API_BASE}/freezers/${freezer.deviceId}/range`, {
                tempMin: range.min,
                tempMax: range.max
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Freezer range updated successfully');
        } catch (err) {
            alert('Failed to update range');
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white transition">
                <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to List
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Chart View */}
                <div className="flex-1 glass-card p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">{freezer.name}</h2>
                            <p className="text-slate-500 text-sm font-mono uppercase tracking-tighter">ID: {freezer.deviceId} | Freezer Health Tracking</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${freezer.isHealthy ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {freezer.isHealthy ? <ShieldCheck className="text-green-500" /> : <ShieldAlert className="text-red-500" />}
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                    itemStyle={{ color: '#6366f1' }}
                                />
                                <Area type="monotone" dataKey="temp" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Settings Side */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="glass-card p-6 border-l-4 border-indigo-600">
                        <h3 className="font-bold mb-4 flex items-center">
                            <Settings className="w-4 h-4 mr-2" /> Freezer Settings
                        </h3>
                        <form onSubmit={handleUpdateRange} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Min Temperature (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm"
                                    value={range.min}
                                    onChange={e => setRange({ ...range, min: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Max Temperature (°C)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm"
                                    value={range.max}
                                    onChange={e => setRange({ ...range, max: e.target.value })}
                                />
                            </div>
                            <button
                                disabled={loading}
                                className="w-full py-2 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                            >
                                {loading ? 'Updating...' : 'Save Freezer Range'}
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 flex items-center">
                            <History className="w-4 h-4 mr-2" /> Health History
                        </h3>
                        <div className="space-y-3">
                            {data.slice(0, 5).map((l, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                                    <span className="text-slate-400">{l.time}</span>
                                    <span className="font-mono text-indigo-400">{l.temp}°C</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminManagement({ token, t }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [baladiya, setBaladiya] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/auth/register-admin`, {
                name, email, password, state, baladiya
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(t.updateSuccess);
            setName(''); setEmail(''); setPassword('');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed');
        }
    };

    return (
        <div className="max-w-2xl glass-card p-8">
            <h2 className="text-2xl font-bold mb-2">{t.registerAdmin}</h2>
            <p className="text-slate-500 mb-8">{t.adminDesc}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-sm font-medium opacity-70 mb-1 block">{t.fullName}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900/10 border border-white/20 rounded-xl p-3" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium opacity-70 mb-1 block">{t.email}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900/10 border border-white/20 rounded-xl p-3" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium opacity-70 mb-1 block">{t.password}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900/10 border border-white/20 rounded-xl p-3" required />
                    </div>
                    <div>
                        <label className="text-sm font-medium opacity-70 mb-1 block">{t.state}</label>
                        <input type="text" value={state} onChange={e => setState(e.target.value)} className="w-full bg-slate-900/10 border border-white/20 rounded-xl p-3" placeholder="e.g. Algiers" />
                    </div>
                    <div>
                        <label className="text-sm font-medium opacity-70 mb-1 block">{t.baladiya}</label>
                        <input type="text" value={baladiya} onChange={e => setBaladiya(e.target.value)} className="w-full bg-slate-900/10 border border-white/20 rounded-xl p-3" placeholder="e.g. Hydra" />
                    </div>
                </div>
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition">
                    {t.createAccount}
                </button>
            </form>
        </div>
    );
}

// --- UTILS ---

function NavItem({ icon, label, active, expanded, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full p-3 transition rounded-xl ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
            <span className="w-6 h-6">{icon}</span>
            {expanded && <span className="ml-3 font-medium">{label}</span>}
        </button>
    );
}

function StatCard({ title, value, icon, color = "text-white" }) {
    return (
        <div className="glass-card p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
                {icon}
            </div>
        </div>
    );
}


export default App;
