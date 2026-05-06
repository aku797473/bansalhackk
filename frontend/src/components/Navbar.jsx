import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  Home, Cloud, Leaf, FlaskConical, TrendingUp,
  Users, Map, User, LogOut, Menu, X, Sun, Moon, Newspaper, Bell, Landmark
} from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import clsx from 'clsx';

import logo from '../assets/logo.png';
import { newsAPI } from '../services/api';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);
  const [latestDate, setLatestDate] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkNews = async () => {
      try {
        const lang = i18n.language === 'hi' ? 'hi' : 'en';
        const { data } = await newsAPI.getLatest(lang);
        if (data.success && data.data.length > 0) {
          const latestPubDate = new Date(data.data[0].pubDate).getTime();
          setLatestDate(latestPubDate);
          const lastSeen = localStorage.getItem('sk_last_seen_news');
          if (!lastSeen || latestPubDate > Number(lastSeen)) setHasNewNews(true);
        }
      } catch (err) { console.error('Failed to check news'); }
    };
    if (user) checkNews();
  }, [i18n.language, user]);

  const handleNotificationClick = () => {
    if (latestDate) {
      localStorage.setItem('sk_last_seen_news', latestDate.toString());
      setHasNewNews(false);
    }
    navigate('/news');
  };

  const links = [
    { to: '/dashboard',  icon: Home,         label: t('nav.home') },
    { to: '/weather',    icon: Cloud,         label: t('nav.weather') },
    { to: '/crop',       icon: Leaf,          label: t('nav.crop') },
    { to: '/fertilizer', icon: FlaskConical,  label: t('nav.fertilizer') },
    { to: '/market',     icon: TrendingUp,    label: t('nav.market') },
    { to: '/labour',     icon: Users,         label: t('nav.labour') },
    { to: '/news',       icon: Newspaper,     label: t('nav.news') },
    { to: '/schemes',    icon: Landmark,      label: t('nav.schemes') },
  ];

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      {/* ── Header ── */}
      <header className={clsx(
        "mx-auto mt-0 sm:mt-3 px-4 h-16 sm:h-20 flex items-center justify-between gap-4 transition-all duration-300 pointer-events-auto",
        scrolled 
          ? "max-w-6xl glass dark:glass-dark sm:rounded-3xl border border-white/20 dark:border-white/5 shadow-premium" 
          : "max-w-7xl bg-white/50 dark:bg-transparent"
      )}>
        
        <NavLink to="/dashboard" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg p-1.5 transition-transform group-hover:scale-110">
            <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 dark:text-white text-sm sm:text-base tracking-tight leading-none">Smart Kisan</span>
            <span className="text-[9px] font-bold text-primary dark:text-emerald-400 uppercase tracking-widest mt-0.5 hidden sm:block">Agriculture Platform</span>
          </div>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300',
                isActive ? 'bg-white dark:bg-slate-700 text-primary dark:text-emerald-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={14} className={clsx(isActive && "animate-pulse")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button onClick={handleNotificationClick} className="relative p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
              <Bell size={19} />
              {hasNewNews && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageSelector showLabel={false} />
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl ring-2 ring-primary/10" } }} />
          </div>

          <button onClick={() => setOpen(!open)} className="flex lg:hidden p-2.5 bg-primary/10 dark:bg-emerald-500/10 text-primary dark:text-emerald-400 rounded-xl active:scale-95 transition-all border border-primary/20 dark:border-emerald-500/20">
            {open ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
          </button>
        </div>
      </header>

      {/* ── Side Drawer ── */}
      <div className={clsx(
        "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setOpen(false)}>
        <div className={clsx(
          "absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-500 p-6 flex flex-col gap-6",
          open ? "translate-x-0" : "translate-x-full"
        )} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Menu</span>
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"><X size={20} /></button>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto pr-2 scrollbar-thin">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all',
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                )}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-3">
             <button onClick={toggleTheme} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 text-sm font-bold">
               {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
               {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
             </button>
             <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 text-sm font-bold">
               <LogOut size={18} />
               Logout
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
