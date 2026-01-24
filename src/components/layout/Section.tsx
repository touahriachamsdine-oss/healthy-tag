import React from 'react';

interface SectionProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function Section({ children, title, description, action, className = '' }: SectionProps) {
    return (
        <section className={`flex flex-col gap-[var(--space-6)] ${className}`}>
            {(title || action) && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-4)] border-b border-[var(--border)] pb-[var(--space-5)]">
                    <div className="flex flex-col gap-[var(--space-2)]">
                        {title && <h2 className="text-[20px] font-bold text-[var(--text-primary)]">{title}</h2>}
                        {description && <p className="text-[14px] text-[var(--text-secondary)] max-w-2xl">{description}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </section>
    );
}
