import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from '../components/LanguageSelector';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const ROLES = [
  { value: 'farmer', emoji: '👨‍🌾', labelKey: 'auth.farmer', descKey: 'auth.farmer_desc' },
  { value: 'buyer',  emoji: '🏪',   labelKey: 'auth.buyer',  descKey: 'auth.buyer_desc' },
  { value: 'labour', emoji: '👷',   labelKey: 'auth.labour', descKey: 'auth.labour_desc' },
];

const BENEFITS = [
  { icon: '🌦️', textKey: 'landing.feat_weather' },
  { icon: '📊', textKey: 'landing.feat_market' },
  { icon: '🌱', textKey: 'landing.feat_crop' },
  { icon: '👷', textKey: 'landing.feat_labour' },
];

export default function Login() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isLogin, setIsLogin]         = useState(true);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [name, setName]               = useState('');
  const [role, setRole]               = useState('farmer');
  const [loading, setLoading]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t('common.error_required', 'Email & Password required')); return; }
    if (!isLogin && !name)   { toast.error(t('auth.name_required', 'Name required')); return; }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success(t('auth.login_success', 'Welcome back! 🌾'));
      } else {
        await register(name, email, password, role);
        toast.success(t('auth.register_success', 'Account created! 🌾'));
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row dark:bg-slate-950 transition-colors duration-200">
      
      {/* Floating Actions */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50 rounded-xl">
          <LanguageSelector align="right" />
        </div>
      </div>

      {/* ── Left panel (branding) ─────────── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-primary-gradient relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-sm">
              🌾
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Smart Kisan</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-6 tracking-tight">
            <span>{t('landing.hero_title').split(' ').slice(0, 2).join(' ')}</span><br />
            <span className="text-green-200">{t('landing.hero_title').split(' ').slice(2).join(' ')}</span>
          </h2>
          <p className="text-green-50 text-base leading-relaxed max-w-sm font-medium opacity-90">
            {t('landing.hero_sub')}
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {BENEFITS.map(b => (
            <div key={b.textKey} className="flex items-center gap-4 text-white/90 group">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                {b.icon}
              </div>
              <span className="text-sm font-bold tracking-wide">{t(b.textKey)}</span>
            </div>
          ))}

          <div className="pt-8 mt-4 border-t border-white/20 flex items-center gap-3 text-green-100/60 text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Secured · Free · Open Source</span>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 bg-white dark:bg-slate-950 min-h-screen lg:min-h-0 transition-colors">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl mb-4 animate-bounce-sm">
              <span className="text-4xl">🌾</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Smart Kisan</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-widest">Your Digital Partner</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-10">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              {isLogin ? t('auth.login_title') : t('auth.register_title')}
            </h1>
            <p className="text-sm font-bold text-gray-400 dark:text-slate-500 mt-2 uppercase tracking-wide">
              {isLogin ? t('auth.login_subtitle') : t('auth.register_subtitle')}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-gray-100 dark:bg-slate-900 p-1.5 mb-8 shadow-inner">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={clsx(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                isLogin 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-md' 
                  : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
              )}>
              {t('auth.login_btn')}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={clsx(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                !isLogin 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-md' 
                  : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
              )}>
              {t('auth.register_btn')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role picker (register only) */}
            {!isLogin && (
              <div className="animate-slide-down">
                <label className="label text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">{t('auth.select_role')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={() => setRole(r.value)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all text-xs font-bold',
                        role === r.value
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-md scale-105'
                          : 'border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-500 hover:border-gray-200 dark:hover:border-slate-700'
                      )}>
                      <span className="text-3xl mb-1">{r.emoji}</span>
                      <span>{t(r.labelKey)}</span>
                      <span className="text-[9px] opacity-60 font-medium leading-tight">{t(r.descKey)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name field (register only) */}
            {!isLogin && (
              <div className="animate-slide-down">
                <label className="label">{t('auth.name_label')}</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="input pl-12 h-14 rounded-2xl border-2 focus:border-primary/50"
                    placeholder={t('auth.name_placeholder')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="label">{t('auth.email_label')}</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  className="input pl-12 h-14 rounded-2xl border-2 focus:border-primary/50"
                  placeholder={t('auth.email_placeholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">{t('auth.password_label')}</label>
                {isLogin && (
                  <button type="button" className="text-xs text-primary font-bold hover:underline tracking-tight">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pl-12 pr-12 h-14 rounded-2xl border-2 focus:border-primary/50"
                  placeholder={t('auth.password_placeholder')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-14 rounded-2xl text-lg font-bold shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? t('auth.login_btn') : t('auth.register_btn')}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-10 text-center">
            {isLogin ? (
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{t('auth.switch_register').split('?')[0]}?</span>
                <button type="button" onClick={() => setIsLogin(false)} className="text-primary font-black text-lg hover:scale-105 transition-transform">
                  {t('auth.switch_register').split('?')[1].trim()}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 items-center">
                <span className="text-sm font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest text-[10px]">{t('auth.switch_login').split('?')[0]}?</span>
                <button type="button" onClick={() => setIsLogin(true)} className="text-primary font-black text-lg hover:scale-105 transition-transform">
                  {t('auth.switch_login').split('?')[1].trim()}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
