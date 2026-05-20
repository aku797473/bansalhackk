import { createContext, useContext, useState, useEffect } from 'react';
import { setTokenProvider, authAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Star, X, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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

  const confirmLogout = async () => {
    const refreshToken = localStorage.getItem('sk_refresh');
    try {
      if (refreshToken) await authAPI.logout(refreshToken);
    } finally {
      localStorage.removeItem('sk_token');
      localStorage.removeItem('sk_refresh');
      setUser(null);
      setTokenProvider(null);
      setShowFeedback(false);
      setRating(0);
      setSuggestion('');
      toast.success('Identity De-linked');
      window.location.href = '/';
    }
  };

  const logout = () => {
    const lastPrompt = localStorage.getItem('sk_last_feedback_prompt');
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    // Only show feedback modal if it's the first time or 7 days have passed
    if (!lastPrompt || (now - parseInt(lastPrompt, 10)) > sevenDays) {
      localStorage.setItem('sk_last_feedback_prompt', now.toString());
      setShowFeedback(true);
    } else {
      confirmLogout();
    }
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0 && !suggestion.trim()) {
      return confirmLogout();
    }
    setIsSubmittingFeedback(true);
    try {
      await userAPI.submitFeedback({ rating, suggestion, feature: 'logout_survey', name: user?.name });
      toast.success('Thanks for your feedback!');
    } catch (e) {
      console.warn('Feedback failed', e);
    } finally {
      setIsSubmittingFeedback(false);
      confirmLogout();
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
      
      {/* Logout Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setShowFeedback(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="fill-current" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-outfit mb-2">Rate Your Experience</h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Before you go, how was your experience with SmartKisan today?</p>
            </div>
            
            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={36} 
                    className={clsx(
                      "transition-all duration-300",
                      (hoverRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400 drop-shadow-md" 
                        : "fill-transparent text-slate-300 dark:text-slate-700 hover:text-amber-200"
                    )} 
                  />
                </button>
              ))}
            </div>
            
            {/* Suggestion */}
            <div className="mb-6 relative">
              <MessageSquare size={16} className="absolute left-4 top-4 text-slate-400" />
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Any suggestions for us? (Optional)"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none h-24 transition-all"
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmittingFeedback}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmittingFeedback ? 'Submitting...' : (rating > 0 || suggestion.length > 0) ? 'Submit & Logout' : 'Skip & Logout'}
              </button>
              <button
                onClick={confirmLogout}
                disabled={isSubmittingFeedback}
                className="w-full h-10 bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Logout Directly
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
