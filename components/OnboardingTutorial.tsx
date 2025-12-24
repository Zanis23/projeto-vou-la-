import React, { useState, useEffect } from 'react';
import { Map, Users, Star, X, ChevronRight, Check } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
            {/* Content Card */}
            <div className="bg-[#1F2937] w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl border border-slate-700 overflow-hidden transform transition-all duration-300">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] rounded-full blur-[60px] opacity-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500 rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

                {/* Close Button */}
                <button
                    onClick={handleFinish}
                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Icon Area */}
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 mx-auto border border-slate-700 shadow-inner group">
                    <div className="group-hover:scale-110 transition-transform duration-500">
                        {current.icon}
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center mb-8">
                    <h2 key={current.title} className="text-2xl font-black text-white italic tracking-tight mb-3 animate-[slideUp_0.3s_ease-out]">
                        {current.title}
                    </h2>
                    <p key={current.desc} className="text-slate-400 text-sm leading-relaxed animate-[slideUp_0.4s_ease-out]">
                        {current.desc}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mb-8">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[var(--primary)]' : 'w-2 bg-slate-700'}`}
                        />
                    ))}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-[var(--primary)] hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                    {step === STEPS.length - 1 ? (
                        <>COMEÇAR <Check className="w-5 h-5" /></>
                    ) : (
                        <>PRÓXIMO <ChevronRight className="w-5 h-5" /></>
                    )}
                </button>
            </div>
        </div>
    );
};
