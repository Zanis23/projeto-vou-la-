
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { X, ArrowRight, MapPin, Search, User } from 'lucide-react';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
    targetRef?: React.RefObject<HTMLElement>; // Future: pointing to elements
}

const STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Bem-vindo ao Vou Lá!',
        description: 'Descubra os melhores rolês da cidade em tempo real. Veja onde está bombando agora!',
        icon: <MapPin className="w-12 h-12 text-[var(--primary-main)]" />
    },
    {
        id: 'radar',
        title: 'Use o Radar',
        description: 'O mapa mostra o que está acontecendo ao seu redor. Pins quentes significam locais cheios!',
        icon: <Search className="w-12 h-12 text-[var(--status-info)]" />
    },
    {
        id: 'profile',
        title: 'Seu Perfil de Baladeiro',
        description: 'Faça check-ins, suba de nível e ganhe destaque nos locais que você frequenta.',
        icon: <User className="w-12 h-12 text-purple-400" />
    }
];

export const ContextualOnboarding = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if onboarding is completed
        const completed = localStorage.getItem('voula_onboarding_completed');
        if (!completed) {
            // Start onboarding
            setCurrentStepIndex(0);
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem('voula_onboarding_completed', 'true');
        setIsVisible(false);
    };

    if (!isVisible || currentStepIndex === -1) return null;

    const step = STEPS[currentStepIndex];

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm animate-slide-up">
                <Card variant="solid" className="bg-[var(--bg-card)] border-[var(--primary-main)]/30 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-4 right-4">
                        <Button variant="ghost" size="icon" onClick={handleComplete} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <CardContent className="pt-8 flex flex-col items-center text-center gap-4">
                        <div className="p-4 rounded-full bg-[var(--bg-subtle)] mb-2">
                            {step.icon}
                        </div>
                        <CardTitle className="text-2xl">{step.title}</CardTitle>
                        <CardDescription className="text-base">{step.description}</CardDescription>

                        <div className="flex gap-1 mt-2">
                            {STEPS.map((_, idx) => (
                                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIndex ? 'w-8 bg-[var(--primary-main)]' : 'w-2 bg-[var(--bg-subtle)]'}`} />
                            ))}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2 pb-6 px-6">
                        <Button fullWidth onClick={handleNext} size="lg" className="text-base">
                            {currentStepIndex < STEPS.length - 1 ? 'Próximo' : 'Bora pro App!'}
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
