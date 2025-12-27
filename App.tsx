
import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Radar = lazy(() => import('./pages/Radar').then(m => ({ default: m.Radar })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Social = lazy(() => import('./pages/Social').then(m => ({ default: m.Social })));
import { Login } from './pages/Login';
import { AiConcierge } from './pages/AiConcierge';
import { Ranking } from './pages/Ranking';
import { Store } from './pages/Store';
import { Challenges } from './pages/Challenges';
import { BusinessRegistration } from './pages/BusinessRegistration';
import { Tab, Place, User, PlaceType } from './types';
import { Map, List, User as UserIcon, MessageCircle, LayoutGrid, X, Loader2 } from 'lucide-react';
import { PlaceCard } from './components/PlaceCard';
import { MoreOptionsModal } from './components/MoreOptionsModal';
import { BusinessDashboard } from './components/BusinessDashboard';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { db } from './utils/storage';

// UI Components
import { BottomNav, BottomNavItem } from './src/components/ui/BottomNav';
import { ContextualOnboarding } from './src/components/ContextualOnboarding';

// Custom Hooks
import { useAuth } from './hooks/useAuth';
import { useRealtimeData } from './hooks/useRealtimeData';
import { usePlaces } from './hooks/usePlaces';
import { useFeed } from './hooks/useFeed';
import { useCheckIn } from './hooks/useCheckIn';

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--bg-default)',
    color: 'var(--primary-main)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
      <div>Carregando...</div>
    </div>
  </div>
);

import { AnimatePresence, motion } from 'framer-motion';
import { fadeIn } from './src/styles/animations';

export default function App() {
  const {
    appState,
    setAppState,
    currentUser,
    setCurrentUser,
    login,
    logout,
    loadUserData
  } = useAuth();

  const { loadInitialData } = useRealtimeData(appState, currentUser);
  const { data: places = [] } = usePlaces();
  const { data: feed = [] } = useFeed();
  const checkInMutation = useCheckIn(currentUser);

  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [homeFilter, setHomeFilter] = useState<PlaceType | 'ALL' | 'SAVED'>('ALL');

  // Apply theme to document element
  useEffect(() => {
    const theme = currentUser.appMode || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [currentUser.appMode]);

  // Lógica para lidar com botão Voltar no Android (Nativo)
  useEffect(() => {
    const handlePopState = () => {
      if (selectedPlace) {
        setSelectedPlace(null);
      } else if (showMoreMenu) {
        setShowMoreMenu(false);
      } else if (activeTab !== Tab.HOME) {
        setActiveTab(Tab.HOME);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  // Handle Offline State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (_name: string, _isNewUser: boolean, user?: User) => {
    if (user) {
      login(user);
      loadInitialData();
    }
  };

  const handleCheckIn = async (placeId: string) => {
    const target = places.find(p => p.id === placeId);
    if (!target) return;

    checkInMutation.mutate({ placeId, target }, {
      onSuccess: ({ updatedUser }) => {
        setCurrentUser(updatedUser);
      }
    });
  };

  if (appState === 'LOADING') {
    return (
      <div className="h-screen bg-[var(--bg-default)] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--primary-main)] animate-spin mb-4" />
        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.3em] text-xs">VOU LÁ</p>
      </div>
    );
  }

  if (appState === 'LOGIN') return <Login onLogin={handleLogin} onBusinessClick={() => setAppState('BUSINESS_REG')} />;

  if (appState === 'BUSINESS_REG') return (
    <BusinessRegistration
      onBack={() => setAppState('LOGIN')}
      onRegisterSuccess={async (u) => {
        setCurrentUser(u);
        await loadUserData(u);
        setActiveTab(Tab.DASHBOARD);
        setAppState('MAIN');
      }}
    />
  );

  return (
    <>
      <PWAUpdateNotification />
      <Suspense fallback={<PageLoader />}>
        <div className="flex flex-col h-[100dvh] bg-[var(--bg-default)] text-[var(--text-primary)] overflow-hidden relative transition-colors duration-500">

          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence>
              {!isOnline && (
                <motion.div
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  exit={{ y: -50 }}
                  className="absolute top-0 left-0 right-0 z-[120] bg-orange-500 py-2 px-4 flex items-center justify-center gap-2"
                >
                  <span className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Você está offline - Usando dados locais
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="h-full scroll-container"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
              >
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
                {activeTab === Tab.SOCIAL && <Social feed={feed} onToggleLike={async () => { /* update */ }} onComment={() => { /* logic */ }} onPlaceSelect={setSelectedPlace} places={places} />}
                {activeTab === Tab.PROFILE && <Profile currentUser={currentUser} places={places} onLogout={logout} onUpdateProfile={(upd) => { const u = { ...currentUser, ...upd }; setCurrentUser(u); db.user.save(u); }} />}
                {activeTab === Tab.RANKING && <Ranking currentUser={currentUser} />}
                {activeTab === Tab.CHALLENGES && <Challenges />}
                {activeTab === Tab.STORE && <Store currentUser={currentUser} onPurchase={(cost) => { const u = { ...currentUser, points: currentUser.points - cost }; setCurrentUser(u); db.user.save(u); }} />}
                {activeTab === Tab.DASHBOARD && currentUser.ownedPlaceId && (
                  <BusinessDashboard
                    placeId={currentUser.ownedPlaceId}
                    placeData={places.find(p => p.id === currentUser.ownedPlaceId)}
                  />
                )}

                {/* Contextual Onboarding Overlay */}
                <ContextualOnboarding />
              </motion.div>
            </AnimatePresence>
          </main>

          <AnimatePresence>
            {selectedPlace && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[100] bg-[var(--bg-default)] flex flex-col"
              >
                <div className="absolute top-safe left-4 z-50 pt-1">
                  <button onClick={() => { window.history.back(); }} className="p-2.5 rounded-full bg-black/40 text-white backdrop-blur-lg border border-white/10 active:scale-90 shadow-xl">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <PlaceCard place={selectedPlace} onCheckIn={handleCheckIn} expanded={true} isCheckedIn={currentUser.history.some(h => h.placeId === selectedPlace.id)} isSaved={currentUser.savedPlaces?.includes(selectedPlace.id)} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[110]"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          <BottomNav>
            <BottomNavItem
              active={activeTab === Tab.HOME}
              onClick={() => { setHomeFilter('ALL'); setActiveTab(Tab.HOME); }}
              icon={<List className="w-5 h-5" />}
              label="Lista"
            />
            <BottomNavItem
              active={activeTab === Tab.RADAR}
              onClick={() => setActiveTab(Tab.RADAR)}
              icon={<Map className="w-5 h-5" />}
              label="Radar"
            />

            <div className="relative -top-6 xs:-top-7">
              <button onClick={() => setShowMoreMenu(true)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border-4 border-[var(--bg-default)] ${showMoreMenu ? 'bg-white text-black' : 'bg-[var(--primary-main)] text-[var(--primary-on)] shadow-[0_0_20px_var(--primary-glow)]'}`}>
                <LayoutGrid className="w-6 h-6 fill-current" />
              </button>
            </div>

            <BottomNavItem
              active={activeTab === Tab.SOCIAL}
              onClick={() => setActiveTab(Tab.SOCIAL)}
              icon={<MessageCircle className="w-5 h-5" />}
              label="Bonde"
            />
            <BottomNavItem
              active={activeTab === Tab.PROFILE}
              onClick={() => setActiveTab(Tab.PROFILE)}
              icon={<UserIcon className="w-5 h-5" />}
              label="Perfil"
            />
          </BottomNav>
        </div>
      </Suspense>
    </>
  );
}
