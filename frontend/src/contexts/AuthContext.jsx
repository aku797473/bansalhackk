import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setTokenProvider, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const getToken = () => firebaseUser.getIdToken();
        setTokenProvider(getToken);

        // Fetch profile from MongoDB via Backend
        try {
          const { data } = await userAPI.getProfile();
          if (data.success) {
            setUser({
              id: firebaseUser.uid,
              name: data.data.name || firebaseUser.displayName,
              email: firebaseUser.email,
              image: data.data.profilePic || firebaseUser.photoURL,
              role: data.data.role || 'farmer',
              location: data.data.location
            });
          }
        } catch (err) {
          // If profile doesn't exist, create a basic one
          const basicUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Farmer',
            email: firebaseUser.email,
            image: firebaseUser.photoURL,
            role: 'farmer'
          };
          setUser(basicUser);
          // Don't save yet, let the user pick their role in login/profile page
        }
      } else {
        setUser(null);
        setTokenProvider(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      toast.error('Authentication failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const updateUser = async (updatedFields) => {
    if (!user) return;
    
    // Optimistic update
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);

    // Persist to MongoDB
    try {
      await userAPI.saveProfile({
        name: newUser.name,
        role: newUser.role,
        profilePic: newUser.image,
        location: newUser.location,
        phone: newUser.phone
      });
      console.log('✅ Profile synced to MongoDB');
    } catch (err) {
      console.error('❌ Failed to sync profile to MongoDB:', err.message);
      toast.error('Sync failed, but local data updated');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login: loginWithGoogle,
      logout, 
      updateUser, 
      isAuth: !!user,
      getToken: () => auth.currentUser?.getIdToken()
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
