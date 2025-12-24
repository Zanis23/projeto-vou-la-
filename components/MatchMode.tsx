
import React, { useState } from 'react';
import { X, Heart, MessageCircle, MapPin, ChevronDown, Wand2, Loader2, Sparkles } from 'lucide-react';
import { MOCK_MATCH_PROFILES } from '../constants';
import { useHaptic } from '../hooks/useHaptic';
import { db } from '../utils/storage';
import { Chat } from '../types';
import { generateIcebreaker } from '../services/geminiService';

interface MatchModeProps {
  placeName: string;
  onClose: () => void;
}

export const MatchMode: React.FC<MatchModeProps> = ({ placeName, onClose }) => {
  const { trigger } = useHaptic();
  const [profiles] = useState(MOCK_MATCH_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  
  // IA States
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [loadingIA, setLoadingIA] = useState(false);

  const swipe = async (direction: 'left' | 'right', customMsg?: string) => {
    trigger(direction === 'right' ? 'success' : 'light');
    setLastDirection(direction);
    
    if (direction === 'right') {
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 1500);

        const currentProfile = profiles[currentIndex];
        const msg = customMsg || icebreaker || `👋 Oie! Te vi aqui no radar do ${placeName}.`;

        const newChat: Chat = {
            id: `chat_${currentProfile.id}_${Date.now()}`,
            userId: currentProfile.id,
            userName: currentProfile.name,
            userAvatar: currentProfile.avatar,
            lastMessage: msg,
            unreadCount: 1,
            messages: [
                {
                    id: Date.now().toString(),
                    senderId: 'me',
                    text: msg,
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    isMe: true,
                    type: 'text'
                }
            ]
        };
        // Fix: await db.chats.add as it is now async
        await db.chats.add(newChat);
    }

    setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setLastDirection(null);
        setIcebreaker(null);
    }, 300);
  };

  const handleGenerateIA = async () => {
    if (loadingIA) return;
    trigger('medium');
    setLoadingIA(true);
    const profile = profiles[currentIndex];
    const text = await generateIcebreaker(profile.name, placeName, profile.tags);
    setIcebreaker(text);
    setLoadingIA(false);
  };

  const currentProfile = profiles[currentIndex];
  const isFinished = currentIndex >= profiles.length;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1121] flex flex-col animate-[slideUp_0.3s_ease-out]">
      <div className="pt-safe px-4 pb-2 bg-gradient-to-b from-fuchsia-900/40 to-transparent flex items-center justify-between z-20">
         <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 backdrop-blur-md">
           <ChevronDown className="w-6 h-6" />
         </button>
         <div className="flex flex-col items-center">
            <h2 className="text-lg font-black text-white italic tracking-tighter shadow-black drop-shadow-lg flex items-center gap-2">
                <span className="animate-pulse">🔥</span> SOCIAL RADAR
            </h2>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {placeName}
            </p>
         </div>
         <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>

         {showMatch && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div className="scale-[2] animate-[bounce_0.5s_ease-in-out]">
                    <Heart className="w-20 h-20 fill-pink-500 text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
                </div>
                <h2 className="text-4xl font-black text-white italic tracking-tighter mt-4 rotate-[-5deg]">OI ENVIADO!</h2>
                <p className="text-white text-sm font-bold mt-2 bg-black/50 px-3 py-1 rounded-full">Confira na aba "Bonde"</p>
            </div>
         )}

         {!isFinished ? (
            <div className={`relative w-full max-w-sm aspect-[3/4] transition-transform duration-300 ease-in-out
                ${lastDirection === 'left' ? '-translate-x-[200px] rotate-[-20deg] opacity-0' : ''}
                ${lastDirection === 'right' ? 'translate-x-[200px] rotate-[20deg] opacity-0' : ''}
            `}>
                <div className="absolute inset-0 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img src={currentProfile.avatar} className="w-full h-full object-cover" alt={currentProfile.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                    
                    {/* IA SUGGESTION BUBBLE */}
                    {icebreaker && (
                        <div className="absolute top-6 left-6 right-6 z-30 animate-[slideDown_0.3s_ease-out]">
                            <div className="bg-[#ccff00] p-4 rounded-2xl rounded-tl-none shadow-xl border-l-4 border-black text-black">
                                <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> IA Sugere:
                                </p>
                                <p className="font-bold text-sm leading-tight italic">"{icebreaker}"</p>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-fuchsia-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                                {currentProfile.status}
                            </span>
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2 drop-shadow-md">
                            {currentProfile.name}, <span className="text-3xl font-normal not-italic">{currentProfile.age}</span>
                        </h2>
                        <p className="text-sm font-medium text-slate-200 mb-4 line-clamp-2 drop-shadow-sm">
                            {currentProfile.bio}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {currentProfile.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute -bottom-24 left-0 right-0 flex justify-center items-center gap-4">
                    <button 
                        onClick={() => swipe('left')}
                        className="w-16 h-16 bg-slate-800/80 backdrop-blur-md rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-300 shadow-xl active:scale-90 transition-transform"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    
                    <button 
                        onClick={handleGenerateIA}
                        disabled={loadingIA}
                        className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-transform border-2 border-indigo-400 overflow-hidden group"
                    >
                        {loadingIA ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-7 h-7 group-hover:rotate-12 transition-transform" />}
                    </button>

                    <button 
                        onClick={() => swipe('right')}
                        className="w-20 h-20 bg-gradient-to-tr from-fuchsia-600 to-pink-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] active:scale-90 transition-transform hover:scale-105 border-4 border-white/10"
                    >
                        <MessageCircle className="w-10 h-10 fill-current" />
                    </button>
                </div>
            </div>
         ) : (
             <div className="text-center p-8 animate-[fadeIn_0.5s_ease-out]">
                 <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                     <span className="text-4xl">👀</span>
                     <div className="absolute inset-0 border-4 border-slate-700 rounded-full animate-ping opacity-20"></div>
                 </div>
                 <h3 className="text-2xl font-black text-white italic mb-2">ZEROU O ROLÊ!</h3>
                 <p className="text-slate-400 mb-8 max-w-[200px] mx-auto">Você já viu todo mundo que está visível por aqui.</p>
                 <button onClick={onClose} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-700 transition-colors">Voltar</button>
             </div>
         )}
      </div>
    </div>
  );
};
