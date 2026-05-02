import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import {
  Home, Cloud, Leaf, FlaskConical, TrendingUp,
  Users, Map, User, LogOut, Menu, X, Sun, Moon, Newspaper, Bell
} from 'lucide-react';
import clsx from 'clsx';
import logo from '../assets/logo.png';
import { newsAPI } from '../services/api';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);
  const [latestDate, setLatestDate] = useState(null);
  
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
    { to: '/map',        icon: Map,           label: t('nav.map') },
    { to: '/news',       icon: Newspaper,     label: t('nav.news', 'News') },
  ];

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 glass dark:glass-dark border-b border-gray-200/50 dark:border-slate-800 transition-colors" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-gray-100 dark:border-slate-700">
              <img src={logo} alt="Smart Kisan Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm hidden xs:block tracking-tight">Smart Kisan</span>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {links.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100/80 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                )}>
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Notifications */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Notifications">
              <Bell size={18} />
              {hasNewNews && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language */}
            <LanguageSelector />

            {/* Profile */}
            <NavLink to="/profile"
              className={({ isActive }) => clsx(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-all text-sm font-bold overflow-hidden shrink-0',
                isActive ? 'bg-primary text-white shadow-sm' : 'bg-primary/10 text-primary hover:bg-primary/15'
              )}
              title="Profile">
              <div className="w-full h-full flex items-center justify-center">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="uppercase">{user?.name?.[0] || 'U'}</span>
                )}
              </div>
            </NavLink>

            {/* Logout */}
            <button onClick={handleLogout}
              className="hidden sm:flex btn-ghost p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
              title="Logout">
              <LogOut size={15} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="btn-ghost p-2 lg:hidden rounded-xl"
              aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {open && (
          <div className="lg:hidden border-t border-gray-100/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-slide-down">
            <div className="px-4 py-3 grid grid-cols-2 gap-1.5">
              {links.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                  )}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {user?.name ? `👤 ${user.name}` : 'Smart Kisan'}
              </span>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-500 font-medium hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
