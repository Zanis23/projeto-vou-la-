import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, MapPin, Globe, MessageSquare, ArrowRight } from 'lucide-react';
import { getGeminiRecommendation, AIRecommendation } from '@/services/geminiService';
import { fadeIn, slideUp } from '@/styles/animations';

export const AiConcierge: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIRecommendation | null>(null);
  const [displayedText, setDisplayedText] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setDisplayedText('');
    const recommendation = await getGeminiRecommendation(query);
    setResult(recommendation);
    setLoading(false);
  };

  // Simple typing effect
  useEffect(() => {
    if (!result?.text) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(result.text.slice(0, i));
      i += 4; // Faster typing for better UX
      if (i > result.text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="full-screen bg-[#050505] overflow-y-auto pb-safe">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="px-6 py-12 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-cyan-400 flex items-center justify-center shadow-[0_20px_40px_rgba(79,70,229,0.3)] mb-8"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div variants={slideUp} initial="initial" animate="animate" className="text-center mb-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">VOU LÁ<br />CONCIERGE</h2>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.3em] mt-3">Advanced Intelligence</p>
        </motion.div>

        <div className="w-full max-w-md space-y-8">
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2rem] blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
            <div className="relative bg-bg-surface-1/40 backdrop-blur-2xl rounded-[2rem] p-3 border border-white/10 flex items-center shadow-2xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="O que você quer fazer hoje?"
                className="bg-transparent w-full text-white px-5 py-3 focus:outline-none placeholder-text-tertiary text-sm font-medium"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSearch}
                disabled={loading}
                className="w-12 h-12 bg-primary-main rounded-2xl text-black flex items-center justify-center disabled:opacity-50 transition-colors shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="glass-card !bg-white/5 border-white/5 p-8 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Recomendação IA</span>
                  </div>

                  <p className="text-white text-base font-medium leading-[1.6] whitespace-pre-wrap">
                    {displayedText}
                    {displayedText.length < (result.text?.length || 0) && (
                      <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="inline-block w-2 h-5 bg-primary-main ml-1 align-middle"
                      />
                    )}
                  </p>

                  {result.groundingMetadata?.groundingChunks && (
                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                      <h4 className="text-[10px] font-black text-white opacity-40 uppercase tracking-widest">Citações e Mapas</h4>
                      <div className="grid gap-3">
                        {result.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                          if (chunk.web) {
                            return (
                              <motion.a
                                key={i}
                                whileHover={{ x: 5 }}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-primary-main/30 group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
                                  <Globe className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-white uppercase truncate">{chunk.web.title}</p>
                                  <p className="text-[9px] text-text-tertiary truncate mt-0.5">{chunk.web.uri}</p>
                                </div>
                              </motion.a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setResult(null); setQuery(''); }}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Nova Consulta
                </motion.button>
              </motion.div>
            ) : !loading && (
              <motion.div
                key="prompts"
                variants={fadeIn}
                className="grid grid-cols-2 gap-4"
              >
                <button onClick={() => setQuery("Melhores bares com música ao vivo")} className="glass-card !bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left transition-all active:scale-95 group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight block">Música ao Vivo</span>
                </button>
                <button onClick={() => setQuery("Restaurantes abertos agora")} className="glass-card !bg-white/5 p-6 rounded-[2rem] border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-left transition-all active:scale-95 group">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest leading-tight block">Jantar Agora</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
