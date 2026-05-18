import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Eye, EyeOff, ShieldCheck, UserPlus, Fingerprint } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '../config/firebase';

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    const id = toast.loading('Connecting Google Account...');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      
      await loginWithGoogle(user.email, user.displayName, user.uid);
      toast.success('Google Access Verified', { id });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      const msg = error.response?.data?.message || error.message || 'Google Auth Cancelled';
      toast.error(msg, { id });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading(mode === 'login' ? 'Validating Identity...' : 'Initializing Identity...');
    
    try {
      if (mode === 'login') {
        await login(formData.phone, formData.password);
      } else {
        if (!formData.name) throw new Error("Full Name is required");
        await register(formData.name, formData.phone, formData.password, role);
      }
      toast.success('Identity Verified', { id });
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(msg, { id });
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async () => {
    setLoading(true);
    const id = toast.loading('Bypassing System...');
    try {
      await login('9999999999', 'kisan123');
      toast.success('Bypass Successful', { id });
      navigate('/dashboard');
    } catch (err) {
      try {
        await register('Smart Farmer', '9999999999', 'kisan123', 'farmer');
        toast.success('New Identity Established', { id });
        navigate('/dashboard');
      } catch (inner) {
        toast.error('Quick Access Revoked', { id });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ThreeBackground key="login-secure-v3" />
      
      <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 border border-white/20 shadow-2xl relative z-10">
        
        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-10 border border-slate-200/20 shadow-inner">
          <button 
            type="button"
            onClick={() => setMode('login')}
            className={clsx(
              "flex-1 py-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2",
              mode === 'login' ? "bg-white dark:bg-slate-750 text-emerald-600 shadow-md" : "text-slate-400 hover:text-slate-500"
            )}
          >
            <ShieldCheck size={14} /> Sign In
          </button>
          <button 
            type="button"
            onClick={() => setMode('register')}
            className={clsx(
              "flex-1 py-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2",
              mode === 'register' ? "bg-white dark:bg-slate-750 text-emerald-600 shadow-md" : "text-slate-400 hover:text-slate-500"
            )}
          >
            <UserPlus size={14} /> Create
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-3">
             {mode === 'login' ? 'Sign In' : 'Create Account'} <Fingerprint className="text-emerald-600" size={32} />
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            {mode === 'login' ? 'Access your Smart Kisan account' : 'Register a new secure account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="Ramesh Kumar"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white font-medium"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Phone Number</label>
            <input 
              required
              type="tel" 
              placeholder="98XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white font-medium"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Password</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder="Secret Key"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white font-medium pr-12"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Account Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['farmer', 'seller', 'labor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      "py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all",
                      role === r ? "border-emerald-600 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-600/30"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-2xl shadow-lg hover:scale-[1.005] active:scale-[0.995] transition-all disabled:opacity-50"
          >
            {loading ? 'Wait...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-2xl shadow-sm hover:scale-[1.005] active:scale-[0.995] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.63 14.97 1 12 1 7.35 1 3.39 3.65 1.41 7.54l3.86 3C6.2 7.74 8.89 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.91 3.41-8.6z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.26c-.25-.74-.39-1.53-.39-2.36s.14-1.62.39-2.36l-3.86-3C.61 8.08 0 9.96 0 12s.61 3.92 1.41 5.46l3.86-3z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.08.72-2.47 1.15-4.26 1.15-3.11 0-5.8-2.7-6.73-5.5l-3.86 3C3.39 20.35 7.35 23 12 23z"
            />
          </svg>
          Sign In with Google
        </button>

        <button
          onClick={quickLogin}
          disabled={loading}
          className="w-full py-3 border border-emerald-600/20 text-emerald-600 text-sm font-semibold rounded-2xl hover:bg-emerald-500/5 transition-all active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <ShieldCheck size={16} /> Bypass Identity Verification
        </button>

        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
           Smart Kisan Secured Vault
        </p>
      </div>
    </div>
  );
}
