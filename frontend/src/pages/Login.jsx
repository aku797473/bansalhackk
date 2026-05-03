import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from '../components/LanguageSelector';
import { ShieldCheck, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';

const BENEFITS = [
  { icon: '🌦️', textKey: 'landing.feat_weather' },
  { icon: '📊', textKey: 'landing.feat_market' },
  { icon: '🌱', textKey: 'landing.feat_crop' },
  { icon: '👷', textKey: 'landing.feat_labour' },
];

export default function Login() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);

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

      {/* ── Right panel (Clerk form) ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12 bg-white dark:bg-slate-950 min-h-screen lg:min-h-0 transition-colors">
        <div className="w-full max-w-md animate-fade-in flex flex-col items-center">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center shadow-xl mb-4 animate-bounce-sm">
              <span className="text-4xl">🌾</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">Smart Kisan</h1>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl bg-gray-100 dark:bg-slate-900 p-1.5 mb-8 shadow-inner w-full">
            <button
              onClick={() => setIsLogin(true)}
              className={clsx(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                isLogin 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-md' 
                  : 'text-gray-500 dark:text-slate-500'
              )}>
              {t('auth.login_btn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={clsx(
                'flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300',
                !isLogin 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-md' 
                  : 'text-gray-500 dark:text-slate-500'
              )}>
              {t('auth.register_btn')}
            </button>
          </div>

          {isLogin ? (
            <SignIn 
              routing="hash" 
              signUpUrl="/login" 
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "rounded-2xl border-2 border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900",
                  formButtonPrimary: "btn-primary h-14 rounded-2xl text-lg font-bold shadow-xl",
                  formFieldInput: "input h-14 rounded-2xl border-2 dark:bg-slate-900",
                  footer: "hidden"
                }
              }}
            />
          ) : (
            <SignUp 
              routing="hash" 
              signInUrl="/login"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none bg-transparent p-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "btn-primary h-14 rounded-2xl text-lg font-bold shadow-xl",
                  formFieldInput: "input h-14 rounded-2xl border-2 dark:bg-slate-900",
                  footer: "hidden"
                }
              }}
            />
          )}

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('auth.secure_by_clerk', 'Secured by Clerk Authentication')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

