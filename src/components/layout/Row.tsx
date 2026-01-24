import React from 'react';

type RowGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface RowProps {
    children: React.ReactNode;
    gap?: RowGap;
    align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between';
    wrap?: boolean;
    className?: string;
}

const gapMap: Record<RowGap, string> = {
    1: 'gap-[var(--space-1)]',
    2: 'gap-[var(--space-2)]',
    3: 'gap-[var(--space-3)]',
    4: 'gap-[var(--space-4)]',
    5: 'gap-[var(--space-5)]',
    6: 'gap-[var(--space-6)]',
    7: 'gap-[var(--space-7)]',
    8: 'gap-[var(--space-8)]',
};

const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
};

const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
};

export function Row({
    children,
    gap = 4,
    align = 'center',
    justify = 'start',
    wrap = false,
    className = ''
}: RowProps) {
    return (
        <div className={`flex flex-row ${gapMap[gap]} ${alignMap[align]} ${justifyMap[justify]} ${wrap ? 'flex-wrap' : 'flex-nowrap'} ${className}`}>
            {children}
        </div>
    );
}
