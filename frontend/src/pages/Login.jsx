import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Eye, EyeOff, ShieldCheck, UserPlus, Fingerprint, Lock, Phone, User, Globe, ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans select-none">
      <ThreeBackground key="login-secure-v3" />
      
      {/* Background radial glow lights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-14 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Top Branding Section */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-pulse">
            <Fingerprint size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none font-outfit">
             SMART KISAN
          </h1>
          <p className="text-xs font-bold text-slate-450 dark:text-slate-400 mt-2.5 uppercase tracking-widest">
            {mode === 'login' ? 'Next-Gen Gateway Authentication' : 'Establish New Secure Identity'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100/60 dark:bg-slate-800/40 p-1.5 rounded-2xl mb-8 border border-slate-200/20 shadow-inner">
          <button 
            type="button"
            onClick={() => setMode('login')}
            className={clsx(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
              mode === 'login' 
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/10" 
                : "text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            <ShieldCheck size={14} /> Sign In
          </button>
          <button 
            type="button"
            onClick={() => setMode('register')}
            className={clsx(
              "flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
              mode === 'register' 
                ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/10" 
                : "text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300"
            )}
          >
            <UserPlus size={14} /> Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          
          {/* Full Name (For Register Only) */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  placeholder="Ramesh Kumar"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          )}
          
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Phone Number</label>
            <div className="relative">
              <input 
                required
                type="tel" 
                placeholder="98XXXXXXXX"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full h-14 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              />
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 relative">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Password</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder="Secret Key"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full h-14 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-12 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              />
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Account Role Card Grid (For Register Only) */}
          {mode === 'register' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Account Role</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {val:'farmer', label:'Farmer'},
                  {val:'buyer', label:'Buyer'},
                  {val:'labour', label:'Labour'}
                ].map(r => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRole(r.val)}
                    className={clsx(
                      "py-3 rounded-2xl border text-xs font-bold capitalize transition-all duration-300",
                      role === r.val 
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-500/30"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Access Portal' : 'Register Identity'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-8">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-14 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl shadow-sm hover:-translate-y-0.5 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
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
          Google Account
        </button>

        <p className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
           🔒 Smart Kisan Secured Vault
        </p>
      </div>
    </div>
  );
}
