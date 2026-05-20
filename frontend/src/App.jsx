import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import LoadingScreen from './components/LoadingScreen';
import VoiceAssistant from './components/VoiceAssistant';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeartPulse } from 'lucide-react';
import { Bell, MagnifyingGlass, Calendar, SignOut, User, CaretDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import axios from 'axios';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy loaded pages
const Landing     = lazy(() => import('./pages/Landing'));
const Login       = lazy(() => import('./pages/Login'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Weather     = lazy(() => import('./pages/Weather'));
const CropAdvisor = lazy(() => import('./pages/CropAdvisor'));
const Fertilizer  = lazy(() => import('./pages/Fertilizer'));
const Market      = lazy(() => import('./pages/Market'));
const Labour      = lazy(() => import('./pages/Labour'));
const MapView     = lazy(() => import('./pages/MapView'));
const Profile     = lazy(() => import('./pages/Profile'));
const News        = lazy(() => import('./pages/News'));
const Schemes     = lazy(() => import('./pages/Schemes'));
const Seller      = lazy(() => import('./pages/SellerPortal'));
const Buyer       = lazy(() => import('./pages/BuyerPortal'));
const ProfitPredictor = lazy(() => import('./pages/ProfitPredictor'));
const SOS         = lazy(() => import('./pages/SOS'));
const Community   = lazy(() => import('./pages/Community'));

function ProtectedRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return isAuth ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !isAuth ? children : <Navigate to="/dashboard" replace />;
}

function KeepAlive() {
  const { isAuth } = useAuth();
  useEffect(() => {
    if (!isAuth) return;
    const infoUrl = import.meta.env.VITE_INFO_API_URL || '/api';
    const gatewayUrl = infoUrl.replace('/weather', '').replace('/api/weather', '/api');
    const wakeUp = () => axios.get(`${gatewayUrl}/wake`).catch(() => {});
    wakeUp();
    const interval = setInterval(wakeUp, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuth]);
  return null;
}

function DesktopHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return t('nav.home', 'Dashboard');
      case '/weather': return t('nav.weather', 'Weather');
      case '/crop': return t('nav.crop', 'Crop Advisor');
      case '/fertilizer': return t('nav.fertilizer', 'Fertilizer');
      case '/market': return t('nav.market', 'Market Trends');
      case '/community': return t('nav.community', 'Kisan Community');
      case '/labour': return t('nav.labour', 'Labour Marketplace');
      case '/seller': return t('nav.seller', 'Seller Portal');
      case '/buyer': return t('nav.buyer', 'Buyer Portal');
      case '/profit-predictor': return t('nav.profit_predictor', 'Profit Predictor');
      case '/map': return t('nav.map', 'Map View');
      case '/news': return t('nav.news', 'News');
      case '/schemes': return t('nav.schemes', 'Schemes');
      case '/profile': return t('nav.profile', 'Profile Settings');
      default: return 'Smart Kisan';
    }
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="hidden xl:flex items-center justify-between h-20 px-8 bg-white/30 dark:bg-slate-900/30 border-b border-slate-200/40 dark:border-slate-800/80 transition-colors duration-500">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 font-outfit tracking-wide leading-none uppercase">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-60 group">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search platform..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                import('react-hot-toast').then(m => m.default.info('Global Search is coming in the next update!'));
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-200/50 dark:border-slate-800/60 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all text-xs font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 px-3.5 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60">
          <Calendar size={16} className="text-indigo-500 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => toast.success(t('common.caught_up', 'You are all caught up!'))}
              className="w-10 h-10 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all rounded-xl border border-slate-200/50 dark:border-slate-800/60"
            >
              <Bell size={18} weight="bold" />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/60 rounded-xl transition-all focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-250 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-850 overflow-hidden shrink-0">
                {user?.image || user?.profilePic ? (
                  <img src={user.image || user.profilePic} alt="user" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={16} weight="bold" />
                  </div>
                )}
              </div>
              <CaretDown size={14} className={clsx("text-slate-500 mr-1.5 transition-transform duration-300", dropdownOpen ? "rotate-180" : "")} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2 z-[100]">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 rounded-xl mb-1 text-left leading-tight">
                  <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">{user?.role || 'Farmer'}</div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate mt-0.5">{user?.name}</div>
                </div>
                
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-left"
                >
                  <User size={16} weight="bold" /> {t('nav.profile', 'Profile Settings')}
                </button>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-2" />
                
                <button 
                  onClick={async () => { setDropdownOpen(false); await logout(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-left"
                >
                  <SignOut size={16} weight="bold" /> {t('common.logout', 'Log Out')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function AppLayout({ children }) {
  const { isAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900 transition-colors duration-200 flex flex-col">
      <KeepAlive />
      {isAuth && <Navbar />}
      <div className={clsx("flex-grow flex flex-col transition-all duration-300", isAuth ? 'xl:pl-80' : '')}>
        {isAuth && <DesktopHeader />}
        <main className={clsx("flex-grow transition-all duration-200", isAuth ? 'pt-16 xl:pt-0' : '')}>
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </div>
      {isAuth && <ChatWidget />}
      {isAuth && <VoiceAssistant />}
      {isAuth && (
        <Link 
          to="/sos"
          className="fixed bottom-24 right-6 md:right-8 z-40 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95 transition-all animate-bounce"
          title="Emergency SOS"
        >
          <HeartPulse size={28} className="animate-pulse" />
        </Link>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MapProvider>
            <AuthProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    borderRadius: '14px',
                    fontSize: '14px',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  },
                }}
              />
              <AppLayout>
                <Routes>
                  <Route path="/"           element={<PublicRoute><Landing /></PublicRoute>} />
                  <Route path="/login"      element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/weather"    element={<ProtectedRoute><Weather /></ProtectedRoute>} />
                  <Route path="/crop"       element={<ProtectedRoute><CropAdvisor /></ProtectedRoute>} />
                  <Route path="/fertilizer" element={<ProtectedRoute><Fertilizer /></ProtectedRoute>} />
                  <Route path="/market"     element={<ProtectedRoute><Market /></ProtectedRoute>} />
                  <Route path="/labour"     element={<ProtectedRoute><Labour /></ProtectedRoute>} />
                  <Route path="/map"        element={<ProtectedRoute><MapView /></ProtectedRoute>} />
                  <Route path="/news"       element={<ProtectedRoute><News /></ProtectedRoute>} />
                  <Route path="/schemes"    element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
                  <Route path="/seller"     element={<ProtectedRoute><Seller /></ProtectedRoute>} />
                  <Route path="/buyer"      element={<ProtectedRoute><Buyer /></ProtectedRoute>} />
                  <Route path="/profit-predictor" element={<ProtectedRoute><ProfitPredictor /></ProtectedRoute>} />
                  <Route path="/sos"        element={<ProtectedRoute><SOS /></ProtectedRoute>} />
                  <Route path="/community"  element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="*"           element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </AuthProvider>
          </MapProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
