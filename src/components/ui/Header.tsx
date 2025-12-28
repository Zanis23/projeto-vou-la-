import React from 'react';

interface HeaderProps {
    left?: React.ReactNode;
    center?: React.ReactNode;
    right?: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    glass?: boolean;
    border?: boolean;
    sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    left,
    center,
    right,
    title,
    subtitle,
    className = '',
    glass = true,
    border = true,
    sticky = true
}) => {
    return (
        <header
            className={`
        z-40 px-6 pt-safe pb-4 flex flex-col gap-4 
        ${sticky ? 'sticky top-0' : 'relative'}
        ${glass ? 'bg-bg-default/60 backdrop-blur-2xl' : 'bg-bg-default'}
        ${border ? 'border-b border-border-default' : ''}
        ${className}
      `}
        >
            <div className="flex justify-between items-center min-h-[48px]">
                <div className="flex items-center gap-4 min-w-[40px]">
                    {left}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    {center || (
                        <>
                            {title && (
                                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5">
                                    {subtitle}
                                </p>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 min-w-[40px]">
                    {right}
                </div>
            </div>
        </header>
    );
};
