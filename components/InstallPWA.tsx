import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const InstallPWA: React.FC = () => {
    const { deferredPrompt, install, isInstalled } = usePWA();
    const [isVisible, setIsVisible] = React.useState(true);

    if (!deferredPrompt || isInstalled || !isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-50 animate-[slideUp_0.4s_ease-out]">
            <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-black">
                        <Download className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Instalar App</h3>
                        <p className="text-slate-400 text-xs">Acesso rápido e offline</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-slate-500 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={install}
                        className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg font-bold text-xs uppercase tracking-wide"
                    >
                        Instalar
                    </button>
                </div>
            </div>
        </div>
    );
};
