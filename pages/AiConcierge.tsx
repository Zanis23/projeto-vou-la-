import React, { useState } from 'react';
import { Sparkles, Send, Loader2, MapPin, Globe } from 'lucide-react';
import { Button } from '../components/Button';
import { getGeminiRecommendation, AIRecommendation } from '../services/geminiService';

export const AiConcierge: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendation | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResult(null);
    const recommendation = await getGeminiRecommendation(query);
    setResult(recommendation);
    setLoading(false);
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-slate-900 flex flex-col pt-safe">
      <div className="text-center mb-8 mt-4">
        <div className="inline-block p-3 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-cyan-500/20 mb-4 animate-float">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-black text-white italic">IA CONCIERGE</h2>
        <p className="text-sm text-slate-400">Powered by Gemini 2.5 Flash</p>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full space-y-6">
        <div className="bg-slate-800 rounded-2xl p-2 flex items-center border border-slate-700 shadow-lg focus-within:border-cyan-500 transition-colors">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ex: Onde tem show de rock hoje em Dourados?"
            className="bg-transparent w-full text-white px-4 py-2 focus:outline-none placeholder-slate-500 text-base"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {result && (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
            
            <p className="text-lg text-white font-medium leading-relaxed mb-6 whitespace-pre-wrap">
              {result.text}
            </p>

            {/* GROUNDING DATA DISPLAY */}
            {result.groundingMetadata && result.groundingMetadata.groundingChunks && (
              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fontes & Locais</h4>
                 
                 {result.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                    if (chunk.web) {
                      return (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800 hover:border-cyan-500 transition-colors">
                           <Globe className="w-4 h-4 text-cyan-400" />
                           <div className="overflow-hidden">
                             <p className="text-sm font-bold text-white truncate">{chunk.web.title}</p>
                             <p className="text-xs text-slate-500 truncate">{chunk.web.uri}</p>
                           </div>
                        </a>
                      );
                    }
                    if (chunk.maps?.placeAnswerSources?.[0]?.reviewSnippets?.[0]) {
                         // Handling simplified Maps snippet
                        const mapData = chunk.maps.placeAnswerSources[0].reviewSnippets[0];
                        return (
                           <div key={i} className="flex items-start gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                              <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-1" />
                              <div>
                                <p className="text-sm text-slate-300">"{mapData.snippet}"</p>
                              </div>
                           </div>
                        )
                    }
                    return null;
                 })}
              </div>
            )}
          </div>
        )}

        {/* Suggested Prompts */}
        {!result && !loading && (
          <div className="grid grid-cols-2 gap-3 mt-8">
            <button onClick={() => setQuery("Melhores bares com música ao vivo hoje")} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-cyan-500 text-left transition-colors active:scale-95">
              <span className="text-2xl mb-2 block">🎸</span>
              <span className="text-sm font-bold text-slate-300">Música ao Vivo</span>
            </button>
            <button onClick={() => setQuery("Restaurantes abertos agora em Dourados")} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:border-fuchsia-500 text-left transition-colors active:scale-95">
              <span className="text-2xl mb-2 block">🍽️</span>
              <span className="text-sm font-bold text-slate-300">Jantar Agora</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};