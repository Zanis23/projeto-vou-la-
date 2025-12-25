```typescript
import React from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const InstallPWA: React.FC = () => {
  const { deferredPrompt, install, isInstalled, isIOS, isMobile } = usePWA();
  const [isVisible, setIsVisible] = React.useState(true);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);

  // Show if: Mobile AND Not Installed AND (Has Prompt OR Is iOS) AND User hasn't closed it
  const shouldShow = isMobile && !isInstalled && isVisible && (deferredPrompt || isIOS);

  if (!shouldShow) return null;

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      install();
    }
  };

  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShowIOSInstructions(false)}>
        <div className="bg-[#1e293b] w-full max-w-md p-6 rounded-t-3xl border-t border-slate-700 pb-10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Instalar no iPhone</h3>
                <button onClick={() => setShowIOSInstructions(false)}><X className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-4 text-slate-300">
                    <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full font-bold">1</span>
                    <p>Toque no botão <Share className="inline w-5 h-5 mx-1 text-blue-500" /> <span className="text-white font-bold">Compartilhar</span> na barra inferior.</p>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                    <span className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full font-bold">2</span>
                    <p>Role para baixo e selecione <PlusSquare className="inline w-5 h-5 mx-1 text-white" /> <span className="text-white font-bold">Adicionar à Tela de Início</span>.</p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-[slideUp_0.4s_ease-out]">
      <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Instalar App</h3>
            <p className="text-slate-400 text-xs">Melhor experiência no app</p>
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
                onClick={handleInstallClick}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-lg font-bold text-xs uppercase tracking-wide hover:brightness-110 transition-all"
            >
                {isIOS ? 'Como Instalar' : 'Instalar'}
            </button>
        </div>
      </div>
    </div>
  );
};
```
