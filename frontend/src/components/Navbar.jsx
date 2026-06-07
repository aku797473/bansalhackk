import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import clsx from 'clsx';
import { newsAPI } from '../services/api';
import { 
  User, 
  SignOut, 
  Sun, 
  Moon, 
  List, 
  X, 
  House, 
  CloudSun, 
  Plant, 
  Storefront, 
  Flask, 
  Briefcase, 
  Handshake, 
  ChartLineUp, 
  MapPin, 
  Newspaper, 
  Sparkle,
  Gear,
  CaretRight,
  ChatCircleText,
  ShoppingBag,
  Microphone
} from '@phosphor-icons/react';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const userMenuRef = useRef();
  const moreMenuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    { to: '/dashboard',  label: t('nav.home', 'Home'), icon: House },
    { to: '/weather',    label: t('nav.weather', 'Weather'), icon: CloudSun },
    { to: '/crop',       label: t('nav.crop', 'Crop Advisor'), icon: Plant },
    { to: '/market',     label: t('nav.market', 'Market Trends'), icon: Storefront },
    { to: '/fertilizer', label: t('nav.fertilizer', 'Fertilizer'), icon: Flask },
    { to: '/community',  label: t('nav.community', 'Kisan Community'), icon: ChatCircleText },
    { to: '/profile',    label: t('nav.profile', 'Profile Settings'), icon: User },
  ];

  const moreLinks = [
    { to: '/labour',           label: t('nav.labour', 'Labour Marketplace'), icon: Briefcase },
    { to: '/seller',           label: t('nav.seller', 'Seller Portal'), icon: Handshake },
    { to: '/buyer',            label: t('nav.buyer', 'Buyer Portal'), icon: ShoppingBag },
    { to: '/profit-predictor', label: t('nav.profit_predictor', 'Profit Predictor'), icon: ChartLineUp },
    { to: '/map',              label: t('nav.map', 'Map View'), icon: MapPin },
    { to: '/news',             label: t('nav.news', 'News'), icon: Newspaper },
    { to: '/schemes',          label: t('nav.schemes', 'Government Schemes'), icon: Sparkle },
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
      {/* ========================================================
          DESKTOP LAYOUT: Sticky/Floating Left-Side Sidebar
          ======================================================== */}
      <aside className="hidden xl:flex fixed left-6 top-6 bottom-6 w-64 bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/60 backdrop-blur-xl rounded-[2.25rem] shadow-premium p-6 flex-col justify-between z-[100] transition-colors duration-500">
        <div className="flex flex-col">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex flex-col leading-none mb-6">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-outfit">
              Smart<span className="text-indigo-600">Kisan</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-1.5 uppercase">Agri Intelligence</span>
          </NavLink>

          {/* Links scroll container */}
          <div className="flex flex-col space-y-6 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 scrollbar-thin hide-scrollbar">
            {/* Core Links */}
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2 px-1">
                Core Modules
              </span>
              {primaryLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/10' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  )}>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            {/* Additional Modules */}
            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase block mb-2 px-1">
                Portals & Tools
              </span>
              {moreLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300',
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/10' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                  )}>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
          {/* Install App Link */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-95"
          >
            📥 Install Smart Kisan App
          </button>

          {/* Quick Settings Bar (Theme, Language, Logout) */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center flex-1"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} weight="bold" /> : <Moon size={16} weight="bold" />}
            </button>

            {/* Language Selector */}
            <div className="flex-1 flex justify-center">
              <LanguageSelector showLabel={false} dropDirection="up" align="left" />
            </div>

            {/* Log Out */}
            <button 
              onClick={async () => { await logout(); navigate('/'); }}
              className="p-2.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100/50 dark:border-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center flex-1"
              title="Log Out"
            >
              <SignOut size={16} weight="bold" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MOBILE LAYOUT: Floating Top Header
          ======================================================== */}
      <header className="fixed top-4 inset-x-0 z-[100] px-3 xs:px-4 sm:px-6 xl:hidden">
        <div className="max-w-7xl mx-auto h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-800/60 rounded-2xl shadow-sm px-3 xs:px-4 sm:px-6 flex items-center justify-between gap-2 xs:gap-4">
          <NavLink to="/dashboard" className="flex flex-col leading-none shrink-0">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Smart<span className="text-indigo-600">Kisan</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">Agri Intelligence</span>
          </NavLink>

          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
            {/* Kisan Mitra Chat Toggle */}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-kisan-chat'))}
              className="hidden xs:flex w-10 h-10 items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all rounded-xl border border-slate-100 dark:border-slate-700 active:scale-95 shrink-0"
              title="Kisan Mitra Chat"
            >
              <ChatCircleText size={20} weight="bold" />
            </button>

            {/* Voice Assistant Toggle */}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-voice-assistant'))}
              className="hidden xs:flex w-10 h-10 items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all rounded-xl border border-slate-100 dark:border-slate-700 active:scale-95 shrink-0"
              title="Voice Assistant"
            >
              <Microphone size={20} weight="bold" />
            </button>

            <div className="hidden sm:block shrink-0">
              <LanguageSelector showLabel={false} />
            </div>

            {/* Custom User Menu */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-indigo-600/30 transition-all focus:outline-none"
              >
                {user?.image || user?.profilePic ? (
                  <img src={user.image || user.profilePic} alt="user" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} weight="bold" className="text-slate-400" />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                   <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-1 uppercase">{user?.role}</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name}</div>
                   </div>
                   <div className="p-2">
                      <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <User size={18} /> Profile Settings
                      </button>
                      <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-2" />
                      <button 
                        onClick={async () => { await logout(); navigate('/'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <SignOut size={18} /> Log Out
                      </button>
                   </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setOpen(true)} 
              className="xl:hidden w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:scale-95 transition-all rounded-xl border border-indigo-50 dark:border-indigo-950/20 shrink-0"
            >
              <List size={22} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={clsx("fixed inset-0 z-[200] xl:hidden transition-all duration-500", open ? "opacity-100 visible" : "opacity-0 invisible")}>
        <div className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-md" onClick={() => setOpen(false)} />
        <div className={clsx("absolute inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-slate-900 shadow-2xl p-6 flex flex-col transition-transform duration-500 border-l border-slate-100 dark:border-slate-800", open ? "translate-x-0" : "translate-x-full")}>
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Smart<span className="text-indigo-600">Kisan</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">Agri Intelligence</span>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95"
            >
              <X size={20} weight="bold" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto my-2 pr-2 space-y-6 scrollbar-none hide-scrollbar">
            {/* Install PWA Banner */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl text-white shadow-sm border border-emerald-500/20 space-y-2.5">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌾</span>
                <div>
                  <h4 className="font-extrabold text-sm">Download Mobile App</h4>
                  <p className="text-[10px] text-emerald-100">Access mandi prices and weather offline!</p>
                </div>
              </div>
              <button 
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('trigger-pwa-install')); }}
                className="w-full py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-center"
              >
                Install Now
              </button>
            </div>

            {/* AI Assistants Module */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2">AI Assistants</div>
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
                <button 
                  onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('toggle-kisan-chat')); }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-100/50 dark:border-slate-800/60 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                >
                  <ChatCircleText size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" weight="bold" />
                  <span>Kisan Mitra</span>
                </button>
                <button 
                  onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('toggle-voice-assistant')); }}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-100/50 dark:border-slate-800/60 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Microphone size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" weight="bold" />
                  <span>Voice Assistant</span>
                </button>
              </div>
            </div>

            {/* Core Modules */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2">Core Modules</div>
              <div className="space-y-1">
                {primaryLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink 
                    key={to} 
                    to={to} 
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => clsx(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200",
                      isActive 
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/10" 
                        : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    )}
                  >
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Additional Modules */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2">Tools & Services</div>
              <div className="space-y-1">
                {moreLinks.map(({ to, label, icon: Icon }) => (
                  <NavLink 
                    key={to} 
                    to={to} 
                    onClick={() => setOpen(false)}
                    className={({ isActive }) => clsx(
                      "flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200",
                      isActive 
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/10" 
                        : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    )}
                  >
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2">Settings</div>
              <div className="space-y-1 p-2 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
                <button 
                  onClick={toggleTheme} 
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <span className="text-xs text-slate-400 capitalize">{theme}</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800/60 my-1.5" />
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-3">
                    <Gear size={18} />
                    <span>Language</span>
                  </div>
                  <LanguageSelector showLabel={true} />
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  );
}
