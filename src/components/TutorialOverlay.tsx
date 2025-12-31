
import React, { useState } from 'react';
import { Map, Flame, Users, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface TutorialOverlayProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: <Map className="w-16 h-16 text-[#ccff00]" />,
    title: "O Radar",
    description: "Visualize todos os rolês da cidade em tempo real. Pinos pulsando significam que o lugar está fervendo!",
    color: "from-[#ccff00]/20"
  },
  {
    icon: <Flame className="w-16 h-16 text-[#FF3399]" />,
    title: "Vibe Check",
    description: "Nós te avisamos onde está lotado e onde está flopado. Acompanhe a lotação antes de sair de casa.",
    color: "from-[#FF3399]/20"
  },
  {
    icon: <Users className="w-16 h-16 text-[#0CC4FF]" />,
    title: "O Bonde",
    description: "Veja onde seus amigos estão, combine o esquenta e compartilhe sua localização com segurança.",
    color: "from-[#0CC4FF]/20"
  }
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < STEPS.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const stepData = STEPS[current];

  return (
    <div className="fixed inset-0 z-[60] bg-[#0E1121] flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-radial ${stepData.color} to-transparent opacity-30 transition-colors duration-500`}></div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
        <div key={current} className="animate-[slideLeft_0.4s_ease-out] flex flex-col items-center">
          <div className="mb-8 p-6 bg-slate-800/50 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm">
            {stepData.icon}
          </div>
          
          <h2 className="text-4xl font-black text-white italic mb-4 tracking-tighter uppercase">
            {stepData.title}
          </h2>
          
          <p className="text-slate-300 text-lg leading-relaxed font-medium">
            {stepData.description}
          </p>
        </div>
      </div>

      <div className="p-6 pb-safe z-10 flex flex-col gap-4">
        <div className="flex justify-center gap-2 mb-4">
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${idx === current ? 'w-8 bg-white' : 'w-2 bg-slate-700'}`}
            ></div>
          ))}
        </div>

        <Button fullWidth variant="primary" onClick={handleNext} className="!bg-white !text-black !shadow-none hover:!bg-slate-200">
          {current === STEPS.length - 1 ? 'BORA PRO ROLÊ' : 'PRÓXIMO'} <ChevronRight className="w-5 h-5" />
        </Button>
        
        <button onClick={onComplete} className="text-slate-500 text-sm font-bold uppercase tracking-widest py-2">
          Pular Tutorial
        </button>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
