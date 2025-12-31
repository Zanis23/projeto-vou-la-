import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = "bg-slate-800/50 animate-pulse relative overflow-hidden";
  const roundedClasses = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-2xl';
  
  return (
    <div className={`${baseClasses} ${roundedClasses} ${className}`}>
       {/* Shimmer Effect */}
       <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
};
