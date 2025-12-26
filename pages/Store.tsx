
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Lock, Ticket, Zap, Crown, CheckCircle2, Calendar, MapPin, Sparkles, X } from 'lucide-react';
import { User, Ticket as TicketType } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { Button } from '../components/Button';
import { WalletModal } from '../components/WalletModal';
import { db } from '../utils/storage';

interface StoreProps {
  currentUser?: User;
  onPurchase?: (cost: number) => void;
}

export const Store: React.FC<StoreProps> = ({ currentUser, onPurchase }) => {
  const { trigger } = useHaptic();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'TICKETS'>('ITEMS');
  const [selectedTicket, setSelectedTicket] = useState<typeof EVENT_TICKETS[0] | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      const userTickets = await db.wallet.getTickets();
      setTickets(userTickets);
    };
    fetchTickets();
  }, []);

  const ITEMS = [
    { id: 'vip_1', title: 'Voucher 10% OFF', description: 'Válido no Tex Bar ou Jangoo.', cost: 1500, icon: <Ticket className="w-6 h-6 text-fuchsia-400" />, type: 'voucher' },
    { id: 'boost_xp', title: 'Double XP (24h)', description: 'Ganhe o dobro de XP nos check-ins.', cost: 3000, icon: <Zap className="w-6 h-6 text-yellow-400" />, type: 'buff' },
    { id: 'badge_king', title: 'Badge "Rei do Camarote"', description: 'Ostente no seu perfil.', cost: 5000, icon: <Crown className="w-6 h-6 text-[var(--primary)]" />, type: 'cosmetic' },
  ];

  const EVENT_TICKETS = [
    {
      id: 'evt_1',
      title: 'Sunset Party - VIP',
      place: 'Tex Music Bar',
      price: 45.00,
      date: '28 Dez, 18:00',
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400',
      description: 'A festa mais exclusiva do verão está de volta! Open bar premium, DJs internacionais e a melhor vista do pôr do sol na Tex Music Bar. Traje sugerido: All White.',
      address: 'Av. das Esmeraldas, 451 - Marília/SP'
    },
    {
      id: 'evt_2',
      title: 'Pagode do Ano',
      place: 'Jangoo Chopperia',
      price: 30.00,
      date: '30 Dez, 20:00',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      description: 'O melhor do pagode 90 e atualidade com os grupos locais mais bombados. Chopp em dobro até as 22h e muita gente bonita na Jangoo.',
      address: 'Rua das Flores, 12 - Marília/SP'
    },
  ];

  const handleBuyItem = (item: typeof ITEMS[0]) => {
    if (!currentUser || currentUser.points < item.cost) {
      trigger('error');
      alert("XP insuficiente! Vá para o rolê ganhar mais.");
      return;
    }

    trigger('medium');
    setPurchasing(item.id);

    setTimeout(() => {
      trigger('success');
      if (onPurchase) onPurchase(item.cost);
      setPurchasing(null);
      alert(`Você comprou: ${item.title}!`);
    }, 1500);
  };

  const handleBuyTicket = async (ticket: typeof EVENT_TICKETS[0]) => {
    trigger('medium');
    setPurchasing(ticket.id);

    const success = await db.wallet.buy(ticket.id);

    if (success) {
      trigger('success');
      const updated = await db.wallet.getTickets();
      setTickets(updated);
      alert(`Ingresso para ${ticket.title} adquirido!`);
    } else {
      trigger('error');
      alert("Erro ao processar compra. Tente novamente.");
    }
    setPurchasing(null);
  };

  if (showWallet) {
    return <WalletModal tickets={tickets} onClose={() => setShowWallet(false)} />;
  }

  return (
    <div className="h-full bg-[var(--background)] pt-safe flex flex-col transition-colors duration-500 overflow-hidden">
      {/* Header with Balance */}
      <div className="px-6 py-6 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-lg sticky top-0 z-20 transition-colors duration-500">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Marketplace</h2>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 flex items-center gap-2 shadow-inner">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saldo:</span>
            <span className="text-[var(--primary)] font-black italic">{currentUser?.points || 0} XP</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant={activeTab === 'ITEMS' ? 'primary' : 'secondary'}
            className="flex-1 !rounded-2xl !py-2.5 !text-[10px]"
            onClick={() => { trigger('light'); setActiveTab('ITEMS'); }}
          >
            <Sparkles className="w-4 h-4 mr-2" /> RECOMPENSAS
          </Button>
          <Button
            variant={activeTab === 'TICKETS' ? 'primary' : 'secondary'}
            className="flex-1 !rounded-2xl !py-2.5 !text-[10px]"
            onClick={() => { trigger('light'); setActiveTab('TICKETS'); }}
          >
            <Ticket className="w-4 h-4 mr-2" /> INGRESSOS
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32 hide-scrollbar">
        {activeTab === 'ITEMS' ? (
          <div className="space-y-4">
            {ITEMS.map(item => {
              const canAfford = (currentUser?.points || 0) >= item.cost;
              const isBuying = purchasing === item.id;

              return (
                <div key={item.id} className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--surface-highlight)] flex flex-col gap-4 shadow-xl transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black/20 flex items-center justify-center shadow-inner border border-white/5">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-white leading-tight text-lg italic tracking-tight uppercase">{item.title}</h3>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-wide">{item.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyItem(item)}
                    disabled={!canAfford || isBuying}
                    className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95
                            ${canAfford
                        ? 'bg-gradient-to-r from-[var(--primary)] to-lime-500 text-black shadow-[0_8px_20px_-5px_var(--primary-glow)] hover:brightness-110'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                        `}
                  >
                    {isBuying ? (
                      <span className="animate-pulse">PROCESSANDO...</span>
                    ) : (
                      <>
                        {canAfford ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        RESGATAR POR {item.cost} XP
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-10 blur-[50px]"></div>
              <h3 className="text-xl font-black text-white italic tracking-tighter leading-none mb-1">PASSE EXCLUSIVOS</h3>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest opacity-70">Eventos selecionados para você</p>
            </div>

            {EVENT_TICKETS.map(ticket => (
              <div
                key={ticket.id}
                className="relative aspect-[16/10] rounded-[2rem] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl transition-transform active:scale-[0.98]"
                onClick={() => { trigger('light'); setSelectedTicket(ticket); }}
              >
                <img src={ticket.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={ticket.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <span className="text-white font-black text-lg italic tracking-tighter">R$ {ticket.price.toFixed(2)}</span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex items-center gap-1.5 text-[var(--primary)] mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{ticket.place}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter leading-none mb-3 drop-shadow-lg">{ticket.title}</h3>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{ticket.date}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBuyTicket(ticket); }}
                      disabled={purchasing === ticket.id}
                      className="ml-auto bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,255,255,0.2)] hover:bg-[var(--primary)] hover:shadow-[0_0_20px_var(--primary-glow)]"
                    >
                      {purchasing === ticket.id ? '...' : 'COMPRAR'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-end animate-[fadeIn_0.3s_ease-out]">
          <div
            className="w-full bg-[var(--background)] rounded-t-[3rem] p-8 pb-safe shadow-2xl border-t border-white/10 flex flex-col animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-slate-800 rounded-full self-center mb-8 opacity-50"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 text-[var(--primary)] mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{selectedTicket.place}</span>
                </div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none uppercase">{selectedTicket.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 mb-10 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
              <div className="flex gap-4">
                <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Data e Hora</span>
                  <span className="text-sm font-black text-white italic">{selectedTicket.date}</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Preço</span>
                  <span className="text-sm font-black text-[var(--primary)] italic">R$ {selectedTicket.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Sobre o Evento</span>
                <p className="text-sm font-medium text-slate-300 leading-relaxed italic opacity-90">
                  "{selectedTicket.description}"
                </p>
              </div>

              <div className="bg-slate-900/50 p-5 rounded-3xl border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Local</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center border border-white/5">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{selectedTicket.address}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <Button
                fullWidth
                variant="primary"
                className="!rounded-2xl !py-4 shadow-[0_10px_30px_rgba(204,255,0,0.3)]"
                onClick={() => { handleBuyTicket(selectedTicket); setSelectedTicket(null); }}
              >
                GARANTIR MEU LUGAR
              </Button>
            </div>
          </div>
          <div className="absolute inset-0 bg-transparent -z-10" onClick={() => setSelectedTicket(null)}></div>
        </div>
      )}

      <div className="p-4 bg-[var(--background)] border-t border-white/5 pb-safe">
        <Button fullWidth variant="secondary" className="!rounded-2xl !py-4 shadow-lg group" onClick={() => { trigger('medium'); setShowWallet(true); }}>
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-black transition-colors">
                <Ticket className="w-5 h-5 text-[var(--primary)] group-hover:text-black" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">Acessar Minha Carteira</span>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-400 group-hover:text-white transition-colors">
              {tickets.length} ITENS
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};
