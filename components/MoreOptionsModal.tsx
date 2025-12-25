
import React from 'react';
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
    { id: Tab.AI_FINDER, label: 'Sugestões', sub: 'IA Concierge', icon: <Sparkles className="w-8 h-8 text-cyan-400" />, gradient: 'from-cyan-500/20 to-blue-600/5' },
    { id: Tab.SOCIAL, label: 'Feed', sub: 'Ao Vivo', icon: <Newspaper className="w-8 h-8 text-fuchsia-400" />, gradient: 'from-fuchsia-500/20 to-purple-600/5' },
    { id: Tab.EVENTS, label: 'Eventos', sub: 'Agenda', icon: <Calendar className="w-8 h-8 text-violet-400" />, gradient: 'from-violet-500/20 to-indigo-600/5' },
    { id: Tab.CHALLENGES, label: 'Desafios', sub: 'Ganhe XP', icon: <Trophy className="w-8 h-8 text-yellow-400" />, gradient: 'from-yellow-500/20 to-amber-600/5' },
    { id: Tab.RANKING, label: 'Rankings', sub: 'Top Usuários', icon: <TrendingUp className="w-8 h-8 text-emerald-400" />, gradient: 'from-emerald-500/20 to-green-600/5' },
    { id: Tab.STORE, label: 'Loja', sub: 'Vouchers', icon: <ShoppingBag className="w-8 h-8 text-orange-400" />, gradient: 'from-orange-500/20 to-red-600/5' },
  ];

  if (currentUser?.ownedPlaceId) {
    menuItems.unshift({ id: Tab.DASHBOARD, label: 'Painel', sub: 'Business', icon: <LayoutDashboard className="w-8 h-8 text-[var(--primary)]" />, gradient: 'from-[var(--primary)]/20 to-lime-600/5' });
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0E1121]/80 backdrop-blur-xl flex items-end sm:items-center justify-center animate-[fadeIn_0.3s_ease-out]" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[var(--surface)]/90 border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 animate-[slideUp_0.4s_cubic-bezier(0.2,0.8,0.2,1)] relative overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Decorator Background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] opacity-5 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Menu Principal</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Explore o app</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          {menuItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                group relative flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border border-white/5 
                transition-all duration-300 active:scale-95 hover:border-white/10 overflow-hidden
                bg-gradient-to-br ${item.gradient} hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]
              `}
              style={{ animation: `slideUp 0.5s cubic-bezier(0.2,0.8,0.2,1) ${i * 0.05}s backwards` }}
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="p-3.5 rounded-2xl bg-black/20 backdrop-blur-md shadow-inner ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <div className="text-center">
                <span className="block text-sm font-black text-white uppercase tracking-wider">{item.label}</span>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">{item.sub}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Config Button - Full Width */}
        <button
          onClick={onOpenSettings}
          className="w-full relative z-10 flex items-center justify-between p-5 rounded-[2rem] border border-white/5 bg-slate-800/30 hover:bg-slate-800/50 transition-all active:scale-95 group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-black/20 text-slate-400 group-hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-black text-white uppercase tracking-wider">Configurações</span>
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Perfil, Tema, Conta</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full group-hover:bg-[var(--primary)] transition-colors"></div>
          </div>
        </button>
      </div>
    </div>
  );
};
