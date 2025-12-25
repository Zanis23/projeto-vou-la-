import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, MapPin, Globe, User, Bot, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { getGeminiRecommendation, AIRecommendation } from '../services/geminiService';
import { useHaptic } from '../hooks/useHaptic';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendation?: AIRecommendation;
  timestamp: Date;
}

export const AiConcierge: React.FC = () => {
  const { trigger } = useHaptic();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou seu Concierge VOU LÁ. 🥂\nOnde você gostaria de curtir hoje? Posso sugerir lugares com base na sua vibe, música preferida ou localização.',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    trigger('light');

    try {
      const recommendation = await getGeminiRecommendation(query);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: recommendation.text,
        recommendation: recommendation,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      trigger('success');
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] pt-safe overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-[var(--primary)] to-fuchsia-600 rounded-2xl shadow-[0_0_15px_var(--primary-glow)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-base font-black text-white italic tracking-tighter uppercase leading-none">CONCIERGE Vibe</h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Inteligência Artificial Ativa</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scroll-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-out]`}
          >
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[var(--primary)]" />}
              </div>

              <div className="space-y-3">
                <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-xl
                  ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/[0.03] text-slate-200 border border-white/5 rounded-tl-none'}`}
                >
                  {msg.content}
                </div>

                {msg.recommendation?.groundingMetadata?.groundingChunks && (
                  <div className="space-y-2 mt-2">
                    {msg.recommendation.groundingMetadata.groundingChunks.map((chunk: any, i: number) => {
                      if (chunk.web) {
                        return (
                          <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-900/50 p-3 rounded-xl border border-white/5 hover:border-[var(--primary)] transition-colors">
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <div className="overflow-hidden">
                              <p className="text-[10px] font-bold text-white truncate uppercase">{chunk.web.title}</p>
                            </div>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-500" />
              </div>
              <div className="p-4 bg-white/5 rounded-[1.5rem] rounded-tl-none flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-[#020617] border-t border-white/5 mb-20">
        <div className="max-w-xl mx-auto flex gap-3 p-2 bg-white/[0.03] rounded-[1.8rem] border border-white/10 focus-within:border-[var(--primary)] transition-colors shadow-2xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Pergunte ao Concierge..."
            className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-white text-sm placeholder:text-slate-600"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="p-3.5 bg-[var(--primary)] rounded-2xl text-black disabled:opacity-30 transition-all active:scale-90 shadow-lg shadow-[var(--primary-glow)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};