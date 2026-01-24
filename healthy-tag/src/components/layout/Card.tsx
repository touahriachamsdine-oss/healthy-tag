import React from 'react';

interface CardProps {
    children: React.ReactNode;
    padding?: 0 | 4 | 5 | 6; // Matching spacing scale somewhat
    className?: string;
}

const paddingMap = {
    0: 'p-0',
    4: 'p-[var(--space-4)]', // 16px
    5: 'p-[var(--space-5)]', // 24px
    6: 'p-[var(--space-6)]', // 32px
};

export function Card({ children, padding = 6, className = '' }: CardProps) {
    return (
        <div className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-sm ${paddingMap[padding]} ${className}`}>
            {children}
        </div>
    );
}
