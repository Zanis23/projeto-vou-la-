import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { CheckCircle2, ChevronRight, MapPin, Loader2, Camera, Zap, Music, ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface CheckInFlowProps {
    place: Place;
    onComplete: (data: { vibe: string; photo?: string }) => void;
    onClose: () => void;
}

type Step = 'scan' | 'vibe' | 'reward';

export const CheckInFlow: React.FC<CheckInFlowProps> = ({ place, onComplete, onClose }) => {
    const { trigger } = useHaptic();
    const [step, setStep] = useState<Step>('scan');
    const [vibe, setVibe] = useState<string | null>(null);
    const [scanned, setScanned] = useState(false);

    // Simulated Location Scan
    useEffect(() => {
        if (step === 'scan') {
            const timer = setTimeout(() => {
                trigger('success');
                setScanned(true);
                setTimeout(() => setStep('vibe'), 800);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [step, trigger]);

    const handleFinish = () => {
        if (!vibe) return;
        trigger('success');
        setStep('reward');
        // Call parent completion after animation
        setTimeout(() => {
            onComplete({ vibe });
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-[fadeIn_0.2s_ease-out]">
            <button onClick={onClose} className="absolute top-safe right-4 p-3 rounded-full bg-white/10 text-white z-50">
                <X className="w-6 h-6" />
            </button>

            {/* STEP 1: SCANNING */}
            {step === 'scan' && (
                <div className="flex flex-col items-center p-8 text-center relative w-full">
                    <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
                        {/* Radar Ripples */}
                        <div className={`absolute inset-0 rounded-full border-2 border-[var(--primary)] opacity-20 ${scanned ? 'scale-110' : 'animate-[ping_1.5s_ease-out_infinite]'}`} />
                        <div className={`absolute inset-4 rounded-full border border-[var(--primary)] opacity-40 ${scanned ? 'scale-105' : 'animate-[ping_1.5s_ease-out_infinite_0.5s]'}`} />

                        {/* Center Icon */}
                        <div className={`relative z-10 w-24 h-24 rounded-full bg-[var(--surface)] flex items-center justify-center border-2 border-[var(--primary)] transition-all duration-500 ${scanned ? 'scale-110 shadow-[0_0_50px_var(--primary)]' : 'shadow-[0_0_20px_var(--primary-glow)]'}`}>
                            <MapPin className={`w-10 h-10 text-[var(--primary)] transition-all ${scanned ? 'scale-125' : 'animate-bounce'}`} />
                        </div>

                        {/* Target Reticle */}
                        <div className="absolute inset-0 border-2 border-[var(--text-muted)] opacity-20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                    </div>

                    <h3 className="text-2xl font-black text-white italic uppercase tracking-widest mb-2">
                        {scanned ? 'LOCALIZADO!' : 'VERIFICANDO...'}
                    </h3>
                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-wide text-xs">
                        {scanned ? 'Confirmando check-in' : 'Buscando sinal GPS'}
                    </p>
                </div>
            )}

            {/* STEP 2: CONTEXT (VIBE) */}
            {step === 'vibe' && (
                <div className="w-full max-w-md p-6 flex flex-col items-center animate-[slideUp_0.4s_ease-out]">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 text-center">
                        COMO TÁ <span className="text-[var(--primary)]">O ROLE?</span>
                    </h2>

                    <div className="grid grid-cols-2 gap-4 w-full mb-8">
                        {['BOMBANDO 🔥', 'MORGADO 💀', 'TOP 🚀', 'TRANQUILO 🍷'].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { trigger('medium'); setVibe(opt); }}
                                className={`p-6 rounded-2xl border-2 font-black italic uppercase transition-all active:scale-95
                  ${vibe === opt
                                        ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-[0_0_20px_var(--primary-glow)] scale-105'
                                        : 'bg-[var(--surface)] border-[var(--surface-highlight)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-white'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleFinish}
                        disabled={!vibe}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all
            ${vibe ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-lg hover:brightness-110' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                    >
                        CONFIRMAR CHECK-IN
                    </button>
                </div>
            )}

            {/* STEP 3: REWARD */}
            {step === 'reward' && (
                <div className="flex flex-col items-center animate-[pop_0.4s_cubic-bezier(0.16,1,0.3,1)]">
                    <div className="w-32 h-32 mb-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[var(--primary)] blur-[50px] opacity-50 animate-pulse" />
                        <CheckCircle2 className="w-24 h-24 text-[var(--primary)] relative z-10" />
                    </div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 drop-shadow-lg">CHECK-IN FEITO!</h2>
                    <div className="bg-[var(--surface)] border border-[var(--surface-highlight)] px-6 py-2 rounded-full mb-8">
                        <span className="text-xl font-black text-[var(--primary)]">+50 XP</span>
                    </div>

                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs animate-pulse">
                        Você agora está visível no mapa
                    </p>
                </div>
            )}
        </div>
    );
};
