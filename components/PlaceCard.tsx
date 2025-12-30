import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place, MenuItem, OrderItem } from '../types';
import { MapPin, Flame, Star, Bookmark, Share2, CheckCircle2, Loader2, Zap, ThumbsUp, ThumbsDown, Users, Utensils, BellRing, Check, Car, Navigation, X, Sparkles, ClipboardList, CreditCard, ShoppingBag, Receipt, HelpCircle, Disc, Crown, History, Beer, Pizza, Music } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { Badge } from '../src/components/ui/Badge';
import { PayButton } from './PayButton';
import { MenuCard } from './MenuCard';
import { useHaptic } from '../hooks/useHaptic';
import { useToast } from './ToastProvider';
import { FALLBACK_IMAGE, getUserById } from '../constants';
import { MatchMode } from './MatchMode';
import { db } from '../utils/storage';
import { fadeIn, springTransition } from '../src/styles/animations';
import { User } from '../types';

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
    currentUser?: User;
}

const MenuCategoryTab: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode; badge?: number }> = ({ label, active, onClick, icon, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border-2 relative
        ${active ? 'bg-primary-main border-primary-main text-black shadow-lg scale-105' : 'bg-bg-surface-1/50 text-text-secondary border-transparent active:bg-bg-surface-2'}`}
    >
        {icon} {label}
        {typeof badge === 'number' && badge > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-status-error text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-bg-default animate-bounce">
                {badge}
            </div>
        )}
    </button>
);



export const PlaceCard: React.FC<PlaceCardProps> = React.memo(({
    place, rank, onCheckIn, expanded = false, isCheckedIn = false, isSaved = false, onToggleSave, loading = false, onClick, currentUser
}) => {
    const { trigger } = useHaptic();
    const { showToast } = useToast();
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Compact layout update
    if (!expanded && place) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden group cursor-pointer border border-white/10"
            >
                {/* Background Structure (UIverse Model Adaptation) */}
                <div className="absolute inset-0 bg-[#1a1a1a] p-1">
                    <div className="w-full h-full rounded-[1.8rem] rounded-tr-[5rem] rounded-br-[3rem] bg-[#222] overflow-hidden relative">
                        {/* Place Image as Background */}
                        <img
                            src={imgError ? FALLBACK_IMAGE : place.imageUrl || FALLBACK_IMAGE}
                            className={`w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 ${imgLoaded ? 'opacity-60' : 'opacity-0'}`}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                            alt={place.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>
                </div>

                {/* Animated Spinner Background Effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 blur-3xl">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-primary-main to-purple-600 animate-spin" style={{ animationDuration: '10s' }}></div>
                </div>

                {/* Foreground Content */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    {/* Top Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-main">{place.type}</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">{place.distance} • {place.rating} ★</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                trigger('light');
                                onToggleSave?.(place.id);
                            }}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${isSaved ? 'bg-primary-main border-primary-main text-black' : 'bg-black/20 border-white/10 text-white'}`}
                        >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Bottom Info */}
                    <div className="relative">
                        <div className="glass-card !bg-white/5 !border-white/10 p-3 rounded-2xl backdrop-blur-md">
                            <h4 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none mb-1 truncate">
                                {place.name}
                            </h4>
                            <p className="text-[9px] text-gray-300 font-medium truncate mb-2">
                                {place.address}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${place.capacityPercentage >= 80 ? 'bg-status-error animate-pulse' : 'bg-status-success'}`}></div>
                                    <span className="text-[9px] font-black uppercase text-gray-400">{place.capacityPercentage}% ON</span>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-primary-main flex items-center justify-center text-black shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                                    <Navigation className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }
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
                    onCheckIn(place?.id || '');
                } else {
                    trigger('heavy');
                    alert(`Você está muito longe! Aproximadamente ${Math.round(d)}m de distância. Chegue mais perto do ${place?.name} para fazer check-in.`);
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

    const handleOpenMaps = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!place) return;
        const query = encodeURIComponent(place.address || place.name);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const handleOpenUber = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!place || !place.lat || !place.lng) {
            alert("Localização não disponível para Uber.");
            return;
        }
        const nickname = encodeURIComponent(place.name);
        const url = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${place.lat}&dropoff[longitude]=${place.lng}&dropoff[nickname]=${nickname}`;
        window.open(url, '_blank');
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!place) return;
        const text = `Confira o ${place.name} no Vou Lá!`;
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({ title: 'Vou Lá', text, url });
        } else {
            alert("Copiado para a área de transferência!");
        }
    };

    if (loading) {
        return (
            <div className={`w-full bg-[var(--bg-card)]/40 rounded-[2rem] p-3 border border-white/5 shadow-2xl ${expanded ? 'h-[500px]' : 'h-32'}`}>
                <div className="flex gap-4 h-full">
                    <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        <Skeleton className="h-6 w-3/4 rounded-lg" />
                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-12 rounded-lg" />
                            <Skeleton className="h-4 w-12 rounded-lg" />
                        </div>
                    </div>
                    {!expanded && <Skeleton className="w-14 h-full rounded-[1.5rem] shrink-0" />}
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

    const cartTotal = useMemo(() => (!place?.menu ? 0 : place.menu.reduce((acc: number, item: MenuItem) => acc + (item.price * (cart[item.id] || 0)), 0)), [cart, place?.menu]);
    const cartCount = (Object.values(cart) as number[]).reduce((a: number, b: number) => a + b, 0);

    const comandaTotal = useMemo(() => (orderedItems as OrderItem[]).reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0), [orderedItems]);

    const filteredMenu = useMemo(() => {
        if (!place?.menu) return [];
        if (menuCategory === 'all') return place.menu;
        if (menuCategory === 'orders') return [];
        return place.menu.filter(m => m.category === menuCategory);
    }, [place.menu, menuCategory]);

    const handleCheckout = () => {
        if (!isCheckedIn) {
            trigger('heavy');
            showToast({
                type: 'info',
                message: 'Você precisa fazer check-in para realizar pedidos! 📍'
            });
            return;
        }
        if (cartCount === 0) return;
        trigger('success');
        setIsOrdering(true);

        setTimeout(async () => {
            if (!currentUser) return;
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
                userId: currentUser.id,
                userName: currentUser.name,
                type: 'Pedido',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'pending'
            });

            setOrderedItems(prev => [...prev, ...newOrders]);
            setCart({});
            setIsOrdering(false);
            setMenuCategory('orders');
            showToast({
                type: 'success',
                message: 'Pedido enviado com sucesso! 🍻'
            });
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
        if (!currentUser) return;
        if (!isCheckedIn) {
            trigger('heavy');
            showToast({
                type: 'info',
                message: 'Faça check-in para chamar o staff! 📍'
            });
            return;
        }
        trigger('medium');
        setStaffState('calling');
        setShowStaffOptions(false);

        await db.places.addCall(place.id, {
            id: `c_${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            type: reason as any,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'pending'
        });

        // Mock success response from staff
        setTimeout(() => {
            trigger('success');
            setStaffState('confirmed');
            showToast({
                type: 'success',
                message: `O Staff do ${place.name} já está a caminho! 🏃‍♂️`
            });
            setTimeout(() => setStaffState('idle'), 5000);
        }, 2000);
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
                                            <PayButton
                                                onClick={() => handlePayment('pix')}
                                                text="Pagar via PIX"
                                                className="w-full bg-cyan-600 border-cyan-500"
                                            />
                                            <PayButton
                                                onClick={() => handlePayment('card')}
                                                text="Cartão (App)"
                                                className="w-full bg-slate-800"
                                            />
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
                                                                    <img src={item.imageUrl || (item.category === 'drink' ? 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=70&w=150' : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=70&w=150')} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-bold text-sm leading-none">{item.quantity}x {item.name}</p>
                                                                    <p className="text-[9px] text-text-tertiary font-bold uppercase mt-1">{item.orderedAt} • R$ {(item.price * item.quantity).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${item.status === 'preparing' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20 animate-pulse' : 'bg-status-success/10 text-status-success border border-status-success/20'}`}>
                                                                {item.status === 'preparing' ? 'Preparando' : 'Entregue'}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        (!place.menu || place.menu.length === 0) ? (
                                            <div className="h-full flex flex-col items-center justify-center text-text-tertiary opacity-40 py-20">
                                                <Utensils className="w-20 h-20 mb-6 stroke-[0.5]" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Sem itens disponíveis</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 pb-8">
                                                {filteredMenu.map(item => (
                                                    <MenuCard
                                                        key={item.id}
                                                        item={item}
                                                        qty={cart[item.id] || 0}
                                                        onAdd={() => handleAddToCart(item.id)}
                                                        onRemove={() => handleRemoveFromCart(item.id)}
                                                    />
                                                ))}
                                            </div>
                                        )
                                    )}
                                </div>

                                {cartCount > 0 && menuCategory !== 'orders' && (
                                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-bg-default via-bg-default to-transparent z-30 pb-safe">
                                        <div className="bg-primary-main rounded-3xl p-4 xs:p-5 shadow-[0_12px_40px_rgba(204,255,0,0.25)] flex items-center justify-between border-t border-white/20">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-black w-12 h-12 rounded-2xl flex items-center justify-center relative">
                                                    <Utensils className="w-5 h-5 text-primary-main" />
                                                    <div className="absolute -top-1.5 -right-1.5 bg-status-error text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-primary-main animate-[pop_0.3s_ease-out]">{cartCount}</div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-black opacity-60 uppercase">Total</span>
                                                    <span className="text-xl font-black text-black italic leading-none">R$ {cartTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                            <button onClick={handleCheckout} className="bg-black text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-wider flex items-center gap-2 active:scale-95 transition-all">
                                                {isOrdering ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-primary-main" />}
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
                                className="w-full max-w-lg bg-bg-surface-1 rounded-t-[3rem] border-t border-border-default p-8 pb-safe"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-white italic tracking-tighter">COMO AJUDAR?</h3>
                                    <button onClick={() => setShowStaffOptions(false)} className="bg-bg-surface-2 p-3 rounded-full text-text-tertiary"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-2">
                                    <button onClick={() => handleCallStaff('Pedido')} className="bg-bg-surface-2 border border-border-default p-6 rounded-2xl flex flex-col items-center gap-3 active:bg-bg-surface-2/70 active:scale-95 transition-all">
                                        <Utensils className="w-8 h-8 text-primary-main" />
                                        <span className="text-[10px] font-black uppercase text-white">Pedido</span>
                                    </button>
                                    <button onClick={() => handleCallStaff('Conta')} className="bg-bg-surface-2 border border-border-default p-6 rounded-2xl flex flex-col items-center gap-3 active:bg-bg-surface-2/70 active:scale-95 transition-all">
                                        <Receipt className="w-8 h-8 text-status-success" />
                                        <span className="text-[10px] font-black uppercase text-white">Conta</span>
                                    </button>
                                    <button onClick={() => handleCallStaff('Ajuda')} className="bg-bg-surface-2 border border-border-default p-6 rounded-2xl flex flex-col items-center gap-3 active:bg-bg-surface-2/70 active:scale-95 transition-all">
                                        <HelpCircle className="w-8 h-8 text-status-error" />
                                        <span className="text-[10px] font-black uppercase text-white">Ajuda</span>
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* HERO AREA */}
                <div className="h-[45vh] xs:h-[50vh] relative w-full overflow-hidden shrink-0 bg-bg-surface-1">
                    <img
                        src={imgError ? FALLBACK_IMAGE : `${place.imageUrl?.split('?')[0]}?q=75&w=800&auto=format&fit=crop` || FALLBACK_IMAGE}
                        className={`w-full h-full object-cover transition-transform duration-[3s] ${imgLoaded ? 'scale-100' : 'scale-110 blur-xl opacity-0'}`}
                        alt={place.name}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => { setImgError(true); setImgLoaded(true); }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-default via-bg-default/20 to-bg-default/40"></div>

                    {/* Top Actions */}
                    <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-30">
                        <button onClick={onClick} className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all">
                            <X className="w-6 h-6" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSave?.(place.id);
                            }}
                            className={`w-12 h-12 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all active:scale-90
                            ${isSaved ? 'bg-primary-main border-primary-main text-black' : 'bg-black/40 border-white/10 text-white'}`}
                        >
                            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-8 pt-20">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="glass-card !bg-primary-main/20 text-primary-main text-[10px] font-black px-3 py-1.5 rounded-xl uppercase border border-primary-main/20">{place.type}</span>
                                {place.isTrending && <span className="bg-status-warning text-black text-[10px] font-black px-3 py-1.5 rounded-xl uppercase flex items-center gap-1.5 shadow-lg shadow-status-warning/20"><Flame className="w-3.5 h-3.5 fill-current" /> Hype</span>}
                            </div>
                            <div className="flex justify-between items-end gap-6">
                                <div className="min-w-0">
                                    <h1 className="text-4xl xs:text-5xl font-black text-white italic tracking-tighter leading-[0.85] drop-shadow-2xl truncate uppercase">{place.name}</h1>
                                    <p className="text-text-secondary text-xs font-medium flex items-center gap-2 mt-3"><MapPin className="w-4 h-4 text-primary-main" /> {place.address}</p>
                                </div>
                                <div className="glass-card !bg-bg-default/40 p-4 rounded-3xl border border-white/10 flex flex-col items-center shrink-0 shadow-2xl">
                                    <span className="text-[9px] font-black text-text-tertiary uppercase mb-1 tracking-widest">Score</span>
                                    <div className="flex items-center gap-1.5 text-primary-main font-black text-2xl"><Star className="w-5 h-5 fill-current" /> {place.rating}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="px-6 -mt-8 relative z-20 space-y-6 pb-40">
                    <div className="flex flex-col gap-4">
                        {/* Main Check-in Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleGeoCheckIn(); }}
                            disabled={isCheckedIn || checkingDistance}
                            className={`w-full min-h-[64px] py-5 rounded-[2rem] font-black uppercase text-base tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.97] border border-white/10
                            ${isCheckedIn
                                    ? 'bg-status-success text-white shadow-[0_12px_32px_rgba(34,197,94,0.3)]'
                                    : 'bg-primary-main text-black shadow-[0_12px_32px_rgba(217,255,0,0.3)]'}`}
                        >
                            {checkingDistance ? (
                                <><Loader2 className="w-6 h-6 animate-spin" /> VERIFICANDO...</>
                            ) : isCheckedIn ? (
                                <><CheckCircle2 className="w-6 h-6" /> ESTOU AQUI</>
                            ) : (
                                <><Navigation className="w-6 h-6" /> VOU LÁ AGORA</>
                            )}
                        </button>

                        {/* Secondary Actions Row */}
                        {!isCheckedIn && (
                            <div className="grid grid-cols-3 gap-3">
                                <button onClick={handleOpenMaps} className="glass-card bg-bg-surface-1/40 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-white group">
                                    <MapPin className="w-5 h-5 text-primary-main" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">MAPS</span>
                                </button>
                                <button onClick={handleOpenUber} className="glass-card bg-bg-surface-1/40 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-white group">
                                    <Car className="w-5 h-5 text-primary-main" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">UBER</span>
                                </button>
                                <button onClick={handleShare} className="glass-card bg-bg-surface-1/40 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-white group">
                                    <Share2 className="w-5 h-5 text-primary-main" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">SHARE</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {isCheckedIn && (
                        <div className="space-y-4">
                            <button onClick={() => { trigger('medium'); setShowMatchMode(true); }} className="w-full bg-gradient-to-br from-primary-main/10 to-transparent backdrop-blur-xl border border-primary-main/20 rounded-[2.5rem] p-6 flex items-center justify-between active:scale-[0.98] transition-all shadow-xl group">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-primary-main/10 flex items-center justify-center border border-primary-main/20 group-hover:scale-110 transition-transform">
                                        <Users className="w-8 h-8 text-primary-main" />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <h4 className="text-2xl font-black text-white italic truncate">QUEM TÁ AQUI?</h4>
                                        <p className="text-[10px] text-text-tertiary font-black uppercase tracking-widest mt-0.5">Vibe Tinder ativada</p>
                                    </div>
                                </div>
                                <div className="bg-primary-main text-black px-4 py-2 rounded-2xl text-[11px] font-black shadow-lg">12+ ON</div>
                            </button>

                            <div className="bg-bg-surface-1/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-border-default shadow-inner">
                                <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-primary-main animate-pulse" /> Vibe Check Realtime</h4>
                                {!votedVibe ? (
                                    <div className="flex gap-4">
                                        <button onClick={() => { trigger('success'); setVotedVibe('up'); }} className="flex-1 bg-status-success/5 border border-status-success/10 p-4 rounded-2xl flex flex-col items-center gap-1.5 active:bg-status-success active:text-white transition-all group">
                                            <ThumbsUp className="w-6 h-6 text-status-success group-active:text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">BOMBANDO</span>
                                        </button>
                                        <button onClick={() => { trigger('success'); setVotedVibe('down'); }} className="flex-1 bg-status-error/5 border border-status-error/10 p-4 rounded-2xl flex flex-col items-center gap-1.5 active:bg-status-error active:text-white transition-all group">
                                            <ThumbsDown className="w-6 h-6 text-status-error group-active:text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-tighter">FLOPADO</span>
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-primary-main/10 border border-primary-main/20 rounded-2xl p-5 text-center shadow-inner">
                                        <p className="text-xs font-black text-primary-main italic tracking-widest">FEEDBACK ENVIADO! VALEU!</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <motion.div whileTap={{ scale: 0.95 }} className="bg-bg-surface-1/40 p-5 rounded-[2.5rem] border border-border-default group active:scale-95 transition-all" onClick={() => { trigger('light'); setShowMusicPoll(true); }}>
                            <div className="flex items-center gap-2 mb-3">
                                <Disc className="w-4 h-4 text-primary-main" />
                                <span className="text-[10px] font-black text-text-tertiary uppercase">Som</span>
                            </div>
                            <p className="text-white font-black text-sm italic truncate uppercase">{place.currentMusic || 'VIBE MISTERIOSA'}</p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[9px] font-black text-text-tertiary uppercase flex items-center gap-1"><History className="w-3 h-3" /> Ver History</span>
                            </div>
                        </motion.div>

                        <div className="bg-bg-surface-1/40 p-5 rounded-[2.5rem] border border-border-default">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-primary-main" />
                                <span className="text-[10px] font-black text-text-tertiary uppercase">Giro</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-white font-black text-2xl leading-none">{place.capacityPercentage}%</p>
                                <div className="w-full h-2 bg-bg-default rounded-full overflow-hidden border border-border-default mt-1">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${place.capacityPercentage >= 80 ? 'bg-status-error' : 'bg-primary-main'}`} style={{ width: `${place.capacityPercentage}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { trigger('light'); setShowMenu(true); }}
                            className="bg-bg-surface-1/60 backdrop-blur-xl border border-border-default p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all shadow-xl group"
                        >
                            <div className="w-16 h-16 bg-primary-main/10 rounded-3xl flex items-center justify-center border border-primary-main/10 group-hover:scale-110 transition-transform">
                                <Utensils className="w-8 h-8 text-primary-main" />
                            </div>
                            <div className="text-center relative">
                                {!isCheckedIn && <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-primary-main/40"><Zap className="w-4 h-4" /></div>}
                                <span className={`text-xs font-black uppercase tracking-widest block ${!isCheckedIn ? 'text-text-tertiary' : 'text-white'}`}>CARDÁPIO</span>
                                <span className="text-[9px] text-text-tertiary font-bold uppercase mt-1 tracking-tighter">{isCheckedIn ? 'Pedidos Online' : 'Apenas Visualizar'}</span>
                            </div>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { if (staffState === 'idle') { trigger('light'); setShowStaffOptions(true); } }}
                            disabled={staffState !== 'idle'}
                            className={`bg-bg-surface-1/60 backdrop-blur-xl border p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all shadow-xl group
                            ${staffState === 'calling' ? 'border-status-warning/50' : staffState === 'confirmed' ? 'border-status-success/50' : 'border-border-default'}`}
                        >
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all group-hover:scale-110 ${staffState === 'calling' ? 'bg-status-warning/20 animate-pulse' : staffState === 'confirmed' ? 'bg-status-success/20' : 'bg-primary-main/10'}`}>
                                {staffState === 'calling' ? <Loader2 className="w-8 h-8 text-status-warning animate-spin" /> : staffState === 'confirmed' ? <CheckCircle2 className="w-8 h-8 text-status-success" /> : <BellRing className="w-8 h-8 text-primary-main" />}
                            </div>
                            <div className="text-center">
                                <span className={`text-xs font-black uppercase tracking-widest block ${staffState === 'calling' ? 'text-status-warning' : staffState === 'confirmed' ? 'text-status-success' : 'text-white'}`}>
                                    {staffState === 'calling' ? 'CHAMANDO' : staffState === 'confirmed' ? 'VINDO!' : 'STAFF'}
                                </span>
                                <span className="text-[9px] text-text-tertiary font-bold uppercase mt-1 tracking-tighter">Chamar Ajuda</span>
                            </div>
                        </motion.button>
                    </div>

                    <div className="bg-bg-surface-1/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-border-default shadow-inner space-y-4">
                        <h4 className="text-[11px] font-black text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-2">DETALHES DO LOCAL</h4>
                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            {place.description || "O melhor rolê da região! Vibe incrível, música selecionada e ambiente premium para você e seus amigos."}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-4">
                            {place.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-bg-surface-2/80 rounded-lg text-[9px] font-black text-text-tertiary uppercase border border-white/5">{tag}</span>
                            ))}
                        </div>
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
            </div >
        );
    }

    return (
        <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            whileTap={{ scale: 0.98 }}
            onClick={() => { trigger('light'); if (onClick) onClick(); }}
            className="bg-[#1e293b]/60 rounded-[2.2rem] p-3.5 border border-white/5 shadow-2xl cursor-pointer mb-4 relative overflow-hidden group hover:bg-[#1e293b]/80 transition-all"
        >
            <div className="flex gap-4 items-stretch">
                {/* Left side: Image */}
                <div className="relative w-28 xs:w-32 shrink-0 rounded-[1.6rem] overflow-hidden bg-slate-900 border border-white/10 shadow-lg aspect-[3/4]">
                    {!imgLoaded && !imgError && <Skeleton className="absolute inset-0 w-full h-full" />}
                    <img
                        src={imgError ? FALLBACK_IMAGE : (place.imageUrl || FALLBACK_IMAGE)}
                        className={`w-full h-full object-cover transition-all duration-[1s] group-hover:scale-110 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                        alt={place.name}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />

                    {/* Occupancy Badge overlaying image */}
                    <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-md rounded-xl py-1.5 flex items-center justify-center gap-1.5 border border-white/10 shadow-lg">
                        <div className={`w-1.5 h-1.5 rounded-full ${isHot ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
                        <span className="text-[9px] font-black text-white italic">{place.capacityPercentage}% ON</span>
                    </div>

                    {rank && (<div className={`absolute top-0 left-0 px-2.5 py-1.5 rounded-br-2xl text-[9px] font-black uppercase shadow-lg ${rank === 1 ? 'bg-[var(--primary)] text-black' : 'bg-slate-900 text-white'}`}>#{rank}</div>)}
                </div>

                {/* Center: Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1.5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{place.type}</span>
                            {place.isTrending && <Flame className="w-3 h-3 text-orange-500 fill-current animate-pulse" />}
                        </div>
                        <h3 className="text-lg xs:text-xl font-black text-white italic truncate leading-none uppercase mb-2 tracking-tight drop-shadow-sm">{place.name}</h3>

                        <div className="space-y-1.5 mt-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-slate-600" /> {place.distance}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 truncate pr-2">
                                <Music className="w-3 h-3 text-slate-600" /> {place.currentMusic || 'Vibe do Local'}
                            </p>
                        </div>
                    </div>

                    {/* BADGES SECTION - SPRINT 2 */}
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
                        {place.capacityPercentage >= 80 && (
                            <Badge variant="destructive" className="py-1 px-3">
                                <Flame className="w-3.5 h-3.5 fill-current mr-1.5" /> BOMBANDO
                            </Badge>
                        )}
                        {place.friendsPresent.length > 0 && (
                            <Badge variant="default" className="py-1 px-3">
                                <Users className="w-3.5 h-3.5 fill-current mr-1.5" /> AMIGOS
                            </Badge>
                        )}
                    </div>

                    <div className="mt-auto flex items-center gap-2 opacity-80">
                        <div className="flex -space-x-1">
                            {[1, 2, 3].map(i => (
                                <img key={i} src={`https://i.pravatar.cc/100?u=${place.id}${i}`} className="w-4 h-4 rounded-full border border-slate-900" alt="" />
                            ))}
                        </div>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter bg-slate-900/40 px-1.5 py-0.5 rounded border border-white/5">Check-in p/ ver</span>
                    </div>
                </div>

                {/* Right: Actions Column */}
                <div className="flex flex-col items-center justify-between shrink-0 py-0.5">
                    <div className="flex flex-col gap-2 items-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleSave?.(place.id); }}
                            className={`p-2 active:scale-90 transition-transform ${isSaved ? 'text-[var(--primary)]' : 'text-slate-700'}`}
                        >
                            <Bookmark className={`w-4.5 h-4.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <button onClick={handleOpenMaps} className="p-2 text-slate-700 hover:text-cyan-400 active:scale-90 transition-transform">
                            <MapPin className="w-4.5 h-4.5" />
                        </button>
                    </div>

                    {/* Big VOU Button */}
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 shadow-[0_8px_20px_rgba(34,211,238,0.3)] flex flex-col items-center justify-center gap-0 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <MapPin className="w-5 h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                        <span className="text-[9px] font-black text-white italic tracking-tighter">VOU!</span>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
});
