
import React, { useState, useEffect } from 'react';
import { X, Phone, Shield, Bell, MapPin, Share2 } from 'lucide-react';
import { Button } from './Button';
import { useHaptic } from '@/hooks/useHaptic';

interface SafetyModalProps {
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ onClose }) => {
  const { trigger } = useHaptic();
  const [fakeCallTimer, setFakeCallTimer] = useState<number | null>(null);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (fakeCallTimer !== null && fakeCallTimer > 0) {
      interval = setInterval(() => {
        setFakeCallTimer((prev) => (prev !== null ? prev - 1 : 0));
      }, 1000);
    } else if (fakeCallTimer === 0) {
      trigger('heavy');
      setIsCalling(true);
      setFakeCallTimer(null);
    }
    return () => clearInterval(interval);
  }, [fakeCallTimer, trigger]);

  const startFakeCall = (seconds: number) => {
    trigger('medium');
    setFakeCallTimer(seconds);
  };

  const handleSOS = () => {
    trigger('error'); // Heavy vibration pattern
    if (confirm("ATENÇÃO: Isso enviaria sua localização em tempo real para seus contatos de emergência e ligaria para a polícia. (Simulação)")) {
        alert("🚨 SOS Enviado! Seus amigos foram notificados.");
    }
  };

  // Fake Call Interface
  if (isCalling) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between pt-16 pb-12 animate-[fadeIn_0.5s_ease-out]">
         <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
               <span className="text-4xl text-gray-500">M</span>
            </div>
            <h2 className="text-3xl text-white font-normal">Mãe</h2>
            <p className="text-gray-400 mt-2">Chamando...</p>
         </div>

         <div className="w-full px-12 flex justify-between">
             <button 
                onClick={() => setIsCalling(false)} 
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg active:scale-95"
             >
                <Phone className="w-8 h-8 text-white rotate-[135deg]" />
             </button>
             <button 
                onClick={() => { setIsCalling(false); alert("Chamada atendida (Simulação)"); }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 animate-pulse"
             >
                <Phone className="w-8 h-8 text-white" />
             </button>
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] bg-[#0E1121] flex flex-col animate-[slideUp_0.3s_ease-out]">
      <div className="pt-safe px-4 pb-4 bg-[#0E1121] border-b border-slate-800 flex items-center gap-3">
        <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
           <Shield className="w-6 h-6 text-[#ccff00]" /> ROLÊ SEGURO
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* Fake Call Section */}
        <section className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700">
           <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-fuchsia-400" />
              <div>
                 <h3 className="font-bold text-white">Chamada Falsa</h3>
                 <p className="text-xs text-slate-400">Simule uma ligação para sair de situações chatas.</p>
              </div>
           </div>
           
           {fakeCallTimer !== null ? (
               <div className="text-center py-4">
                  <p className="text-4xl font-black text-[#ccff00] animate-pulse">00:0{fakeCallTimer}</p>
                  <button onClick={() => setFakeCallTimer(null)} className="text-xs text-red-500 font-bold mt-2 uppercase">Cancelar</button>
               </div>
           ) : (
               <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => startFakeCall(5)} className="bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-fuchsia-400 transition-all">
                     Agora
                  </button>
                  <button onClick={() => startFakeCall(10)} className="bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-fuchsia-400 transition-all">
                     10 seg
                  </button>
                  <button onClick={() => startFakeCall(30)} className="bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-300 border border-slate-700 hover:bg-slate-700 hover:border-fuchsia-400 transition-all">
                     30 seg
                  </button>
               </div>
           )}
        </section>

        {/* Location Share */}
        <section className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700">
           <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-cyan-400" />
              <div>
                 <h3 className="font-bold text-white">Compartilhar Local</h3>
                 <p className="text-xs text-slate-400">Envie onde você está para amigos de confiança.</p>
              </div>
           </div>
           <Button variant="secondary" fullWidth onClick={() => alert("Link de localização temporária copiado!")}>
              <MapPin className="w-4 h-4 mr-2" /> Gerar Link Seguro
           </Button>
        </section>

        {/* SOS Button */}
        <section className="pt-8 text-center">
            <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Em caso de emergência</p>
            <button 
               onClick={handleSOS}
               className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_30px_rgba(220,38,38,0.4)] border-4 border-red-500 flex flex-col items-center justify-center active:scale-95 transition-transform mx-auto"
            >
               <Bell className="w-10 h-10 text-white animate-pulse mb-1" />
               <span className="text-2xl font-black text-white italic">SOS</span>
            </button>
            <p className="text-[10px] text-slate-500 mt-4 max-w-[200px] mx-auto">
               Isso alertará seus contatos de emergência e as autoridades locais.
            </p>
        </section>

      </div>
    </div>
  );
};
