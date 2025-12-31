import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart, MessageCircle, ChevronDown, Wand2, Loader2, Sparkles } from 'lucide-react';
import { MOCK_MATCH_PROFILES } from '../constants';
import { useHaptic } from '@/hooks/useHaptic';
import { db } from '@/utils/storage';
import { Chat } from '@/types';
import { generateIcebreaker } from '@/services/geminiService';
import { slideUp, springTransition } from '@/styles/animations';

interface MatchModeProps {
    placeName: string;
    onClose: () => void;
}

export const MatchMode: React.FC<MatchModeProps> = ({ placeName, onClose }) => {
    const { trigger } = useHaptic();
    const [profiles] = useState(MOCK_MATCH_PROFILES);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMatch, setShowMatch] = useState(false);

    const [icebreaker, setIcebreaker] = useState<string | null>(null);
    const [loadingIA, setLoadingIA] = useState(false);

    // Motion values for drag
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const colorRight = useTransform(x, [0, 150], ['rgba(236, 72, 153, 0)', 'rgba(236, 72, 153, 0.4)']);
    const colorLeft = useTransform(x, [-150, 0], ['rgba(100, 116, 139, 0.4)', 'rgba(100, 116, 139, 0)']);

    const swipe = async (direction: 'left' | 'right', customMsg?: string) => {
        trigger(direction === 'right' ? 'success' : 'light');

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
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        isMe: true,
                        type: 'text'
                    }
                ]
            };
            await db.chats.add(newChat);
        }

        x.set(0); // Reset x for next card
        setCurrentIndex(prev => prev + 1);
        setIcebreaker(null);
    };

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) {
            swipe('right');
        } else if (info.offset.x < -100) {
            swipe('left');
        }
    };

    const handleGenerateIA = async () => {
        if (loadingIA) return;
        trigger('medium');
        setLoadingIA(true);
        try {
            const profile = profiles[currentIndex];
            const text = await generateIcebreaker(profile.name, placeName, profile.tags);
            setIcebreaker(text);
        } catch (e) {
            console.error("Erro IA:", e);
        } finally {
            setLoadingIA(false);
        }
    };

    const currentProfile = profiles[currentIndex];
    const isFinished = currentIndex >= profiles.length;

    return (
        <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-[100] bg-[#0E1121] flex flex-col"
        >
            <div className="pt-safe px-4 pb-2 bg-gradient-to-b from-fuchsia-900/40 to-transparent flex items-center justify-between z-20">
                <button onClick={onClose} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 backdrop-blur-md">
                    <ChevronDown className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-black text-white italic tracking-tighter flex items-center gap-2">
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

                <AnimatePresence>
                    {showMatch && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                        >
                            <motion.div
                                initial={{ scale: 0.5, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={springTransition}
                                className="scale-[2]"
                            >
                                <Heart className="w-20 h-20 fill-pink-500 text-pink-500 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" />
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-4xl font-black text-white italic tracking-tighter mt-4 rotate-[-5deg]"
                            >
                                OI ENVIADO!
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="absolute inset-x-0 h-40 bg-pink-500/20 blur-[100px] -z-10"
                            />
                            <p className="text-white text-[10px] font-black uppercase tracking-widest mt-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">Confira na aba "Bonde"</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isFinished ? (
                    <div className="relative w-full max-w-sm aspect-[3/4]">
                        {/* Background Cards for Stack Depth */}
                        <div className="absolute inset-0 translate-y-4 scale-90 bg-slate-800/20 rounded-3xl border border-white/5 z-0" />
                        <div className="absolute inset-0 translate-y-2 scale-95 bg-slate-800/40 rounded-3xl border border-white/5 z-0" />

                        <motion.div
                            style={{ x, rotate, opacity }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                            whileDrag={{ scale: 1.05 }}
                            className="absolute inset-0 bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing z-10"
                        >
                            <img src={currentProfile.avatar} className="w-full h-full object-cover pointer-events-none" alt={currentProfile.name} />

                            {/* Visual feedback for swipe */}
                            <motion.div style={{ backgroundColor: colorRight }} className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <motion.div style={{ opacity: useTransform(x, [50, 150], [0, 1]) }} className="border-4 border-pink-500 p-4 rounded-2xl rotate-[-15deg]">
                                    <span className="text-4xl font-black text-pink-500 uppercase italic">QUERO!</span>
                                </motion.div>
                            </motion.div>
                            <motion.div style={{ backgroundColor: colorLeft }} className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <motion.div style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }} className="border-4 border-slate-400 p-4 rounded-2xl rotate-[15deg]">
                                    <span className="text-4xl font-black text-slate-400 uppercase italic">PASSAR</span>
                                </motion.div>
                            </motion.div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>

                            {/* IA SUGGESTION BUBBLE */}
                            <AnimatePresence>
                                {icebreaker && (
                                    <motion.div
                                        initial={{ y: -20, opacity: 0, scale: 0.9 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: -20, opacity: 0, scale: 0.9 }}
                                        className="absolute top-6 left-6 right-6 z-30"
                                    >
                                        <div className="bg-[#ccff00] p-4 rounded-2xl rounded-tl-none shadow-xl border-l-4 border-black text-black">
                                            <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> IA Sugere:
                                            </p>
                                            <p className="font-bold text-sm leading-tight italic">"{icebreaker}"</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                        </motion.div>

                        {/* Actions */}
                        <div className="absolute -bottom-24 left-0 right-0 flex justify-center items-center gap-4">
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => swipe('left')}
                                className="w-16 h-16 bg-slate-800/80 backdrop-blur-md rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-300 shadow-xl"
                            >
                                <X className="w-8 h-8" />
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={handleGenerateIA}
                                disabled={loadingIA}
                                className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-indigo-400 overflow-hidden group"
                            >
                                {loadingIA ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-7 h-7 group-hover:rotate-12 transition-transform" />}
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => swipe('right')}
                                className="w-20 h-20 bg-gradient-to-tr from-fuchsia-600 to-pink-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] border-4 border-white/10"
                            >
                                <MessageCircle className="w-10 h-10 fill-current" />
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-8"
                    >
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <span className="text-4xl">👀</span>
                            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 border-4 border-slate-700 rounded-full"></motion.div>
                        </div>
                        <h3 className="text-2xl font-black text-white italic mb-2">ZEROU O ROLÊ!</h3>
                        <p className="text-slate-400 mb-8 max-w-[200px] mx-auto">Você já viu todo mundo que está visível por aqui.</p>
                        <button onClick={onClose} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl hover:bg-slate-700 transition-colors">Voltar</button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
