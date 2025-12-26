import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Star, Bookmark, Music, Users, Zap, ThumbsUp, ThumbsDown, Disc, Info, Phone, Clock, Plus, Minus, Map as MapIcon, Car, CheckCircle2, Ghost, ChevronRight, Beer, Pizza } from 'lucide-react';
import { Place, User, CheckIn, MenuItem, OrderItem } from '../types';
import { useHaptic } from '../hooks/useHaptic';
import { db } from '../utils/storage';
import { PeopleList } from './PeopleList';
import { Skeleton } from './Skeleton';
import { MOCK_USER } from '../constants';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop";

interface PlaceCardProps {
    place: Place;
    rank?: number;
    onCheckIn?: (id: string, vibe?: string) => void;
    expanded?: boolean;
    isCheckedIn?: boolean;
    isSaved?: boolean;
    onToggleSave?: (id: string) => void;
    loading?: boolean;
    onClick?: () => void;
    onShowSocialHub?: () => void;
    currentUser?: User;
    peoplePresent?: User[]; // Added Prop
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
    place, rank, onCheckIn, expanded = false, isCheckedIn = false, isSaved = false, onToggleSave, loading = false, onClick, onShowSocialHub, currentUser, peoplePresent
}) => {
    const { trigger } = useHaptic();
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    // const [showPeopleList, setShowPeopleList] = useState(false); // Removed
    const [votedVibe, setVotedVibe] = useState<'up' | 'down' | null>(null);

    // Simplified Check-in Logic
    const handleCheckInToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isCheckedIn) {
            // Already checked in -> Do nothing (or un-checkin if we wanted)
            if (onClick) onClick(); // Expand if not already
        } else {
            // Not checked in -> Check In
            trigger('success');
            if (onCheckIn) onCheckIn(place.id);
        }
    };

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
            <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col animate-[slideUp_0.4s_ease-out]">
                {/* Hero Header */}
                <div className="relative h-64 shrink-0 group">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full" onScroll={handleImageScroll}>
                        {gallery.map((img, i) => (
                            <div key={i} className="w-full h-full shrink-0 snap-center relative">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-black/30 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full p-4 pt-safe flex justify-between items-start z-30">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                trigger('light');
                                if (onClick) onClick();
                                else window.history.back();
                            }}
                            className="p-3.5 bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/20 shadow-2xl transition-all active:scale-90"
                        >
                            <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
                        <h2 className="text-4xl font-black text-[var(--text-main)] italic tracking-tighter uppercase leading-none drop-shadow-lg">{place.name}</h2>
                        <div className="flex items-center gap-2 text-white/80 mt-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{place.address}</span>
                        </div>
                    </div>
                    {/* Dots */}
                    <div className="absolute top-6 right-6 flex gap-1.5 p-2 rounded-full bg-black/20 backdrop-blur-sm z-20">
                        {gallery.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 p-6 pb-28">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--surface)] p-5 rounded-[2.5rem] border border-[var(--surface-highlight)] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-cyan-500/10 transition-colors"></div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-cyan-400" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Público</span>
                            </div>
                            <p className="text-4xl font-black text-[var(--text-main)] italic tracking-tighter relative z-10">{place.capacityPercentage}%</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase mt-1 tracking-wider opacity-60 relative z-10">Lotado agora</p>
                        </div>
                        <div className="bg-[var(--surface)] p-5 rounded-[2.5rem] border border-[var(--surface-highlight)] shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-fuchsia-500/10 transition-colors"></div>
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
                                    <Music className="w-4 h-4 text-fuchsia-400" />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Som</span>
                            </div>
                            <p className="text-xl font-black text-[var(--text-main)] italic truncate relative z-10">{place.currentMusic || 'Variada'}</p>
                            <button onClick={() => setShowMusicPoll(true)} className="text-[10px] text-[var(--primary)] font-black uppercase mt-2 tracking-widest hover:underline relative z-10 flex items-center gap-1">
                                <Disc className="w-3 h-3 animate-spin-slow" /> VOTAR PRÓXIMO
                            </button>
                        </div>
                    </div>

                    {/* INLINE SOCIAL / MATCH TAB (Visible only when checked in) */}
                    {isCheckedIn ? (
                        <div className="bg-[var(--surface)] p-6 rounded-[2.5rem] border border-[var(--surface-highlight)] shadow-sm animate-[fadeIn_0.5s_ease-out]">
                            <PeopleList
                                placeName={place.name}
                                people={peoplePresent || []}
                                currentUser={currentUser || MOCK_USER}
                                onClose={() => { }} // No close button needed for inline
                                onConnect={(uid) => console.log("Connect", uid)}
                                isInline={true}
                            />
                        </div>
                    ) : (
                        <div className="bg-[var(--surface)] p-8 rounded-[2.5rem] border border-[var(--surface-highlight)] shadow-sm flex flex-col items-center justify-center text-center opacity-70 grayscale">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Ghost className="w-8 h-8 text-slate-500" />
                            </div>
                            <h4 className="text-lg font-black text-white italic tracking-tighter uppercase mb-2">Lista Bloqueada</h4>
                            <p className="text-xs text-slate-400 font-medium max-w-[200px]">Faça check-in para ver quem está no rolê e dar match!</p>
                        </div>
                    )}

                    {/* Vibe Check */}
                    <div className="bg-[var(--surface)] p-6 rounded-[2.5rem] border border-[var(--surface-highlight)] shadow-sm">
                        <h4 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Vibe da Galera</h4>
                        {!votedVibe ? (
                            <div className="flex gap-4">
                                <button onClick={() => setVotedVibe('up')} className="flex-1 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-green-500/20">
                                    <ThumbsUp className="w-6 h-6 text-green-500" />
                                    <span className="text-[9px] font-black text-green-500 uppercase">Bombando</span>
                                </button>
                                <button onClick={() => setVotedVibe('down')} className="flex-1 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-transform hover:bg-red-500/20">
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
                    <div className="bg-[var(--surface)] p-6 rounded-[2.5rem] border border-[var(--surface-highlight)] shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-[10px] font-black text-[var(--text-main)] uppercase tracking-[0.2em]">Cardápio Rápido</h4>
                            <button onClick={() => setShowMenu(true)} className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Ver tudo</button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setShowMenu(true)} className="bg-[var(--background)] border border-[var(--surface-highlight)] p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-[var(--primary)] transition-colors active:scale-95">
                                <Beer className="w-6 h-6 text-[var(--text-main)]" />
                                <span className="text-[9px] font-black text-[var(--text-muted)]">Drinks</span>
                            </button>
                            <button onClick={() => setShowMenu(true)} className="bg-[var(--background)] border border-[var(--surface-highlight)] p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-[var(--primary)] transition-colors active:scale-95">
                                <Pizza className="w-6 h-6 text-[var(--text-main)]" />
                                <span className="text-[9px] font-black text-[var(--text-muted)]">Lanches</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sticky CTA */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isCheckedIn && checkInState !== 'checking') {
                                // handleGeoCheckIn(); // OLD
                                setShowCheckInFlow(true); // NEW
                            }
                        }}
                        disabled={isCheckedIn}
                        className={`w-full py-4 rounded-2xl font-black italic tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-95
                        ${isCheckedIn ? 'bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]' :
                                'bg-[var(--primary)] text-[var(--on-primary)] shadow-[0_0_20px_var(--primary-glow)]'}`}
                    >
                        {isCheckedIn ? <><CheckCircle2 className="w-6 h-6" /> ESTOU AQUI!</> : 'VOU LÁ!'}
                    </button>

                </div>

                {/* MODALS */}
                {showMenu && (
                    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl animate-[fadeIn_0.2s_ease-out] flex flex-col">
                        <div className="px-5 pt-safe flex justify-between items-center h-20 bg-[var(--surface)] border-b border-[var(--surface-highlight)]">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowMenu(false)} className="p-3 bg-[var(--background)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)]"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                <h3 className="font-black text-[var(--text-main)] text-xl italic tracking-tighter">CARDÁPIO</h3>
                            </div>
                            <div className="flex bg-[var(--background)] rounded-xl p-1 border border-[var(--surface-highlight)]">
                                <button onClick={() => setMenuCategory('all')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${menuCategory === 'all' ? 'bg-[var(--primary)] text-black' : 'text-[var(--text-muted)]'}`}>Todos</button>
                                <button onClick={() => setMenuCategory('drink')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${menuCategory === 'drink' ? 'bg-[var(--primary)] text-black' : 'text-[var(--text-muted)]'}`}>Drinks</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Mock Menu Items */}
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-4 p-4 mb-4 bg-[var(--surface)] rounded-2xl border border-[var(--surface-highlight)]">
                                    <div className="w-20 h-20 bg-[var(--background)] rounded-xl shrink-0"></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[var(--text-main)]">Item Exemplo {i}</h4>
                                        <p className="text-[var(--text-muted)] text-xs mt-1">Descrição deliciosa do item.</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-black text-[var(--primary)]">R$ 29,90</span>
                                            <button onClick={() => alert('Adicionado!')} className="p-2 bg-[var(--primary)] rounded-lg text-black"><Plus className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            {/* People List Inline Integration */}
            {/* We no longer render it as a fixed modal here. Instead, it will be part of the expanded content below */}

            <div
                onClick={onClick}
                className="group relative bg-[var(--surface)] glass-card rounded-[2.5rem] p-2 mb-4 active:scale-[0.98] transition-all cursor-pointer overflow-hidden premium-shadow min-h-[140px] flex items-stretch flow-root"
            >
                {/* Animated Glow Backdrop */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                {/* Content Container - Flex row with gap */}
                <div className="flex gap-3 items-center relative z-10 w-full">
                    {/* Image Container - Closer to edge */}
                    <div className="relative w-32 shrink-0 h-full min-h-[120px] rounded-[2rem] overflow-hidden bg-slate-900 shadow-xl border border-white/5 ml-1">
                        <img
                            src={imgError ? FALLBACK_IMAGE : place.imageUrl}
                            className={`w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                            alt={place.name}
                        />

                        {/* Occupancy Pill overlay */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5 whitespace-nowrap">
                            <div className={`w-1.5 h-1.5 rounded-full ${place.capacityPercentage > 85 ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`}></div>
                            <span className="text-[8px] font-black text-white italic">{place.capacityPercentage}% <span className="opacity-50 not-italic">ON</span></span>
                        </div>
                    </div>

                    {/* Content - Middle */}
                    <div className="flex-1 min-w-0 py-2 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            {rank && (
                                <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase italic ${rank === 1 ? 'bg-amber-500 text-black' : 'bg-slate-700 text-white'}`}>
                                    #{rank} TOP
                                </div>
                            )}
                            <span className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest truncate">{place.type.toUpperCase()}</span>
                        </div>

                        <h3 className="text-lg xs:text-xl font-black text-[var(--text-main)] italic tracking-tighter truncate uppercase leading-tight mb-1">
                            {place.name}
                        </h3>

                        <div className="flex flex-col gap-1 text-[var(--text-muted)] font-bold text-[9px] xs:text-[10px] uppercase">
                            <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" /> {place.address?.split(',')[0]}</span>
                            <span className="flex items-center gap-1 truncate"><Music className="w-3 h-3 shrink-0" /> {place.currentMusic || 'Variada'}</span>
                        </div>

                        {/* UPDATED: People/Friends Section with Lock/Unlock Logic */}
                        <div
                            onClick={(e) => {
                                // If checked in, just let it bubble up to expand the card
                                if (isCheckedIn) {
                                    // Let parent handle expand
                                } else {
                                    e.stopPropagation();
                                    handleCheckInToggle(e);
                                }
                            }}
                            className={`flex items-center gap-2 mt-2.5 transition-all relative
                            ${isCheckedIn ? 'opacity-100' : 'opacity-70 blur-[2px] hover:blur-none transition-all duration-500'}`}
                        >
                            {/* Optional Lock Icon Overlay if not checked in */}
                            {!isCheckedIn && (
                                <div className="absolute z-20 left-8 px-2 py-0.5 bg-black/60 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1">
                                    <span className="text-[8px] font-black text-white uppercase tracking-wider">Check-in p/ ver</span>
                                </div>
                            )}

                            <div className="flex -space-x-3 items-center">
                                {place.friendsPresent?.slice(0, 3).map((f, i) => (
                                    <div key={i} className="relative group/avatar">
                                        <img src={f} className="w-8 h-8 rounded-full border-2 border-[var(--surface)] object-cover shadow-lg" alt="" />
                                    </div>
                                ))}
                                {/* Fake extra heads to look busy if empty */}
                                {!place.friendsPresent?.length && [1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[var(--surface)]" />
                                ))}
                            </div>

                            <div className="flex items-center gap-1.5 bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                                <span className="text-[8px] font-black text-[var(--primary)] uppercase tracking-tighter italic whitespace-nowrap">
                                    {isCheckedIn ? 'Ver Galera' : 'Galera Oculta'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Column - Right Aligned with bg/border separator if needed, essentially taking the right space */}
                    <div className="flex flex-col items-center justify-between py-1 gap-2 pr-1 w-12 shrink-0">
                        <button
                            onClick={onToggleSave ? (e) => { e.stopPropagation(); onToggleSave(place.id); } : undefined}
                            className={`p-2 rounded-xl transition-all active:scale-95 ${isSaved ? 'text-[var(--primary)]' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + (place.address || ""))}`, '_blank'); }}
                                className="p-1 rounded-xl text-slate-500 hover:text-white transition-all active:scale-95"
                            >
                                <MapIcon className="w-4 h-4" />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); window.open(`https://m.uber.com/ul/?action=setPickup&client_id=YOUR_CLIENT_ID&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(place.address || "")}&dropoff[nickname]=${encodeURIComponent(place.name)}`, '_blank'); }}
                                className="p-1 rounded-xl text-slate-500 hover:text-white transition-all active:scale-95"
                            >
                                <Car className="w-4 h-4" />
                            </button>
                        </div>

                        {/* THE CHECK-IN / UNLOCK BUTTON */}
                        <button
                            onClick={handleCheckInToggle}
                            className={`w-10 h-12 flex flex-col items-center justify-center rounded-xl transition-all duration-500 shadow-lg z-20 relative
                            ${isCheckedIn
                                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] ring-2 ring-emerald-500/50 scale-110'
                                    : 'bg-[var(--primary)] text-black shadow-[0_0_15px_var(--primary-glow)] hover:brightness-110'}`}
                        >
                            {isCheckedIn ? (
                                <CheckCircle2 className="w-5 h-5 animate-[pop_0.3s_ease-out]" />
                            ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-[7px] font-black leading-none">VOU</span>
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Premium Glow effect in corner */}
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 blur-[40px] opacity-20 rounded-full pointer-events-none
                    ${rank === 1 ? 'bg-amber-500' : 'bg-[var(--primary)]'}`}></div>
            </div>
        </>
    );
});
