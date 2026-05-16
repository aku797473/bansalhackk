import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Eye, EyeOff, ShieldCheck, UserPlus, Fingerprint } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading(mode === 'login' ? 'Validating Identity...' : 'Initializing Identity...');
    
    try {
      if (mode === 'login') {
        await login(formData.phone, formData.password);
      } else {
        if (!formData.name) throw new Error("Full Name is required for registration");
        await register(formData.name, formData.phone, formData.password, role);
      }
      toast.success('Identity Verified', { id });
      navigate('/dashboard');
    } catch (error) {
      const msg = error.message || error.response?.data?.message || 'Operation failed';
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
      <ThreeBackground key="login-secure-v2" />
      
      <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 border border-white/20 shadow-2xl relative z-10 transition-all duration-500">
        
        {/* Mode Selector */}
        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-10 border border-slate-200/20 shadow-inner">
          <button 
            onClick={() => setMode('login')}
            className={clsx(
              "flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-2",
              mode === 'login' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-md" : "text-slate-400 hover:text-slate-500"
            )}
          >
            <ShieldCheck size={14} /> Sign In
          </button>
          <button 
            onClick={() => setMode('register')}
            className={clsx(
              "flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-2",
              mode === 'register' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-md" : "text-slate-400 hover:text-slate-500"
            )}
          >
            <UserPlus size={14} /> Create
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none flex items-center justify-center gap-4">
             {mode === 'login' ? 'IDENTITY' : 'INITIATE'} <Fingerprint className="text-emerald-600" size={40} />
          </h1>
          <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-[0.4em] opacity-60">
            {mode === 'login' ? 'Encrypted Session Control' : 'Establish Your Farmer Node'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-10">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="RAMESH KUMAR"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-4.5 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Phone Identity</label>
            <input 
              required
              type="tel" 
              placeholder="98XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-4.5 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Secret Key</label>
            <div className="relative">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-4.5 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 pr-16"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['farmer', 'seller', 'labor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      "py-4 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      role === r ? "border-emerald-600 bg-emerald-600 text-white shadow-lg" : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-600/30"
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
            className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.6em] rounded-2xl shadow-2xl hover:scale-102 active:scale-98 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'VALIDATING...' : mode === 'login' ? 'AUTHORIZE →' : 'INITIALIZE →'}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-8">
           <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">OR</span>
           <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>

        <button
          onClick={quickLogin}
          disabled={loading}
          className="w-full py-4 border-2 border-emerald-600/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.5em] rounded-xl hover:bg-emerald-600/5 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <ShieldCheck size={16} /> QUICK SYSTEM ACCESS
        </button>

        <p className="mt-12 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-40">
           SmartKisan Secure Identity Protocol 2.5
        </p>
      </div>
    </div>
  );
}
