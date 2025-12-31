
import React, { useEffect, useState } from 'react';
import { Siren, X, ArrowRight, Flame, Mail } from 'lucide-react';

interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'hype' | 'alert' | 'invite';
  onClose: () => void;
  onAction: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  title, 
  message, 
  type = 'hype', 
  onClose, 
  onAction 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 50);
    
    // Auto dismiss after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 6000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-[70] transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      onClick={onAction}
    >
      <div className="bg-[var(--background)]/95 backdrop-blur-md border border-[var(--primary)] rounded-2xl shadow-[0_0_20px_var(--primary-glow)] p-4 flex items-start gap-4 relative overflow-hidden cursor-pointer active:scale-95 transition-transform">
        
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/10 to-transparent animate-pulse"></div>

        {/* Icon Box */}
        <div className="relative z-10 bg-[var(--primary)] w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[var(--primary-glow)] text-[var(--on-primary)]">
           {type === 'alert' ? (
             <Siren className="w-7 h-7 animate-[wiggle_0.5s_infinite]" />
           ) : type === 'invite' ? (
             <Mail className="w-7 h-7 animate-bounce" />
           ) : (
             <Flame className="w-7 h-7 animate-pulse" />
           )}
        </div>

        {/* Content */}
        <div className="flex-1 relative z-10 pt-0.5">
          <h4 className="text-[var(--primary)] font-black italic uppercase text-sm tracking-wide mb-1 flex items-center gap-2">
             {title}
             <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-ping"></span>
          </h4>
          <p className="text-white text-sm font-medium leading-tight">
            {message}
          </p>
          <div className="mt-2 flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-1 group">
             Ver Local <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="relative z-10 text-slate-500 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

      </div>
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
};
