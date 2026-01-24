'use client';

import {
    Thermometer,
    AlertTriangle,
    Check,
    WifiOff,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';

// Use strict Layout Primitives
import { Card } from '@/components/layout/Card';
import { Stack } from '@/components/layout/Stack';
import { Row } from '@/components/layout/Row';

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: 'thermometer' | 'alert' | 'check' | 'offline' | 'trending-up' | 'trending-down' | 'activity';
    color: 'healthy' | 'warning' | 'danger' | 'offline' | 'primary';
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    delay?: number;
}

const icons = {
    thermometer: Thermometer,
    alert: AlertTriangle,
    check: Check,
    offline: WifiOff,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    activity: Activity,
};

const colors = {
    healthy: { icon: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    warning: { icon: 'text-amber-500', bg: 'bg-amber-500/10' },
    danger: { icon: 'text-red-500', bg: 'bg-red-500/10' },
    offline: { icon: 'text-[var(--text-muted)]', bg: 'bg-slate-500/10' },
    primary: { icon: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    delay = 0
}: StatCardProps) {
    const Icon = icons[icon];
    const colorClasses = colors[color];

    return (
        <Card padding={5} className="animate-fade-in-up bg-[var(--bg-surface)]">
            <Stack gap={4}>
                <Row justify="between" align="start">
                    <div className={`w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center ${colorClasses.bg} ${colorClasses.icon}`}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {trend.value}%
                        </div>
                    )}
                </Row>

                <Stack gap={1}>
                    <p className="text-[10px] font-black uppercase tracking-[2px] text-[var(--text-muted)]">{title}</p>
                    <div className="flex items-baseline gap-2 overflow-hidden">
                        <h4 className="text-3xl font-black text-[var(--text-primary)] truncate leading-none">{value}</h4>
                        {subtitle && (
                            <p className="text-xs font-medium text-[var(--text-muted)] truncate">{subtitle}</p>
                        )}
                    </div>
                </Stack>
            </Stack>
        </Card>
    );
}
