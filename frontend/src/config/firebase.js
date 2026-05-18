import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDcQbx97szpVrPlwmyKmP74711ntngH7hw",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-kisan-50f1d.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-kisan-50f1d",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-kisan-50f1d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "972232616824",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:972232616824:web:dea377da473437e505f68d",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-M7LSW4LF3X"
};

// Check if keys exist
if (!firebaseConfig.apiKey) {
  console.error("❌ CRITICAL: Firebase API Key is missing. Authentication will fail.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
