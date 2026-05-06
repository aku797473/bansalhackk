import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  Home, Cloud, Leaf, FlaskConical, TrendingUp,
  Users, Map, User, LogOut, Menu, X, Sun, Moon, Newspaper, Bell, Landmark, Search
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
  
  // Track scroll for "floating" effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check for new news
  useEffect(() => {
    const checkNews = async () => {
      try {
        const lang = i18n.language === 'hi' ? 'hi' : 'en';
        const { data } = await newsAPI.getLatest(lang);
        if (data.success && data.data.length > 0) {
          const latestPubDate = new Date(data.data[0].pubDate).getTime();
          setLatestDate(latestPubDate);
          const lastSeen = localStorage.getItem('sk_last_seen_news');
          if (!lastSeen || latestPubDate > Number(lastSeen)) {
            setHasNewNews(true);
          }
        }
      } catch (err) {
        console.error('Failed to check news for notifications');
      }
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

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className="fixed top-0 inset-x-0 z-50 transition-all duration-300 pointer-events-none">
      {/* ── Main Navbar Container ── */}
      <header className={clsx(
        "mx-auto mt-0 sm:mt-3 px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4 transition-all duration-300 pointer-events-auto",
        scrolled 
          ? "max-w-6xl glass dark:glass-dark sm:rounded-3xl border border-white/20 dark:border-white/5 shadow-premium" 
          : "max-w-7xl bg-white/50 dark:bg-transparent"
      )}>
        
        {/* ── Logo ── */}
        <NavLink to="/dashboard" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all overflow-hidden p-1.5">
            <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight leading-none">Smart Kisan</span>
            <span className="text-[10px] font-bold text-primary dark:text-emerald-400 uppercase tracking-widest mt-0.5">Agriculture Platform</span>
          </div>
        </NavLink>

        {/* ── Desktop Navigation ── */}
        <nav className="hidden xl:flex items-center gap-1 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300',
                isActive
                  ? 'bg-white dark:bg-slate-700 text-primary dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={14} className={clsx(isActive ? "animate-pulse" : "")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Action Buttons ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          <div className="hidden sm:flex items-center gap-1">
            {/* Theme */}
            <button onClick={toggleTheme} className="p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <button onClick={handleNotificationClick} className="relative p-2.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90">
              <Bell size={20} />
              {hasNewNews && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />}
            </button>
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block" />

          {/* Language & Profile */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 rounded-2xl ring-2 ring-primary/10" } }} />
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-900 dark:text-white active:scale-90 transition-all">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      <div className={clsx(
        "lg:hidden fixed inset-0 top-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-3xl transition-all duration-500 pointer-events-auto",
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="p-6 grid grid-cols-2 gap-3 max-w-2xl mx-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => clsx(
                'flex flex-col items-center justify-center gap-3 p-6 rounded-3xl text-sm font-bold transition-all shadow-sm',
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-800'
              )}>
              <Icon size={24} />
              {label}
            </NavLink>
          ))}
          
          <button onClick={toggleTheme} className="col-span-1 flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold">
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button onClick={handleLogout} className="col-span-1 flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-red-50 dark:bg-red-950/20 text-red-500 font-bold border border-red-100 dark:border-red-900/30">
            <LogOut size={24} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
