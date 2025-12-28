import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Sparkles, Newspaper, Calendar, Trophy, TrendingUp, ShoppingBag, Settings, X, ArrowRight } from 'lucide-react';
import { Tab, User } from '../types';
import { containerVariants, springTransition } from '../src/styles/animations';

interface MoreOptionsModalProps {
  currentUser?: User;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
}

export const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({ currentUser, onClose, onNavigate, onOpenSettings }) => {
  const menuItems = [
    { id: Tab.AI_FINDER, label: 'Concierge', icon: <Sparkles className="w-6 h-6 text-cyan-400" />, desc: 'Sugestões IA' },
    { id: Tab.SOCIAL, label: 'Bonde', icon: <Newspaper className="w-6 h-6 text-indigo-400" />, desc: 'Feed & Chat' },
    { id: Tab.EVENTS, label: 'Eventos', icon: <Calendar className="w-6 h-6 text-fuchsia-400" />, desc: 'Próximos rolês' },
    { id: Tab.CHALLENGES, label: 'Desafios', icon: <Trophy className="w-6 h-6 text-amber-400" />, desc: 'Ganhe XP' },
    { id: Tab.RANKING, label: 'Rankings', icon: <TrendingUp className="w-6 h-6 text-emerald-400" />, desc: 'Líderes' },
    { id: Tab.STORE, label: 'Vou Lá Store', icon: <ShoppingBag className="w-6 h-6 text-orange-400" />, desc: 'Use seus pontos' },
  ];

  if (currentUser?.ownedPlaceId) {
    menuItems.unshift({ id: Tab.DASHBOARD, label: 'Painel', icon: <LayoutDashboard className="w-6 h-6 text-[var(--primary-main)]" />, desc: 'Gerir Local' });
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl flex flex-col justify-end" onClick={onClose}>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="initial"
        className="w-full bg-[var(--bg-default)] rounded-t-[3rem] border-t border-white/5 p-6 xs:p-8 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 opacity-50"></div>

        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Explorar</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">Descubra novas experiências</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-900 rounded-full text-slate-400 active:scale-90 transition-all border border-white/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {menuItems.map(menuItem => (
            <motion.button
              key={menuItem.id}
              variants={itemVariants}
              onClick={() => onNavigate(menuItem.id)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5 transition-all active:scale-[0.98] hover:bg-slate-900 hover:border-white/10 group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {menuItem.icon}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-white uppercase block leading-none">{menuItem.label}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">{menuItem.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          variants={itemVariants}
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between p-5 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 active:scale-[0.98] transition-all mb-4 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl group-hover:rotate-45 transition-transform">
              <Settings className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-black text-white uppercase leading-none">Ajustes</span>
              <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Perfil, Tema e Conta</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-indigo-400" />
        </motion.button>
      </motion.div>
    </div>
  );
};

