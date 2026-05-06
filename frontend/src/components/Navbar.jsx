import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  Home, Cloud, Leaf, FlaskConical, TrendingUp,
  Users, Map, Newspaper, Bell, Landmark, Menu, X, LogOut, Sun, Moon
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

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="fixed top-0 inset-x-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <img src={logo} alt="Logo" className="w-6 h-6 brightness-0 invert object-contain" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white hidden xs:block">Smart Kisan</span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
              )}>
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate('/news')} className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
              <Bell size={18} />
              {hasNewNews && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900" />}
            </button>
          </div>
          
          <LanguageSelector showLabel={false} />
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-lg" } }} />

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden absolute top-16 inset-x-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-xl overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="p-4 space-y-1">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                )}>
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100 dark:border-slate-800 space-y-1">
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={async () => { await logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
