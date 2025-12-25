
import React, { useState, useEffect } from 'react';
import { User, Place, Moment } from '../types';
import { X, Users, Zap, Heart, MessageCircle, Gift, ArrowLeft, Crown, Flame, Share2, MapPin, Clock, Camera, Star, Music, PartyPopper } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

interface SocialHubProps {
    place: Place;
    currentUser: User;
    onClose: () => void;
}

interface FeedItem {
    id: string;
    type: 'checkin' | 'match' | 'music' | 'moment' | 'order';
    user: {
        name: string;
        avatar: string;
        isVip?: boolean;
    };
    content: string;
    timestamp: string;
    meta?: any;
}

export const SocialHub: React.FC<SocialHubProps> = ({ place, currentUser, onClose }) => {
    const { trigger } = useHaptic();
    const [activeSegment, setActiveSegment] = useState<'live' | 'people' | 'requests'>('live');

    // Mock Live Activity Feed
    const feedItems: FeedItem[] = [
        {
            id: '1',
            type: 'checkin',
            user: { name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?u=1' },
            content: 'acabou de chegar no rolê! 💃',
            timestamp: 'Agora'
        },
        {
            id: '2',
            type: 'music',
            user: { name: 'DJ Live', avatar: 'https://i.pravatar.cc/150?u=dj' },
            content: 'soltou o som: "Hitmaker - Sentada 22" 🎧',
            timestamp: '2 min atrás'
        },
        {
            id: '3',
            type: 'moment',
            user: { name: 'Lucas Bento', avatar: 'https://i.pravatar.cc/150?u=2', isVip: true },
            content: 'postou um novo Moment!',
            timestamp: '5 min atrás',
            meta: { image: 'https://images.unsplash.com/photo-1514525253344-99a20399d63c?q=80&w=200&auto=format&fit=crop' }
        },
        {
            id: '4',
            type: 'match',
            user: { name: 'Sistema', avatar: 'https://i.pravatar.cc/150?u=system' },
            content: 'Um novo MATCH aconteceu agora! 🔥',
            timestamp: '8 min atrás'
        },
        {
            id: '5',
            type: 'checkin',
            user: { name: 'Carla M.', avatar: 'https://i.pravatar.cc/150?u=3', isVip: true },
            content: 'chegou com tudo na área VIP! ✨',
            timestamp: '12 min atrás'
        }
    ];

    const peopleHere = [
        { id: '1', name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Dançando muito! 💃', points: 1200 },
        { id: '2', name: 'Lucas Bento', avatar: 'https://i.pravatar.cc/150?u=2', status: 'No bar 🍻', points: 850 },
        { id: '3', name: 'Carla Menezes', avatar: 'https://i.pravatar.cc/150?u=3', status: 'Comemorando niver! ✨', points: 2500, isVip: true },
        { id: '4', name: 'João Paulo', avatar: 'https://i.pravatar.cc/150?u=4', status: 'Rolê insano', points: 400 },
        { id: '5', name: 'Mariana', avatar: 'https://i.pravatar.cc/150?u=5', status: 'Vibe 100%', points: 1600 }
    ];

    return (
        <div className="fixed inset-0 z-[200] bg-[var(--background)] flex flex-col animate-[fadeIn_0.3s_ease-out] overflow-hidden">
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-[var(--background)] to-transparent">
                <button
                    onClick={onClose}
                    className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white active:scale-95 transition-all shadow-lg"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.4em] mb-1">LIVE FEED</span>
                    <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">{place.name}</h2>
                </div>

                <button className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white active:scale-95 transition-all shadow-lg">
                    <Share2 className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-6 pt-24 pb-32 flex flex-col gap-6">

                {/* Hero Stats Card */}
                <div className="relative group overflow-hidden rounded-[2.5rem] bg-[var(--surface)] border border-white/5 p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] blur-[60px] opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition-opacity"></div>

                    <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-3 h-3 text-[var(--primary)]" /> Público Agora
                            </p>
                            <h3 className="text-3xl font-black text-white italic tracking-tighter">42 <span className="text-sm opacity-50 not-italic">PESSOAS</span></h3>
                        </div>
                        <div className="h-14 w-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center animate-pulse">
                            <Flame className="w-6 h-6 text-orange-500 fill-current" />
                            <span className="text-[7px] font-black text-orange-500 uppercase tracking-tighter">Hype Max</span>
                        </div>
                    </div>

                    <div className="mt-6 flex -space-x-3 items-center">
                        {peopleHere.slice(0, 5).map(p => (
                            <img key={p.id} src={p.avatar} className="w-10 h-10 rounded-full border-2 border-[var(--surface)] object-cover shadow-xl" alt="" />
                        ))}
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[var(--surface)] flex items-center justify-center text-[10px] font-black text-slate-400">
                            +37
                        </div>
                        <span className="ml-4 text-[9px] font-black text-[var(--primary)] uppercase tracking-tighter">Galera está on!</span>
                    </div>
                </div>

                {/* Segments Nav */}
                <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                    {(['live', 'people', 'requests'] as const).map((seg) => (
                        <button
                            key={seg}
                            onClick={() => { trigger('light'); setActiveSegment(seg); }}
                            className={`flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-[0.15em] transition-all
                            ${activeSegment === seg ? 'bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary-glow)]' : 'text-slate-500 hover:text-white'}`}
                        >
                            {seg === 'live' ? 'Atividade' : seg === 'people' ? 'Galera' : 'Pedidos'}
                        </button>
                    ))}
                </div>

                {/* Content Tabs */}
                <div className="flex-1">
                    {activeSegment === 'live' && (
                        <div className="space-y-4 animate-[slideUp_0.3s_ease-out]">
                            {feedItems.map((item, i) => (
                                <div key={item.id} className="flex gap-4 relative group" style={{ animationDelay: `${i * 0.1}s` }}>
                                    {/* Timeline Line */}
                                    {i !== feedItems.length - 1 && (
                                        <div className="absolute top-12 bottom-0 left-[21px] w-[2px] bg-white/5"></div>
                                    )}

                                    <div className="relative shrink-0">
                                        <div className={`w-[48px] h-[48px] squircle overflow-hidden border-2 relative z-10 ${item.user.isVip ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'border-white/10'}`}>
                                            <img src={item.user.avatar} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--surface)] rounded-full border border-white/10 flex items-center justify-center">
                                            {item.type === 'checkin' && <MapPin className="w-2.5 h-2.5 text-emerald-400" />}
                                            {item.type === 'music' && <Music className="w-2.5 h-2.5 text-fuchsia-400" />}
                                            {item.type === 'match' && <Heart className="w-2.5 h-2.5 text-red-500 fill-current" />}
                                            {item.type === 'moment' && <Camera className="w-2.5 h-2.5 text-cyan-400" />}
                                        </div>
                                    </div>

                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="text-sm font-black text-white italic">{item.user.name}</h4>
                                                {item.user.isVip && <Crown className="w-3 h-3 text-amber-500 fill-current" />}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{item.timestamp}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5 leading-relaxed">{item.content}</p>

                                        {item.meta?.image && (
                                            <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 max-w-[200px] aspect-square active:scale-[0.98] transition-transform">
                                                <img src={item.meta.image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSegment === 'people' && (
                        <div className="grid grid-cols-2 gap-4 animate-[slideUp_0.3s_ease-out]">
                            {peopleHere.map((p, i) => (
                                <div key={p.id} className="bg-[var(--surface)]/50 rounded-[2rem] p-4 border border-white/5 flex flex-col items-center gap-3 relative group overflow-hidden active:scale-95 transition-transform">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--primary)] blur-2xl opacity-10 -mr-8 -mt-8"></div>

                                    <div className="relative">
                                        <div className={`w-20 h-20 squircle overflow-hidden border-2 shadow-xl ${p.isVip ? 'border-amber-500' : 'border-white/10'}`}>
                                            <img src={p.avatar} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        {p.isVip && (
                                            <div className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-lg rotate-12 shadow-lg scale-90">
                                                <Crown className="w-3 h-3 text-black fill-current" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <h4 className="text-white font-black text-sm italic tracking-tighter truncate w-32 uppercase">{p.name}</h4>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{p.status}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full mt-1 relative z-10">
                                        <button className="flex-1 py-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl border border-white/10 text-slate-500 transition-all flex items-center justify-center">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        <button className="flex-1 py-2.5 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-500 rounded-xl border border-white/10 text-slate-500 transition-all flex items-center justify-center">
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeSegment === 'requests' && (
                        <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
                            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/30 to-fuchsia-600/30 p-8 rounded-[2.5rem] border border-white/10 text-center">
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 blur-3xl rounded-full"></div>
                                <Music className="w-12 h-12 text-white mx-auto mb-4 animate-bounce" />
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Vibe do Momento</h3>
                                <p className="text-xs text-slate-400 mt-3 mb-6 font-medium">O DJ está ouvindo a galera agora. Qual o próximo hit?</p>
                                <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Sugerir Música</button>
                            </div>

                            <div className="bg-[var(--surface)]/50 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-fuchsia-500/20 rounded-xl">
                                        <PartyPopper className="w-4 h-4 text-fuchsia-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">As Mais Pedidas</span>
                                </div>
                                {[
                                    { title: 'Sentada 22', artist: 'Hitmaker', votes: 12 },
                                    { title: 'MTG Quero Te Encontrar', artist: 'DJ Top', votes: 8 },
                                    { title: 'Vibe de Cria', artist: 'Trap BR', votes: 5 }
                                ].map((song, i) => (
                                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-black text-slate-500 italic">0{i + 1}</div>
                                            <div>
                                                <p className="text-white font-bold text-sm tracking-tight">{song.title}</p>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase">{song.artist}</p>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-500 group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] transition-all active:scale-90">
                                            <span className="text-[10px] font-black">{song.votes}</span>
                                            <Heart className="w-3.5 h-3.5 group-hover:fill-current" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Floating CTA */}
            <div className="absolute bottom-8 left-6 right-6 z-[60]">
                <div className="bg-[var(--surface)]/80 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-[0_-15px_40px_rgba(0,0,0,0.5)] flex items-center gap-4">
                    <img src={currentUser.avatar} className="w-12 h-12 rounded-2xl object-cover border border-white/20" alt="" />
                    <div className="flex-1">
                        <input
                            placeholder="Diga algo no Live Feed..."
                            className="w-full bg-transparent border-none text-white text-sm font-medium focus:ring-0 placeholder:text-slate-600"
                        />
                    </div>
                    <button className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-black flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)] active:scale-90 transition-all">
                        <Zap className="w-6 h-6 fill-current" />
                    </button>
                </div>
            </div>
        </div>
    );
};
