import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place, PlaceType, User } from '../types';
import { Bell, Bookmark, Search, Music, Navigation, Zap, SlidersHorizontal, Trash2, Sparkles } from 'lucide-react';
import { PlaceCard } from '../components/PlaceCard';
import { useHaptic } from '../hooks/useHaptic';
import { useToast } from '../components/ToastProvider';
import { fadeIn, slideUp } from '../src/styles/animations';

// UI Components
import { Avatar } from '../src/components/ui/Avatar';
import { Button } from '../src/components/ui/Button';
import { Skeleton } from '../src/components/ui/Skeleton';
import { Card } from '../src/components/ui/Card';
import { Badge } from '../src/components/ui/Badge';
import { Tab } from '../types';

interface HomeProps {
  currentUser: User;
  places: Place[];
  onPlaceSelect: (place: Place) => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  savedPlaces: string[];
  onToggleSave: (id: string) => void;
  initialFilter?: PlaceType | 'ALL' | 'SAVED';
  onNavigateToIA: () => void;
}

export const Home: React.FC<HomeProps> = ({
  currentUser,
  places,
  onPlaceSelect,
  notificationCount,
  onOpenNotifications,
  savedPlaces,
  onToggleSave,
  initialFilter = 'ALL',
  onNavigateToIA
}) => {
  const { trigger } = useHaptic();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<PlaceType | 'ALL' | 'SAVED'>(initialFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilters, setActiveSubFilters] = useState<string[]>([]);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (type: PlaceType | 'ALL' | 'SAVED') => {
    trigger('light');
    setFilter(type);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  const filteredPlaces = places.filter(p => {
    const matchesFilter = filter === 'ALL' ? true : filter === 'SAVED' ? savedPlaces.includes(p.id) : (p.type as string) === (filter as string);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubFilters = activeSubFilters.length === 0 || activeSubFilters.every(sf => {
      if (sf === 'HYPE') return p.capacityPercentage >= 80;
      if (sf === 'CLOSE') return true;
      return true;
    });
    return matchesFilter && matchesSearch && matchesSubFilters;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (filter === 'SAVED') return 0;
    return b.capacityPercentage - a.capacityPercentage;
  });

  const filters = [
    { id: 'ALL', label: 'Todos' },
    { id: 'SAVED', label: 'Favoritos', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { id: PlaceType.BALADA, label: 'Baladas' },
    { id: PlaceType.BAR, label: 'Bares' },
    { id: PlaceType.EVENTO, label: 'Eventos' },
    { id: PlaceType.RESTAURANTE, label: 'Comer' },
  ];

  const firstName = currentUser.name.split(' ')[0] || 'Visitante';

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="h-full w-full bg-[var(--bg-default)] overflow-hidden flex flex-col pt-safe relative transition-colors duration-500"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[var(--bg-subtle)] to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary-main)] opacity-10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Header Sticky */}
      <div className="px-6 pb-4 z-20 flex flex-col gap-6 sticky top-0 backdrop-blur-xl bg-[var(--bg-default)]/70 pt-8 transition-all duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="relative group mr-1"
            >
              <div className="absolute -inset-1 bg-gradient-to-tr from-[var(--primary-main)] to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <Avatar
                src={currentUser.avatar}
                fallback={firstName}
                size="lg"
                bordered
                className="bg-[var(--bg-card)] relative border-2 border-[var(--bg-default)] shadow-2xl"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--status-success)] rounded-full border-4 border-[var(--bg-default)] shadow-lg"></div>
            </motion.div>

            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mb-1">
                Bem-vindo
              </p>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white italic truncate tracking-tight">
                  {firstName}
                </h2>
                <div className="w-1 h-8 bg-[var(--primary-main)] rounded-full glow-primary opacity-80" />
              </div>
            </div>
          </div>
          <div className="relative">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => { trigger('light'); onOpenNotifications(); }}
                className="rounded-2xl w-12 h-12 bg-[var(--bg-card)]/50 border border-white/5 shadow-2xl backdrop-blur-md"
              >
                <Bell className="w-6 h-6 text-[var(--text-secondary)]" />
              </Button>
            </motion.div>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[var(--status-error)] rounded-full border-2 border-[var(--bg-default)] shadow-lg"></span>
            )}
          </div>
        </div>

        {/* Search, Sub-filters and Categories */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 transition-colors ${searchQuery ? 'text-[var(--primary-main)]' : 'text-slate-500'}`} />
              </div>
              <input
                type="text"
                placeholder="Buscar por lugar ou estilo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-card)]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary-main)]/30 focus:bg-[var(--bg-card)] transition-all placeholder:text-slate-600 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                </button>
              )}
            </div>
            <Button variant="secondary" size="icon" className="rounded-2xl w-14 h-14 bg-[var(--bg-card)]/50 border border-white/5 shadow-2xl shrink-0">
              <SlidersHorizontal className="w-6 h-6 text-[var(--text-secondary)]" />
            </Button>
          </div>

          {/* Recommendations Section - SPRINT 2 */}
          {filter === 'ALL' && !searchQuery && (
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white italic uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> Recomendados
                </h3>
                <button
                  onClick={onNavigateToIA}
                  className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 active:scale-95 transition-all"
                >
                  IA Concierge
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2">
                {places.filter(p => p.isTrending).slice(0, 4).map(p => (
                  <motion.div
                    key={p.id}
                    className="w-48 shrink-0 relative group"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onPlaceSelect(p)}
                  >
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-black italic uppercase text-xs truncate mb-1">{p.name}</h4>
                        <Badge variant="success" className="text-[8px] py-0.5">
                          {p.capacityPercentage}% ON
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2">
            {[
              { id: 'HYPE', label: 'Bombando', icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'CLOSE', label: 'Perto de mim', icon: <Navigation className="w-3.5 h-3.5" /> },
              { id: 'LIVE', label: 'Ao Vivo', icon: <Music className="w-3.5 h-3.5" /> },
            ].map(sf => {
              const isActive = activeSubFilters.includes(sf.id);
              return (
                <button
                  key={sf.id}
                  onClick={() => {
                    trigger('light');
                    setActiveSubFilters(prev =>
                      prev.includes(sf.id) ? prev.filter(x => x !== sf.id) : [...prev, sf.id]
                    );
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-[var(--primary-main)]/10 border-[var(--primary-main)] text-[var(--primary-main)] glow-primary'
                      : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'
                    }`}
                >
                  {sf.icon}
                  {sf.label}
                </button>
              );
            })}
          </div>

          {/* Categories Carousel */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {filters.map((f, i) => {
              const isActive = filter === f.id;
              return (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Button
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleFilterChange(f.id as any)}
                    className={`rounded-2xl px-5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${isActive ? 'shadow-lg border-transparent glow-primary' : 'bg-[var(--bg-card)]/40'}`}
                    leftIcon={f.icon}
                  >
                    {f.label}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 scroll-container z-10 w-full max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 pt-2"
            >
              {Array(4).fill(0).map((_, i) => (
                <Card key={i} variant="solid" className="bg-[var(--bg-card)]/40 p-3 border-[var(--border-default)]/50">
                  <div className="flex gap-4">
                    <Skeleton variant="circular" className="w-24 h-24 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 py-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4 pt-2"
            >
              {filter === 'SAVED' && sortedPlaces.length === 0 && (
                <motion.div variants={fadeIn} className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
                  <Bookmark className="w-16 h-16 mb-4 stroke-1 opacity-50" />
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sem favoritos ainda</h3>
                  <p className="text-center text-sm max-w-[200px]">Salve os rolês que você curte para acessar rápido aqui.</p>
                </motion.div>
              )}
              {sortedPlaces.map((place, i) => (
                <motion.div key={place.id} variants={slideUp}>
                  <PlaceCard
                    place={place}
                    rank={filter === 'ALL' && i < 3 ? i + 1 : undefined}
                    onClick={() => onPlaceSelect(place)}
                    isSaved={savedPlaces.includes(place.id)}
                    onToggleSave={onToggleSave}
                    currentUser={currentUser}
                    isCheckedIn={currentUser.history?.some(h => {
                      const checkInDate = new Date(h.timestamp).getTime();
                      const now = new Date().getTime();
                      const eightHoursInMs = 8 * 60 * 60 * 1000;
                      return h.placeId === place.id && (now - checkInDate) < eightHoursInMs;
                    })}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
