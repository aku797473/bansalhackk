import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/clerk-react';
import { setTokenProvider } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded: authLoaded, signOut, getToken } = useClerkAuth();
  const { openSignIn, openSignUp } = useClerk();
  const [user, setUser] = useState(null);

  // Sync Clerk user to our local user state
  useEffect(() => {
    if (userLoaded && clerkUser) {
      setUser({
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress,
        image: clerkUser.imageUrl,
        role: clerkUser.publicMetadata?.role || 'farmer', // Default to farmer
      });
      
      // Tell API service how to get tokens
      setTokenProvider(getToken);
    } else if (userLoaded && !clerkUser) {
      setUser(null);
    }
  }, [userLoaded, clerkUser, getToken]);


  const login = () => openSignIn();
  const register = () => openSignUp();
  
  const logout = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  const updateUser = async (updatedFields) => {
    if (!clerkUser) return;
    // For now, we just update local state, but in a real app, 
    // you'd update Clerk publicMetadata or use a webhook.
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const loading = !userLoaded || !authLoaded;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      authLoading: false, 
      login, 
      register, 
      logout, 
      updateUser, 
      isAuth: !!user,
      getToken // Useful for authenticated API calls
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

