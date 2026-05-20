import { createContext, useContext, useState, useEffect } from 'react';
import { setTokenProvider, authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sk_token');
      if (token) {
        setTokenProvider(() => Promise.resolve(token));
        try {
          const { data } = await authAPI.me();
          if (data.success) {
            let fullUser = {
              ...data.user,
              id: data.user._id,
            };
            try {
              const { data: profileRes } = await userAPI.getProfile();
              if (profileRes.success && profileRes.data) {
                fullUser = {
                  ...fullUser,
                  ...profileRes.data,
                  image: profileRes.data.profilePic || fullUser.image,
                  name: profileRes.data.name || fullUser.name,
                  role: profileRes.data.role || fullUser.role,
                  location: profileRes.data.location
                };
              }
            } catch (pErr) {
              console.warn('Profile load failed during initAuth:', pErr.message);
            }
            setUser(fullUser);
          }
        } catch (err) {
          localStorage.removeItem('sk_token');
          localStorage.removeItem('sk_refresh');
          setTokenProvider(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (phone, password) => {
    try {
      const { data } = await authAPI.login(phone, password);
      if (data.success) {
        localStorage.setItem('sk_token', data.accessToken);
        localStorage.setItem('sk_refresh', data.refreshToken);
        setTokenProvider(() => Promise.resolve(data.accessToken));
        
        let fullUser = { ...data.user, id: data.user.id || data.user._id };
        try {
          const { data: profileRes } = await userAPI.getProfile();
          if (profileRes.success && profileRes.data) {
            fullUser = {
              ...fullUser,
              ...profileRes.data,
              image: profileRes.data.profilePic || fullUser.image,
              name: profileRes.data.name || fullUser.name,
              role: profileRes.data.role || fullUser.role,
              location: profileRes.data.location
            };
          }
        } catch (pErr) {
          console.warn('Profile load failed during login:', pErr.message);
        }
        setUser(fullUser);
        toast.success('Access Authenticated');
        return fullUser;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Authentication failed';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (name, phone, password, role) => {
    try {
      const { data } = await authAPI.register(name, phone, password, role);
      if (data.success) {
        localStorage.setItem('sk_token', data.accessToken);
        localStorage.setItem('sk_refresh', data.refreshToken);
        setTokenProvider(() => Promise.resolve(data.accessToken));
        
        let fullUser = { ...data.user, id: data.user.id || data.user._id };
        try {
          const { data: profileRes } = await userAPI.getProfile();
          if (profileRes.success && profileRes.data) {
            fullUser = {
              ...fullUser,
              ...profileRes.data,
              image: profileRes.data.profilePic || fullUser.image,
              name: profileRes.data.name || fullUser.name,
              role: profileRes.data.role || fullUser.role,
              location: profileRes.data.location
            };
          }
        } catch (pErr) {
          console.warn('Profile load failed during registration:', pErr.message);
        }
        setUser(fullUser);
        toast.success('Identity Created Successfully');
        return fullUser;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  const loginWithGoogle = async (email, name, googleId) => {
    try {
      const { data } = await authAPI.loginWithGoogle(email, name, googleId);
      if (data.success) {
        localStorage.setItem('sk_token', data.accessToken);
        localStorage.setItem('sk_refresh', data.refreshToken);
        setTokenProvider(() => Promise.resolve(data.accessToken));
        
        let fullUser = { ...data.user, id: data.user.id || data.user._id };
        try {
          const { data: profileRes } = await userAPI.getProfile();
          if (profileRes.success && profileRes.data) {
            fullUser = {
              ...fullUser,
              ...profileRes.data,
              image: profileRes.data.profilePic || fullUser.image,
              name: profileRes.data.name || fullUser.name,
              role: profileRes.data.role || fullUser.role,
              location: profileRes.data.location
            };
          }
        } catch (pErr) {
          console.warn('Profile load failed during google auth:', pErr.message);
        }
        setUser(fullUser);
        toast.success('Access Authenticated via Google');
        return fullUser;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Google Authentication failed';
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('sk_refresh');
    try {
      if (refreshToken) await authAPI.logout(refreshToken);
    } finally {
      localStorage.removeItem('sk_token');
      localStorage.removeItem('sk_refresh');
      setUser(null);
      setTokenProvider(null);
      toast.success('Identity De-linked');
      window.location.href = '/';
    }
  };

  const updateUser = async (updatedFields) => {
    if (!user) return;
    const newUser = { ...user, ...updatedFields };
    if (updatedFields.profilePic) {
      newUser.image = updatedFields.profilePic;
    }
    setUser(newUser);
    try {
       const { data } = await userAPI.saveProfile(updatedFields);
       if (data.success && data.data) {
         setUser(prev => ({
           ...prev,
           ...data.data,
           image: data.data.profilePic || prev.image || prev.profilePic
         }));

         if (data.accessToken) {
           localStorage.setItem('sk_token', data.accessToken);
           setTokenProvider(() => Promise.resolve(data.accessToken));
         }
       }
    } catch (err) {
       console.error('Profile sync failed', err, err.response?.data);
       throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login,
      register,
      loginWithGoogle,
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
