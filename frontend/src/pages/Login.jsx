import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('farmer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading(mode === 'login' ? 'Authenticating...' : 'Creating Identity...');
    
    try {
      if (mode === 'login') {
        await login(formData.phone, formData.password);
      } else {
        if (!formData.name) throw new Error("Full Name is required for registration");
        await register(formData.name, formData.phone, formData.password, role);
      }
      toast.success('Access Granted', { id });
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
    const id = toast.loading('Bypassing Protocol...');
    try {
      await login('9999999999', 'kisan123');
      toast.success('Demo Access Granted', { id });
      navigate('/dashboard');
    } catch (err) {
      try {
        await register('Smart Farmer', '9999999999', 'kisan123', 'farmer');
        toast.success('New Demo Account Created', { id });
        navigate('/dashboard');
      } catch (inner) {
        toast.error('Quick Access Unavailable', { id });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ThreeBackground key="login-session-bg" />
      
      <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-20 border border-white/20 shadow-2xl relative z-10">
        
        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl mb-12">
          <button 
            onClick={() => setMode('login')}
            className={clsx(
              "flex-1 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all",
              mode === 'login' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Sign In
          </button>
          <button 
            onClick={() => setMode('register')}
            className={clsx(
              "flex-1 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-xl transition-all",
              mode === 'register' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Create Account
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            {mode === 'login' ? 'Welcome Back' : 'Join Network'}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-4 uppercase tracking-[0.3em] opacity-60">
            {mode === 'login' ? 'Secure Login Protocol' : 'Identity Initialization'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          {mode === 'register' && (
            <div className="space-y-2 group">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="E.G. RAMESH KUMAR"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-5 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
              />
            </div>
          )}
          
          <div className="space-y-2 group">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">Mobile Identity (Number)</label>
            <input 
              required
              type="tel" 
              placeholder="98XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-5 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="space-y-2 group">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2 group-focus-within:text-emerald-600 transition-colors">Secret Access Key</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-5 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] ml-2">Operational Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['farmer', 'seller', 'labor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      "py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
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
            className="w-full py-7 bg-slate-900 dark:bg-white text-white dark:text-black text-[12px] font-black uppercase tracking-[0.6em] rounded-[2rem] shadow-2xl hover:scale-102 active:scale-98 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'PROCESSING...' : mode === 'login' ? 'AUTHORIZE ACCESS' : 'INITIALIZE NODE'}
          </button>
        </form>

        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.5em]"><span className="bg-white dark:bg-slate-900 px-4 text-slate-400">Emergency Access</span></div>
        </div>

        <button
          onClick={quickLogin}
          disabled={loading}
          className="w-full py-5 border-2 border-emerald-600/20 text-emerald-600 text-[10px] font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-95"
        >
          BYPASS LOGIN (DEMO)
        </button>

        <p className="mt-12 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.5em] opacity-40">
           Secured by SmartKisan Local Identity Vault v2.4
        </p>
      </div>
    </div>
  );
}
