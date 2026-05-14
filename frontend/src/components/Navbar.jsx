import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  HouseSimple, CloudSun, Plant, Flask, TrendUp, ShoppingBagOpen,
  Users, MapPin, Newspaper, Bell, Bank, List, X, SignOut, Sun, Moon, CaretRight, Calculator
} from '@phosphor-icons/react';
import { UserButton } from '@clerk/clerk-react';
import clsx from 'clsx';

import logo from '../assets/kisan-logo-new.jpg';
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
    { to: '/dashboard',  icon: HouseSimple,   label: t('nav.home'),        accent: 'text-violet-600 dark:text-violet-400', activeBg: 'bg-violet-50 dark:bg-violet-500/10', iconBg: 'bg-violet-100 dark:bg-violet-500/20' },
    { to: '/weather',    icon: CloudSun,      label: t('nav.weather'),     accent: 'text-sky-600 dark:text-sky-400',       activeBg: 'bg-sky-50 dark:bg-sky-500/10',       iconBg: 'bg-sky-100 dark:bg-sky-500/20' },
    { to: '/crop',       icon: Plant,         label: t('nav.crop'),        accent: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconBg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { to: '/market',     icon: TrendUp,    label: t('nav.market'),      accent: 'text-indigo-600 dark:text-indigo-400', activeBg: 'bg-indigo-50 dark:bg-indigo-500/10', iconBg: 'bg-indigo-100 dark:bg-indigo-500/20' },
    { to: '/fertilizer', icon: Flask,         label: t('nav.fertilizer'), accent: 'text-amber-600 dark:text-amber-400',   activeBg: 'bg-amber-50 dark:bg-amber-500/10',   iconBg: 'bg-amber-100 dark:bg-amber-500/20' },
  ];

  const moreLinks = [
    { to: '/labour',           icon: Users,         label: t('nav.labour'),               accent: 'text-rose-600 dark:text-rose-400',       activeBg: 'bg-rose-50 dark:bg-rose-500/10',       iconBg: 'bg-rose-100 dark:bg-rose-500/20' },
    { to: '/buyer',            icon: ShoppingBagOpen, label: t('nav.buyer', 'Marketplace'), accent: 'text-teal-600 dark:text-teal-400',      activeBg: 'bg-teal-50 dark:bg-teal-500/10',      iconBg: 'bg-teal-100 dark:bg-teal-500/20' },
    { to: '/profit-predictor', icon: Calculator,    label: 'Profit Predictor',            accent: 'text-violet-600 dark:text-violet-400',   activeBg: 'bg-violet-50 dark:bg-violet-500/10',  iconBg: 'bg-violet-100 dark:bg-violet-500/20' },
    { to: '/map',              icon: MapPin,        label: t('nav.map'),                  accent: 'text-cyan-600 dark:text-cyan-400',       activeBg: 'bg-cyan-50 dark:bg-cyan-500/10',      iconBg: 'bg-cyan-100 dark:bg-cyan-500/20' },
    { to: '/news',             icon: Newspaper,     label: t('nav.news'),                 accent: 'text-orange-600 dark:text-orange-400',   activeBg: 'bg-orange-50 dark:bg-orange-500/10',  iconBg: 'bg-orange-100 dark:bg-orange-500/20' },
    { to: '/schemes',          icon: Bank,          label: t('nav.schemes'),              accent: 'text-fuchsia-600 dark:text-fuchsia-400', activeBg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-500/20' },
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
          
          {/* Brand Wordmark - SaaS Style (no image on desktop) */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all">
              <img src={logo} className="w-full h-full object-cover filter contrast-[1.1] brightness-[1.1]" alt="logo" />
            </div>
            {/* Text wordmark */}
            <div className="flex flex-col leading-none">
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                Smart<span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">Kisan</span>
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 hidden sm:block">AgriTech Platform</span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {primaryLinks.map(({ to, icon: Icon, label, accent, activeBg, iconBg }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group/nav',
                  isActive
                    ? `${activeBg} ${accent} font-bold`
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                )}>
                {({ isActive }) => (
                  <>
                    <span className={clsx(
                      'flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200',
                      isActive ? iconBg : 'group-hover/nav:bg-slate-200/60 dark:group-hover/nav:bg-slate-700/60'
                    )}>
                      <Icon size={14} weight="duotone" />
                    </span>
                    {label}
                    {isActive && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-current opacity-60" />}
                  </>
                )}
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="relative ml-1">
              <button 
                onClick={() => setMoreOpen(!moreOpen)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all",
                  moreLinks.some(l => location.pathname === l.to)
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                )}
              >
                <span>{t('common.more', 'More')}</span>
                <CaretRight size={13} weight="bold" className={clsx("transition-transform", moreOpen ? "rotate-90" : "")} />
              </button>

              {moreOpen && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-200/60 dark:shadow-black/40 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {moreLinks.map(({ to, icon: Icon, label, accent, activeBg, iconBg }) => (
                    <NavLink key={to} to={to}
                      className={({ isActive }) => clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                        isActive
                          ? `${activeBg} ${accent} font-bold`
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}>
                      {({ isActive }) => (
                        <>
                          <span className={clsx(
                            'flex items-center justify-center w-6 h-6 rounded-lg transition-all',
                            isActive ? iconBg : 'bg-slate-100 dark:bg-slate-800'
                          )}>
                            <Icon size={14} weight="duotone" />
                          </span>
                          {label}
                        </>
                      )}
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
                {theme === 'dark' ? <Sun size={18} weight="duotone" /> : <Moon size={18} weight="duotone" />}
              </button>
              <button onClick={() => navigate('/news')} className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Alerts">
                <Bell size={18} weight="duotone" />
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
              <List size={22} weight="bold" />
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
                  <img src={logo} className="w-8 h-8 object-cover rounded-lg filter contrast-[1.1] brightness-[1.1]" alt="logo" />
               </div>
               <span className="font-bold text-gray-900 dark:text-white text-lg">{t('nav.menu')}</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-gray-900 dark:text-white">
              <X size={20} weight="bold" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-none">
            {[...primaryLinks, ...moreLinks].map(({ to, icon: Icon, label, accent, activeBg, iconBg }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center justify-between w-full p-3.5 rounded-2xl text-sm font-semibold transition-all',
                  isActive
                    ? `${activeBg} ${accent} font-bold`
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-900'
                )}>
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={clsx(
                        'flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                        isActive ? iconBg : 'bg-slate-100 dark:bg-slate-800'
                      )}>
                        <Icon size={16} />
                      </span>
                      {label}
                    </div>
                    <CaretRight size={14} weight="bold" className={clsx("transition-transform", isActive ? "opacity-100" : "opacity-0")} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <button onClick={toggleTheme} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 font-bold text-sm">
              {theme === 'dark' ? <Sun size={20} weight="duotone" /> : <Moon size={20} weight="duotone" />}
              {theme === 'dark' ? t('nav.light') : t('nav.dark')}
            </button>
            <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-50 dark:bg-red-950/10 text-red-500 font-bold text-sm shadow-sm active:scale-95 transition-transform">
              <SignOut size={20} weight="duotone" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
