
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
    { id: Tab.AI_FINDER, label: 'Sugestões', icon: <Sparkles className="w-6 h-6 text-cyan-400" />, bg: 'bg-cyan-500/10 border-cyan-500/50' },
    { id: Tab.SOCIAL, label: 'Feed', icon: <Newspaper className="w-6 h-6 text-slate-300" />, bg: 'bg-slate-800 border-slate-700' },
    { id: Tab.EVENTS, label: 'Eventos', icon: <Calendar className="w-6 h-6 text-fuchsia-400" />, bg: 'bg-slate-800 border-slate-700' },
    { id: Tab.CHALLENGES, label: 'Desafios', icon: <Trophy className="w-6 h-6 text-yellow-400" />, bg: 'bg-slate-800 border-slate-700' },
    { id: Tab.RANKING, label: 'Rankings', icon: <TrendingUp className="w-6 h-6 text-green-400" />, bg: 'bg-slate-800 border-slate-700' },
    { id: Tab.STORE, label: 'Loja', icon: <ShoppingBag className="w-6 h-6 text-orange-400" />, bg: 'bg-slate-800 border-slate-700' },
  ];

  if (currentUser?.ownedPlaceId) {
    menuItems.unshift({ id: Tab.DASHBOARD, label: 'Painel', icon: <LayoutDashboard className="w-6 h-6 text-indigo-400" />, bg: 'bg-indigo-500/10 border-indigo-500/50' });
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#0E1121] rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-800 p-6 animate-[slideUp_0.3s_ease-out] relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white italic tracking-tight">Mais Opções</h2>
          <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all active:scale-95 hover:bg-opacity-80 aspect-square ${item.bg}`}
            >
              <div className="p-2 rounded-full bg-black/20">
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">{item.label}</span>
            </button>
          ))}

          {/* Config Button */}
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-slate-700 bg-slate-800 transition-all active:scale-95 hover:bg-opacity-80 aspect-square"
          >
            <div className="p-2 rounded-full bg-black/20">
              <Settings className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};
