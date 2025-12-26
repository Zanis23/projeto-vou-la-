
import React, { useState, useEffect, useCallback } from 'react';
import { Home } from './pages/Home';
import { Radar } from './pages/Radar';
import { Profile } from './pages/Profile';
import { Social } from './pages/Social';
import { Login } from './pages/Login';
import { AiConcierge } from './pages/AiConcierge';
import { Ranking } from './pages/Ranking';
import { Store } from './pages/Store';
import { Challenges } from './pages/Challenges';
import { BusinessRegistration } from './pages/BusinessRegistration';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { Tab, Place, User, FeedItem, CheckIn, PlaceType, Chat } from './types';
import { Map, List, User as UserIcon, MessageCircle, LayoutGrid, X, Loader2 } from 'lucide-react';
import { PlaceCard } from './components/PlaceCard';
import { MoreOptionsModal } from './components/MoreOptionsModal';
import { BusinessDashboard } from './components/BusinessDashboard';
import { MOCK_USER } from './constants';
import { db } from './utils/storage';
import { supabase } from './services/supabase';

type AppState = 'LOADING' | 'LOGIN' | 'MAIN' | 'BUSINESS_REG';

export default function App() {
  const [appState, setAppState] = useState<AppState>('LOADING');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [homeFilter, setHomeFilter] = useState<PlaceType | 'ALL' | 'SAVED'>('ALL');

  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [places, setPlaces] = useState<Place[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check tutorial on mount/login
  useEffect(() => {
    if (appState === 'MAIN' && !localStorage.getItem('voula_tutorial_seen_v1')) {
      setShowTutorial(true);
    }
  }, [appState]);

  // Lógica para lidar com botão Voltar no Android (Nativo)
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      // Prevent default browser behavior if needed, though for history it's already done
      if (selectedPlace) {
        setSelectedPlace(null);
        return;
      }
      if (showMoreMenu) {
        setShowMoreMenu(false);
        return;
      }
      if (activeTab !== Tab.HOME) {
        setActiveTab(Tab.HOME);
        return;
      }
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [selectedPlace, showMoreMenu, activeTab]);

  // Push state when opening modals to enable Back Button
  useEffect(() => {
    if (selectedPlace) {
      window.history.pushState({ modal: 'place' }, '');
    }
  }, [selectedPlace]);

  useEffect(() => {
    if (showMoreMenu) {
      window.history.pushState({ modal: 'menu' }, '');
    }
  }, [showMoreMenu]);

  const loadData = useCallback(async (optimisticUser?: User) => {
    // If optimisticUser is provided, use it effectively as 'currentUser' for the session 
    // but still fetch concurrent data
    const [fetchedUser, allPlaces, allFeed] = await Promise.all([
      optimisticUser ? Promise.resolve(optimisticUser) : db.user.get(),
      db.places.get(),
      db.feed.get()
    ]);

    // If we have an optimistic user, trust it over the DB for the initial render to avoid reversion
    // But we should eventually sync. For now, this is enough to keep the "Owner" state active.
    const finalUser = optimisticUser || fetchedUser;

    setCurrentUser(finalUser);
    setPlaces(allPlaces);
    setFeed(allFeed);

    if (allPlaces.length === 0) {
      await db.seed();
      const freshPlaces = await db.places.get();
      setPlaces(freshPlaces);
    }

    return finalUser;
  }, []);

  useEffect(() => {
    const init = async () => {
      const sessionUser = await db.auth.getSession();
      if (sessionUser) {
        setCurrentUser(sessionUser);
        await loadData();
        setAppState('MAIN');
      } else {
        const isLogged = localStorage.getItem('voula_logged_in');
        if (isLogged) {
          await loadData();
          setAppState('MAIN');
        } else {
          setAppState('LOGIN');
        }
      }
    };
    init();
  }, [loadData]);

  // Realtime Subscriptions
  useEffect(() => {
    if (appState !== 'MAIN') return;

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlaces(prev => [payload.new as Place, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setPlaces(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'DELETE') {
          setPlaces(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed' }, (payload) => {
        setFeed(prev => [payload.new as FeedItem, ...prev]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, (payload) => {
        // Only react if the chat involves the current user
        const chat = payload.new as any;
        if (chat && currentUser && (chat.user_id === currentUser.id || chat.target_id === currentUser.id)) {
          window.dispatchEvent(new CustomEvent('voula_chat_update'));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, (payload) => {
        const d = payload.new as any;
        if (d && d.id) {
          setPlaces(prev => prev.map(p => {
            if (p.id !== d.id) return p;
            return {
              ...p,
              ...d,
              peopleCount: d.people_count ?? p.peopleCount,
              capacityPercentage: d.capacity_percentage ?? p.capacityPercentage,
              imageUrl: d.image_url ?? p.imageUrl,
              isTrending: d.is_trending ?? p.isTrending,
              coordinates: d.coordinates || p.coordinates || { x: 0, y: 0 },
              phoneNumber: d.phone_number ?? p.phoneNumber,
              openingHours: d.opening_hours ?? p.openingHours,
              currentMusic: d.current_music ?? p.currentMusic,
              activeCalls: d.active_calls ?? p.activeCalls,
              friendsPresent: d.friends_present ?? p.friendsPresent,
              liveRequests: d.live_requests ?? p.liveRequests,
              upcomingEvents: d.upcoming_events ?? p.upcomingEvents,
              activePromos: d.active_promos ?? p.activePromos,
              sentimentScore: d.sentiment_score ?? p.sentimentScore,
              crowdInsights: d.crowd_insights ?? p.crowdInsights,
              ownerId: d.owner_id ?? p.ownerId
            };
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appState, currentUser]);

  const handleLogin = (name: string, isNewUser: boolean, user?: User) => {
    if (user) {
      setCurrentUser(user);
      loadData();
      setAppState('MAIN');
    }
  };

  const handleLogout = async () => {
    await db.auth.logout();
    setAppState('LOGIN');
    setActiveTab(Tab.HOME);
    setCurrentUser(MOCK_USER);
  };

  const handleCheckIn = async (placeId: string) => {
    const target = places.find(p => p.id === placeId);
    if (!target) return;

    const xp = 50;
    const checkin: CheckIn = {
      id: Date.now().toString(),
      placeId,
      placeName: target.name,
      timestamp: new Date().toISOString(),
      xpEarned: xp,
      snapshotImageUrl: target.imageUrl
    };

    const updatedUser = {
      ...currentUser,
      points: currentUser.points + xp,
      history: [checkin, ...currentUser.history]
    };

    setCurrentUser(updatedUser);
    await db.user.save(updatedUser);

    const newItem: FeedItem = {
      id: `f_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'chegou no',
      placeName: target.name,
      timeAgo: 'Agora',
      liked: false,
      likesCount: 0,
      commentsCount: 0
    };

    await db.feed.add(newItem);
    await db.places.update({
      id: placeId,
      peopleCount: target.peopleCount + 1,
      capacityPercentage: Math.min(100, target.capacityPercentage + 2)
    });
  };

  if (appState === 'LOADING') {
    return (
      <div className="h-screen bg-[#0E1121] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">VOU LÁ</p>
      </div>
    );
  }

  if (appState === 'LOGIN') return <Login onLogin={handleLogin} onBusinessClick={() => setAppState('BUSINESS_REG')} />;

  if (appState === 'BUSINESS_REG') return (
    <BusinessRegistration
      onBack={() => setAppState('LOGIN')}
      onRegisterSuccess={async (u) => {
        setCurrentUser(u);
        await loadData(u); // Ensure data is loaded
        setActiveTab(Tab.DASHBOARD);
        setAppState('MAIN');
      }}
    />
  );

  return (
    <div className={`flex flex-col h-[100dvh] bg-[var(--background)] text-[var(--text-main)] overflow-hidden relative transition-colors duration-500 ${currentUser.appMode === 'light' ? 'light-mode' : ''}`}>

      <main className="flex-1 overflow-hidden relative">
        <div key={activeTab} className="h-full scroll-container">
          {activeTab === Tab.HOME && (
            <Home
              currentUser={currentUser}
              places={places}
              onPlaceSelect={setSelectedPlace}
              notificationCount={0}
              onOpenNotifications={() => { }}
              savedPlaces={currentUser.savedPlaces || []}
              initialFilter={homeFilter}
              onToggleSave={(id) => {
                const next = currentUser.savedPlaces.includes(id) ? currentUser.savedPlaces.filter(x => x !== id) : [...currentUser.savedPlaces, id];
                const u = { ...currentUser, savedPlaces: next };
                setCurrentUser(u);
                db.user.save(u);
              }}
            />
          )}
          {activeTab === Tab.RADAR && <Radar places={places} onPlaceSelect={setSelectedPlace} />}
          {activeTab === Tab.AI_FINDER && <AiConcierge />}
          {activeTab === Tab.SOCIAL && <Social feed={feed} onToggleLike={async (id) => { /* update */ }} onComment={(id) => { /* logic */ }} onPlaceSelect={setSelectedPlace} places={places} />}
          {activeTab === Tab.PROFILE && <Profile currentUser={currentUser} places={places} onLogout={handleLogout} onUpdateProfile={(upd) => { const u = { ...currentUser, ...upd }; setCurrentUser(u); db.user.save(u); }} />}
          {activeTab === Tab.RANKING && <Ranking currentUser={currentUser} />}
          {activeTab === Tab.CHALLENGES && <Challenges />}
          {activeTab === Tab.STORE && <Store currentUser={currentUser} onPurchase={(cost) => { const u = { ...currentUser, points: currentUser.points - cost }; setCurrentUser(u); db.user.save(u); }} />}
          {activeTab === Tab.DASHBOARD && currentUser.ownedPlaceId && (
            <BusinessDashboard
              placeId={currentUser.ownedPlaceId}
              placeData={places.find(p => p.id === currentUser.ownedPlaceId)}
            />
          )}

          {/* Tutorial Overlay */}
          {showTutorial && (
            <OnboardingTutorial onComplete={() => {
              localStorage.setItem('voula_tutorial_seen_v1', 'true');
              setShowTutorial(false);
            }} />
          )}
        </div>
      </main>

      {selectedPlace && (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)] flex flex-col">
          <div className="absolute top-safe left-4 z-50 pt-1">
            <button onClick={() => { window.history.back(); }} className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-lg border border-white/10 active:scale-90 shadow-xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          <PlaceCard place={selectedPlace} onCheckIn={handleCheckIn} expanded={true} isCheckedIn={currentUser.history.some(h => h.placeId === selectedPlace.id)} isSaved={currentUser.savedPlaces?.includes(selectedPlace.id)} />
        </div>
      )}

      {showMoreMenu && (
        <MoreOptionsModal
          currentUser={currentUser}
          onClose={() => setShowMoreMenu(false)}
          onNavigate={(dest) => {
            if (dest === Tab.EVENTS) {
              setHomeFilter(PlaceType.EVENTO);
              setActiveTab(Tab.HOME);
            } else {
              setHomeFilter('ALL');
              setActiveTab(dest as Tab);
            }
            setShowMoreMenu(false);
          }}
          onOpenSettings={() => {
            setShowMoreMenu(false);
            setActiveTab(Tab.PROFILE);
          }}
        />
      )}

      <nav className="bg-[var(--background)]/95 backdrop-blur-xl border-t border-white/5 flex justify-around items-center px-2 z-[90] pb-safe pt-2 min-h-[75px] xs:min-h-[85px] shrink-0">
        <NavButton active={activeTab === Tab.HOME} onClick={() => { setHomeFilter('ALL'); setActiveTab(Tab.HOME); }} icon={<List className="w-5 h-5" />} label="Lista" />
        <NavButton active={activeTab === Tab.RADAR} onClick={() => setActiveTab(Tab.RADAR)} icon={<Map className="w-5 h-5" />} label="Radar" />

        <div className="relative -top-6 xs:-top-7">
          <button onClick={() => setShowMoreMenu(true)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border-4 border-[var(--background)] ${showMoreMenu ? 'bg-white text-black' : 'bg-[var(--primary)] text-[var(--on-primary)] shadow-[0_0_20px_var(--primary-glow)]'}`}>
            <LayoutGrid className="w-6 h-6 fill-current" />
          </button>
        </div>

        <NavButton active={activeTab === Tab.SOCIAL} onClick={() => setActiveTab(Tab.SOCIAL)} icon={<MessageCircle className="w-5 h-5" />} label="Bonde" />
        <NavButton active={activeTab === Tab.PROFILE} onClick={() => setActiveTab(Tab.PROFILE)} icon={<UserIcon className="w-5 h-5" />} label="Perfil" />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-all active:scale-95 ${active ? 'text-[var(--primary)]' : 'text-slate-500'}`}>
    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `${(icon as any).props.className} ${active ? 'fill-current' : ''}` })}
    <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
  </button>
);
