import React from 'react';
import { User, PrivacySettings } from '../types';
import { X, MessageCircle, UserPlus, Ghost, Users } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

interface PeopleListProps {
    placeName: string;
    people: User[];
    currentUser: User;
    onClose: () => void;
    onConnect: (userId: string) => void;
    isInline?: boolean; // New prop
}

export const PeopleList: React.FC<PeopleListProps> = ({ placeName, people, currentUser, onClose, onConnect, isInline = false }) => {
    const { trigger } = useHaptic();

    // Filter out users who have ghostMode enabled
    const visiblePeople = people.filter(p => !p.settings?.ghostMode);

    if (isInline) {
        return (
            <div className="flex flex-col bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-1 border border-white/5 relative overflow-hidden group/card">
                {/* Background Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                {/* Card Header (Reference Design) */}
                <div className="flex items-center justify-between p-4 pb-2 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                            <Users className="w-5 h-5 text-white/80" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-md">
                                QUEM TÁ AQUI?
                            </h3>
                            <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest mt-0.5">
                                ENCONTRE SUA GALERA
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{visiblePeople.length} ON</span>
                    </div>
                </div>

                {/* Inline Content (Grid) */}
                <div className="p-2 relative z-10">
                    {currentUser.settings?.ghostMode && (
                        <div className="mb-3 mx-2 bg-purple-500/10 border border-purple-500/30 p-2.5 rounded-xl flex items-center gap-3">
                            <div className="p-1.5 bg-purple-500/20 rounded-full">
                                <Ghost className="w-3.5 h-3.5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[10px] uppercase">Modo Fantasma</p>
                                <p className="text-purple-300 text-[9px] leading-tight">Você está invisível.</p>
                            </div>
                        </div>
                    )}

                    {visiblePeople.length === 0 ? (
                        <div className="bg-black/20 rounded-2xl p-6 text-center mx-2 mb-2">
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Ninguém visível ainda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {visiblePeople.map((user) => (
                                <div key={user.id} className="bg-[var(--background)]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-3 flex flex-col items-center gap-2 relative group hover:bg-[var(--surface)] hover:border-[var(--primary)]/30 transition-all">
                                    <div className="w-12 h-12 rounded-full p-0.5 border border-[var(--primary)] shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <div className="text-center min-w-0 w-full">
                                        <h4 className="text-white font-bold text-xs leading-none truncate px-1">{user.name.split(' ')[0]}</h4>
                                        <p className="text-[8px] text-slate-400 uppercase mt-0.5 truncate px-1">{user.bio || "Vibing"}</p>
                                    </div>
                                    <button
                                        onClick={() => onConnect(user.id)}
                                        className="w-full py-1.5 bg-[var(--primary)] text-black rounded-lg font-black uppercase text-[9px] tracking-wide mt-0.5 hover:brightness-110 active:scale-95 transition-transform"
                                    >
                                        Conectar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default Modal View
    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-[fadeIn_0.2s_ease-out]">
            {/* Header */}
            <div className="px-6 pt-safe pb-4 flex justify-between items-center bg-[var(--surface)] border-b border-[var(--surface-highlight)]">
                <div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                        QUEM TÁ NO
                    </h2>
                    <p className="text-[var(--primary)] font-black uppercase tracking-widest text-sm truncate max-w-[200px]">
                        {placeName}
                    </p>
                </div>
                <button
                    onClick={() => { trigger('light'); onClose(); }}
                    className="p-3 bg-[var(--background)] rounded-full text-white border border-white/10 active:scale-90 transition-transform"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {currentUser.settings?.ghostMode && (
                    <div className="mb-6 bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-full">
                            <Ghost className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Modo Fantasma Ativado</p>
                            <p className="text-purple-300 text-xs">Você está invisível nesta lista.</p>
                        </div>
                    </div>
                )}

                {visiblePeople.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                        <Ghost className="w-16 h-16 mb-4 text-slate-600" />
                        <p className="text-xl font-black italic text-slate-500 uppercase">Ninguém visível por aqui...</p>
                        <p className="text-sm text-slate-600">Seja o primeiro a agitar!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {visiblePeople.map((user) => (
                            <div key={user.id} className="bg-[var(--surface)] border border-[var(--surface-highlight)] rounded-3xl p-4 flex flex-col items-center gap-3 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />

                                <div className="relative w-20 h-20 rounded-full p-1 border-2 border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)]">
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                </div>

                                <div className="text-center z-10">
                                    <h3 className="text-white font-black italic tracking-tight text-lg leading-none mb-1">{user.name.split(' ')[0]}</h3>
                                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">{user.bio || "Vibing..."}</p>
                                </div>

                                <button
                                    onClick={() => onConnect(user.id)}
                                    className="w-full py-2 bg-[var(--primary)] text-[var(--on-primary)] rounded-xl font-black uppercase text-xs tracking-wider mt-1 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-4 h-4" /> Conectar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
