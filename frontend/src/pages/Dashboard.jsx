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

      {/* ── Alerts strip ──────────────────────────────────── */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none mb-7">
        {recentAlerts.map((a, i) => (
          <div key={i} className={clsx(
            'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border shadow-sm transition-colors',
            a.type === 'warning' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
            a.type === 'info'    && 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
            a.type === 'success' && 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-100 dark:border-green-900/30',
          )}>
            <span>{a.icon}</span>
            {a.text}
          </div>
        ))}
      </div>

      {/* ── Weather card ──────────────────────────────────── */}
      {weatherLoading ? (
        <div className="skeleton h-32 mb-7 rounded-3xl" />
      ) : weather ? (
        <div className="mb-7 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 dark:from-primary/80 dark:to-emerald-800/80 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="text-6xl drop-shadow-md">{getWeatherEmoji(weather.icon)}</span>
              <div>
                <p className="text-emerald-100 text-sm font-bold tracking-wide uppercase opacity-80">{weather.city}, {weather.country}</p>
                <div className="flex items-end gap-2">
                  <p className="text-5xl font-bold tracking-tighter">{Math.round(weather.temperature)}°</p>
                  <p className="text-emerald-100 text-lg font-medium mb-1.5 capitalize">{weather.description}</p>
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
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 tracking-tight">{t('dashboard.quick_actions')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map(({ to, icon: Icon, labelKey, sublabelKey, color, bg, text }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="group relative overflow-hidden rounded-2xl p-5 text-left bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300">
              <div className={clsx('absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r', color)} />
              <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:rotate-6 transition-transform', bg)}>
                <Icon size={22} className={text} />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{t(labelKey)}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-wider">{t(sublabelKey)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)
        ) : stats.map(s => (
          <div key={s.label} className="card p-5 bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 flex flex-col gap-1 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{s.icon}</span>
              <span className={clsx(
                'text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1',
                s.up ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
              )}>
                {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {s.trend}
              </span>
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-2 tracking-tight">{s.value}</p>
            <p className="text-sm font-bold text-gray-500 dark:text-slate-400">{s.label}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-widest mt-1">{s.sub}</p>
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
    </div>
  );
}
