
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    className = '',
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    fullWidth = true,
    disabled,
    ...props
}, ref) => {
    const baseInputStyles = 'flex h-12 w-full rounded-xl border bg-[var(--bg-subtle)] px-4 py-2 text-sm text-[var(--text-primary)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-main)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all';

    const borderStyles = error
        ? 'border-[var(--status-error)] focus-visible:ring-[var(--status-error)]'
        : 'border-[var(--border-default)]';

    return (
        <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--text-secondary)]">
                    {label}
                </label>
            )}

            <div className="relative">
                {startIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {startIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    className={`
            ${baseInputStyles}
            ${borderStyles}
            ${startIcon ? 'pl-10' : ''}
            ${endIcon ? 'pr-10' : ''}
            ${className}
          `}
                    disabled={disabled}
                    {...props}
                />

                {endIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                        {endIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={`text-xs ${error ? 'text-[var(--status-error)]' : 'text-[var(--text-muted)]'}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
