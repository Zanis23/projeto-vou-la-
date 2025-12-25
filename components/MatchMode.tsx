
import React, { useState } from 'react';
import { X, Heart, MessageCircle, MapPin, ChevronDown, Wand2, Loader2, Sparkles, Star, Flame, Zap } from 'lucide-react';
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
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // IA States
    const [icebreaker, setIcebreaker] = useState<string | null>(null);
    const [loadingIA, setLoadingIA] = useState(false);

    const swipe = async (direction: 'left' | 'right', customMsg?: string) => {
        trigger(direction === 'right' ? 'success' : 'light');
        setLastDirection(direction);

        if (direction === 'right') {
            setShowMatch(true);
            setTimeout(() => setShowMatch(false), 2000);

            const currentProfile = profiles[currentIndex];
            const currentUser = await db.user.get();
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
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: true,
                        type: 'text'
                    }
                ]
            };

            // Create chat
            await db.chats.add(newChat);

            // Send notification to the liked user
            await db.notifications.add({
                userId: currentProfile.id,
                type: 'match_like',
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar,
                title: '💕 Novo Match!',
                message: `${currentUser.name} te enviou um oi no ${placeName}!`,
                read: false,
                chatId: newChat.id,
                placeName: placeName
            });
        }

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setLastDirection(null);
            setIcebreaker(null);
            setDragOffset({ x: 0, y: 0 });
        }, 400);
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
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col animate-[fadeIn_0.3s_ease-out] overflow-hidden">
            {/* Premium Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-[var(--background)]/80 to-transparent backdrop-blur-sm">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white active:scale-95 transition-all shadow-lg"
                >
                    <ChevronDown className="w-6 h-6 border-none" />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.4em]">RADAR SOCIAL</span>
                        <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                    </div>
                    <h2 className="text-sm font-black text-white italic tracking-widest uppercase opacity-80">{placeName}</h2>
                </div>

                <div className="w-12"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
                {/* Dynamic Background Glows */}
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

                {showMatch && (
                    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-[fadeIn_0.2s_ease-out]">
                        <div className="relative">
                            <div className="absolute inset-0 bg-pink-500 blur-[60px] opacity-40 animate-pulse"></div>
                            <Heart className="w-32 h-32 fill-pink-500 text-pink-500 drop-shadow-[0_0_30px_rgba(236,72,153,1)] relative z-10 animate-[pop_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]" />
                        </div>
                        <h2 className="text-5xl font-black text-white italic tracking-tighter mt-8 rotate-[-3deg] uppercase shadow-emerald-500">Match!</h2>
                        <p className="text-pink-400 text-sm font-black mt-4 uppercase tracking-[0.2em] bg-pink-500/10 px-6 py-2 rounded-full border border-pink-500/20">Oi enviado com sucesso</p>
                    </div>
                )}

                {!isFinished ? (
                    <div
                        className="relative w-full max-w-sm aspect-[4/5] transition-all duration-300 ease-out cursor-grab active:cursor-grabbing z-20"
                        style={{
                            transform: isDragging
                                ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`
                                : lastDirection === 'left'
                                    ? 'translateX(-600px) rotate(-40deg)'
                                    : lastDirection === 'right'
                                        ? 'translateX(600px) rotate(40deg)'
                                        : 'translate(0, 0) rotate(0deg)',
                            opacity: isDragging ? 1 - Math.abs(dragOffset.x) / 500 : lastDirection ? 0 : 1
                        }}
                        onTouchStart={(e) => {
                            setIsDragging(true);
                            const touch = e.touches[0];
                            const startX = touch.clientX;
                            const startY = touch.clientY;

                            const handleMove = (moveEvent: TouchEvent) => {
                                const currentTouch = moveEvent.touches[0];
                                setDragOffset({
                                    x: currentTouch.clientX - startX,
                                    y: currentTouch.clientY - startY
                                });
                            };

                            const handleEnd = () => {
                                setIsDragging(false);
                                if (Math.abs(dragOffset.x) > 120) {
                                    swipe(dragOffset.x > 0 ? 'right' : 'left');
                                } else {
                                    setDragOffset({ x: 0, y: 0 });
                                }
                                document.removeEventListener('touchmove', handleMove);
                                document.removeEventListener('touchend', handleEnd);
                            };

                            document.addEventListener('touchmove', handleMove);
                            document.addEventListener('touchend', handleEnd);
                        }}
                    >
                        <div className="absolute inset-0 bg-[var(--surface)] rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 premium-shadow glass-card">
                            {/* Profile Image with subtle zoom on hover */}
                            <div className="absolute inset-0 overflow-hidden">
                                <img src={currentProfile.avatar} className="w-full h-full object-cover transition-transform duration-[10s] ease-linear hover:scale-110" alt={currentProfile.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            </div>

                            {/* IA SUGGESTION BUBBLE - Premium Redesign */}
                            {icebreaker && (
                                <div className="absolute top-6 left-6 right-6 z-30 animate-[slideDown_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
                                    <div className="bg-[var(--primary)] p-4 rounded-3xl rounded-tl-none shadow-2xl border border-black/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 blur-xl rounded-full -mr-8 -mt-8"></div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 mb-1.5 flex items-center gap-2">
                                            <Zap className="w-3 h-3 fill-current" /> IA ICEBREAKER
                                        </p>
                                        <p className="font-black text-black text-sm leading-tight italic">"{icebreaker}"</p>
                                    </div>
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 text-white z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-[var(--primary)] text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-bounce">
                                        <Flame className="w-3 h-3 fill-current" /> {currentProfile.status}
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full border border-white/10 uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3" /> {placeName}
                                    </div>
                                </div>

                                <h2 className="text-5xl font-black italic tracking-tighter leading-none mb-3 drop-shadow-2xl">
                                    {currentProfile.name}, <span className="text-3xl font-normal not-italic opacity-80">{currentProfile.age}</span>
                                </h2>

                                <p className="text-sm font-medium text-slate-300 mb-6 line-clamp-3 leading-relaxed">
                                    {currentProfile.bio}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {currentProfile.tags.map((tag, i) => (
                                        <span key={tag} className="text-[9px] font-black bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/5 uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors" style={{ animationDelay: `${i * 0.1}s` }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Premium Actions Bar */}
                        <div className="absolute -bottom-24 left-0 right-0 flex justify-center items-center gap-6">
                            <button
                                onClick={() => swipe('left')}
                                className="w-16 h-16 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 flex items-center justify-center text-slate-400 shadow-2xl active:scale-90 transition-all hover:bg-white/10 hover:text-white group"
                            >
                                <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                            </button>

                            <button
                                onClick={handleGenerateIA}
                                disabled={loadingIA}
                                className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center text-black shadow-[0_0_30px_var(--primary-glow)] active:scale-90 transition-all hover:scale-110 relative overflow-hidden group"
                            >
                                {loadingIA ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        <Wand2 className="w-9 h-9 relative z-10 group-hover:rotate-12 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => swipe('right')}
                                className="w-16 h-16 bg-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(192,38,211,0.4)] active:scale-90 transition-all hover:scale-110 border border-fuchsia-400/30 group"
                            >
                                <MessageCircle className="w-8 h-8 fill-current group-hover:scale-125 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-12 animate-[fadeIn_0.5s_ease-out] bg-[var(--surface)]/30 backdrop-blur-xl rounded-[3rem] border border-white/5">
                        <div className="w-28 h-28 bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative">
                            <span className="text-5xl">🔭</span>
                            <div className="absolute inset-0 border-4 border-[var(--primary)] rounded-[2rem] animate-ping opacity-20"></div>
                        </div>
                        <h3 className="text-3xl font-black text-white italic mb-3 tracking-tighter uppercase">Fim do Radar</h3>
                        <p className="text-slate-500 mb-10 max-w-[240px] mx-auto text-sm font-medium leading-relaxed">Você já explorou todo mundo que está visível no {placeName}.</p>
                        <button
                            onClick={onClose}
                            className="bg-[var(--primary)] text-black font-black uppercase tracking-widest py-4 px-10 rounded-2xl shadow-[0_0_30px_var(--primary-glow)] hover:scale-105 active:scale-95 transition-all"
                        >
                            FECHAR
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
