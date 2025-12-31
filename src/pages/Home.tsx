import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place, PlaceType, User } from '@/types';
import { Bell, Bookmark, Search, Sparkles } from 'lucide-react';
import { PlaceCard } from '@/components/PlaceCard';
import { useHaptic } from '@/hooks/useHaptic';

// UI Components
import { Avatar } from '@/components/ui/Avatar';
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';

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
  const [filter, setFilter] = useState<PlaceType | 'ALL' | 'SAVED'>(initialFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilters] = useState<string[]>([]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="full-screen bg-bg-default"
    >
      {/* Background Cinematic */}
      <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-primary-main/5 to-transparent pointer-events-none z-0" />

      <Header
        left={
          <div className="flex items-center gap-3">
            <Avatar src={currentUser.avatar} size="md" className="border-2 border-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest leading-none">Bem-vindo</span>
              <span className="text-sm font-black text-white italic tracking-tight">{firstName}</span>
            </div>
          </div>
        }
        center={
          <h1 className="text-xl font-black text-white italic tracking-tighter uppercase mr-4">
            VOU LÁ
          </h1>
        }
        right={
          <div className="flex items-center gap-2">
            <button onClick={onNavigateToIA} className="p-2.5 rounded-xl bg-primary-main/10 text-primary-main border border-primary-main/20 active:scale-95 transition-all">
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => { trigger('light'); onOpenNotifications(); }}
              className="p-2.5 rounded-xl bg-white/5 text-white border border-white/10 active:scale-95 transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-status-error text-[10px] text-white rounded-full flex items-center justify-center font-black border-2 border-bg-default shadow-lg">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-32 scroll-container relative z-10">
        {/* Search & Categories */}
        <div className="space-y-6 mb-8">
          <Input
            placeholder="Para onde vamos hoje?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startIcon={<Search className="w-4 h-4" />}
            className="!bg-white/5 !border-white/5 shadow-inner"
          />

          <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-2 px-2">
            {filters.map((f) => {
              const isActive = filter === f.id;
              return (
                <motion.button
                  key={f.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleFilterChange(f.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all
                    ${isActive
                      ? 'bg-primary-main text-black shadow-lg shadow-primary-main/20'
                      : 'bg-white/5 text-text-secondary border border-white/5'
                    }`}
                >
                  {f.icon}
                  {f.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Trending Section */}
        {filter === 'ALL' && !searchQuery && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-5 px-1">
              <h3 className="text-xs font-black text-text-tertiary uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-main" /> Em Alta Agora
              </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2">
              {places.filter(p => p.isTrending).slice(0, 5).map(p => (
                <motion.div
                  key={p.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPlaceSelect(p)}
                  className="w-44 shrink-0 relative rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl aspect-[3/4] group cursor-pointer"
                >
                  <motion.img
                    src={p.imageUrl}
                    className="w-full h-full object-cover"
                    alt={p.name}
                    whileHover={{ scale: 1.15 }}
                    transition={{ duration: 0.8 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-[10px] font-black text-primary-main uppercase tracking-widest truncate mb-0.5">{p.type}</p>
                    <h4 className="text-white font-black italic uppercase text-sm tracking-tight truncate">{p.name}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Places List */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-[2rem] animate-pulse border border-white/5" />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 gap-3 pb-32"
              >
                {sortedPlaces.length === 0 ? (
                  <div className="col-span-2 py-20 text-center opacity-40 flex flex-col items-center">
                    <Search className="w-12 h-12 mb-4 text-text-tertiary" />
                    <p className="text-sm font-black uppercase tracking-widest">Nenhum lugar encontrado</p>
                  </div>
                ) : (
                  sortedPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      onClick={() => onPlaceSelect(place)}
                      isSaved={savedPlaces.includes(place.id)}
                      onToggleSave={onToggleSave}
                      currentUser={currentUser}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
  );
};
