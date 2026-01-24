import React from 'react';

interface GridProps {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4 | 12;
    gap?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    className?: string;
}

const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2', // Mobile-first default
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
    12: 'grid-cols-4 md:grid-cols-12',
};

const gapMap: Record<number, string> = {
    1: 'gap-[var(--space-1)]',
    2: 'gap-[var(--space-2)]',
    3: 'gap-[var(--space-3)]',
    4: 'gap-[var(--space-4)]',
    5: 'gap-[var(--space-5)]',
    6: 'gap-[var(--space-6)]',
    7: 'gap-[var(--space-7)]',
    8: 'gap-[var(--space-8)]',
};

export function Grid({ children, cols = 1, gap = 6, className = '' }: GridProps) {
    return (
        <div className={`grid ${colsMap[cols]} ${gapMap[gap]} ${className}`}>
            {children}
        </div>
    );
}
