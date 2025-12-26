
import React, { useState } from 'react';
import { Button } from './Button';
import { ArrowRight, Music, Beer, Sparkles } from 'lucide-react';

interface OnboardingQuizProps {
  onComplete: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    icon: <Sparkles className="w-8 h-8 text-[#ccff00]" />,
    question: "Qual sua vibe de hoje?",
    options: [
      { label: "Balada Insana", value: "party" },
      { label: "Barzinho Chill", value: "bar" },
      { label: "Date Romântico", value: "date" },
      { label: "Gastronomia", value: "food" }
    ]
  },
  {
    id: 2,
    icon: <Music className="w-8 h-8 text-[#FF3399]" />,
    question: "O que não pode faltar no som?",
    options: [
      { label: "Sertanejo", value: "sertanejo" },
      { label: "Funk / Mandelão", value: "funk" },
      { label: "Rock / Alternativo", value: "rock" },
      { label: "Eletrônica", value: "electronic" }
    ]
  },
  {
    id: 3,
    icon: <Beer className="w-8 h-8 text-[#0CC4FF]" />,
    question: "Qual seu combustível?",
    options: [
      { label: "Cerveja Trincando", value: "beer" },
      { label: "Drinks Elaborados", value: "drinks" },
      { label: "Combo de Vodka", value: "combo" },
      { label: "Só na Água", value: "water" }
    ]
  }
];

export const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [step]: value }));
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const currentQ = QUESTIONS[step];

  return (
    <div className="fixed inset-0 z-50 bg-[#0E1121] flex flex-col p-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full mb-8 mt-safe-top">
        <div 
          className="h-full bg-[#ccff00] rounded-full transition-all duration-500 shadow-[0_0_10px_#ccff00]"
          style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-8 animate-[slideUp_0.4s_ease-out]" key={currentQ.id}>
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center shadow-2xl">
              {currentQ.icon}
            </div>
          </div>
          <h2 className="text-3xl font-black text-white text-center italic leading-tight mb-2">
            {currentQ.question}
          </h2>
          <p className="text-slate-400 text-center text-sm">
            Passo {step + 1} de {QUESTIONS.length}
          </p>
        </div>

        <div className="space-y-3">
          {currentQ.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all active:scale-95 flex justify-between items-center
                ${answers[step] === opt.value 
                  ? 'border-[#ccff00] bg-[#ccff00]/10 text-white shadow-[0_0_15px_rgba(204,255,0,0.2)]' 
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500'
                }`}
            >
              {opt.label}
              {answers[step] === opt.value && <div className="w-3 h-3 rounded-full bg-[#ccff00] shadow-[0_0_5px_#ccff00]"></div>}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 pb-safe">
        <Button 
          fullWidth 
          variant="neon" 
          onClick={handleNext}
          disabled={!answers[step]}
          className={!answers[step] ? 'opacity-50 grayscale' : ''}
        >
          {step === QUESTIONS.length - 1 ? 'FINALIZAR' : 'PRÓXIMO'} <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
