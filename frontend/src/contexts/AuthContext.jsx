import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// ─── Helper: check if JWT is expired ─────────────────
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // treat unreadable token as expired
  }
}

// ─── All localStorage keys we manage ─────────────────
const STORAGE_KEYS = [
  'sk_access_token',
  'sk_refresh_token',
  'sk_user',
  'sk_last_seen_news',
];

function clearStorage() {
  STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
}

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);   // initial auth check
  const [authLoading, setAuthLoading] = useState(false); // login/register in progress

  // ─── On startup: validate stored token ───────────────
  useEffect(() => {
    const token = localStorage.getItem('sk_access_token');
    const saved  = localStorage.getItem('sk_user');

    if (token && saved && !isTokenExpired(token)) {
      setUser(JSON.parse(saved));
    } else if (token) {
      // Token exists but is expired — clean up silently
      clearStorage();
    }
    setLoading(false);
  }, []);

  const handleAuthResponse = useCallback((data) => {
    localStorage.setItem('sk_access_token',  data.accessToken);
    localStorage.setItem('sk_refresh_token', data.refreshToken);
    localStorage.setItem('sk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => {
    if (authLoading) return; // prevent double-submit
    setAuthLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      return handleAuthResponse(data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  }, [authLoading, handleAuthResponse]);

  const register = useCallback(async (name, email, password, role) => {
    if (authLoading) return;
    setAuthLoading(true);
    try {
      const { data } = await authAPI.register(name, email, password, role);
      return handleAuthResponse(data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  }, [authLoading, handleAuthResponse]);

  // ─── Optimistic logout: instant UX, server is fire-and-forget ─
  const logout = useCallback(() => {
    const refresh = localStorage.getItem('sk_refresh_token');
    
    // 1. Clear local state immediately → instant UI response
    clearStorage();
    setUser(null);
    toast.success('Logged out successfully');

    // 2. Tell the server in the background (fire-and-forget)
    if (refresh) {
      authAPI.logout(refresh).catch(() => {}); // silent — we don't care if it fails
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem('sk_user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, authLoading, login, register, logout, updateUser, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
