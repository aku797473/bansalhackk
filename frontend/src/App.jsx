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
import PWAInstallBanner from './components/PWAInstallBanner';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeartPulse, MessageCircle, Mic } from 'lucide-react';
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
const DairyHub     = lazy(() => import('./pages/DairyHub'));
const AutomobileRental = lazy(() => import('./pages/AutomobileRental'));

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
      case '/dairy': return t('nav.dairy', 'Dairy Hub');
      case '/automobile': return t('nav.automobile', 'Tractor Rental');
      default: return 'Smart Kisan';
    }
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter') {
      const val = e.target.value.toLowerCase().trim();
      if (!val) return;
      
      const routes = {
        'weather': '/weather', 'mausam': '/weather', 'forecast': '/weather',
        'crop': '/crop', 'disease': '/crop', 'advisory': '/crop', 'fasal': '/crop',
        'fertilizer': '/fertilizer', 'khad': '/fertilizer',
        'market': '/market', 'mandi': '/market', 'price': '/market',
        'community': '/community', 'chat': '/community', 'forum': '/community', 'kisan': '/community',
        'labour': '/labour', 'job': '/labour', 'work': '/labour', 'mazdoor': '/labour',
        'seller': '/seller', 'sell': '/seller', 'shop': '/seller',
        'buyer': '/buyer', 'buy': '/buyer', 'purchase': '/buyer',
        'profit': '/profit-predictor', 'margin': '/profit-predictor',
        'map': '/map', 'gps': '/map', 'location': '/map',
        'news': '/news', 'samachar': '/news',
        'scheme': '/schemes', 'yojana': '/schemes', 'government': '/schemes',
        'profile': '/profile', 'setting': '/profile'
      };

      for (const [key, path] of Object.entries(routes)) {
        if (val.includes(key)) {
          navigate(path);
          e.target.value = '';
          return;
        }
      }
      
      import('react-hot-toast').then(m => m.default.error('Module not found. Try "weather", "mandi", "labour", etc.'));
    }
  };

  return (
    <header className="hidden xl:flex items-center justify-end h-24 px-8 bg-transparent transition-colors duration-500 z-40 relative">
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative w-64 group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search platform..." 
            onKeyDown={handleGlobalSearch}
            className="w-full pl-11 pr-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border-0 shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-sm">
          <Calendar size={18} className="text-indigo-500 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Kisan Mitra Chat Toggle */}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-kisan-chat'))}
            className="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-all rounded-2xl shadow-sm active:scale-95"
            title="Kisan Mitra Chat"
          >
            <MessageCircle size={20} />
          </button>

          {/* Voice Assistant Toggle */}
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-voice-assistant'))}
            className="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:text-slate-400 transition-all rounded-2xl shadow-sm active:scale-95"
            title="Voice Assistant"
          >
            <Mic size={20} />
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => toast.success(t('common.caught_up', 'You are all caught up!'))}
              className="w-12 h-12 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-all rounded-2xl shadow-sm active:scale-95"
            >
              <Bell size={20} weight="bold" />
            </button>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm shadow-red-500/50" />
          </div>

          {/* User Profile Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 pr-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-2xl shadow-sm transition-all active:scale-95 focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                {user?.image || user?.profilePic ? (
                  <img src={user.image || user.profilePic} alt="user" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <User size={18} weight="bold" />
                  </div>
                )}
              </div>
              <CaretDown size={14} className={clsx("text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-300", dropdownOpen ? "rotate-180" : "")} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-2.5 animate-in fade-in slide-in-from-top-4 z-[100]">
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl mb-2 text-left">
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">{user?.role || 'Farmer'}</div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate mt-1">{user?.name || 'User'}</div>
                </div>
                
                <button 
                  onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 rounded-2xl transition-colors text-left"
                >
                  <User size={18} weight="bold" /> {t('nav.profile', 'Profile Settings')}
                </button>
                
                <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1 mx-3" />
                
                <button 
                  onClick={async () => { setDropdownOpen(false); await logout(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-2xl transition-colors text-left"
                >
                  <SignOut size={18} weight="bold" /> {t('common.logout', 'Log Out')}
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
    <div className="min-h-screen bg-surface dark:bg-slate-950 transition-colors duration-200 flex flex-col">
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
      {isAuth && (
        <>
          <ChatWidget />
          <VoiceAssistant />
          <Link 
            to="/sos"
            className="fixed bottom-24 right-6 md:right-8 z-40 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95 transition-all animate-bounce"
            title="Emergency SOS"
          >
            <HeartPulse size={28} className="animate-pulse" />
          </Link>
        </>
      )}
      <PWAInstallBanner />
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
                  <Route path="/dairy"      element={<ProtectedRoute><DairyHub /></ProtectedRoute>} />
                  <Route path="/automobile" element={<ProtectedRoute><AutomobileRental /></ProtectedRoute>} />
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
