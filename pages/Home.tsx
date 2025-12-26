
import React, { useState, useEffect } from 'react';
import { MOCK_USER, FALLBACK_IMAGE } from '../constants';
import { Place, PlaceType, User } from '../types';
import { Bell, Bookmark } from 'lucide-react';
import { PlaceCard } from '../components/PlaceCard';
import { Skeleton } from '../components/Skeleton';
import { useHaptic } from '../hooks/useHaptic';

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
    { id: 'SAVED', label: 'Favoritos', icon: <Bookmark className="w-3 h-3" /> },
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
    <div className="h-full w-full bg-[var(--background)] overflow-hidden flex flex-col pt-safe relative transition-colors duration-500">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#1a1f35] to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary)] opacity-10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      <div className="px-5 pb-2 z-20 flex flex-col gap-5 sticky top-0 backdrop-blur-md bg-[var(--background)]/80 pt-4 border-b border-transparent transition-colors duration-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer active:scale-95 transition-transform">
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-[var(--primary)] via-white to-fuchsia-500">
                <img
                  src={currentUser.avatar}
                  className="w-full h-full rounded-full object-cover border-2 border-[var(--background)] bg-slate-800"
                  alt="Profile"
                  onError={(e) => e.currentTarget.src = FALLBACK_IMAGE}
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--background)] shadow-[0_0_8px_#22c55e]"></div>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                {getGreeting()}
              </p>
              <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none flex items-center gap-2 drop-shadow-md">
                {firstName} <span className="text-2xl not-italic">|</span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => { trigger('light'); onOpenNotifications(); }}
            className="relative p-3 bg-[var(--surface)] rounded-full text-slate-300 hover:text-white transition-colors border border-[var(--surface-highlight)] hover:border-[var(--primary)] active:scale-95 group shadow-lg"
          >
            <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            {notificationCount > 0 && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--surface)] animate-pulse shadow-[0_0_5px_#ef4444]"></div>
            )}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border
                    ${filter === f.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-[0_0_20px_var(--primary-glow)] scale-105'
                  : 'bg-[var(--surface)] text-slate-400 border-[var(--surface-highlight)] hover:border-slate-600 hover:text-white'}`}
            >
              {f.icon && React.cloneElement(f.icon as any, { className: 'w-3.5 h-3.5' })}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32 hide-scrollbar z-10">
        {filter === 'SAVED' && sortedPlaces.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-[fadeIn_0.5s_ease-out]">
            <Bookmark className="w-16 h-16 mb-4 stroke-1 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-2">Sem favoritos ainda</h3>
            <p className="text-center text-sm max-w-[200px] text-slate-400">Salve os rolês que você curte para acessar rápido aqui.</p>
          </div>
        )}

        <div className="space-y-4 pt-2">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-slate-800/40 p-3 rounded-3xl border border-slate-700/50">
                <div className="flex gap-4">
                  <Skeleton variant="circular" className="w-24 h-24 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2 py-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
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
