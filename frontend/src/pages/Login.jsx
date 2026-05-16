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
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('farmer');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading(mode === 'login' ? 'Authenticating...' : 'Creating Account...');
    
    try {
      if (mode === 'login') {
        await login(formData.phone, formData.password);
      } else {
        await register(formData.name, formData.phone, formData.password, role);
      }
      toast.success('Access Granted', { id });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed', { id });
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
        toast.error('Direct access failed', { id });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ThreeBackground key="login-bg" />
      
      <div className="w-full max-w-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 border border-white/20 shadow-2xl relative z-10 transition-all">
        <div className="text-center mb-10 sm:mb-12">
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-4">SECURITY PORTAL</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            {mode === 'login' ? 'Auth Node' : 'Initialize'}
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-4 uppercase tracking-[0.2em] opacity-60">
            {mode === 'login' ? 'Identify yourself to continue' : 'Establish your digital identity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Name</label>
              <input 
                required
                type="text" 
                placeholder="RAMESH KUMAR"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Phone Number</label>
            <input 
              required
              type="tel" 
              placeholder="98XXXXXXXX"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Password</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['farmer', 'seller', 'labor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      "py-3 rounded-lg sm:rounded-xl border-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                      role === r ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-emerald-600/30"
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
            className="w-full py-5 sm:py-6 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-xl sm:rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : mode === 'login' ? 'AUTHENTICATE →' : 'INITIALIZE →'}
          </button>
        </form>

        <div className="space-y-6">
           <button
            onClick={quickLogin}
            disabled={loading}
            className="w-full py-4 border-2 border-emerald-600/20 text-emerald-600 text-[10px] font-black uppercase tracking-[0.5em] rounded-xl sm:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-lg"
          >
            QUICK DEMO ACCESS
          </button>

          <div className="text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              {mode === 'login' ? "New identity? Initialize here" : "Identified? Authenticate here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
