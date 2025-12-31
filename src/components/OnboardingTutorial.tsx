import React, { useState } from 'react';
import { Map, Users, Star, X, ChevronRight, Check } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface OnboardingTutorialProps {
    onComplete: () => void;
}

const STEPS = [
    {
        title: "Bem-vindo ao Vou Lá!",
        desc: "O seu novo jeito de descobrir os melhores rolês da cidade.",
        icon: <Star className="w-12 h-12 text-yellow-400" />,
        highlight: "center"
    },
    {
        title: "Radar de Hype",
        desc: "Acompanhe em tempo real onde a galera está e o que está lotando.",
        icon: <Map className="w-12 h-12 text-indigo-400" />,
        highlight: "radar"
    },
    {
        title: "Bonde & Chat",
        desc: "Combine com amigos, mande correio elegante e veja quem vai.",
        icon: <Users className="w-12 h-12 text-pink-500" />,
        highlight: "social"
    }
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const { trigger } = useHaptic();
    const [isVisible, setIsVisible] = useState(true);

    const handleNext = () => {
        trigger('medium');
        if (step < STEPS.length - 1) {
            setStep(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = () => {
        trigger('success');
        setIsVisible(false);
        setTimeout(onComplete, 300); // Allow fade out
    };

    if (!isVisible) return null;

    const current = STEPS[step];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-[fadeIn_0.5s_ease-out]">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[var(--primary)]/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            {/* Content Card */}
            <div className="bg-[#111827]/80 w-full max-w-sm rounded-[2.5rem] p-10 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 backdrop-blur-2xl overflow-hidden transform transition-all duration-300">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500 rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

                {/* Close Button */}
                <button
                    onClick={handleFinish}
                    className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Icon Area */}
                <div className="relative w-28 h-28 mb-8 mx-auto">
                    <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-full h-full bg-slate-800/80 rounded-full flex items-center justify-center border border-slate-700 shadow-inner group overflow-hidden">
                        <div className="group-hover:scale-110 transition-transform duration-500 transform">
                            {current.icon}
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center mb-10">
                    <h2 key={current.title} className="text-3xl font-black text-white italic tracking-tighter mb-4 animate-[slideUp_0.3s_ease-out]">
                        {current.title.toUpperCase()}
                    </h2>
                    <p key={current.desc} className="text-slate-400 text-base leading-relaxed animate-[slideUp_0.4s_ease-out] font-medium">
                        {current.desc}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-3 mb-10">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-[var(--primary)] shadow-[0_0_10px_var(--primary)]' : 'w-2 bg-slate-700'}`}
                        />
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNext}
                    className="relative w-full py-5 bg-[var(--primary)] hover:brightness-110 active:scale-95 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center gap-2 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {step === STEPS.length - 1 ? (
                        <>COMEÇAR <Check className="w-5 h-5 stroke-[3px]" /></>
                    ) : (
                        <>PRÓXIMO <ChevronRight className="w-5 h-5 stroke-[3px]" /></>
                    )}
                </button>
            </div>
        </div>
    );
};
