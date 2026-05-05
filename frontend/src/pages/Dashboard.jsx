import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  Cloud, Leaf, TrendingUp, Users, FlaskConical, Map,
  ArrowRight, AlertTriangle, RefreshCw, Droplets, Wind,
  Bell, TrendingDown, Calendar
} from 'lucide-react';
import { weatherAPI, marketAPI, labourAPI } from '../services/api';
import clsx from 'clsx';

const quickActions = [
  { to: '/weather',    icon: Cloud,        labelKey: 'nav.weather',    sublabelKey: 'dashboard.labels.live_forecast', color: 'from-sky-400 to-sky-600',    bg: 'bg-sky-50 dark:bg-sky-900/20',    text: 'text-sky-600 dark:text-sky-400' },
  { to: '/crop',       icon: Leaf,         labelKey: 'nav.crop',       sublabelKey: 'dashboard.labels.ai_powered',    color: 'from-green-400 to-green-600', bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400' },
  { to: '/market',     icon: TrendingUp,   labelKey: 'nav.market',     sublabelKey: 'dashboard.labels.mandi_rates',   color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-600 dark:text-amber-400' },
  { to: '/fertilizer', icon: FlaskConical, labelKey: 'nav.fertilizer', sublabelKey: 'dashboard.labels.soil_analysis', color: 'from-orange-400 to-orange-500',bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  { to: '/labour',     icon: Users,        labelKey: 'nav.labour',     sublabelKey: 'dashboard.labels.hire_workers',  color: 'from-purple-400 to-purple-600',bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  { to: '/map',        icon: Map,          labelKey: 'nav.map',        sublabelKey: 'dashboard.labels.smart_map',     color: 'from-teal-400 to-teal-600',   bg: 'bg-teal-50 dark:bg-teal-900/20',   text: 'text-teal-600 dark:text-teal-400' },
];

const WEATHER_EMOJIS = { '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const getWeatherEmoji = (icon) => WEATHER_EMOJIS[icon?.slice(0, 2)] || '🌡️';

const tips = [
  { 
    title: 'Soil Health', 
    body: 'Test your soil every 2 years to optimize fertilizer usage and save costs.', 
    icon: '🧪', 
    color: 'bg-indigo-50 dark:bg-indigo-900/10', 
    border: 'border-indigo-100 dark:border-indigo-900/30' 
  },
  { 
    title: 'Watering Tip', 
    body: 'Early morning irrigation reduces evaporation and prevents fungal growth.', 
    icon: '💧', 
    color: 'bg-emerald-50 dark:bg-emerald-900/10', 
    border: 'border-emerald-100 dark:border-emerald-900/30' 
  }
];

const recentAlerts = [
  { type: 'info',    icon: '📢', text: 'New PM-Kisan installment credited',    action: 'View Details',  color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-300',   btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { type: 'warning', icon: '🦗', text: 'Locust warning in neighboring district', action: 'See Alert',    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-300', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
  { type: 'success', icon: '📈', text: 'Wheat prices up by 5% today',           action: 'Check Mandi',  color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-300',  btn: 'bg-green-600 hover:bg-green-700 text-white' },
];

function getGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'dashboard.greeting_morning';
  if (h < 17) return 'dashboard.greeting_afternoon';
  return 'dashboard.greeting_evening';
}

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { t, i18n } = useTranslation();
  
  const greetingKey = getGreetingKey();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-US';

  // Weather Query
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather-current'],
    queryFn: async () => {
      return new Promise((resolve) => {
        navigator.geolocation?.getCurrentPosition(
          async ({ coords }) => {
            const { data } = await weatherAPI.getCurrent(coords.latitude, coords.longitude);
            resolve(data.data);
          },
          async () => {
            const { data } = await weatherAPI.getCurrent(24.6005, 80.8322); // Satna fallback
            resolve(data.data);
          }
        );
      });
    },
    staleTime: 15 * 60 * 1000, // 15 mins
  });

  // Stats Query
  const { data: stats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', weather?.city],
    queryFn: async () => {
      const city = weather?.city || '';
      const [marketRes, labourRes] = await Promise.all([
        marketAPI.getTrends('Wheat', '', city),
        labourAPI.getJobs({ district: city, limit: 1 })
      ]);

      const newStats = [];

      // 1. Market Price
      if (marketRes.data?.success) {
        const trends = marketRes.data.data.trends;
        const latest = trends[trends.length - 1];
        const previous = trends[trends.length - 2];
        const trendVal = previous ? (((latest.price - previous.price) / previous.price) * 100).toFixed(1) : '0';
        
        newStats.push({
          label: t('dashboard.stats.market_price'),
          value: `₹${latest.price.toLocaleString()}/Q`,
          icon: '💰',
          trend: `${trendVal > 0 ? '+' : ''}${trendVal}%`,
          up: trendVal >= 0,
          sub: 'Wheat today'
        });
      }

      // 2. Labour
      if (labourRes.data?.success) {
        const total = labourRes.data.pagination.total;
        newStats.push({
          label: t('dashboard.stats.labour'),
          value: total.toString(),
          icon: '👷',
          trend: '+1',
          up: true,
          sub: t('dashboard.labels.available_now')
        });
      }

      // 3. Weather Stats
      if (weather) {
        newStats.push({
          label: t('weather.temp', 'Temperature'),
          value: `${Math.round(weather.temperature)}°C`,
          icon: '🌡️',
          trend: weather.temperature > 30 ? 'High' : 'Normal',
          up: weather.temperature < 35,
          sub: weather.city
        });
        
        newStats.push({
          label: t('weather.humidity', 'Humidity'),
          value: `${weather.humidity}%`,
          icon: '💧',
          trend: '-2%',
          up: false,
          sub: 'Air Humidity'
        });
      }
      return newStats;
    },
    enabled: !weatherLoading,
  });

  return (
    <div className="page-wrapper animate-fade-in">

      {/* ── Top row: greeting + date ──────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-2 text-gray-900 dark:text-white">
            <span>{t(greetingKey)}</span>
            <span>{user?.name?.split(' ')[0] || t('auth.farmer')}</span>
          </h1>
          <p className="page-subtitle flex items-center gap-1.5 mt-1.5 text-gray-500 dark:text-slate-400">
            <Calendar size={13} />
            <span className="capitalize">
              {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.reload()} className="btn-icon bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm" title="Refresh">
            <RefreshCw size={16} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── Alerts strip ──────────────────────────────── */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-none mb-8 -mx-4 sm:mx-0 sm:px-0">
        {recentAlerts.map((a, i) => (
          <div key={i} className={clsx(
            'flex items-center justify-between gap-4 pl-4 pr-2 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap shrink-0 border shadow-sm min-w-[280px] first:ml-4 sm:first:ml-0 last:mr-4 sm:last:mr-0',
            a.color
          )}>
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{a.icon}</span>
              <span className="text-xs font-bold leading-tight max-w-[150px] whitespace-normal">{a.text}</span>
            </div>
            <button className={clsx('text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl shrink-0 transition-all active:scale-95', a.btn)}>
              {a.action}
            </button>
          </div>
        ))}
      </div>

      {/* ── Weather card ──────────────────────────────────── */}
      {weatherLoading ? (
        <div className="skeleton h-32 mb-7 rounded-3xl" />
      ) : weather ? (
        <div className="mb-7 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 dark:from-primary/80 dark:to-emerald-800/80 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5 sm:gap-8">
              <span className="text-5xl sm:text-7xl drop-shadow-md">{getWeatherEmoji(weather.icon)}</span>
              <div>
                <p className="text-emerald-50 text-[10px] font-black tracking-[0.2em] uppercase opacity-80 mb-1">{weather.city}, {weather.country}</p>
                <div className="flex items-end gap-3">
                  <p className="text-5xl sm:text-6xl font-black tracking-tighter">{Math.round(weather.temperature)}°</p>
                  <p className="text-emerald-100 text-base sm:text-xl font-bold mb-1.5 capitalize opacity-90">{weather.description}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:flex sm:flex-col gap-4 text-emerald-50 bg-black/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <span className="flex items-center gap-2 text-sm font-semibold"><Droplets size={16} className="text-emerald-300" /> {weather.humidity}%</span>
              <span className="flex items-center gap-2 text-sm font-semibold"><Wind size={16} className="text-emerald-300" /> {weather.windSpeed} km/h</span>
            </div>

            <button
              onClick={() => navigate('/weather')}
              className="self-start sm:self-center flex items-center gap-2 bg-white text-primary hover:bg-emerald-50 font-bold px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95">
              {t('dashboard.labels.details')} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Quick Actions ─────────────────────────────────── */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">{t('dashboard.quick_actions')}</h2>
        <div className="grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {quickActions.map(({ to, icon: Icon, labelKey, sublabelKey, color, bg, text }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group relative overflow-hidden rounded-[2rem] p-5 sm:p-6 text-left bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-2 active:scale-95 transition-all duration-500 animate-slide-up"
            >
              <div className={clsx('absolute top-0 inset-x-0 h-1 bg-gradient-to-r opacity-50', color)} />
              <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-3', bg)}>
                <Icon size={26} className={text} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-base leading-tight tracking-tight">{t(labelKey)}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 uppercase font-black tracking-widest opacity-80">{t(sublabelKey)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)
        ) : stats.map(s => (
          <div key={s.label} className="group p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-700/50 flex flex-col gap-1 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <span className="text-4xl group-hover:scale-110 transition-transform">{s.icon}</span>
              <span className={clsx(
                'text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-tighter',
                s.up ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              )}>
                {s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {s.trend}
              </span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-3 tracking-tighter tabular-nums">{s.value}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide opacity-80">{s.label}</p>
            <div className="mt-2 h-1 w-full bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all duration-1000', s.up ? 'bg-green-500 w-2/3' : 'bg-red-500 w-1/3')} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Tips Row ──────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {tips.map(tip => (
          <div key={tip.title} className={clsx('card p-6 border transition-all hover:shadow-lg', tip.color, tip.border)}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                {tip.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 text-sm uppercase tracking-wide">{tip.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed font-medium">{tip.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ── Voice Assistant ──────────────────────────── */}
      {/* Moved to App.jsx — now global across all pages */}
    </div>
  );
}
