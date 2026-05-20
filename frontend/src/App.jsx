import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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

function AppLayout({ children }) {
  const { isAuth } = useAuth();
  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900 transition-colors duration-200 flex flex-col">
      <KeepAlive />
      {isAuth && <Navbar />}
      <div className={clsx("flex-grow flex flex-col transition-all duration-300", isAuth ? 'xl:pl-80' : '')}>
        <main className={clsx("flex-grow transition-all duration-200", isAuth ? 'pt-16 xl:pt-6' : '')}>
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
