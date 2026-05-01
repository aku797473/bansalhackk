import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sk_access_token');
    const saved  = localStorage.getItem('sk_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleAuthResponse = (data) => {
    localStorage.setItem('sk_access_token',  data.accessToken);
    localStorage.setItem('sk_refresh_token', data.refreshToken);
    localStorage.setItem('sk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login(email, password);
      return handleAuthResponse(data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await authAPI.register(name, email, password, role);
      return handleAuthResponse(data);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('sk_refresh_token');
      if (refresh) await authAPI.logout(refresh);
    } catch (err) { 
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('sk_access_token');
      localStorage.removeItem('sk_refresh_token');
      localStorage.removeItem('sk_user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedFields) => {
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    localStorage.setItem('sk_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
