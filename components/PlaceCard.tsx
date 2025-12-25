
import React, { useState, useMemo, useEffect } from 'react';
import { Place, MenuItem, OrderItem, StaffCall } from '../types';
import { MapPin, Crown, Check, ChevronRight, User, Music, Star, Clock, Map as MapIcon, Car, ArrowUpRight, Bookmark, Flame, Utensils, BellRing, ThumbsUp, ThumbsDown, Zap, Users, X, Beer, Pizza, Loader2, CheckCircle2, Play, Disc, Plus, Minus, Receipt, HelpCircle, History, BarChart3, Sparkles, ClipboardList, CreditCard, QrCode, ShoppingBag } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { useHaptic } from '../hooks/useHaptic';
import { FALLBACK_IMAGE, getUserById } from '../constants';
import { MatchMode } from './MatchMode';
import { db } from '../utils/storage';

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
    onShowSocialHub?: () => void;
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
        <div className="flex gap-3 xs:gap-4 p-3 xs:p-4 bg-slate-800/30 border border-slate-700/40 rounded-[1.8rem] mb-3 animate-[itemReveal_0.4s_ease-out] hover:bg-slate-800/40 transition-colors group relative overflow-hidden">
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
        </div>
    );
};

export const PlaceCard: React.FC<PlaceCardProps> = React.memo(({
    place, rank, onCheckIn, expanded = false, isCheckedIn = false, isSaved = false, onToggleSave, loading = false, onClick, onShowSocialHub
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
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
    const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');


    const [showStaffOptions, setShowStaffOptions] = useState(false);
    const [staffState, setStaffState] = useState<'idle' | 'calling' | 'confirmed'>('idle');

    const [showMusicPoll, setShowMusicPoll] = useState(false);
    const [hasVotedMusic, setHasVotedMusic] = useState(false);
    const [votingGenre, setVotingGenre] = useState<string | null>(null);
    const [pollResults, setPollResults] = useState<Record<string, number>>({
        'Sertanejo': 45, 'Funk': 32, 'Eletrônica': 18, 'Pop/Nacional': 5
    });

    // Reset img state when place changes
    useEffect(() => {
        setImgLoaded(false);
        setImgError(false);
    }, [place?.id]);

    const [checkInState, setCheckInState] = useState<'idle' | 'checking' | 'success'>('idle');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const gallery = useMemo(() => {
        if (place?.images && place.images.length > 0) return place.images;
        // Fallback demo gallery if only main image exists
        return [place?.imageUrl || FALLBACK_IMAGE, 'https://images.unsplash.com/photo-1570125909232-eb2be3b11374?q=80&w=1000&auto=format&fit=crop'];
    }, [place]);

    const handleImageScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const width = e.currentTarget.offsetWidth;
        setActiveImageIndex(Math.round(scrollLeft / width));
    };

    const handleGeoCheckIn = () => {
        if (!place || !onCheckIn || isCheckedIn) return;

        setCheckInState('checking');
        trigger('light');

        // Simulate GPS verification for better UX feel
        setTimeout(() => {
            // BETA BYPASS: Distance check disabled for testing
            trigger('success');
            setCheckInState('success');

            setTimeout(() => {
                onCheckIn(place.id);
                setCheckInState('idle');
            }, 1000);
        }, 1500);
    };

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCheckedIn) {
            if (onShowSocialHub) onShowSocialHub();
        } else {
            trigger('medium');
            setCheckInState('checking');
            setTimeout(() => {
                setCheckInState('success');
                if (onCheckIn) onCheckIn(place!.id);
                trigger('success');
            }, 1500);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-700/30 mb-3">
                <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            </div>
        );
    }

    if (!place) return null;

    if (expanded) {
        return (
            <div className="fixed inset-0 z-50 bg-[#0E1121] flex flex-col p-6 animate-[slideUp_0.4s_ease-out]">
                {/* Hero Header */}
                <div className="relative h-64 shrink-0 -mx-6 -mt-6 mb-6 group">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full" onScroll={handleImageScroll}>
                        {gallery.map((img, i) => (
                            <div key={i} className="w-full h-full shrink-0 snap-center relative">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1121] via-transparent to-black/30 pointer-events-none"></div>
                    <button onClick={onClick} className="absolute top-6 left-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white">
                        <ChevronRight className="w-6 h-6 rotate-180" />
                    </button>
                    <div className="absolute bottom-6 left-6">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{place.name}</h2>
                        <div className="flex items-center gap-2 text-slate-400 mt-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{place.address}</span>
                        </div>
                    </div>
                    {/* Dots */}
                    <div className="absolute top-6 right-6 flex gap-1.5 p-2 rounded-full bg-black/20 backdrop-blur-sm">
                        {gallery.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pb-20">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/20 p-5 rounded-[2rem] border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Público</span>
                            </div>
                            <p className="text-3xl font-black text-white">{place.capacityPercentage}%</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Lotado agora</p>
                        </div>
                        <div className="bg-slate-800/20 p-5 rounded-[2rem] border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Music className="w-4 h-4 text-fuchsia-400" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Som</span>
                            </div>
                            <p className="text-lg font-black text-white italic truncate">{place.currentMusic || 'Variada'}</p>
                            <button onClick={() => setShowMusicPoll(true)} className="text-[10px] text-indigo-400 font-bold uppercase mt-2 hover:underline">Votar no próximo</button>
                        </div>
                    </div>

                    {/* Vibe Check */}
                    <div className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-700/30">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Vibe da Galera</h4>
                        {!votedVibe ? (
                            <div className="flex gap-4">
                                <button onClick={() => setVotedVibe('up')} className="flex-1 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex flex-col items-center gap-2">
                                    <ThumbsUp className="w-6 h-6 text-green-500" />
                                    <span className="text-[9px] font-black text-green-500 uppercase">Bombando</span>
                                </button>
                                <button onClick={() => setVotedVibe('down')} className="flex-1 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center gap-2">
                                    <ThumbsDown className="w-6 h-6 text-red-500" />
                                    <span className="text-[9px] font-black text-red-500 uppercase">Morgado</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2 animate-[fadeIn_0.3s_ease-out]">
                                <span className="text-xs font-black text-[var(--primary)] uppercase tracking-widest italic flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Feedback recebido!
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quick Menu Preview */}
                    <div className="bg-slate-800/20 p-6 rounded-[2.5rem] border border-slate-700/30">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Cardápio Rápido</h4>
                            <button onClick={() => setShowMenu(true)} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Ver tudo</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowMenu(true)} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2">
                                <Beer className="w-6 h-6" />
                                <span className="text-[9px] font-black">Drinks</span>
                            </button>
                            <button onClick={() => setShowMenu(true)} className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2">
                                <Pizza className="w-6 h-6" />
                                <span className="text-[9px] font-black">Lanches</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky CTA */}
                <div className="absolute bottom-6 left-6 right-6">
                    <button
                        onClick={handleGeoCheckIn}
                        disabled={isCheckedIn || checkInState === 'checking'}
                        className={`w-full py-5 rounded-2xl font-black italic tracking-[0.2em] transition-all flex items-center justify-center gap-3
                        ${isCheckedIn ? 'bg-slate-700 text-slate-500' :
                                checkInState === 'checking' ? 'bg-indigo-600 animate-pulse text-white' :
                                    'bg-[var(--primary)] text-black shadow-[0_0_30px_var(--primary-glow)]'}`}
                    >
                        {checkInState === 'checking' ? <Loader2 className="w-6 h-6 animate-spin" /> :
                            isCheckedIn ? <CheckCircle2 className="w-6 h-6" /> : 'CHECK-IN NO GPS'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={onClick}
            className="group relative bg-[var(--surface)] glass-card rounded-[2.5rem] p-4 mb-5 active:scale-[0.98] transition-all cursor-pointer overflow-hidden premium-shadow"
        >
            {/* Animated Glow Backdrop */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="flex gap-4 items-center relative z-10">
                {/* Image Container with Squircle Masking */}
                <div className="relative w-28 h-28 xs:w-32 xs:h-32 shrink-0 squircle overflow-hidden bg-slate-900 shadow-xl border border-white/5">
                    <img
                        src={imgError ? FALLBACK_IMAGE : place.imageUrl}
                        className={`w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgError(true)}
                        alt={place.name}
                    />

                    {/* Occupancy Pill overlay */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${place.capacityPercentage > 85 ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`}></div>
                        <span className="text-[8px] font-black text-white italic">{place.capacityPercentage}% <span className="opacity-50 not-italic">ON</span></span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {rank && (
                            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase italic ${rank === 1 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'}`}>
                                #{rank} TOP
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">{place.type.toUpperCase()}</span>
                    </div>

                    <h3 className="text-xl font-black text-[var(--text-main)] italic tracking-tighter truncate uppercase leading-tight">
                        {place.name}
                    </h3>

                    <div className="flex items-center gap-3 mt-1.5 text-[var(--text-muted)] font-bold text-[10px] uppercase">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {place.distance}</span>
                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {place.currentMusic || 'Variada'}</span>
                    </div>

                    <div className="flex -space-x-2 mt-3 items-center">
                        {place.friendsPresent?.slice(0, 3).map((f, i) => (
                            <img key={i} src={f} className="w-7 h-7 rounded-full border-2 border-[var(--surface)] object-cover shadow-sm" alt="" />
                        ))}
                        {place.friendsPresent && place.friendsPresent.length > 0 && (
                            <span className="ml-3 text-[9px] font-black text-[var(--primary)] uppercase tracking-tighter">Galera On</span>
                        )}
                    </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={onToggleSave ? (e) => { e.stopPropagation(); onToggleSave(place.id); } : undefined}
                        className={`p-2 rounded-xl transition-all ${isSaved ? 'text-[var(--primary)]' : 'text-slate-600'}`}
                    >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + (place.address || ""))}`, '_blank'); }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
                    >
                        <MapIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(`https://m.uber.com/ul/?action=setPickup&client_id=YOUR_CLIENT_ID&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(place.address || "")}&dropoff[nickname]=${encodeURIComponent(place.name)}`, '_blank'); }}
                        className="p-2 rounded-xl text-slate-400 hover:text-white transition-all active:scale-95"
                    >
                        <Car className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleActionClick}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg mt-2
                        ${isCheckedIn ? 'bg-[var(--primary)] text-black shadow-[0_0_20px_var(--primary-glow)]' :
                                checkInState === 'checking' ? 'bg-indigo-600 animate-pulse text-white' : 'bg-white/5 border border-white/10 text-white'}`}
                    >
                        {checkInState === 'checking' ? <Loader2 className="w-6 h-6 animate-spin" /> :
                            isCheckedIn ? <CheckCircle2 className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Premium Glow effect in corner */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 blur-[40px] opacity-20 rounded-full
                ${rank === 1 ? 'bg-amber-500' : 'bg-[var(--primary)]'}`}></div>
        </div>
    );
});
