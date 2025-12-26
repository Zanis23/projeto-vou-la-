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
import { InstallPWA } from './components/InstallPWA';
import { usePWA } from './hooks/usePWA';
import { useGeoLocation } from './hooks/useGeoLocation';
import { Tab, Place, User, FeedItem, CheckIn, PlaceType, Chat, Moment, Ticket } from './types';
import { Map, List, User as UserIcon, MessageCircle, LayoutGrid, X, Loader2 } from 'lucide-react';
import { PlaceCard } from './components/PlaceCard';
import { MoreOptionsModal } from './components/MoreOptionsModal';
import { SocialHub } from './components/SocialHub';
import { BusinessDashboard } from './components/BusinessDashboard';
import { MOCK_USER, ACCENTS, MODES } from './constants';
import { db } from './utils/storage';
import { supabase } from './services/supabase';

type AppState = 'LOADING' | 'LOGIN' | 'MAIN' | 'BUSINESS_REG';

export default function App() {
  const [appState, setAppState] = useState<AppState>('LOADING');
  const userLocation = useGeoLocation();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [homeFilter, setHomeFilter] = useState<PlaceType | 'ALL' | 'SAVED'>('ALL');

  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [places, setPlaces] = useState<Place[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Apply theme globally
  useEffect(() => {
    const mode = currentUser.appMode || 'dark';
    const accent = currentUser.themeColor || 'neon';
    const accentData = ACCENTS[accent as keyof typeof ACCENTS];

    // MAJOR FIX: Use data-attribute for Mode (Light/Dark) to let CSS handle it
    document.documentElement.setAttribute('data-mode', mode);

    // Only inject Dynamic Brand Colors via JS
    if (accentData) {
      document.documentElement.style.setProperty('--primary', accentData.primary);
      document.documentElement.style.setProperty('--primary-glow', accentData.primaryGlow);
      document.documentElement.style.setProperty('--on-primary', accentData.onPrimary);
    }
  }, [currentUser.appMode, currentUser.themeColor]);

  // Check tutorial on mount/login
  useEffect(() => {
    // Check whenever we enter MAIN state or user changes
    if (appState === 'MAIN') {
      const seen = localStorage.getItem('voula_tutorial_seen_v1');
      if (seen !== 'true') {
        setShowTutorial(true);
      }
    }
  }, [appState, currentUser?.id]);

  // MAJOR FIX: Back button logic integrated with Browser History
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (selectedPlace) {
        setSelectedPlace(null);
        // We don't want to go back in browser history if we just closed a modal
        // but popstate already happened, so we just clear the state.
      } else if (showMoreMenu) {
        setShowMoreMenu(false);
      } else if (activeTab !== Tab.HOME) {
        setActiveTab(Tab.HOME);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedPlace, showMoreMenu, activeTab]);

  // Push state when opening high-level modals
  useEffect(() => {
    if (selectedPlace) {
      window.history.pushState({ modal: 'place' }, '');
    }
  }, [selectedPlace]);

  const loadData = useCallback(async (optimisticUser?: User) => {
    const [fetchedUser, allPlaces, allFeed, allMoments] = await Promise.all([
      db.user.get(),
      db.places.get(),
      db.feed.get(),
      db.moments.list()
    ]);

    setPlaces(allPlaces);
    setFeed(allFeed);
    setMoments(allMoments);

    if (allPlaces.length === 0) {
      await db.seed();
      const freshPlaces = await db.places.get();
      setPlaces(freshPlaces);
    }

    setCurrentUser(prevUser => {
      if (optimisticUser) return optimisticUser;

      // If fetchedUser is older than our current local state, keep current
      if (fetchedUser.lastSync && prevUser.lastSync && fetchedUser.lastSync < prevUser.lastSync) {
        console.log("⚠️ DB data is stale, keeping local state.");
        return prevUser;
      }

      return fetchedUser;
    });

    return fetchedUser;
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
      // Force tutorial check by clearing flag if explicitly new user
      if (isNewUser) {
        localStorage.removeItem('voula_tutorial_seen_v1');
      }
      setCurrentUser(user);
      loadData();
      setAppState('MAIN');
    }
  };

  const handleShowMoment = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  const handleAddMoment = async () => {
    // Logic to open camera and post moment
    // For now, simulator:
    const checkIn = currentUser.history[0];
    if (!checkIn) {
      alert("Você precisa estar em algum lugar para postar um Momento!");
      return;
    }

    const newMoment: Omit<Moment, 'id' | 'createdAt' | 'expiresAt'> = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      placeId: checkIn.placeId,
      placeName: checkIn.placeName,
      contentUrl: checkIn.snapshotImageUrl,
      contentType: 'image'
    };

    await db.moments.add(newMoment);
    const updatedMoments = await db.moments.list();
    setMoments(updatedMoments);
  };

  const [showSocialHub, setShowSocialHub] = useState(false);

  const handleBuyTicket = async (ticketId: string) => {
    const success = await db.wallet.buy(ticketId);
    if (success) {
      const updatedUser = await db.user.get();
      setCurrentUser(updatedUser);
      loadData();
    }
    return success;
  };

  const handleLogout = async () => {
    await db.auth.logout();
    setAppState('LOGIN');
    setActiveTab(Tab.HOME);
    setCurrentUser(MOCK_USER);
  };

  // AI Concierge Proactive Logic
  useEffect(() => {
    if (appState !== 'MAIN' || !currentUser) return;

    const checkHype = () => {
      const explodingPlace = places.find(p => p.capacityPercentage > 90 && p.isTrending);
      if (explodingPlace) {
        // Check if friends are there
        const friendCount = explodingPlace.friendsPresent?.length || 0;
        if (friendCount > 0) {
          const msg = `Ei! ${explodingPlace.name} está pegando fogo 🔥 ${friendCount} amigos seus estão lá. Bora?`;
          // Add to notifications (simulator for now)
          console.log("AI CONCIERGE NOTIFICATION:", msg);
        }
      }
    };

    const interval = setInterval(checkHype, 60000); // Every minute
    return () => clearInterval(interval);
  }, [appState, places, currentUser]);

  // Achievement Check Logic
  useEffect(() => {
    if (appState === 'MAIN' && currentUser) {
      const checkAchievements = async () => {
        const unlocked = currentUser.achievements || [];

        // Check: First Check-in
        if (currentUser.history.length > 0 && !unlocked.includes('first_checkin')) {
          await db.achievements.award(currentUser.id, 'first_checkin');
          console.log("ACHIEVEMENT UNLOCKED: Desbravador!");
        }

        // Check: Regular Attendee (5 checkins)
        if (currentUser.history.length >= 5 && !unlocked.includes('regular')) {
          await db.achievements.award(currentUser.id, 'regular');
          console.log("ACHIEVEMENT UNLOCKED: Ruleiro Raiz!");
        }
      };
      checkAchievements();
    }
  }, [appState, currentUser?.history?.length]);

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
      id: `f_${Date.now()} `,
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
      <div className="h-screen bg-[var(--background)] flex flex-col items-center justify-center">
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
    <div className="flex flex-col h-[100dvh] bg-[var(--background)] text-white overflow-hidden relative transition-colors duration-500">

      <main className="flex-1 overflow-hidden relative">
        <div key={activeTab} className="h-full scroll-container">
          <InstallPWA />
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
              moments={moments}
              onShowMoment={handleShowMoment}
              onAddMoment={handleAddMoment}
              hasCheckedIn={currentUser.history.some(h => {
                const now = new Date();
                const checkDate = new Date(h.timestamp);
                return (now.getTime() - checkDate.getTime()) < 12 * 60 * 60 * 1000; // 12h window
              })}
              onCheckIn={handleCheckIn}
              onShowSocialHub={(p) => {
                setSelectedPlace(p);
                setShowSocialHub(true);
              }}
            />
          )}
          {activeTab === Tab.RADAR && (
            <Radar
              places={places}
              center={userLocation.coordinates || { lat: -22.2232, lng: -54.8125 }}
              userLocation={userLocation.coordinates}
            />
          )}
          {activeTab === Tab.AI_FINDER && <AiConcierge />}
          {activeTab === Tab.SOCIAL && <Social feed={feed} onToggleLike={async (id) => { /* update */ }} onComment={(id) => { /* logic */ }} onPlaceSelect={setSelectedPlace} places={places} />}
          {activeTab === Tab.PROFILE && (
            <Profile
              currentUser={currentUser}
              places={places}
              onLogout={handleLogout}
              onUpdateProfile={async (upd) => {
                const u = { ...currentUser, ...upd, lastSync: new Date().getTime() };
                setCurrentUser(u);
                await db.user.save(u);
              }}
              onUpdateSettings={async (settings, mode, accent) => {
                const u = {
                  ...currentUser,
                  settings: { ...currentUser.settings, ...settings },
                  lastSync: new Date().getTime()
                };
                if (mode) u.appMode = mode;
                if (accent) u.themeColor = accent;
                setCurrentUser(u);
                await db.user.save(u);
              }}
            />
          )}
          {activeTab === Tab.RANKING && <Ranking currentUser={currentUser} />}
          {activeTab === Tab.CHALLENGES && <Challenges />}
          {activeTab === Tab.STORE && <Store currentUser={currentUser} onPurchase={(cost) => { const u = { ...currentUser, points: currentUser.points - cost }; setCurrentUser(u); db.user.save(u); }} />}
          {activeTab === Tab.DASHBOARD && currentUser.ownedPlaceId && (
            <BusinessDashboard
              placeId={currentUser.ownedPlaceId}
              placeData={places.find(p => p.id === currentUser.ownedPlaceId)}
            />
          )}

        </div>
      </main>

      {/* Tutorial Overlay (Fixed outside tab scroll container) */}
      {showTutorial && (
        <OnboardingTutorial onComplete={() => {
          localStorage.setItem('voula_tutorial_seen_v1', 'true');
          setShowTutorial(false);
        }} />
      )}

      {selectedPlace && (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)] flex flex-col">
          <div className="absolute top-safe left-4 z-50 pt-1">
            <button onClick={() => window.history.back()} className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-lg border border-white/10 active:scale-90 shadow-xl">
              <X className="w-6 h-6" />
            </button>
          </div>
          <PlaceCard place={selectedPlace} onCheckIn={handleCheckIn} expanded={true} isCheckedIn={currentUser.history.some(h => h.placeId === selectedPlace.id)} isSaved={currentUser.savedPlaces?.includes(selectedPlace.id)} />
        </div>
      )}

      {showSocialHub && selectedPlace && (
        <SocialHub
          place={selectedPlace}
          currentUser={currentUser}
          onClose={() => setShowSocialHub(false)}
        />
      )}

      {selectedMoment && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
          <div className="absolute top-safe right-4 pt-2 z-[120]">
            <button onClick={() => setSelectedMoment(null)} className="p-3 rounded-full bg-white/10 text-white backdrop-blur-xl border border-white/10 active:scale-90">
              <X className="w-7 h-7" />
            </button>
          </div>
          <div className="w-full h-full relative">
            <img src={selectedMoment.contentUrl} className="w-full h-full object-cover" alt="Moment" />
            <div className="absolute bottom-0 left-0 right-0 p-10 pb-16 bg-gradient-to-t from-black via-black/40 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full p-1 bg-gradient-to-tr from-[var(--primary)] to-cyan-400">
                  <img src={selectedMoment.userAvatar} className="w-full h-full rounded-full border-2 border-black object-cover" alt={selectedMoment.userName} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic tracking-tighter">{selectedMoment.userName}</h3>
                  <p className="text-sm font-bold text-[var(--primary)] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></span>
                    Ao vivo em {selectedMoment.placeName}
                  </p>
                </div>
              </div>
            </div>
          </div>
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

        <div className="relative -top-6 xs:-top-7 group">
          <div className={`absolute inset-0 rounded-full transition-all duration-500 blur-md ${showMoreMenu ? 'bg-white/50 scale-110' : 'bg-[var(--primary)]/50 scale-90 group-hover:scale-110 group-hover:bg-[var(--primary)]/70'}`} />
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`
              relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-[#0E1121]
              active:scale-95 shadow-black/50 shadow-lg
              ${showMoreMenu
                ? 'bg-white text-black rotate-180'
                : 'bg-[var(--primary)] text-[var(--on-primary)] hover:brightness-110'
              } 
            `}
          >
            <LayoutGrid className="w-7 h-7 fill-current" />
          </button>
        </div>

        <NavButton active={activeTab === Tab.SOCIAL} onClick={() => setActiveTab(Tab.SOCIAL)} icon={<MessageCircle className="w-5 h-5" />} label="Bonde" />
        <NavButton active={activeTab === Tab.PROFILE} onClick={() => setActiveTab(Tab.PROFILE)} icon={<UserIcon className="w-5 h-5" />} label="Perfil" />
      </nav>

      <style>{`
@keyframes shake {
  0 %, 100 % { transform: translateX(0); }
  25 % { transform: translateX(-5px); }
  75 % { transform: translateX(5px); }
}
@keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
}
@keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
}
@keyframes slideLeft {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
}
`}</style>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-300 w-16
      ${active ? 'text-[var(--primary)] -translate-y-1' : 'text-slate-400 hover:text-slate-200'} 
    `}
  >
    <div className={`
      relative p-1 rounded-xl transition-all duration-300
      ${active ? 'bg-[var(--primary)]/10' : 'bg-transparent'}
    `}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
        className: `
          ${(icon as any).props.className} 
          ${active ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]' : 'stroke-[1.5px]'}
          transition-all duration-300
          w-7 h-7
        `
      })}
    </div>
    <span className={`
      text-[10px] font-bold tracking-wide transition-all duration-300
      ${active ? 'opacity-100 scale-100' : 'opacity-70 scale-90'}
    `}>
      {label}
    </span>
    {active && (
      <div className="absolute bottom-1 w-1 h-1 bg-[var(--primary)] rounded-full shadow-[0_0_5px_var(--primary)]" />
    )}
  </button>
);
