'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr' | 'ar';
type Theme = 'light' | 'dark' | 'night';

interface SettingsContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        dashboard: 'Dashboard',
        dashboardOverview: 'National Metrics',
        dashboardWelcome: 'Monitor cold chain efficiency and compliance across the network.',
        live: 'Live Status',
        total: 'Total Units',
        actionReq: 'Action Req',
        dataVerified: 'Integrity Verified',
        complianceText: 'Fleet stability is within nominal parameters. {count} events detected.',
        viewPatternAnalysis: 'AI Pattern Analysis',
        recentActivity: 'System Logs',
        temperatureWarning: 'Thermal Deviation',
        viewAllHistory: 'Audit Trail',
        nationalDashboard: 'Healthy Tag Command',
        monitoringSystem: 'Cold Chain Compliance Platform',
        devices: 'IoT Nodes',
        manageDevices: 'Hardware registry and telemetry configuration',
        searchDevices: 'Search nodes...',
        addDevice: 'Add Node',
        map: 'Geospatial',
        alerts: 'Critical Incidents',
        manageAlerts: 'Review thermal excursions and anomalies',
        severity: 'Criticality',
        reports: 'Intelligence',
        generateReports: 'Compliance analytics and regulatory exports',
        users: 'Identity & Access',
        manageUsers: 'Admin hierarchy and regional permissions',
        settings: 'Configuration',
        preferences: 'Global platform behavior and UI settings',
        profile: 'Personal Identity',
        appearance: 'Visual Aesthetic',
        logout: 'Secure Sign Out',
        lastUpdated: 'Last sync',
        refresh: 'Force Sync',
        healthy: 'Operational',
        warnings: 'Marginal',
        critical: 'Failure',
        complianceRate: 'Stability Index',
        activeUnits: 'Monitored Nodes',
        activeMarkers: 'GPS Active',
        email: 'Institutional Email',
        password: 'Security Key',
        signIn: 'Authenticate',
        // New IAM
        admin: 'Administrator',
        roleScope: 'Jurisdiction',
        contact: 'Channel',
        status: 'State',
        addRegionalAdmin: 'Delegate Authority',
        registerNewAdmin: 'Provision New Admin',
        regionalAdmin: 'Regional Manager',
        localAdmin: 'Site Supervisor',
        systemAdmin: 'Core Systems',
        assignedRegion: 'Authority Scope',
        firstName: 'Given Name',
        lastName: 'Surname',
        processing: 'Encrypting...',
        registerAdmin: 'Confirm Provisioning',
        // Themes
        light: 'Clarity',
        dark: 'Midnight',
        night: 'OLED Black',
        security: 'Security & Keys',
        accountProtection: 'Vault Status',
        resetPassword: 'Rotate Key',
        platformConfig: 'Platform Configuration'
    },
    fr: {
        dashboard: 'Tableau de bord',
        dashboardOverview: 'Métriques Nationales',
        dashboardWelcome: 'Surveillez l\'efficacité de la chaîne du froid sur le réseau.',
        live: 'État en Direct',
        total: 'Unités Totales',
        actionReq: 'Action Req',
        dataVerified: 'Intégrité Vérifiée',
        complianceText: 'La stabilité de la flotte est nominale. {count} événements détectés.',
        viewPatternAnalysis: 'Analyse IA des Tendances',
        recentActivity: 'Journaux Système',
        temperatureWarning: 'Déviation Thermique',
        viewAllHistory: 'Piste d\'Audit',
        nationalDashboard: 'Commande Healthy Tag',
        monitoringSystem: 'Plateforme de Conformité',
        devices: 'Nœuds IoT',
        manageDevices: 'Registre matériel et télémétrie',
        searchDevices: 'Rechercher des nœuds...',
        addDevice: 'Ajouter Nœud',
        map: 'Géospatial',
        alerts: 'Incidents Critiques',
        manageAlerts: 'Excursions thermiques et anomalies',
        severity: 'Criticité',
        reports: 'Intelligence',
        generateReports: 'Analyses de conformité',
        users: 'Identité & Accès',
        manageUsers: 'Hiérarchie admin et permissions',
        settings: 'Configuration',
        preferences: 'Comportement global et UI',
        profile: 'Identité Personnelle',
        appearance: 'Esthétique Visuelle',
        logout: 'Déconnexion Sécurisée',
        lastUpdated: 'Dernière sync',
        refresh: 'Forcer la Sync',
        healthy: 'Opérationnel',
        warnings: 'Marginal',
        critical: 'Échec',
        complianceRate: 'Indice de Stabilité',
        activeUnits: 'Nœuds Surveillés',
        activeMarkers: 'GPS Actifs',
        email: 'Email Institutionnel',
        password: 'Clé de Sécurité',
        signIn: 'S\'Authentifier',
        admin: 'Administrateur',
        roleScope: 'Juridiction',
        contact: 'Canal',
        status: 'État',
        addRegionalAdmin: 'Déléguer l\'Autorité',
        registerNewAdmin: 'Provisionner Admin',
        regionalAdmin: 'Gestionnaire Régional',
        localAdmin: 'Superviseur de Site',
        systemAdmin: 'Systèmes Centraux',
        assignedRegion: 'Portée d\'Autorité',
        firstName: 'Prénom',
        lastName: 'Nom',
        processing: 'Chiffrement...',
        registerAdmin: 'Confirmer Provisionnement',
        light: 'Clarté',
        dark: 'Minuit',
        night: 'Noir OLED',
        security: 'Sécurité & Clés',
        accountProtection: 'État du Coffre',
        resetPassword: 'Rotation Clé',
        platformConfig: 'Configuration Plateforme'
    },
    ar: {
        dashboard: 'لوحة القيادة',
        dashboardOverview: 'المقاييس الوطنية',
        dashboardWelcome: 'راقب كفاءة سلسلة التبريد والامتثال عبر الشبكة.',
        live: 'حالة فورية',
        total: 'إجمالي الوحدات',
        actionReq: 'إجراء مطلوب',
        dataVerified: 'بيانات موثقة',
        complianceText: 'استقرار الأسطول ضمن المعايير الاسمية. تم رصد {count} حدث.',
        viewPatternAnalysis: 'تحليل الأنماط بالذكاء الاصطناعي',
        recentActivity: 'سجلات النظام',
        temperatureWarning: 'انحراف حراري',
        viewAllHistory: 'سجل التدقيق',
        nationalDashboard: 'مركز تحكم Healthy Tag',
        monitoringSystem: 'منصة امتثال سلسلة التبريد',
        devices: 'عقد إنترنت الأشياء',
        manageDevices: 'سجل الأجهزة وإعدادات القياس',
        searchDevices: 'البحث عن عقد...',
        addDevice: 'إضافة عقدة',
        map: 'جغرافي مكاني',
        alerts: 'حوادث حرجة',
        manageAlerts: 'مراجعة التنبيهات والانحرافات',
        severity: 'مستوى الخطورة',
        reports: 'الذكاء المعلوماتي',
        generateReports: 'تحليلات الامتثال والتقارير التنظيمية',
        users: 'الهوية والوصول',
        manageUsers: 'التسلسل الإداري والصلاحيات الإقليمية',
        settings: 'الإعدادات',
        preferences: 'تفضيلات المنصة والمظهر',
        profile: 'الهوية الشخصية',
        appearance: 'الجمالية البصرية',
        logout: 'خروج آمن',
        lastUpdated: 'آخر تزامن',
        refresh: 'تزامن قسري',
        healthy: 'يعمل بكفاءة',
        warnings: 'هامشي',
        critical: 'فشل',
        complianceRate: 'مؤشر الاستقرار',
        activeUnits: 'العقد المراقبة',
        activeMarkers: 'نشاط GPS',
        email: 'البريد المؤسسي',
        password: 'مفتاح الأمان',
        signIn: 'توثيق الدخول',
        admin: 'مسؤول',
        roleScope: 'النطاق الإداري',
        contact: 'قناة الاتصال',
        status: 'الحالة',
        addRegionalAdmin: 'تفويض السلطة',
        registerNewAdmin: 'إضافة مسؤول جديد',
        regionalAdmin: 'مدير إقليمي',
        localAdmin: 'مشرف موقع',
        systemAdmin: 'الأنظمة الأساسية',
        assignedRegion: 'نطاق الصلاحية',
        firstName: 'الاسم الأول',
        lastName: 'اللقب',
        processing: 'تشفير البيانات...',
        registerAdmin: 'تأكيد التسجيل',
        light: 'وضوح',
        dark: 'منتصف الليل',
        night: 'أسود OLED',
        security: 'الأمان والمفاتيح',
        accountProtection: 'حالة الخزنة',
        resetPassword: 'تدوير المفتاح',
        platformConfig: 'إعدادات المنصة'
    }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    // Initialize from localStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('lang') as Language;
        if (savedLang && ['en', 'fr', 'ar'].includes(savedLang)) {
            setLanguage(savedLang);
        }
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme && ['light', 'dark', 'night'].includes(savedTheme)) {
            setTheme(savedTheme);
        }
        setMounted(true);
    }, []);

    // Apply theme and direction
    useEffect(() => {
        if (!mounted) return;
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', language);
        localStorage.setItem('lang', language);
        localStorage.setItem('theme', theme);
    }, [language, theme, mounted]);

    const t = (key: string) => translations[language][key] || key;

    return (
        <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
}
