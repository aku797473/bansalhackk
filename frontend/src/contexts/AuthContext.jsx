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
import { setTokenProvider } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to local (keeps user logged in after refresh)
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get JWT token from Firebase
        const getToken = () => firebaseUser.getIdToken();
        setTokenProvider(getToken);

        // Map Firebase user to our local user structure
        // In a real app, you'd fetch additional metadata (like role) from Firestore
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Farmer',
          email: firebaseUser.email,
          image: firebaseUser.photoURL,
          role: localStorage.getItem(`sk_role_${firebaseUser.uid}`) || 'farmer', // Fallback to local storage for demo
        });
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
      await signInWithPopup(auth, provider);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error('Authentication failed');
      console.error(error);
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
    setUser(prev => {
      const newUser = { ...prev, ...updatedFields };
      if (updatedFields.role) {
        localStorage.setItem(`sk_role_${user.id}`, updatedFields.role);
      }
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login: loginWithGoogle, // Simplify login for now
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
