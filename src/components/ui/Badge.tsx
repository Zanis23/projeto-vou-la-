
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
        default: 'border-transparent bg-[var(--primary-main)] text-[var(--primary-text)] shadow-[0_0_10px_var(--primary-glow)] font-black uppercase tracking-widest',
        secondary: 'border-white/10 bg-[var(--neutral-700)] text-[var(--text-secondary)] font-bold uppercase tracking-wider',
        outline: 'text-[var(--text-primary)] border-[var(--border-default)] backdrop-blur-md bg-white/5 font-bold',
        destructive: 'border-transparent bg-[var(--status-error)] text-white shadow-[0_0_10px_rgba(255,77,109,0.3)] font-black uppercase tracking-widest',
        success: 'border-transparent bg-[var(--status-success)] text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] font-black uppercase tracking-widest',
        warning: 'border-transparent bg-[var(--status-warning)] text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] font-black uppercase tracking-widest',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />
    );
};
