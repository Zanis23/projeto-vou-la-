
import React, { useState } from 'react';
import { X, Wand2, Image as ImageIcon, Download, Loader2, Send } from 'lucide-react';
import { Button } from './Button';
import { generateAIImage, editAIImage } from '../services/geminiService';

interface AiStudioProps {
  onClose: () => void;
}

type Mode = 'GENERATE' | 'EDIT';

export const AiStudio: React.FC<AiStudioProps> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('GENERATE');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<'1K' | '2K' | '4K'>('1K');
  
  // For Edit Mode - Mock Initial Image (In a real app, user would upload)
  const [baseImage, setBaseImage] = useState<string>('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=500&auto=format&fit=crop');

  const handleAction = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResultImage(null);

    try {
      if (mode === 'GENERATE') {
        // Fix: Mandatory API key selection check for Gemini 3 Pro Image models as per guidelines
        if (typeof (window as any).aistudio !== 'undefined') {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
            // Guidelines: proceed anyway assuming success as per "assume the key selection was successful after triggering openSelectKey()"
          }
        }

        const img = await generateAIImage(prompt, selectedSize);
        if (img) setResultImage(img);
        else alert("Erro ao gerar imagem. Tente novamente.");
      } else {
        // Convert the URL to base64 for the mock implementation
        // In real usage, this comes from file input
        const response = await fetch(baseImage);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const img = await editAIImage(base64data, prompt);
          if (img) setResultImage(img);
          else alert("Erro ao editar imagem.");
          setLoading(false);
        };
        reader.readAsDataURL(blob);
        return; // Return early as reader is async
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#0E1121] flex flex-col animate-[slideUp_0.3s_ease-out]">
      {/* Header */}
      <div className="pt-safe px-4 pb-4 bg-[#0E1121] border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-[#ccff00]" />
          AI STUDIO
        </h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* Mode Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setMode('GENERATE'); setResultImage(null); }}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'GENERATE' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-slate-400'}`}
          >
            GERAR (Nano Banana Pro)
          </button>
          <button 
             onClick={() => { setMode('EDIT'); setResultImage(null); }}
             className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'EDIT' ? 'bg-[#ccff00] text-black shadow-lg' : 'text-slate-400'}`}
          >
            EDITAR (Flash Image)
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 space-y-4">
           
           {mode === 'GENERATE' && (
              <div>
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Resolução</label>
                 <div className="flex gap-2">
                    {(['1K', '2K', '4K'] as const).map(size => (
                      <button 
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border text-xs font-bold ${selectedSize === size ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10' : 'border-slate-600 text-slate-500'}`}
                      >
                        {size}
                      </button>
                    ))}
                 </div>
              </div>
           )}

           {mode === 'EDIT' && (
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Imagem Base</label>
                <div className="relative rounded-xl overflow-hidden h-40 border border-slate-600">
                   <img src={baseImage} className="w-full h-full object-cover" alt="base" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Usando imagem de exemplo</span>
                   </div>
                </div>
             </div>
           )}

           <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                {mode === 'GENERATE' ? 'Descreva sua imagem' : 'O que você quer mudar?'}
              </label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'GENERATE' ? "Ex: Um DJ robô em uma festa neon..." : "Ex: Adicione óculos escuros..."}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-[#ccff00] focus:outline-none resize-none h-24"
              />
           </div>

           <Button fullWidth variant="neon" onClick={handleAction} disabled={loading || !prompt}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'PROCESSANDO...' : mode === 'GENERATE' ? 'CRIAR IMAGEM' : 'EDITAR IMAGEM'}
           </Button>
        </div>

        {/* Result Area */}
        {resultImage && (
          <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
             <h3 className="text-white font-bold mb-4 flex items-center gap-2">
               <ImageIcon className="w-5 h-5 text-[#ccff00]" /> Resultado
             </h3>
             <div className="relative rounded-2xl overflow-hidden border-2 border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                <img src={resultImage} className="w-full h-auto" alt="Generated" />
                <a href={resultImage} download="voula_ai.png" className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg active:scale-90 transition-transform">
                   <Download className="w-6 h-6" />
                </a>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
