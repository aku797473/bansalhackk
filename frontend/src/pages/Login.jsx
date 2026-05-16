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
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading(mode === 'login' ? 'Authenticating...' : 'Creating Account...');
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, role);
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
      // Demo account
      await login('farmer@smartkisan.com', 'kisan123');
      toast.success('Demo Access Granted', { id });
      navigate('/dashboard');
    } catch (err) {
      // If demo fails, try to register it once
      try {
        await register('Smart Farmer', 'farmer@smartkisan.com', 'kisan123', 'farmer');
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="w-full max-w-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3.5rem] p-12 sm:p-16 border border-white/20 shadow-2xl relative z-10">
        <div className="text-center mb-12">
          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-4">SECURITY PROTOCOL</div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            {mode === 'login' ? 'Auth Node' : 'Initialize'}
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-4 uppercase tracking-[0.2em] opacity-60">
            {mode === 'login' ? 'Identify yourself to continue' : 'Establish your digital identity'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-10">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Display Name</label>
              <input 
                required
                type="text" 
                placeholder="E.G. RAMESH KUMAR"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-indigo-600 outline-none transition-all"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Email Identity</label>
            <input 
              required
              type="email" 
              placeholder="FARMER@NETWORK.COM"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Access Key</label>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-indigo-600 outline-none transition-all"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Operational Role</label>
              <div className="grid grid-cols-3 gap-3">
                {['farmer', 'seller', 'labor'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      "py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                      role === r ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-600/30"
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
            className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
          >
            {loading ? 'PROCESSING...' : mode === 'login' ? 'AUTHENTICATE →' : 'INITIALIZE IDENTITY →'}
          </button>
        </form>

        <div className="space-y-6">
           <button
            onClick={quickLogin}
            disabled={loading}
            className="w-full py-4 border-2 border-indigo-600/20 text-indigo-600 text-[10px] font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
          >
            QUICK DEMO ACCESS
          </button>

          <div className="text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
            >
              {mode === 'login' ? "Don't have an identity? Initialize here" : "Already identified? Authenticate here"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
