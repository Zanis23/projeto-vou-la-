import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place, PlaceType, User } from '../types';
import { Bell, Bookmark } from 'lucide-react';
import { PlaceCard } from '../components/PlaceCard';
import { useHaptic } from '../hooks/useHaptic';
import { fadeIn, slideUp } from '../src/styles/animations';

// UI Components
import { Avatar } from '../src/components/ui/Avatar';
import { Button } from '../src/components/ui/Button';
import { Skeleton } from '../src/components/ui/Skeleton';
import { Card } from '../src/components/ui/Card';

interface HomeProps {
  currentUser: User;
  places: Place[];
  onPlaceSelect: (place: Place) => void;
  notificationCount: number;
  onOpenNotifications: () => void;
  savedPlaces: string[];
  onToggleSave: (id: string) => void;
  initialFilter?: PlaceType | 'ALL' | 'SAVED';
}

export const Home: React.FC<HomeProps> = ({
  currentUser,
  places,
  onPlaceSelect,
  notificationCount,
  onOpenNotifications,
  savedPlaces,
  onToggleSave,
  initialFilter = 'ALL'
}) => {
  const { trigger } = useHaptic();
  const [filter, setFilter] = useState<PlaceType | 'ALL' | 'SAVED'>(initialFilter);
  const [isLoading, setIsLoading] = useState(true);

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
    if (filter === 'ALL') return true;
    if (filter === 'SAVED') return savedPlaces.includes(p.id);
    return p.type === filter;
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

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'BOM DIA,' : h < 18 ? 'BOA TARDE,' : 'BOA NOITE,';
  };

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
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em] mb-1"
              >
                {getGreeting()}
              </motion.p>
              <div className="flex items-center gap-2">
                <motion.h2
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-black text-[var(--text-primary)] tracking-tighter leading-none"
                >
                  {firstName}
                </motion.h2>
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

        {/* Filters Carousel */}
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
                  className={`rounded-2xl px-5 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${isActive ? 'shadow-lg border-transparent glow-primary bg-[var(--primary-main)] text-[var(--primary-on)]' : 'bg-[var(--bg-card)]/40 text-[var(--text-secondary)] border-[var(--border-default)]'}`}
                  leftIcon={f.icon}
                >
                  {f.label}
                </Button>
              </motion.div>
            );
          })}
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
