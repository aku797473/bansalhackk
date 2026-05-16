import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import clsx from 'clsx';
import { newsAPI } from '../services/api';
import { User, SignOut, DotsThreeVertical, Sun, Moon } from '@phosphor-icons/react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const checkNews = async () => {
      try {
        const lang = i18n.language === 'hi' ? 'hi' : 'en';
        const { data } = await newsAPI.getLatest(lang);
        if (data.success && data.data.length > 0) {
          const latestPubDate = new Date(data.data[0].pubDate).getTime();
          const lastSeen = localStorage.getItem('sk_last_seen_news');
          if (!lastSeen || latestPubDate > Number(lastSeen)) {
             // Optional: Show notification dot
          }
        }
      } catch (err) {}
    };
    if (user) checkNews();
  }, [i18n.language, user]);

  const primaryLinks = [
    { to: '/dashboard',  label: t('nav.home') },
    { to: '/weather',    label: t('nav.weather') },
    { to: '/crop',       label: t('nav.crop') },
    { to: '/market',     label: t('nav.market') },
    { to: '/fertilizer', label: t('nav.fertilizer') },
  ];

  const moreLinks = [
    { to: '/labour',           label: t('nav.labour') },
    { to: '/buyer',            label: t('nav.buyer') },
    { to: '/profit-predictor', label: t('nav.profit_predictor') },
    { to: '/map',              label: t('nav.map') },
    { to: '/news',             label: t('nav.news') },
    { to: '/schemes',          label: t('nav.schemes') },
  ];

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [open]);

  useEffect(() => { 
    setOpen(false); 
    setMoreOpen(false); 
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-[100] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 rounded-2xl shadow-sm px-6 flex items-center justify-between gap-4">
          
          <NavLink to="/dashboard" className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Smart<span className="text-indigo-600">Kisan</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-0.5">Agri Intelligence</span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-8">
            {primaryLinks.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'text-[10px] font-black uppercase tracking-widest transition-all',
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                )}>
                {label}
              </NavLink>
            ))}

            <div className="relative">
              <button 
                onClick={() => setMoreOpen(!moreOpen)} 
                className={clsx("text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors", moreOpen ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white')}
              >
                {t('common.more')}
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-4 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                  {moreLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to} className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <LanguageSelector showLabel={false} />
            </div>

            {/* Custom User Menu */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-indigo-600/30 transition-all"
              >
                {user?.image ? (
                  <img src={user.image} alt="user" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} weight="bold" className="text-slate-400" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                   <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{user?.role}</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{user?.name}</div>
                   </div>
                   <div className="p-2">
                      <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <User size={16} /> PROFILE SETTINGS
                      </button>
                      <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />} {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2" />
                      <button 
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <SignOut size={16} /> TERMINATE SESSION
                      </button>
                   </div>
                </div>
              )}
            </div>

            <button onClick={() => setOpen(true)} className="xl:hidden w-10 h-10 flex items-center justify-center text-indigo-600">
              <DotsThreeVertical size={24} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={clsx("fixed inset-0 z-[200] xl:hidden transition-all duration-500", open ? "opacity-100 visible" : "opacity-0 invisible")}>
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl" onClick={() => setOpen(false)} />
        <div className={clsx("absolute inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl p-8 flex flex-col transition-transform duration-500", open ? "translate-x-0" : "translate-x-full")}>
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-black uppercase tracking-tighter">SmartKisan</span>
            <button onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400">CLOSE</button>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto pr-4 scrollbar-none">
            {[...primaryLinks, ...moreLinks].map(({ to, label }) => (
              <NavLink key={to} to={to} className="block text-3xl font-black uppercase tracking-tighter text-slate-400 hover:text-indigo-600 transition-colors">
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
            <button onClick={async () => { await logout(); navigate('/'); }} className="w-full py-5 text-center text-[10px] font-black uppercase tracking-[0.5em] bg-red-600 text-white rounded-2xl shadow-xl shadow-red-500/20">
              TERMINATE SESSION
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
