'use client';

import {
    AlertTriangle,
    Bell,
    Check,
    Clock,
    ChevronRight,
    SearchX
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSettings } from '@/context/SettingsContext';

interface AlertsListProps {
    alerts: any[];
    onAcknowledge?: (id: string) => void;
    onResolve?: (id: string) => void;
    showActions?: boolean;
    maxItems?: number;
    compact?: boolean;
}

const severityConfig = {
    CRITICAL: { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle },
    HIGH: { color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle },
    MEDIUM: { color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Bell },
    LOW: { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Bell },
};

export default function AlertsList({ alerts, maxItems, compact = false }: AlertsListProps) {
    const { t } = useSettings();
    const displayAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

    if (displayAlerts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-body)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
                    <Check size={24} className="text-emerald-500" />
                </div>
                <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-tight mb-1">{t('allClear')}</h4>
                <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">{t('noAlerts')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {displayAlerts.map((alert) => {
                const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
                const Icon = config.icon;

                return (
                    <div
                        key={alert.id}
                        className={`p-4 rounded-[var(--radius-lg)] border ${config.border} ${config.bg} flex gap-4 items-start group transition-all hover:translate-x-1 cursor-pointer`}
                    >
                        {/* 
                         * On compact mode (like dashboard), reduce icon size or remove bg container if desired.
                         * For consistency, keeping the container but sizing it appropriately.
                         */}
                        <div className={`w-9 h-9 rounded-[var(--radius-md)] bg-[var(--bg-surface)] flex items-center justify-center shrink-0 shadow-sm ${config.color}`}>
                            <Icon size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
                                    {alert.severity}
                                </span>
                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest whitespace-nowrap">
                                    {alert.alertType.replace('_', ' ')}
                                </span>
                            </div>
                            <h5 className="font-bold text-[var(--text-primary)] text-sm mb-1 leading-snug truncate">
                                {alert.title}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                <span className="flex items-center gap-1 min-w-[60px]"><Clock size={12} /> {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}</span>

                                <span className="truncate border-l border-[var(--border-color)] pl-2">{alert.facilityName || alert.deviceId}</span>
                            </div>
                        </div>
                        {!compact && <ChevronRight size={18} className="text-[var(--text-muted)] mt-2 shrink-0 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />}
                    </div>
                );
            })}
        </div>
    );
}
