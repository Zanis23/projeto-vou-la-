
import { useState } from 'react';

export interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    bordered?: boolean;
}

export const Avatar = ({
    src,
    alt = 'Avatar',
    fallback = 'U',
    size = 'md',
    className = '',
    bordered = false
}: AvatarProps) => {
    const [hasError, setHasError] = useState(false);

    const sizes = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-base',
        xl: 'h-20 w-20 text-xl',
    };

    const containerBase = `relative flex shrink-0 overflow-hidden rounded-full ${sizes[size]}`;
    const borderClass = bordered ? 'ring-2 ring-[var(--bg-default)] border-2 border-[var(--primary-main)]' : '';

    return (
        <div className={`${containerBase} ${borderClass} ${className}`}>
            {!hasError && src ? (
                <img
                    src={src}
                    alt={alt}
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] font-bold">
                    {fallback.substring(0, 2).toUpperCase()}
                </div>
            )}
        </div>
    );
};
