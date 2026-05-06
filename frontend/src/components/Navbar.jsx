import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  Home, Cloud, Leaf, FlaskConical, TrendingUp,
  Users, Map, Newspaper, Bell, Landmark, Menu, X, LogOut, Sun, Moon, ChevronRight
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

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [open]);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          
          {/* Logo Section */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
              <img src={logo} alt="Logo" className="w-6 h-6 brightness-0 invert object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 dark:text-white text-base leading-none">Smart Kisan</span>
              <span className="text-[10px] text-primary dark:text-emerald-400 font-bold uppercase tracking-wider hidden sm:block">Farm Smarter</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
                )}>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => navigate('/news')} className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <Bell size={18} />
                {hasNewNews && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />}
              </button>
            </div>
            
            <LanguageSelector showLabel={false} />
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-xl border-2 border-primary/10" } }} />

            {/* Mobile Hamburger Menu Button - High Visibility */}
            <button 
              onClick={() => setOpen(true)} 
              className="lg:hidden ml-1 p-2 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 transition-all active:scale-95 border border-gray-200 dark:border-slate-700"
              aria-label="Open Menu"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <div className={clsx(
        "fixed inset-0 z-[200] lg:hidden transition-all duration-300",
        open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
        
        {/* Drawer Content */}
        <div className={clsx(
          "absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 transform p-6 flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="flex items-center justify-between mb-8">
            <span className="font-bold text-gray-900 dark:text-white text-lg">Menu</span>
            <button onClick={() => setOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center justify-between w-full p-4 rounded-2xl text-sm font-bold transition-all',
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                )}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      {label}
                    </div>
                    <ChevronRight size={14} className={isActive ? "opacity-100" : "opacity-0"} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <button onClick={toggleTheme} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 font-bold text-sm">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              {theme === 'dark' ? 'Light Appearance' : 'Dark Appearance'}
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/10 text-red-500 font-bold text-sm">
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
