
import React, { useState, useEffect } from 'react';
import { FALLBACK_IMAGE } from '../constants';
import { Place, PlaceType, User } from '../types';
import { Bell, Bookmark } from 'lucide-react';
import { PlaceCard } from '../components/PlaceCard';
import { useHaptic } from '../hooks/useHaptic';

// UI Components
import { Avatar } from '../src/components/ui/Avatar';
import { Badge } from '../src/components/ui/Badge';
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

  return (
    <div className="h-full w-full bg-[var(--bg-default)] overflow-hidden flex flex-col pt-safe relative transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[var(--bg-subtle)] to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary-main)] opacity-10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Header Sticky */}
      <div className="px-5 pb-2 z-20 flex flex-col gap-5 sticky top-0 backdrop-blur-md bg-[var(--bg-default)]/80 pt-4 border-b border-transparent transition-colors duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer active:scale-95 transition-transform">
              <Avatar
                src={currentUser.avatar}
                fallback={firstName}
                size="lg"
                bordered
                className="bg-[var(--bg-card)]"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--status-success)] rounded-full border-2 border-[var(--bg-default)] shadow-[0_0_8px_var(--status-success)]"></div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-0.5 flex items-center gap-1">
                {getGreeting()}
              </p>
              <h2 className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter leading-none flex items-center gap-2 drop-shadow-md">
                {firstName} <span className="text-2xl not-italic text-[var(--text-tertiary)]">|</span>
              </h2>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => { trigger('light'); onOpenNotifications(); }}
              className="rounded-full w-12 h-12 border-[var(--bg-subtle)] shadow-lg"
            >
              <Bell className="w-6 h-6" />
            </Button>
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-[var(--status-error)] rounded-full border-2 border-[var(--bg-default)] animate-pulse"></span>
            )}
          </div>
        </div>

        {/* Filters Carousel */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map(f => {
            const isActive = filter === f.id;
            return (
              <Button
                key={f.id}
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleFilterChange(f.id as any)}
                className={`rounded-2xl px-5 text-xs font-black uppercase tracking-wider whitespace-nowrap ${isActive ? 'scale-105 shadow-md' : 'text-[var(--text-secondary)] border-transparent'}`}
                leftIcon={f.icon}
              >
                {f.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 hide-scrollbar z-10 w-full max-w-xl mx-auto">
        {filter === 'SAVED' && sortedPlaces.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] animate-[fadeIn_0.5s_ease-out]">
            <Bookmark className="w-16 h-16 mb-4 stroke-1 opacity-50" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sem favoritos ainda</h3>
            <p className="text-center text-sm max-w-[200px]">Salve os rolês que você curte para acessar rápido aqui.</p>
          </div>
        )}

        <div className="space-y-4 pt-2">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
              <Card key={i} variant="solid" className="bg-[var(--bg-card)]/40 p-3 border-[var(--border-default)]/50">
                <div className="flex gap-4">
                  <Skeleton variant="circular" className="w-24 h-24 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3 py-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </Card>
            ))
            : sortedPlaces.map((place, i) => (
              <div key={place.id} className="animate-[slideUp_0.3s_ease-out]" style={{ animationDelay: `${i * 0.05}s` }}>
                <PlaceCard
                  place={place}
                  rank={filter === 'ALL' && i < 3 ? i + 1 : undefined}
                  onClick={() => onPlaceSelect(place)}
                  isSaved={savedPlaces.includes(place.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};
