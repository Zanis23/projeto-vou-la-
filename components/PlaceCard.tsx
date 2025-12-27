import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place, MenuItem, OrderItem } from '../types';
import { MapPin, Crown, Check, ChevronRight, Music, Star, Clock, Bookmark, Flame, Utensils, BellRing, ThumbsUp, ThumbsDown, Zap, Users, X, Beer, Pizza, Loader2, CheckCircle2, Disc, Plus, Minus, Receipt, HelpCircle, History, BarChart3, Sparkles, ClipboardList, CreditCard, QrCode, ShoppingBag } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { useHaptic } from '../hooks/useHaptic';
import { FALLBACK_IMAGE, getUserById } from '../constants';
import { MatchMode } from './MatchMode';
import { db } from '../utils/storage';
import { fadeIn, slideUp, springTransition } from '../src/styles/animations';

interface PlaceCardProps {
    place?: Place;
    rank?: number;
    onCheckIn?: (id: string) => void;
    expanded?: boolean;
    isCheckedIn?: boolean;
    isSaved?: boolean;
    onToggleSave?: (id: string) => void;
    loading?: boolean;
    onClick?: () => void;
}

const MenuCategoryTab: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode; badge?: number }> = ({ label, active, onClick, icon, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border-2 relative
        ${active ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-[0_0_12px_var(--primary-glow)] scale-105' : 'bg-slate-800/50 text-slate-500 border-transparent active:bg-slate-800'}`}
    >
        {icon} {label}
        {typeof badge === 'number' && badge > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border border-slate-900 animate-bounce">
                {badge}
            </div>
        )}
    </button>
);

const MenuItemRow: React.FC<{ item: MenuItem; qty: number; onAdd: () => void; onRemove: () => void }> = ({ item, qty, onAdd, onRemove }) => {
    const imageSrc = item.imageUrl || (item.category === 'drink'
        ? 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop'
        : item.category === 'food'
            ? 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1558444453-1fa7d88EEBD1?q=80&w=300&auto=format&fit=crop');

    return (
        <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
            className="flex gap-3 xs:gap-4 p-3 xs:p-4 bg-slate-800/30 border border-slate-700/40 rounded-[1.8rem] mb-3 hover:bg-slate-800/40 transition-colors group relative overflow-hidden"
        >
            <div className="relative w-24 h-24 xs:w-28 xs:h-28 shrink-0 overflow-hidden rounded-2xl shadow-lg">
                <img src={imageSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.name} loading="lazy" />
                {!item.available && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="text-[8px] font-black text-white uppercase border border-white/30 px-2 py-0.5 rounded">Esgotado</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div className="min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-white text-sm xs:text-base leading-tight mb-1 italic truncate">{item.name}</h4>
                        {item.category === 'drink' && <Zap className="w-3 h-3 text-yellow-400 shrink-0 opacity-50" />}
                    </div>
                    <p className="text-[9px] xs:text-[10px] text-slate-500 font-medium leading-tight line-clamp-2">Ingredientes premium selecionados para sua vibe.</p>
                </div>

                <div className="flex justify-between items-center mt-auto">
                    <span className="font-black text-[var(--primary)] text-base xs:text-lg tracking-tighter">R$ {item.price.toFixed(2)}</span>

                    {qty === 0 ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(); }}
                            disabled={!item.available}
                            className={`p-2.5 xs:p-3 rounded-xl transition-all shadow-lg active:scale-90
                            ${item.available ? 'bg-slate-700 text-white active:bg-[var(--primary)] active:text-black' : 'bg-slate-800 text-slate-600 opacity-50'}`}
                        >
                            <Plus className="w-4 h-4 xs:w-5 xs:h-5" />
                        </button>
                    ) : (
                        <div className="flex items-center bg-black/50 backdrop-blur-md rounded-xl border border-white/10 p-0.5 shadow-xl animate-[pop_0.2s_ease-out]">
                            <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1.5 xs:p-2 text-slate-400 active:text-white"><Minus className="w-3.5 h-3.5 xs:w-4 xs:h-4" /></button>
                            <span className="w-6 xs:w-8 text-center text-xs xs:text-sm font-black text-white">{qty}</span>
                            <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="p-1.5 xs:p-2 text-[var(--primary)] active:text-white"><Plus className="w-3.5 h-3.5 xs:w-4 xs:h-4" /></button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export const PlaceCard: React.FC<PlaceCardProps> = React.memo(({
    place, rank, onCheckIn, expanded = false, isCheckedIn = false, isSaved = false, onToggleSave, loading = false, onClick
}) => {
    const { trigger } = useHaptic();
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [votedVibe, setVotedVibe] = useState<'up' | 'down' | null>(null);
    const [showMatchMode, setShowMatchMode] = useState(false);

    const [showMenu, setShowMenu] = useState(false);
    const [menuCategory, setMenuCategory] = useState<'all' | 'drink' | 'food' | 'other' | 'orders'>('all');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
    const [isOrdering, setIsOrdering] = useState(false);
    const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
    const [, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
    const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
    const [checkingDistance, setCheckingDistance] = useState(false);

    const [showStaffOptions, setShowStaffOptions] = useState(false);
    const [staffState, setStaffState] = useState<'idle' | 'calling' | 'confirmed'>('idle');

    const [showMusicPoll, setShowMusicPoll] = useState(false);
    const [hasVotedMusic, setHasVotedMusic] = useState(false);
    const [votingGenre, setVotingGenre] = useState<string | null>(null);
    const [pollResults, setPollResults] = useState<Record<string, number>>({
        'Sertanejo': 45, 'Funk': 32, 'Eletrônica': 18, 'Pop/Nacional': 5
    });

    useEffect(() => {
        setImgLoaded(false);
        setImgError(false);
    }, [place?.id]);

    const handleGeoCheckIn = () => {
        if (!place || !onCheckIn || isCheckedIn) return;

        if (!place.lat || !place.lng) {
            trigger('medium');
            alert("Este local não possui coordenadas cadastradas. Check-in liberado para testes.");
            onCheckIn(place.id);
            return;
        }

        setCheckingDistance(true);
        trigger('light');

        if (!navigator.geolocation) {
            alert("Geolocalização não suportada.");
            setCheckingDistance(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const R = 6371e3;
                const φ1 = userLat * Math.PI / 180;
                const φ2 = place.lat! * Math.PI / 180;
                const Δφ = (place.lat! - userLat) * Math.PI / 180;
                const Δλ = (place.lng! - userLng) * Math.PI / 180;

                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const d = R * c;

                setCheckingDistance(false);
                if (d <= 200) {
                    trigger('success');
                    onCheckIn(place.id);
                } else {
                    trigger('heavy');
                    alert(`Você está muito longe! Aproximadamente ${Math.round(d)}m de distância. Chegue mais perto do ${place.name} para fazer check-in.`);
                }
            },
            (err) => {
                console.error(err);
                setCheckingDistance(false);
                alert("Erro ao obter localização. Verifique permissões.");
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    if (loading) {
        return (
            <div className="bg-[var(--bg-card)]/40 p-4 rounded-3xl border border-[var(--border-default)] mb-3">
                <div className="flex gap-4">
                    <Skeleton variant="circular" className="w-20 h-20 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                        <Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!place) return null;

    const isHot = place.capacityPercentage >= 80;
    const kingUser = place.kingId ? getUserById(place.kingId) : null;

    const handleAddToCart = (itemId: string) => { trigger('light'); setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 })); };
    const handleRemoveFromCart = (itemId: string) => {
        trigger('light');
        setCart(prev => {
            const newQty = (prev[itemId] || 0) - 1;
            if (newQty <= 0) { const { [itemId]: _, ...rest } = prev; return rest; }
            return { ...prev, [itemId]: newQty };
        });
    };

    const cartTotal = useMemo(() => (!place.menu ? 0 : place.menu.reduce((acc: number, item: MenuItem) => acc + (item.price * (cart[item.id] || 0)), 0)), [cart, place.menu]);
    const cartCount = (Object.values(cart) as number[]).reduce((a: number, b: number) => a + b, 0);

    const comandaTotal = useMemo(() => (orderedItems as OrderItem[]).reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0), [orderedItems]);

    const filteredMenu = useMemo(() => {
        if (!place.menu) return [];
        if (menuCategory === 'all') return place.menu;
        if (menuCategory === 'orders') return [];
        return place.menu.filter(m => m.category === menuCategory);
    }, [place.menu, menuCategory]);

    const handleCheckout = () => {
        if (cartCount === 0) return;
        trigger('success');
        setIsOrdering(true);

        setTimeout(async () => {
            const newOrders: OrderItem[] = [];
            Object.entries(cart).forEach(([id, qty]) => {
                const item = place.menu?.find(m => m.id === id);
                if (item) {
                    newOrders.push({
                        ...item,
                        quantity: qty,
                        status: 'preparing',
                        orderedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }
            });

            await db.places.addCall(place.id, {
                id: `c_${Date.now()}`,
                userId: 'u1',
                userName: 'Gabriel Vou Lá',
                type: 'Pedido',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'pending'
            });

            setOrderedItems(prev => [...prev, ...newOrders]);
            setCart({});
            setIsOrdering(false);
            setMenuCategory('orders');
            trigger('success');
        }, 1500);
    };

    const handlePayment = (method: 'pix' | 'card') => {
        trigger('medium');
        setPaymentMethod(method);
        setPaymentStep('processing');

        setTimeout(() => {
            trigger('success');
            setPaymentStep('success');
        }, 3000);
    };

    const handleCallStaff = async (reason: string) => {
        trigger('medium');
        setStaffState('calling');
        setShowStaffOptions(false);
        await db.places.addCall(place.id, {
            id: `c_${Date.now()}`,
            userId: 'u1',
            userName: 'Gabriel Vou Lá',
            type: reason as any,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'pending'
        });
        setTimeout(() => { trigger('success'); setStaffState('confirmed'); setTimeout(() => setStaffState('idle'), 5000); }, 2000);
    };

    const handleVoteMusic = (genre: string) => {
        if (hasVotedMusic) return;
        trigger('success'); setVotingGenre(genre); setHasVotedMusic(true);
        setPollResults((prev: Record<string, number>) => ({ ...prev, [genre]: (prev[genre] || 0) + 1 }));
        setTimeout(() => setShowMusicPoll(false), 2500);
    };

    if (expanded) {
        return (
            <div className="h-full bg-[var(--bg-default)] overflow-y-auto scroll-container overscroll-contain pb-safe">
                {showMatchMode && <MatchMode placeName={place.name} onClose={() => setShowMatchMode(false)} />}

                {/* MODAL PAGAMENTO */}
                <AnimatePresence>
                    {showPaymentOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center p-6"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-slate-700 overflow-hidden relative shadow-2xl"
                            >
                                <button onClick={() => setShowPaymentOverlay(false)} className="absolute top-4 right-4 p-2 text-slate-500 active:text-white"><X className="w-6 h-6" /></button>

                                {paymentStep === 'select' && (
                                    <div className="p-8 text-center space-y-6">
                                        <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <CreditCard className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic">FECHAR CONTA</h3>
                                            <p className="text-slate-400 text-sm">Total a pagar: <span className="text-[var(--primary)] font-black">R$ {comandaTotal.toFixed(2)}</span></p>
                                        </div>
                                        <div className="space-y-3">
                                            <button onClick={() => handlePayment('pix')} className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all">
                                                <QrCode className="w-4 h-4" /> Pagar via PIX
                                            </button>
                                            <button onClick={() => handlePayment('card')} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all border border-slate-700">
                                                <CreditCard className="w-4 h-4" /> Cartão (App)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {paymentStep === 'processing' && (
                                    <div className="p-12 text-center space-y-6 flex flex-col items-center">
                                        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
                                        <p className="text-white font-black uppercase tracking-widest text-sm">Processando Pagamento...</p>
                                    </div>
                                )}

                                {paymentStep === 'success' && (
                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-8 text-center space-y-6">
                                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                            <Check className="w-10 h-10 text-white stroke-[4px]" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white italic">CONTA PAGA!</h3>
                                            <p className="text-slate-400 text-sm">Valeu pelo rolê! Seu recibo foi enviado por e-mail.</p>
                                        </div>
                                        <button onClick={() => { setShowPaymentOverlay(false); setShowMenu(false); setOrderedItems([]); }} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs active:scale-95 transition-all">VOLTAR PRO APP</button>
                                    </motion.div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODAL: ENQUETE MUSICAL */}
                <AnimatePresence>
                    {showMusicPoll && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-end justify-center"
                            onClick={() => setShowMusicPoll(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={springTransition}
                                className="bg-[#1e293b] w-full max-lg rounded-t-[2.5rem] p-6 xs:p-8 border-t border-slate-700 pb-safe"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl xs:text-2xl font-black text-white italic tracking-tighter">O QUE TOCA AGORA?</h3>
                                        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Escolha do Público</p>
                                    </div>
                                    <button onClick={() => setShowMusicPoll(false)} className="p-2.5 bg-slate-800 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                                </div>

                                <div className="space-y-3 mb-6">
                                    {Object.entries(pollResults).map(([genre, value]) => {
                                        const total = (Object.values(pollResults) as number[]).reduce((a: number, b: number) => a + b, 0);
                                        const percent = total > 0 ? Math.round(((value as number) / total) * 100) : 0;
                                        const isSelected = votingGenre === genre;

                                        return (
                                            <button
                                                key={genre}
                                                disabled={hasVotedMusic}
                                                onClick={() => handleVoteMusic(genre)}
                                                className={`relative w-full p-4 xs:p-5 rounded-2xl border-2 transition-all flex items-center justify-between overflow-hidden
                                        ${hasVotedMusic
                                                        ? isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-slate-800 bg-slate-900/50'
                                                        : 'border-slate-700 bg-slate-800/50 active:scale-[0.98]'}`}
                                            >
                                                {hasVotedMusic && (
                                                    <div className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${isSelected ? 'bg-[var(--primary)]/20' : 'bg-slate-700/10'}`} style={{ width: `${percent}%` }} />
                                                )}
                                                <span className={`relative z-10 font-black text-xs xs:text-sm uppercase italic ${isSelected ? 'text-[var(--primary)]' : 'text-white'}`}>{genre}</span>
                                                {hasVotedMusic && <span className="relative z-10 font-black text-[10px] text-slate-400">{percent}%</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODAL: MENU DIGITAL */}
                <AnimatePresence>
                    {showMenu && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col justify-end"
                            onClick={() => setShowMenu(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={springTransition}
                                className="bg-[var(--bg-default)] rounded-t-[2.5rem] border-t border-[var(--border-default)] h-[94vh] flex flex-col shadow-2xl relative overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="p-5 xs:p-6 border-b border-[var(--border-default)] flex justify-between items-center sticky top-0 bg-[var(--bg-default)]/90 backdrop-blur-md z-20">
                                    <div>
                                        <h3 className="text-2xl xs:text-3xl font-black text-white italic tracking-tighter leading-none">VOU LÁ MENU</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {place.name}
                                        </p>
                                    </div>
                                    <button onClick={() => setShowMenu(false)} className="p-2.5 bg-slate-800 rounded-full text-slate-400 active:scale-90"><X className="w-6 h-6" /></button>
                                </div>

                                <div className="px-5 py-4 flex gap-2 overflow-x-auto hide-scrollbar sticky top-[80px] bg-[var(--bg-default)] z-10">
                                    <MenuCategoryTab label="Tudo" icon={<Sparkles className="w-3.5 h-3.5" />} active={menuCategory === 'all'} onClick={() => setMenuCategory('all')} />
                                    <MenuCategoryTab label="Bebidas" icon={<Beer className="w-3.5 h-3.5" />} active={menuCategory === 'drink'} onClick={() => setMenuCategory('drink')} />
                                    <MenuCategoryTab label="Comidas" icon={<Pizza className="w-3.5 h-3.5" />} active={menuCategory === 'food'} onClick={() => setMenuCategory('food')} />
                                    <MenuCategoryTab label="Outros" icon={<ShoppingBag className="w-3.5 h-3.5" />} active={menuCategory === 'other'} onClick={() => setMenuCategory('other')} />
                                    <MenuCategoryTab label="Comanda" icon={<ClipboardList className="w-3.5 h-3.5" />} active={menuCategory === 'orders'} onClick={() => setMenuCategory('orders')} badge={orderedItems.length} />
                                </div>

                                <div key={menuCategory} className="flex-1 overflow-y-auto px-5 pb-40 scroll-container">
                                    {menuCategory === 'orders' ? (
                                        <div className="space-y-4 pt-2">
                                            {orderedItems.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40 py-20">
                                                    <ClipboardList className="w-20 h-20 mb-6 stroke-[0.5]" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Sua comanda está vazia</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-indigo-600/10 p-5 rounded-3xl border border-indigo-500/20 mb-6">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Status da Comanda</span>
                                                            <span className="bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Aberta</span>
                                                        </div>
                                                        <p className="text-3xl font-black text-white italic tracking-tighter mt-2">R$ {comandaTotal.toFixed(2)}</p>
                                                        <button onClick={() => setShowPaymentOverlay(true)} className="w-full mt-4 py-3 bg-[var(--primary)] text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Pagar Comanda Agora</button>
                                                    </div>
                                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Itens Pedidos</h4>
                                                    {orderedItems.map((item, idx) => (
                                                        <div key={`${item.id}-${idx}`} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 bg-slate-900 rounded-xl overflow-hidden">
                                                                    <img src={item.imageUrl || (item.category === 'drink' ? 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300' : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300')} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-bold text-sm leading-none">{item.quantity}x {item.name}</p>
                                                                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{item.orderedAt} • R$ {(item.price * item.quantity).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${item.status === 'preparing' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                                {item.status === 'preparing' ? 'Preparando' : 'Entregue'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        (!place.menu || place.menu.length === 0) ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40 py-20">
                                                <Utensils className="w-20 h-20 mb-6 stroke-[0.5]" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Sem itens disponíveis</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {filteredMenu.map(item => (
                                                    <MenuItemRow key={item.id} item={item} qty={cart[item.id] || 0} onAdd={() => handleAddToCart(item.id)} onRemove={() => handleRemoveFromCart(item.id)} />
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>

                                {cartCount > 0 && menuCategory !== 'orders' && (
                                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent z-30 pb-safe">
                                        <div className="bg-[var(--primary)] rounded-3xl p-4 xs:p-5 shadow-[0_12px_40px_rgba(204,255,0,0.25)] flex items-center justify-between border-t border-white/20">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-black w-12 h-12 rounded-2xl flex items-center justify-center relative">
                                                    <Utensils className="w-5 h-5 text-[var(--primary)]" />
                                                    <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[var(--primary)] animate-[pop_0.3s_ease-out]">{cartCount}</div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-black opacity-60 uppercase">Total</span>
                                                    <span className="text-xl font-black text-black italic leading-none">R$ {cartTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button onClick={handleCheckout} className="bg-black text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-wider flex items-center gap-2 active:scale-95 transition-all">
                                                {isOrdering ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />}
                                                {isOrdering ? 'ENVIANDO' : 'PEDIR AGORA'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODAL: STAFF */}
                <AnimatePresence>
                    {showStaffOptions && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-end justify-center"
                            onClick={() => setShowStaffOptions(false)}
                        >
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={springTransition}
                                className="w-full max-w-lg bg-[#1e293b] rounded-t-[2.5rem] border-t border-slate-700 p-6 xs:p-8 pb-safe"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-white italic tracking-tighter">COMO AJUDAR?</h3>
                                    <button onClick={() => setShowStaffOptions(false)} className="bg-slate-800 p-2 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                    <button onClick={() => handleCallStaff('Pedido')} className="bg-slate-800 border border-slate-700 p-4 xs:p-6 rounded-2xl flex flex-col items-center gap-3 active:bg-slate-700 active:scale-95 transition-all">
                                        <Utensils className="w-8 h-8 text-[var(--primary)]" />
                                        <span className="text-[9px] font-black uppercase text-white">Pedido</span>
                                    </button>
                                    <button onClick={() => handleCallStaff('Conta')} className="bg-slate-800 border border-slate-700 p-4 xs:p-6 rounded-2xl flex flex-col items-center gap-3 active:bg-slate-700 active:scale-95 transition-all">
                                        <Receipt className="w-8 h-8 text-green-500" />
                                        <span className="text-[9px] font-black uppercase text-white">Conta</span>
                                    </button>
                                    <button onClick={() => handleCallStaff('Ajuda')} className="bg-slate-800 border border-slate-700 p-4 xs:p-6 rounded-2xl flex flex-col items-center gap-3 active:bg-slate-700 active:scale-95 transition-all">
                                        <HelpCircle className="w-8 h-8 text-red-500" />
                                        <span className="text-[9px] font-black uppercase text-white">Ajuda</span>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HERO AREA */}
                <div className="h-[45vh] xs:h-[50vh] relative w-full overflow-hidden shrink-0 bg-slate-900">
                    <img src={imgError ? FALLBACK_IMAGE : (place.imageUrl || FALLBACK_IMAGE)} className={`w-full h-full object-cover transition-transform duration-[3s] ${imgLoaded ? 'scale-100' : 'scale-110 blur-xl opacity-0'}`} alt={place.name} onLoad={() => setImgLoaded(true)} onError={() => { setImgError(true); setImgLoaded(true); }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-[#0B0F19]/40"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 xs:p-8">
                        <div className="flex justify-between items-end mb-4 gap-4">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">{place.type}</span>
                                    {place.isTrending && <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1"><Flame className="w-2.5 h-2.5 fill-current" /> Hype</span>}
                                </div>
                                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-white italic tracking-tighter leading-[0.9] drop-shadow-xl truncate">{place.name.toUpperCase()}</h1>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl px-3 py-2 rounded-2xl border border-white/10 flex flex-col items-center shrink-0">
                                <span className="text-[8px] font-black text-slate-300 uppercase mb-0.5">Vibe</span>
                                <div className="flex items-center gap-1 text-[var(--primary)] font-black text-base xs:text-xl"><Star className="w-4 h-4 xs:w-5 xs:h-5 fill-current" /> {place.rating}</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5"><MapPin className="w-3.5 h-3.5 text-[var(--primary)]" /> {place.distance}</span>
                            <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5"><Clock className="w-3.5 h-3.5 text-[var(--primary)]" /> {place.openingHours}</span>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="px-5 xs:px-6 -mt-4 relative z-10 space-y-6 pb-40">
                    <button onClick={(e) => { e.stopPropagation(); handleGeoCheckIn(); }} disabled={isCheckedIn || checkingDistance} className={`w-full py-5 xs:py-6 rounded-2xl xs:rounded-[2rem] font-black uppercase text-sm xs:text-base tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.97]
                ${isCheckedIn
                            ? 'bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                            : 'bg-[var(--primary)] text-[var(--on-primary)] shadow-[0_0_25px_var(--primary-glow)]'} ${checkingDistance ? 'opacity-80' : ''}`}>
                        {checkingDistance
                            ? <><Loader2 className="w-5 h-5 animate-spin" /> VERIFICANDO GPS...</>
                            : isCheckedIn
                                ? (<><CheckCircle2 className="w-5 h-5 xs:w-6 xs:h-6" /> ESTOU AQUI!</>)
                                : (<><MapPin className="w-5 h-5 xs:w-6 xs:h-6" /> VOU LÁ!</>)
                        }
                    </button>

                    {isCheckedIn && (
                        <div className="space-y-4">
                            <button onClick={() => { trigger('medium'); setShowMatchMode(true); }} className="w-full bg-gradient-to-br from-indigo-900 to-[#12122b] border border-indigo-500/20 rounded-2xl xs:rounded-[2.5rem] p-4 xs:p-5 flex items-center justify-between active:scale-[0.98] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-400/20">
                                        <Users className="w-7 h-7 text-indigo-300" />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <h4 className="text-lg font-black text-white italic truncate">QUEM TÁ AQUI?</h4>
                                        <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider mt-0.5">Encontre sua galera</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 px-3 py-1.5 rounded-full text-[10px] font-black text-white border border-white/5 shrink-0">12+ ON</div>
                            </button>

                            <div className="bg-slate-800/30 p-4 xs:p-5 rounded-2xl xs:rounded-[2.5rem] border border-slate-700/40">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Vibe Check</h4>
                                {!votedVibe ? (
                                    <div className="flex gap-3">
                                        <button onClick={() => { trigger('success'); setVotedVibe('up'); }} className="flex-1 bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex flex-col items-center gap-1 active:bg-green-500 active:text-black transition-all">
                                            <ThumbsUp className="w-5 h-5" />
                                            <span className="text-[9px] font-black uppercase">Bombando</span>
                                        </button>
                                        <button onClick={() => { trigger('success'); setVotedVibe('down'); }} className="flex-1 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex flex-col items-center gap-1 active:bg-red-500 active:text-black transition-all">
                                            <ThumbsDown className="w-5 h-5" />
                                            <span className="text-[9px] font-black uppercase">Vazio</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                                        <p className="text-xs font-black text-white italic">FEEDBACK RECEBIDO!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 xs:gap-4">
                        <motion.div whileTap={{ scale: 0.95 }} className="bg-slate-800/20 p-5 rounded-2xl xs:rounded-[2.5rem] border border-slate-700/30 group active:scale-95 transition-all" onClick={() => { trigger('light'); setShowMusicPoll(true); }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Disc className="w-4 h-4 text-fuchsia-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase">Som</span>
                            </div>
                            <p className="text-white font-black text-sm italic truncate">{place.currentMusic || 'VIBE MISTERIOSA'}</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-600 uppercase flex items-center gap-1"><History className="w-2.5 h-2.5" /> Ver</span>
                                {isCheckedIn && <BarChart3 className="w-3.5 h-3.5 text-fuchsia-400 ml-auto" />}
                            </div>
                        </motion.div>

                        <div className="bg-slate-800/20 p-5 rounded-2xl xs:rounded-[2.5rem] border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase">Giro</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-white font-black text-xl leading-none">{place.capacityPercentage}%</p>
                                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${isHot ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${place.capacityPercentage}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xs:gap-4">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { trigger('light'); setShowMenu(true); }} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl xs:rounded-[2.5rem] flex flex-col items-center gap-3 active:border-[var(--primary)] active:bg-slate-700 transition-all shadow-lg">
                            <div className="p-3 bg-slate-900 rounded-xl"><Utensils className="w-7 h-7" /></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Cardápio</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { if (staffState === 'idle') { trigger('light'); setShowStaffOptions(true); } }} disabled={staffState !== 'idle'} className={`bg-slate-800 border p-5 rounded-2xl xs:rounded-[2.8rem] flex flex-col items-center gap-3 active:bg-slate-700 transition-all shadow-lg
                        ${staffState === 'calling' ? 'border-yellow-500' : staffState === 'confirmed' ? 'border-green-500' : 'border-slate-700'}`}>
                            <div className={`p-3 rounded-xl ${staffState === 'calling' ? 'bg-yellow-500 animate-pulse' : staffState === 'confirmed' ? 'bg-green-500' : 'bg-slate-900'}`}>
                                {staffState === 'calling' ? <Loader2 className="w-7 h-7 text-black animate-spin" /> : staffState === 'confirmed' ? <CheckCircle2 className="w-7 h-7 text-white" /> : <BellRing className="w-7 h-7 text-indigo-400" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase ${staffState === 'calling' ? 'text-yellow-500' : staffState === 'confirmed' ? 'text-green-500' : 'text-white'}`}>{staffState === 'calling' ? 'Chamando' : staffState === 'confirmed' ? 'Opa!' : 'Garçom'}</span>
                        </motion.button>
                    </div>

                    {kingUser && (
                        <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-4 xs:p-6 rounded-2xl xs:rounded-[2.8rem] flex items-center gap-4 xs:gap-6 border border-amber-500/20 relative overflow-hidden">
                            <div className="relative shrink-0">
                                <img src={kingUser.avatar} className="w-16 h-16 xs:w-20 xs:h-20 rounded-2xl border-2 border-amber-500 object-cover shadow-xl" alt="" />
                                <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1.5 rounded-lg rotate-12 shadow-lg"><Crown className="w-4 h-4 fill-current" /></div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1.5 mb-1"><Sparkles className="w-3 h-3" /> Rei da Noite</p>
                                <h4 className="text-xl xs:text-2xl font-black text-white italic truncate leading-none uppercase">{kingUser.name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">{kingUser.points} XP acumulados</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            whileTap={{ scale: 0.98 }}
            onClick={() => { trigger('light'); if (onClick) onClick(); }}
            className="bg-[var(--bg-card)]/60 rounded-[2rem] p-3.5 border border-[var(--border-default)] shadow-xl cursor-pointer mb-3 relative overflow-hidden premium-card"
        >
            <div className="flex gap-4 items-center">
                <div className="relative w-28 h-28 xs:w-32 xs:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-white/5">
                    {!imgLoaded && !imgError && <Skeleton className="absolute inset-0 w-full h-full" />}
                    <img
                        src={imgError ? FALLBACK_IMAGE : (place.imageUrl || FALLBACK_IMAGE)}
                        className={`w-full h-full object-cover transition-all duration-[1s] ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                        alt={place.name}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                    {rank && (<div className={`absolute top-0 left-0 px-2 py-1 rounded-br-xl text-[8px] font-black uppercase ${rank === 1 ? 'bg-[var(--primary)] text-black' : 'bg-slate-900 text-white'}`}>#{rank}</div>)}
                    <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-md rounded-lg px-2 py-0.5 flex items-center gap-1.5 border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isHot ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-[9px] font-black text-white">{place.capacityPercentage}%</span>
                    </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 py-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-xl xs:text-2xl font-black text-white italic truncate pr-1 leading-none uppercase">{place.name}</h3>
                        <button onClick={(e) => { e.stopPropagation(); onToggleSave?.(place.id); }} className="p-1.5 -mt-1 active:scale-90 transition-transform">
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[var(--primary)] text-[var(--primary)]' : 'text-slate-700'}`} />
                        </button>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">{place.type} <span className="w-1 h-1 rounded-full bg-slate-800"></span> {place.distance}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {isHot && (<span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase rounded-lg border border-red-500/10 flex items-center gap-1"><Flame className="w-2.5 h-2.5 fill-current" /> Fervendo</span>)}
                        <span className="px-2 py-0.5 bg-slate-800/60 text-slate-400 text-[8px] font-black uppercase rounded-lg border border-slate-700/50 truncate max-w-[120px] flex items-center gap-1.5"><Music className="w-2.5 h-2.5" /> {place.currentMusic || 'Vibe'}</span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-800 shrink-0" />
            </div>
        </motion.div>
    );
});
