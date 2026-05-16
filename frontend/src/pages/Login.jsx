import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('farmer');

  const handleLogin = async () => {
    setLoading(true);
    const id = toast.loading('Authenticating...');
    try {
      const fbUser = await login();
      // After login, update the role and sync to MongoDB
      await updateUser({ 
        role, 
        name: fbUser.displayName, 
        image: fbUser.photoURL,
        email: fbUser.email 
      });
      
      toast.success('Access Granted', { id });
      navigate('/dashboard');
    } catch (error) {
      toast.error('Authentication Failed', { id });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="w-full max-w-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[3rem] p-12 sm:p-16 border border-white/20 shadow-2xl relative z-10">
        <div className="text-center mb-12">
          <div className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-4">ACCESS PORTAL</div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
            SmartKisan
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-4 uppercase tracking-widest">Select your role and continue with Google</p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-10">
          {[
            { id: 'farmer', label: 'Farmer', desc: 'Manage crops & mandi' },
            { id: 'seller', label: 'Seller', desc: 'Sell seeds & tools' },
            { id: 'labor',  label: 'Labor',  desc: 'Find farm work' }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={clsx(
                "p-6 rounded-2xl border-2 transition-all text-left group",
                role === r.id 
                  ? "border-indigo-600 bg-indigo-600/5 dark:bg-indigo-600/10" 
                  : "border-slate-100 dark:border-slate-800 hover:border-indigo-600/30"
              )}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className={clsx(
                    "text-lg font-black uppercase tracking-widest",
                    role === r.id ? "text-indigo-600" : "text-slate-900 dark:text-white"
                  )}>
                    {r.label}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {r.desc}
                  </div>
                </div>
                <div className={clsx(
                  "w-4 h-4 rounded-full border-2",
                  role === r.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-600"
                )} />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.5em] rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
        >
          {loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}
          <span>→</span>
        </button>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-loose">
            Secure multi-factor authentication protocol active. <br />
            <span className="text-indigo-600 cursor-pointer">Security Center</span> | <span className="text-indigo-600 cursor-pointer">Privacy Vault</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
