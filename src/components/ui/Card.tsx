
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'solid' | 'glass' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    className = '',
    variant = 'solid',
    padding = 'md',
    children,
    ...props
}, ref) => {
    const variants = {
        solid: 'bg-[var(--bg-card)] border-[var(--border-default)]',
        glass: 'glass-card text-[var(--text-primary)]', // Requires .glass-card in css
        outline: 'bg-transparent border-[var(--border-default)]',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8',
    };

    return (
        <div
            ref={ref}
            className={`rounded-2xl border transition-all ${variants[variant]} ${paddings[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props} />
));

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className = '', ...props }, ref) => (
    <h3 ref={ref} className={`font-black uppercase tracking-tight text-xl text-[var(--text-primary)] ${className}`} {...props} />
));

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-sm text-[var(--text-secondary)] ${className}`} {...props} />
));

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`${className}`} {...props} />
));

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex items-center pt-4 mt-4 border-t border-[var(--border-default)] ${className}`} {...props} />
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
