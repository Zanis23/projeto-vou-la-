
import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning';
}

export const Badge = ({
    className = '',
    variant = 'default',
    ...props
}: BadgeProps) => {
    const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary-main)] focus:ring-offset-2';

    const variants = {
        default: 'border-transparent bg-[var(--primary-main)] text-[var(--primary-text)] hover:opacity-80',
        secondary: 'border-transparent bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]/80',
        outline: 'text-[var(--text-primary)] border-[var(--border-default)]',
        destructive: 'border-transparent bg-[var(--status-error)] text-white hover:opacity-80',
        success: 'border-transparent bg-[var(--status-success)] text-white hover:opacity-80',
        warning: 'border-transparent bg-[var(--status-warning)] text-white hover:opacity-80',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />
    );
};
