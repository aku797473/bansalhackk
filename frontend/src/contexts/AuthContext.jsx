import { createContext, useContext, useState, useEffect } from 'react';
import { setTokenProvider, authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sk_token');
      if (token) {
        setTokenProvider(() => Promise.resolve(token));
        try {
          const { data } = await authAPI.me();
          if (data.success) {
            setUser({
              ...data.user,
              id: data.user._id, // Map MongoDB ID
            });
          }
        } catch (err) {
          localStorage.removeItem('sk_token');
          setTokenProvider(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login(email, password);
      if (data.success) {
        localStorage.setItem('sk_token', data.accessToken);
        localStorage.setItem('sk_refresh', data.refreshToken);
        setTokenProvider(() => Promise.resolve(data.accessToken));
        
        const userData = { ...data.user, id: data.user.id };
        setUser(userData);
        toast.success('Welcome back, ' + userData.name);
        return userData;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await authAPI.register(name, email, password, role);
      if (data.success) {
        localStorage.setItem('sk_token', data.accessToken);
        localStorage.setItem('sk_refresh', data.refreshToken);
        setTokenProvider(() => Promise.resolve(data.accessToken));
        
        const userData = { ...data.user, id: data.user.id };
        setUser(userData);
        toast.success('Registration successful!');
        return userData;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('sk_refresh');
    try {
      await authAPI.logout(refreshToken);
    } finally {
      localStorage.removeItem('sk_token');
      localStorage.removeItem('sk_refresh');
      setUser(null);
      setTokenProvider(null);
      toast.success('Session terminated');
    }
  };

  const updateUser = async (updatedFields) => {
    if (!user) return;
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    // Profile sync with MongoDB is handled by the user service via userAPI.saveProfile
    try {
       await userAPI.saveProfile(updatedFields);
    } catch (err) {
       console.error('Profile sync failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login,
      register,
      logout, 
      updateUser, 
      isAuth: !!user,
      getToken: () => Promise.resolve(localStorage.getItem('sk_token'))
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
