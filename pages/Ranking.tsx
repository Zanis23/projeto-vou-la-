
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Crown, Loader2, ChevronLeft } from 'lucide-react';
import { User } from '../types';
import { db } from '../utils/storage';

interface RankingProps {
  currentUser?: User;
}

export const Ranking: React.FC<RankingProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      const data = await (db as any).ranking.list();
      setUsers(data);
      setLoading(false);
    };
    loadRanking();
  }, []);

  const leaderboard = useMemo(() => {
    if (users.length === 0 && currentUser) {
      // Temporary fallback while DB is still populating or if user is the only one
      return [{ ...currentUser, isMe: true } as any];
    }
    return users.map(u => ({
      ...u,
      isMe: u.id === currentUser?.id
    }));
  }, [users, currentUser]);

  return (
    <div className="p-4 pb-24 min-h-screen bg-[var(--background)] pt-safe transition-colors duration-500">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 mt-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50">
        <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-3 rounded-2xl shadow-lg shadow-amber-500/20 rotate-3">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter">RANKING</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Semanal - Dourados/MS</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Calculando Ranking...</p>
        </div>
      )}

      <div className="space-y-3 relative z-10">
        {leaderboard.map((user, index) => {
          const isTop3 = index < 3;
          const isMe = user.isMe;

          return (
            <div
              key={user.id}
              className={`relative flex items-center p-4 rounded-2xl border transition-all duration-300
                ${isMe
                  ? 'bg-[var(--surface)] border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)] scale-[1.02] z-10'
                  : 'bg-[var(--surface)]/60 border-[var(--surface-highlight)]'
                }
              `}
            >
              {/* Rank Number */}
              <div className={`w-8 h-8 flex items-center justify-center font-black text-lg mr-4 italic
                 ${index === 0 ? 'text-yellow-400 drop-shadow-md' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-[var(--text-muted)]'}
              `}>
                {index === 0 && <Crown className="w-5 h-5 absolute -top-3 -left-1 rotate-[-20deg] fill-yellow-400 text-yellow-400 animate-bounce" />}
                #{index + 1}
              </div>

              {/* Avatar */}
              <div className="relative mr-4">
                <img src={user.avatar} className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isMe ? 'border-[var(--primary)]' : 'border-[var(--surface-highlight)]'}`} alt={user.name} />
                {isMe && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full border-2 border-[var(--surface)]"></div>}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm truncate ${isMe ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}`}>
                  {user.name} {isMe && '(Você)'}
                </h3>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  {index === 0 ? 'Lenda do Rolê' : 'Festeiro'}
                </p>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <p className="font-black text-[var(--text-main)] text-lg">{user.points.toLocaleString()}</p>
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Fade & Scroll Indicator */}
      <div className="fixed bottom-20 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none z-20 flex items-end justify-center pb-8">
        <div className="flex flex-col items-center animate-bounce opacity-50">
          <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Ver Mais</span>
          <ChevronLeft className="w-5 h-5 -rotate-90 text-[var(--text-muted)]" />
        </div>
      </div>
    </div>
  );
};
