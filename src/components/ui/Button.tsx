
import React from 'react';
import { Loader2 } from 'lucide-react';

import { triggerHaptic } from '../../utils/haptics';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    onClick,
    ...props
}, ref) => {

    const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide uppercase transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-95';

    const variants = {
        primary: 'bg-[var(--primary-main)] text-[var(--bg-default)] hover:opacity-90 shadow-[0_0_20px_rgba(204,255,0,0.3)] border border-transparent',
        secondary: 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--primary-main)]',
        outline: 'border-2 border-[var(--primary-main)] text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:text-[var(--bg-default)]',
        ghost: 'hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        danger: 'bg-[var(--status-error)] text-white hover:opacity-90 shadow-lg shadow-red-900/20',
    };

    const sizes = {
        sm: 'h-8 px-4 text-[10px] rounded-lg',
        md: 'h-12 px-6 text-xs rounded-xl',
        lg: 'h-14 px-8 text-sm rounded-2xl',
        icon: 'h-10 w-10 p-0 flex items-center justify-center rounded-xl',
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;
        triggerHaptic('light');
        onClick?.(e);
    };

    return (
        <button
            ref={ref}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isLoading ? 'cursor-wait' : ''}
        ${className}
      `}
            disabled={disabled || isLoading}
            onClick={handleClick}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';
