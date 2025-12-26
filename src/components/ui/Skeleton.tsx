
import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    ...props
}: SkeletonProps) => {
    const baseStyles = 'animate-pulse bg-[var(--bg-subtle)] rounded-lg';

    const variants = {
        rectangular: '',
        circular: 'rounded-full',
    };

    const style = {
        width,
        height,
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={style}
            {...props}
        />
    );
};
