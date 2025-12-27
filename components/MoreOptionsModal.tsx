import { motion } from 'framer-motion';
import { LayoutDashboard, Sparkles, Newspaper, Calendar, Trophy, TrendingUp, ShoppingBag, Settings, X } from 'lucide-react';
import { Tab, User } from '../types';

interface MoreOptionsModalProps {
  currentUser?: User;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenSettings: () => void;
}

export const MoreOptionsModal: React.FC<MoreOptionsModalProps> = ({ currentUser, onClose, onNavigate, onOpenSettings }) => {
  const menuItems = [
    { id: Tab.AI_FINDER, label: 'Sugestões', icon: <Sparkles className="w-6 h-6 text-cyan-400" />, bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { id: Tab.SOCIAL, label: 'Feed', icon: <Newspaper className="w-6 h-6 text-slate-300" />, bg: 'bg-[var(--bg-card)]/50 border-[var(--border-default)]' },
    { id: Tab.EVENTS, label: 'Eventos', icon: <Calendar className="w-6 h-6 text-fuchsia-400" />, bg: 'bg-[var(--bg-card)]/50 border-[var(--border-default)]' },
    { id: Tab.CHALLENGES, label: 'Desafios', icon: <Trophy className="w-6 h-6 text-yellow-400" />, bg: 'bg-[var(--bg-card)]/50 border-[var(--border-default)]' },
    { id: Tab.RANKING, label: 'Rankings', icon: <TrendingUp className="w-6 h-6 text-green-400" />, bg: 'bg-[var(--bg-card)]/50 border-[var(--border-default)]' },
    { id: Tab.STORE, label: 'Loja', icon: <ShoppingBag className="w-6 h-6 text-orange-400" />, bg: 'bg-[var(--bg-card)]/50 border-[var(--border-default)]' },
  ];

  if (currentUser?.ownedPlaceId) {
    menuItems.unshift({ id: Tab.DASHBOARD, label: 'Painel', icon: <LayoutDashboard className="w-6 h-6 text-[var(--primary-main)]" />, bg: 'bg-[var(--primary-main)]/10 border-[var(--primary-main)]/30' });
  }

  const container = {
    hidden: { opacity: 0, y: 50 },
    show: {
      opacity: 1, y: 0,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="w-full max-w-md bg-[var(--bg-default)] rounded-[2.5rem] border border-[var(--border-default)] p-8 relative glass-card shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Explorar</h2>
          <button onClick={onClose} className="p-2.5 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {menuItems.map(menuItem => (
            <motion.button
              key={menuItem.id}
              variants={item}
              onClick={() => onNavigate(menuItem.id)}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border transition-all active:scale-95 hover:border-[var(--primary-main)] group aspect-square ${menuItem.bg}`}
            >
              <div className="p-2 rounded-2xl bg-black/20 group-hover:scale-110 transition-transform">
                {menuItem.icon}
              </div>
              <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{menuItem.label}</span>
            </motion.button>
          ))}

          <motion.button
            variants={item}
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)]/50 transition-all active:scale-95 hover:border-[var(--primary-main)] group aspect-square"
          >
            <div className="p-2 rounded-2xl bg-black/20 group-hover:rotate-45 transition-transform">
              <Settings className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest text-center">Ajustes</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
