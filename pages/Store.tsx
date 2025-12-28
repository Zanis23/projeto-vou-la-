
import React, { useState } from 'react';
import { ShoppingBag, Lock, Ticket, Zap, Crown } from 'lucide-react';
import { User, Ticket as TicketType } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { Button } from '../components/Button';
import { WalletModal } from '../components/WalletModal';

interface StoreProps {
  currentUser?: User;
  onPurchase?: (cost: number) => void;
}

export const Store: React.FC<StoreProps> = ({ currentUser, onPurchase }) => {
  const { trigger } = useHaptic();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showWallet, setShowWallet] = useState(false);

  // Local state for tickets (In a real app, this would be in the User object or context)
  const [tickets, setTickets] = useState<TicketType[]>(currentUser?.wallet || []);

  const ITEMS = [
    { id: 'ticket_standard', title: 'Ingresso Padrão', description: 'Entrada individual para qualquer parceiro.', cost: 1000, icon: <Ticket className="w-6 h-6 text-emerald-400" />, type: 'ticket' },
    { id: 'ticket_vip', title: 'Ingresso VIP / Camarote', description: 'Acesso exclusivo e sem filas.', cost: 2500, icon: <Crown className="w-6 h-6 text-amber-400" />, type: 'ticket' },
    { id: 'voucher_10', title: 'Voucher 10% OFF', description: 'Válido no Tex Bar ou Jangoo.', cost: 1500, icon: <ShoppingBag className="w-6 h-6 text-fuchsia-400" />, type: 'voucher' },
    { id: 'boost_xp', title: 'Double XP (24h)', description: 'Ganhe o dobro de XP nos check-ins.', cost: 3000, icon: <Zap className="w-6 h-6 text-yellow-500" />, type: 'buff' },
  ];

  const handleBuy = (item: typeof ITEMS[0]) => {
    if (!currentUser || currentUser.points < item.cost) {
      trigger('error');
      alert("XP insuficiente! Vá para o rolê ganhar mais.");
      return;
    }

    trigger('medium');
    setPurchasing(item.id);

    // Simulate API call
    setTimeout(() => {
      trigger('success');

      // Add to wallet if it's a voucher or ticket
      if (item.type === 'voucher' || item.type === 'ticket') {
        const newTicket: TicketType = {
          id: Math.random().toString(36).substr(2, 9),
          title: item.title,
          placeName: 'Parceiros Vou Lá',
          qrCodeData: `voula_${item.type}_${Date.now()}`,
          status: 'valid',
          type: item.type === 'ticket' ? 'ingresso' : 'voucher',
          date: 'Válido por 7 dias'
        };

        const updatedTickets = [...tickets, newTicket];
        setTickets(updatedTickets);

        // Important: also update parent/db
        if (onPurchase) onPurchase(item.cost);
        alert(`Você comprou: ${item.title}! Já está na sua carteira.`);
      } else {
        if (onPurchase) onPurchase(item.cost);
        alert(`Você comprou: ${item.title}!`);
      }

      setPurchasing(null);
    }, 1500);
  };

  if (showWallet) {
    return <WalletModal tickets={tickets} onClose={() => setShowWallet(false)} />;
  }

  return (
    <div className="h-full bg-[var(--background)] pt-safe flex flex-col transition-colors duration-500">
      {/* Header with Balance */}
      <div className="px-6 py-6 border-b border-slate-800 bg-[var(--background)] sticky top-0 z-10 shadow-lg transition-colors duration-500">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-2xl font-black text-white italic tracking-tighter">LOJA</h2>
          <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">Saldo:</span>
            <span className="text-[var(--primary)] font-black">{currentUser?.points || 0} XP</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm">Troque seus pontos por benefícios reais.</p>

        <div className="mt-4">
          <Button fullWidth variant="secondary" onClick={() => setShowWallet(true)}>
            <Ticket className="w-5 h-5 mr-2 text-fuchsia-400" /> MINHA CARTEIRA
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {ITEMS.map(item => {
          const canAfford = (currentUser?.points || 0) >= item.cost;
          const isBuying = purchasing === item.id;

          return (
            <div key={item.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg border border-slate-700">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleBuy(item)}
                disabled={!canAfford || isBuying}
                className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95
                        ${canAfford
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-[0_0_15px_var(--primary-glow)] hover:opacity-90'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}
                    `}
              >
                {isBuying ? (
                  <span className="animate-pulse">Processando...</span>
                ) : (
                  <>
                    {canAfford ? <ShoppingBag className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    {item.cost} XP
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
