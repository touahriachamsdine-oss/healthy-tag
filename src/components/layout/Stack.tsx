import React from 'react';

type StackGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface StackProps {
    children: React.ReactNode;
    gap?: StackGap;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between';
    className?: string;
    as?: 'div' | 'section' | 'article' | 'main' | 'ul';
}

const gapMap: Record<StackGap, string> = {
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
    stretch: 'items-stretch',
};

const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
};

export function Stack({
    children,
    gap = 4,
    align = 'stretch',
    justify = 'start',
    className = '',
    as: Component = 'div'
}: StackProps) {
    return (
        <Component className={`flex flex-col ${gapMap[gap]} ${alignMap[align]} ${justifyMap[justify]} ${className}`}>
            {children}
        </Component>
    );
}
