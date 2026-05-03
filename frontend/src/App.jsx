import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MapProvider } from './contexts/MapContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import LoadingScreen from './components/LoadingScreen';

import { ThemeProvider } from './contexts/ThemeContext';

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

function AppLayout({ children }) {
  const { isAuth } = useAuth();
  return (
    <div className="min-h-screen bg-surface dark:bg-slate-900 transition-colors duration-200">
      {isAuth && <Navbar />}
      <main className={isAuth ? 'pt-16' : ''}>
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </main>
      {isAuth && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
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
                <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="*"           element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </AuthProvider>
        </MapProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
