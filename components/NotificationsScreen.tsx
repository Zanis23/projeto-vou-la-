import React, { useEffect, useState } from 'react';
import { X, Check, Bell, Loader2, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useHaptic } from '../hooks/useHaptic';
import { MatchOverlay } from './MatchOverlay';

interface NotificationProps {
    onClose: () => void;
    onUpdateBadge?: (count: number) => void;
}

interface Interaction {
    id: string;
    type: 'LIKE' | 'CONNECT';
    actor: {
        id: string;
        name: string;
        avatar: string;
        bio?: string;
    };
    created_at: string;
}

export const NotificationsScreen: React.FC<NotificationProps> = ({ onClose, onUpdateBadge }) => {
    const { trigger } = useHaptic();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<Interaction[]>([]);
    const [matchedUser, setMatchedUser] = useState<Interaction['actor'] | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await api.getPendingInteractions();
        setRequests(data as any); // Cast for simplicity if types aren't fully synced yet
        if (onUpdateBadge) onUpdateBadge(data.length);
        setLoading(false);
    };

    const handleRespond = async (id: string, accept: boolean) => {
        trigger(accept ? 'success' : 'light');

        // Find user for match effect
        const req = requests.find(r => r.id === id);

        // Optimistic Update
        setRequests(prev => prev.filter(r => r.id !== id));
        if (onUpdateBadge) onUpdateBadge(requests.length - 1);

        if (accept && req) {
            setMatchedUser(req.actor);
        }

        try {
            await api.respondToInteraction(id, accept ? 'ACCEPTED' : 'REJECTED');
        } catch (err) {
            console.error("Failed to respond", err);
            // Revert on error? For now simple log.
        }
    };

    if (matchedUser) {
        return (
            <MatchOverlay
                user={matchedUser as any}
                onClose={() => setMatchedUser(null)}
                onChat={() => {
                    // Navigate to chat (Future impl: window.location.hash = '#chat' etc)
                    setMatchedUser(null);
                    onClose(); // Close notifications too
                }}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col animate-[slideLeft_0.3s_ease-out]">
            {/* Header */}
            <div className="px-6 pt-safe pb-4 flex justify-between items-center bg-[var(--surface)] border-b border-[var(--surface-highlight)]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--primary)]/10 rounded-xl relative">
                        <Bell className="w-6 h-6 text-[var(--primary)]" />
                        {requests.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                            NOTIFICAÇÕES
                        </h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            SUAS CONEXÕES
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { trigger('light'); onClose(); }}
                    className="p-3 bg-[var(--background)] rounded-full text-white border border-white/10 active:scale-90 transition-transform"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Carregando...</span>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                        <Bell className="w-16 h-16 mb-4 stroke-1" />
                        <h3 className="text-xl font-black italic uppercase">Tudo limpo!</h3>
                        <p className="text-sm max-w-[200px]">Nenhuma nova solicitação por enquanto.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="bg-[var(--surface)] border border-[var(--surface-highlight)] p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden group animate-[fadeIn_0.4s_ease-out]">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            <div className="relative shrink-0">
                                <img src={req.actor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.actor.id}`} className="w-14 h-14 rounded-full border-2 border-white/10 object-cover" alt="" />
                                <div className="absolute -bottom-1 -right-1 bg-[var(--primary)] text-black p-1 rounded-full border border-black shadow-lg">
                                    <MessageCircle className="w-3 h-3" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-base leading-tight truncate">{req.actor.name}</h4>
                                <p className="text-[10px] text-[var(--primary)] uppercase tracking-wide font-bold">Quer conectar com você</p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">{req.actor.bio || "Sem bio..."}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRespond(req.id, false)}
                                    className="p-3 bg-red-500/10 text-red-500 rounded-2xl active:scale-90 transition-transform border border-red-500/20 hover:bg-red-500/20"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleRespond(req.id, true)}
                                    className="p-3 bg-emerald-500 text-white rounded-2xl active:scale-90 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:brightness-110"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
