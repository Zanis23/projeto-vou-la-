
import React from 'react';
import { useHaptic } from '@/hooks/useHaptic';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  onClick,
  ...props 
}) => {
  const { trigger } = useHaptic();
  
  const baseStyles = "font-black uppercase tracking-wider py-4 px-6 rounded-xl transition-all active:scale-95 outline-none flex items-center justify-center gap-2 border-2";
  
  const variants = {
    primary: "bg-fuchsia-600 border-fuchsia-400 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:bg-fuchsia-500",
    secondary: "bg-slate-800 border-slate-600 text-white hover:bg-slate-700",
    danger: "bg-red-500 border-red-400 text-white hover:bg-red-400",
    neon: "bg-[var(--primary)] border-white text-[var(--on-primary)] shadow-[0_0_20px_var(--primary-glow)] hover:opacity-90"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trigger('medium');
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
