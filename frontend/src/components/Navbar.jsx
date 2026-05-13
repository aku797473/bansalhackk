import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  Home, Cloud, Leaf, FlaskConical, TrendingUp, ShoppingBag,
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

  const primaryLinks = [
    { to: '/dashboard',  icon: Home,         label: t('nav.home') },
    { to: '/weather',    icon: Cloud,         label: t('nav.weather') },
    { to: '/crop',       icon: Leaf,          label: t('nav.crop') },
    { to: '/market',     icon: TrendingUp,    label: t('nav.market') },
    { to: '/fertilizer', icon: FlaskConical,  label: t('nav.fertilizer') },
  ];

  const moreLinks = [
    { to: '/labour',     icon: Users,         label: t('nav.labour') },
    { to: '/buyer',      icon: ShoppingBag,   label: t('nav.buyer', 'Marketplace') },
    { to: '/map',        icon: Map,           label: t('nav.map') },
    { to: '/news',       icon: Newspaper,     label: t('nav.news') },
    { to: '/schemes',    icon: Landmark,      label: t('nav.schemes') },
  ];

  const [moreOpen, setMoreOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [open]);

  useEffect(() => { setOpen(false); setMoreOpen(false); }, [location.pathname]);

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-[100] px-4 sm:px-6">
        <div className="max-w-7xl mx-auto h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none px-4 flex items-center justify-between gap-4 transition-all">
          
          {/* Logo Section */}
          <NavLink to="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-all border-2 border-white/20">
              <img src={logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain scale-125" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-base leading-none truncate max-w-[80px] sm:max-w-none">Smart Kisan</span>
                <span className="px-1 py-0.5 bg-gray-100 dark:bg-white/5 text-[7px] font-black text-gray-400 dark:text-gray-500 rounded uppercase tracking-tighter hidden xs:block">v2.0.5</span>
              </div>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider hidden md:block">{t('nav.slogan')}</span>
            </div>
          </NavLink>

          {/* Desktop Navigation - Hidden earlier to save space */}
          <nav className="hidden xl:flex items-center gap-1">
            {primaryLinks.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-800'
                )}>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="relative ml-1">
              <button 
                onClick={() => setMoreOpen(!moreOpen)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                  moreLinks.some(l => location.pathname === l.to)
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                )}
              >
                <span>{t('common.more', 'More')}</span>
                <ChevronRight size={14} className={clsx("transition-transform", moreOpen ? "rotate-90" : "")} />
              </button>

              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {moreLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) => clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all',
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                      )}>
                      <Icon size={16} />
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1">
              <button onClick={toggleTheme} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Toggle Theme">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => navigate('/news')} className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Alerts">
                <Bell size={18} />
                {hasNewNews && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />}
              </button>
            </div>
            
            <div className="h-6 w-px bg-gray-100 dark:bg-slate-800 hidden sm:block mx-1" />
            
            <LanguageSelector showLabel={false} />
            
            <div className="flex items-center gap-2 pl-1 sm:pl-2">
               <UserButton appearance={{ elements: { userButtonAvatarBox: "w-7 h-7 sm:w-8 sm:h-8 rounded-xl" } }} />
            </div>

            {/* Mobile Hamburger Menu Button - Shown Earlier (at XL) */}
            <button 
              onClick={() => setOpen(true)} 
              className="xl:hidden ml-1 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95 border border-blue-100 dark:border-blue-900/20"
              aria-label="Open Menu"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <div className={clsx(
        "fixed inset-0 z-[200] xl:hidden transition-all duration-300",
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
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <img src={logo} className="w-6 h-6 object-contain" alt="logo" />
               </div>
               <span className="font-bold text-gray-900 dark:text-white text-lg">{t('nav.menu')}</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-none">
            {[...primaryLinks, ...moreLinks].map(({ to, icon: Icon, label }) => (
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
              {theme === 'dark' ? t('nav.light') : t('nav.dark')}
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/10 text-red-500 font-bold text-sm shadow-sm active:scale-95 transition-transform">
              <LogOut size={20} />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
