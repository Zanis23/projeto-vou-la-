import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, TrendingUp, Sparkles } from 'lucide-react';
import { User } from '../types';
import { generateMockRanking } from '../utils/core';
import { slideUp, scaleIn } from '../src/styles/animations';
import { Header } from '../src/components/ui/Header';
import { Avatar } from '../src/components/ui/Avatar';

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
        staggerChildren: 0.1
      }
    }
  };

  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="full-screen bg-bg-default overflow-hidden flex flex-col">
      <Header
        left={
          <div className="w-10 h-10 rounded-xl bg-primary-main/10 flex items-center justify-center border border-primary-main/20 rotate-3">
            <Trophy className="w-5 h-5 text-primary-main shadow-[0_0_10px_var(--primary-glow)]" />
          </div>
        }
        title="HALL OF FAME"
        subtitle="Ranking Semanal • Dourados"
        right={<div className="w-10" />}
      />

      <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6 scroll-container space-y-8 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex items-end justify-center gap-2 pt-10 pb-4 relative"
        >
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary-main/5 to-transparent blur-[60px] pointer-events-none" />

          {topThree[1] && (
            <motion.div variants={slideUp} className="flex flex-col items-center flex-1">
              <div className="relative mb-3">
                <Avatar src={topThree[1].avatar} size="lg" className="border-4 border-slate-400 shadow-2xl" />
                <div className="absolute -top-2 -left-2 bg-slate-400 text-black w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shadow-lg">2</div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white italic truncate w-24">{topThree[1].name}</p>
                <p className="text-[9px] font-bold text-text-tertiary uppercase">{topThree[1].points} XP</p>
              </div>
            </motion.div>
          )}

          {topThree[0] && (
            <motion.div variants={scaleIn} className="flex flex-col items-center flex-1 -mt-8 relative z-10">
              <div className="relative mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border-2 border-dashed border-primary-main/20 rounded-full"
                />
                <Avatar src={topThree[0].avatar} size="xl" className="w-28 h-28 border-4 border-primary-main shadow-[0_0_30px_var(--primary-glow)]" />
                <Crown className="w-8 h-8 text-primary-main absolute -top-8 left-1/2 -translate-x-1/2 drop-shadow-[0_0_10px_var(--primary-glow)]" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary-main text-black px-4 py-1 rounded-full font-black text-[10px] shadow-xl">KING #1</div>
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-white italic truncate w-32">{topThree[0].name}</p>
                <div className="flex items-center justify-center gap-1 text-[10px] text-primary-main font-black uppercase tracking-widest mt-0.5">
                  <Sparkles className="w-3 h-3" /> {topThree[0].points} XP
                </div>
              </div>
            </motion.div>
          )}

          {topThree[2] && (
            <motion.div variants={slideUp} className="flex flex-col items-center flex-1">
              <div className="relative mb-3">
                <Avatar src={topThree[2].avatar} size="lg" className="border-4 border-amber-600 shadow-2xl" />
                <div className="absolute -top-2 -right-2 bg-amber-600 text-white w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] shadow-lg">3</div>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white italic truncate w-24">{topThree[2].name}</p>
                <p className="text-[9px] font-bold text-text-tertiary uppercase">{topThree[2].points} XP</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {leaderboard.slice(3).map((user, index) => {
            const isMe = user.isMe;
            const absoluteRank = index + 4;

            return (
              <motion.div
                key={user.id}
                variants={slideUp}
                className={`relative flex items-center p-4 rounded-[1.5rem] border transition-all duration-500
                  ${isMe
                    ? 'bg-primary-main text-black border-transparent shadow-[0_10px_30px_-5px_var(--primary-glow)] scale-[1.02] z-20'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
                  }
                `}
              >
                <div className={`w-8 font-black text-sm italic mr-4 ${isMe ? 'text-black' : 'text-text-tertiary'}`}>
                  #{absoluteRank}
                </div>

                <div className="flex-1 flex items-center gap-4">
                  <Avatar src={user.avatar} size="md" className={`${isMe ? 'border-2 border-black/20' : 'border border-white/10'}`} />
                  <div className="min-w-0">
                    <h3 className={`font-black text-sm italic tracking-tight truncate ${isMe ? 'text-black' : 'text-white'}`}>
                      {user.name} {isMe && '• VOCÊ'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isMe ? 'text-black/60' : 'text-text-tertiary'}`}>
                        {absoluteRank < 10 ? 'Elite' : 'Membro'}
                      </p>
                      {absoluteRank < 10 && <TrendingUp className={`w-3 h-3 ${isMe ? 'text-black' : 'text-status-success'}`} />}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-black text-base italic leading-none ${isMe ? 'text-black' : 'text-white'}`}>{user.points.toLocaleString()}</p>
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isMe ? 'text-black/40' : 'text-text-tertiary'}`}>XP</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
