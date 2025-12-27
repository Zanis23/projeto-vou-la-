import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown } from 'lucide-react';
import { User } from '../types';
import { generateMockRanking } from '../utils/core';
import { slideUp } from '../src/styles/animations';

interface RankingProps {
  currentUser?: User;
}

export const Ranking: React.FC<RankingProps> = ({ currentUser }) => {
  const leaderboard = useMemo(() => {
    if (!currentUser) return [];
    return generateMockRanking(currentUser.points, currentUser.name, currentUser.avatar);
  }, [currentUser]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="p-4 pb-24 min-h-screen bg-[var(--background)] pt-safe transition-colors duration-500">

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 mb-8 mt-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700/50"
      >
        <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-3 rounded-2xl shadow-lg shadow-amber-500/20 rotate-3">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter">RANKING</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Semanal - Dourados/MS</p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {leaderboard.map((user, index) => {
          const isMe = user.isMe;

          return (
            <motion.div
              key={user.id}
              variants={slideUp}
              className={`relative flex items-center p-4 rounded-2xl border transition-all
                ${isMe
                  ? 'bg-[var(--surface)] border-[var(--primary)] shadow-[0_0_15px_var(--primary-glow)]'
                  : 'bg-slate-800/40 border-slate-700/50'
                }
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Rank Number */}
              <div className={`w-8 h-8 flex items-center justify-center font-black text-lg mr-4 italic relative
                 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-600' : 'text-slate-600'}
              `}>
                {index === 0 && <Crown className="w-5 h-5 absolute -top-3 -left-1 rotate-[-20deg] fill-yellow-400 text-yellow-400" />}
                #{index + 1}
              </div>

              {/* Avatar */}
              <div className="relative mr-4">
                <img src={user.avatar} className={`w-12 h-12 rounded-full object-cover border-2 ${isMe ? 'border-[var(--primary)]' : 'border-slate-600'}`} alt={user.name} />
                {isMe && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--primary)] rounded-full border-2 border-slate-800"></div>}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className={`font-bold text-sm ${isMe ? 'text-[var(--primary)]' : 'text-white'}`}>
                  {user.name} {isMe && '(Você)'}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {index === 0 ? 'Lenda do Rolê' : 'Festeiro'}
                </p>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="font-black text-white text-lg">{user.points.toLocaleString()}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">XP</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
