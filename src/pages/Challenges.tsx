
import React, { useState, useMemo } from 'react';
import { Trophy, Target, MessageCircle, MapPin, Flame, Zap, TrendingUp } from 'lucide-react';
import { Mission } from '@/types';
import { MOCK_MISSIONS } from '../constants';
import { useHaptic } from '@/hooks/useHaptic';

import { User } from '@/types';

interface ChallengesProps {
    currentUser?: User;
}

export const Challenges: React.FC<ChallengesProps> = ({ currentUser }) => {
    const { trigger: _trigger } = useHaptic();

    // Calculate ACTUAL mission progress based on currentUser history
    const calculatedMissions = useMemo(() => {
        return MOCK_MISSIONS.map(mission => {
            let progress = mission.progress;

            if (currentUser?.history) {
                if (mission.id === 'm1') { // "Primeiro Gole" - Faç seu primeiro check-in
                    progress = currentUser.history.length > 0 ? 1 : 0;
                } else if (mission.id === 'm2') { // "Explorador" - 3 check-ins
                    progress = Math.min(3, currentUser.history.length);
                } else if (mission.id === 'm3') { // "Festeiro" - 5 check-ins
                    progress = Math.min(5, currentUser.history.length);
                }
            }

            return {
                ...mission,
                progress,
                completed: progress >= mission.total
            };
        });
    }, [currentUser?.history]);

    const [missions] = useState<Mission[]>(calculatedMissions);

    // Stats for the Streak Card
    const streakStats = {
        current: 7,
        record: 14,
        bonus: 70,
        nextLevelProgress: 23
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'location': return <MapPin className="w-5 h-5 text-fuchsia-400" />;
            case 'social': return <MessageCircle className="w-5 h-5 text-blue-400" />;
            case 'target': return <Target className="w-5 h-5 text-red-400" />;
            default: return <Trophy className="w-5 h-5 text-yellow-400" />;
        }
    };

    const totalDailyXP = missions.reduce((acc, m) => acc + (m.completed ? m.xpReward : 0), 0);
    const maxDailyXP = missions.reduce((acc, m) => acc + m.xpReward, 0);
    const completedCount = missions.filter(m => m.progress >= m.total).length;
    const dailyProgress = (completedCount / missions.length) * 100;

    return (
        <div className="h-full bg-[var(--background)] p-4 pt-safe overflow-y-auto pb-24 transition-colors duration-500">

            <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="p-3 bg-[var(--primary)]/10 rounded-xl border border-[var(--primary)]/30">
                    <Target className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter">MISSÕES E DESAFIOS</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Complete e ganhe XP</p>
                </div>
            </div>

            {/* 1. SEQUÊNCIA / STREAK CARD */}
            <div className="bg-[#151a21] rounded-3xl p-6 border border-slate-800 relative overflow-hidden mb-6 shadow-xl">
                <div className="absolute top-0 right-0 p-3">
                    <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Super</span>
                </div>

                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-orange-500 rounded-full"><Flame className="w-4 h-4 text-white fill-current" /></div>
                        <h3 className="font-bold text-white text-lg">Sequência</h3>
                    </div>
                    <p className="text-slate-400 text-xs mb-4">Ativa agora</p>

                    {/* Animated Fire */}
                    <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                        <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
                        <Flame className="w-20 h-20 text-orange-500 fill-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse" />
                        <span className="absolute text-3xl font-black text-white drop-shadow-md mt-4">{streakStats.current}</span>
                    </div>
                    <p className="text-slate-300 font-medium text-sm">dias seguidos</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="flex flex-col items-center">
                        <Trophy className="w-5 h-5 text-yellow-500 mb-1" />
                        <span className="font-black text-white text-lg">{streakStats.record}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Recorde</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Zap className="w-5 h-5 text-fuchsia-500 mb-1" />
                        <span className="font-black text-white text-lg">+{streakStats.bonus}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">XP Bônus</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                        <span className="font-black text-white text-lg">{streakStats.nextLevelProgress}%</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Progresso</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Próximo nível</span>
                        <span>7 dias</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 w-1/4 rounded-full"></div>
                    </div>
                </div>

                <div className="mt-4 bg-[#1e1523] p-3 rounded-xl border border-pink-500/20 flex items-center gap-2 justify-center">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-pink-400 text-xs font-bold">Uma semana completa! Você tá ON!</span>
                </div>
            </div>

            {/* 2. PROGRESSO DIÁRIO */}
            <div className="bg-gradient-to-br from-[#2a1b3d] to-[#161221] rounded-3xl p-5 border border-purple-500/30 mb-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-white font-bold text-lg">Progresso Diário</h3>
                        <p className="text-slate-400 text-sm">{completedCount} de {missions.length} missões completas</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-purple-400 block">{maxDailyXP - totalDailyXP}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">XP disponível</span>
                    </div>
                </div>

                <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${dailyProgress}%` }}></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                    <span>{Math.round(dailyProgress)}% completo</span>
                    <span className="flex items-center gap-1">🕒 Atualizado agora</span>
                </div>
            </div>

            {/* 3. MISSÕES DIÁRIAS LIST */}
            <div className="space-y-4 mb-8">
                <h3 className="text-sm font-bold text-[#f97316] uppercase tracking-widest flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Missões Diárias
                </h3>

                {missions.map(mission => (
                    <div key={mission.id} className="bg-[#151a21] border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                    {getIcon(mission.icon)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{mission.title}</h4>
                                    <p className="text-xs text-slate-400">{mission.description}</p>
                                </div>
                            </div>
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-purple-500/30">
                                +{mission.xpReward} XP
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                <span>Progresso</span>
                                <span>{mission.progress} / {mission.total}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${mission.progress >= mission.total ? 'bg-green-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 4. WEEKLY CHALLENGE */}
            <div>
                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Trophy className="w-4 h-4" /> Desafio Semanal
                </h3>

                <div className="bg-gradient-to-br from-yellow-900/40 to-black border border-yellow-700/50 p-5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 blur-[50px] opacity-20"></div>

                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                            <h4 className="text-lg font-black text-white">Mestre da Noite</h4>
                            <p className="text-xs text-slate-400 mt-1">Faça check-in em 5 categorias diferentes de rolê.</p>
                        </div>
                        <span className="bg-yellow-500 text-black font-black text-xs px-3 py-1 rounded-full border border-yellow-400">
                            +500 XP
                        </span>
                    </div>

                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div className="h-full bg-yellow-500 w-[40%] shadow-[0_0_10px_#eab308]"></div>
                    </div>
                    <p className="text-[10px] text-right text-yellow-500/80 font-bold mt-2 uppercase">2/5 Completado</p>
                </div>
            </div>

        </div>
    );
};
