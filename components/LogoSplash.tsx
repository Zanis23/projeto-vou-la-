import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface LogoSplashProps {
  onComplete: () => void;
}

export const LogoSplash: React.FC<LogoSplashProps> = ({ onComplete }) => {
  const [scale, setScale] = useState(false);

  useEffect(() => {
    // Start pulse
    setTimeout(() => setScale(true), 500);
    
    // Finish
    setTimeout(() => {
      onComplete();
    }, 2500);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-[#0E1121] flex items-center justify-center transition-opacity duration-500 ${scale ? 'animate-exit' : ''}`}>
      <div className={`transition-all duration-1000 transform ${scale ? 'scale-[50] opacity-0' : 'scale-150'}`}>
        <div className="relative">
           <div className="absolute inset-0 bg-[#ccff00] blur-3xl opacity-50 animate-pulse"></div>
           <Logo className="w-24 h-24 relative z-10" />
        </div>
      </div>
    </div>
  );
};