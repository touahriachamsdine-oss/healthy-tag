import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string; // Escape hatch only if absolutely needed
}

export function Container({ children, className = '' }: ContainerProps) {
    return (
        <div className={`layout-container ${className}`}>
            {children}
        </div>
    );
}
