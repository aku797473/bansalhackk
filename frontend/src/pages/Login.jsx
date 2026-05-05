import { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from '../components/LanguageSelector';
import { ShieldCheck, Sun, Moon, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-primary/30">
      
      {/* Floating Actions */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-3 text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-xl shadow-black/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 hover:scale-110 active:scale-95"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
          {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
          <LanguageSelector align="right" />
        </div>
      </div>

      {/* ── Left panel (Branding & Impact) ─────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative overflow-hidden flex-col justify-between p-16 bg-[#0a2e1f]">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")'
        }} />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16 animate-slide-right">
            <div className="w-14 h-14 rounded-[1.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center text-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              🌾
            </div>
            <div>
              <span className="block font-black text-white text-2xl tracking-tighter leading-none">Smart Kisan</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1 block">Digital Krishi</span>
            </div>
          </div>

          <div className="space-y-8 max-w-lg">
            <h2 className="text-5xl xl:text-7xl font-black text-white leading-[1.1] tracking-tight animate-slide-up">
              {t('landing.hero_title').split(' ').slice(0, 2).join(' ')} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-green-300">
                {t('landing.hero_title').split(' ').slice(2).join(' ')}
              </span>
            </h2>
            <p className="text-xl text-emerald-50/70 leading-relaxed font-medium animate-slide-up delay-100">
              {t('landing.hero_sub')}
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 animate-slide-up delay-200">
          {BENEFITS.map((b, i) => (
            <div key={b.textKey} className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                {b.icon}
              </div>
              <span className="text-sm font-bold text-white/90 tracking-wide">{t(b.textKey)}</span>
            </div>
          ))}

          <div className="col-span-2 pt-10 mt-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-100/40 text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={16} className="text-primary" />
              <span>Institutional Grade Security</span>
            </div>
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a2e1f] bg-slate-800 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover grayscale opacity-80" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#0a2e1f] bg-primary flex items-center justify-center text-[10px] font-bold text-white">+2M</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (Authentication) ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-16 bg-white dark:bg-slate-950 transition-colors duration-500 relative">
        
        {/* Background Blobs for Mobile */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile Header */}
          <div className="flex flex-col items-center mb-12 lg:hidden text-center">
            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl shadow-primary/20 mb-6 animate-bounce-sm">
              <span className="text-4xl">🌾</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">Smart Kisan</h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('landing.v2')}</p>
          </div>

          <div className="mb-10">
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
              {isLogin ? t('auth.login_title') : t('auth.register_title')}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              {isLogin ? t('auth.login_subtitle') : t('auth.register_subtitle')}
            </p>
          </div>

          {/* Premium Tab Switcher */}
          <div className="flex p-1.5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 mb-10 shadow-sm">
            <button
              onClick={() => setIsLogin(true)}
              className={clsx(
                'flex-1 py-3.5 rounded-2xl text-sm font-black transition-all duration-500 tracking-wide flex items-center justify-center gap-2',
                isLogin 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-xl shadow-black/5 scale-[1.02] border border-slate-100 dark:border-slate-700' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              )}>
              {t('auth.login_btn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={clsx(
                'flex-1 py-3.5 rounded-2xl text-sm font-black transition-all duration-500 tracking-wide flex items-center justify-center gap-2',
                !isLogin 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-xl shadow-black/5 scale-[1.02] border border-slate-100 dark:border-slate-700' 
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              )}>
              {t('auth.register_btn')}
            </button>
          </div>

          {/* Clerk Integration with Custom Styling */}
          <div className="clerk-container animate-slide-up">
            {isLogin ? (
              <SignIn 
                routing="hash" 
                signUpUrl="/login" 
                forceRedirectUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-none bg-transparent p-0",
                    header: "hidden",
                    socialButtonsBlockButton: "h-14 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-slate-700 dark:text-slate-200 shadow-sm",
                    socialButtonsBlockButtonText: "font-black tracking-tight",
                    dividerLine: "bg-slate-100 dark:bg-slate-800 h-[1.5px]",
                    dividerText: "text-slate-300 font-black uppercase text-[9px] tracking-widest",
                    formButtonPrimary: "btn-primary h-14 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4 border-none",
                    formFieldInput: "h-14 rounded-2xl border border-slate-200 focus:border-primary dark:bg-slate-900 dark:border-slate-800 transition-all font-bold text-base shadow-inner bg-slate-50/30",
                    formFieldLabel: "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1",
                    footer: "hidden",
                    formFieldAction: "text-xs font-black text-primary hover:text-emerald-600 transition-colors",
                    identityPreviewText: "font-bold text-slate-700 dark:text-slate-200",
                    identityPreviewEditButton: "text-primary font-black uppercase text-[10px] tracking-widest"
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
                    header: "hidden",
                    socialButtonsBlockButton: "h-14 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-slate-700 dark:text-slate-200 shadow-sm",
                    socialButtonsBlockButtonText: "font-black tracking-tight",
                    dividerLine: "bg-slate-100 dark:bg-slate-800 h-[1.5px]",
                    dividerText: "text-slate-300 font-black uppercase text-[9px] tracking-widest",
                    formButtonPrimary: "btn-primary h-14 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 active:scale-95 transition-all mt-4 border-none",
                    formFieldInput: "h-14 rounded-2xl border border-slate-200 focus:border-primary dark:bg-slate-900 dark:border-slate-800 transition-all font-bold text-base shadow-inner bg-slate-50/30",
                    formFieldLabel: "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1",
                    footer: "hidden",
                    formFieldAction: "text-xs font-black text-primary hover:text-emerald-600 transition-colors"
                  }
                }}
              />
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {t('auth.secure_by_clerk')}
            </div>
            <div className="w-px h-3 bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-blue-500" />
              AES-256 Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
