import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import { UserButton } from '@clerk/clerk-react';
import clsx from 'clsx';
import { newsAPI } from '../services/api';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);

  useEffect(() => {
    const checkNews = async () => {
      try {
        const lang = i18n.language === 'hi' ? 'hi' : 'en';
        const { data } = await newsAPI.getLatest(lang);
        if (data.success && data.data.length > 0) {
          const latestPubDate = new Date(data.data[0].pubDate).getTime();
          const lastSeen = localStorage.getItem('sk_last_seen_news');
          if (!lastSeen || latestPubDate > Number(lastSeen)) setHasNewNews(true);
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

  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [open]);

  useEffect(() => { setOpen(false); setMoreOpen(false); }, [location.pathname]);

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-[100] px-4 sm:px-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/10 dark:border-slate-800/60 rounded-2xl sm:rounded-[1.5rem] shadow-sm px-6 flex items-center justify-between gap-4">
          
          <NavLink to="/dashboard" className="flex flex-col leading-none">
            <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Smart<span className="text-indigo-600">Kisan</span>
            </span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-0.5">AgriTech</span>
          </NavLink>

          <nav className="hidden xl:flex items-center gap-6">
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
              <button onClick={() => setMoreOpen(!moreOpen)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                {t('common.more')} {moreOpen ? '↑' : '↓'}
              </button>
              {moreOpen && (
                <div className="absolute top-full right-0 mt-4 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                  {moreLinks.map(({ to, label }) => (
                    <NavLink key={to} to={to} className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSelector showLabel={false} />
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />
            <button onClick={() => setOpen(true)} className="xl:hidden text-[10px] font-black uppercase tracking-widest text-indigo-600">
              MENU
            </button>
          </div>
        </div>
      </header>

      <div className={clsx("fixed inset-0 z-[200] xl:hidden transition-all duration-500", open ? "opacity-100 visible" : "opacity-0 invisible")}>
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl" onClick={() => setOpen(false)} />
        <div className={clsx("absolute inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl p-8 flex flex-col transition-transform duration-500", open ? "translate-x-0" : "translate-x-full")}>
          <div className="flex justify-between items-center mb-12">
            <span className="text-xl font-black uppercase tracking-tighter">SmartKisan</span>
            <button onClick={() => setOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400">CLOSE</button>
          </div>
          <nav className="flex-1 space-y-4 overflow-y-auto pr-4 scrollbar-none">
            {[...primaryLinks, ...moreLinks].map(({ to, label }) => (
              <NavLink key={to} to={to} className="block text-2xl font-black uppercase tracking-tighter text-slate-400 hover:text-indigo-600 transition-colors">
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <button onClick={toggleTheme} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] bg-slate-100 dark:bg-slate-800 rounded-xl">
              {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }} className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20">
              LOGOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
