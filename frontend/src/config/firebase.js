import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCHSfchEw2pG6xTY_41bWlxQzr7GHmlHjQ",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-kisan-2cf49.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-kisan-2cf49",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-kisan-2cf49.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "642731474303",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:642731474303:web:18fb2a97176175d73cee4a",
};

// Check if keys exist
if (!firebaseConfig.apiKey) {
  console.error("❌ CRITICAL: Firebase API Key is missing. Authentication will fail.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
