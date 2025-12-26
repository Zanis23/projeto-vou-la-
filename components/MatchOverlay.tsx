import React, { useEffect } from 'react';
import { User } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { MessageCircle, X } from 'lucide-react';

interface MatchOverlayProps {
    user: User; // The user you matched with
    onClose: () => void;
    onChat: () => void;
}

export const MatchOverlay: React.FC<MatchOverlayProps> = ({ user, onClose, onChat }) => {
    const { trigger } = useHaptic();

    useEffect(() => {
        trigger('success'); // Initial impact
    }, []);

    return (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Confetti / Burst effect simulated via CSS or simple divs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--primary)]/20 blur-[100px] rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10 text-center animate-[zoomIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform -rotate-2">
                    DEU MATCH!
                </h2>
                <p className="text-[var(--primary)] font-bold uppercase tracking-[0.3em] text-sm mt-2 mb-8">
                    Vocês estão conectados
                </p>

                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-[var(--primary)] rounded-full animate-ping opacity-30"></div>
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full border-4 border-[var(--primary)] object-cover shadow-[0_0_30px_var(--primary-glow)] relative z-10"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[var(--primary)] text-black p-2 rounded-full border-2 border-black z-20">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                </div>

                <div className="space-y-3 w-full max-w-xs mx-auto">
                    <button
                        onClick={() => { trigger('light'); onChat(); }}
                        className="w-full py-4 bg-[var(--primary)] text-black rounded-2xl font-black uppercase text-lg tracking-wider shadow-[0_0_20px_var(--primary-glow)] hover:brightness-110 active:scale-95 transition-all"
                    >
                        Mandar Oi
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 text-white rounded-2xl font-black uppercase text-xs tracking-wider border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                    >
                        Continuar navegando
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.5) rotate(-5deg); }
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }
            `}</style>
        </div>
    );
};
