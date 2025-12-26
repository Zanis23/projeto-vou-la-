import React from 'react';
import { User } from '../types';
import { MapPin, Music, Sparkles, Check, X, MessageCircle } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';

interface MatchCardProps {
    profile: User & { distance?: string; matchPercentage?: number; commonInterests?: string[] };
    onLike: () => void;
    onPass: () => void;
    onSuperLike?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ profile, onLike, onPass, onSuperLike }) => {
    const { trigger } = useHaptic();

    return (
        <div className="relative w-full h-[65vh] md:h-[600px] max-w-sm mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#0E1121] border border-[#334155] group select-none touch-none">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1121] via-transparent to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0E1121]/30 to-transparent" />
            </div>

            {/* Top Status */}
            <div className="absolute top-0 left-0 right-0 p-5 pt-6 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 w-fit">
                        <MapPin className="w-3 h-3 text-[var(--primary)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                            {profile.distance || '2 km'}
                        </span>
                    </div>
                    {profile.matchPercentage && (
                        <div className="bg-[var(--primary)]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 w-fit shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                            <Sparkles className="w-3 h-3 text-black" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-black">
                                {profile.matchPercentage}% Match
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 flex flex-col gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter drop-shadow-lg flex items-end gap-2">
                        {profile.name} <span className="text-xl text-[var(--text-muted)] font-medium not-italic mb-1">{profile.age || 24}</span>
                    </h2>
                    <p className="text-sm font-medium text-slate-300 line-clamp-2 mt-1 drop-shadow-md">
                        {profile.bio || "Explorando os melhores rolês da cidade. 🚀"}
                    </p>
                </div>

                {/* Interests / Vibes */}
                <div className="flex flex-wrap gap-2">
                    {(profile.commonInterests || ['Sertanejo', 'Eletrônica', 'Barzinho']).slice(0, 3).map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white">
                            {interest}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 mt-2 px-2">
                    <button
                        onClick={() => { trigger('medium'); onPass(); }}
                        className="w-14 h-14 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-slate-400 shadow-lg active:scale-90 transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
                    >
                        <X className="w-6 h-6 stroke-[3px]" />
                    </button>

                    {onSuperLike && (
                        <button
                            onClick={() => { trigger('success'); onSuperLike(); }}
                            className="w-12 h-12 rounded-full bg-[#1e293b] border border-[#334155] flex items-center justify-center text-blue-400 shadow-lg active:scale-90 transition-all hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50"
                        >
                            <MessageCircle className="w-5 h-5 stroke-[2.5px]" />
                        </button>
                    )}

                    <button
                        onClick={() => { trigger('success'); onLike(); }}
                        className="w-16 h-16 rounded-full bg-[var(--primary)] text-black flex items-center justify-center shadow-[0_0_20px_var(--primary-glow)] active:scale-90 transition-all hover:scale-110 hover:brightness-110"
                    >
                        <HeartFilled className="w-7 h-7" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper for the filled heart icon
const HeartFilled = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
);
