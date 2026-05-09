import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  Cloud, Leaf, TrendingUp, Users, FlaskConical, Map,
  ArrowRight, AlertTriangle, RefreshCw, Droplets, Wind,
  Bell, TrendingDown, Calendar, FileDown, CheckCircle2,
  Newspaper, Landmark, ShieldCheck, Sparkles, Zap, Sun, Award
} from 'lucide-react';
import { weatherAPI, marketAPI, labourAPI } from '../services/api';
import clsx from 'clsx';

const WEATHER_EMOJIS = { '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const getWeatherEmoji = (icon) => WEATHER_EMOJIS[icon?.slice(0, 2)] || '🌡️';

function getGreetingKey() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'dashboard.greeting_morning';
  if (h >= 12 && h < 17) return 'dashboard.greeting_afternoon';
  if (h >= 17 && h < 22) return 'dashboard.greeting_evening';
  return 'dashboard.greeting_night';
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
      const { data } = await weatherAPI.getCurrent(24.6005, 80.8322);
      return data.data;
    },
    staleTime: 15 * 60 * 1000,
  });

  // Market Query
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['market-trends-dashboard'],
    queryFn: async () => {
       const { data } = await marketAPI.getTrends('Wheat', '', 'Satna');
       return data.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const modules = [
    { 
      id: 'weather', 
      to: '/weather', 
      size: 'lg',
      color: 'bg-gradient-to-br from-primary to-emerald-600',
      icon: Cloud,
      label: t('nav.weather'),
      isLoading: weatherLoading,
      render: () => (
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-4xl sm:text-5xl mb-2">{getWeatherEmoji(weather?.icon)}</div>
               <div className="text-3xl sm:text-4xl font-black">{Math.round(weather?.temperature || 0)}°C</div>
               <div className="text-xs font-bold uppercase tracking-widest opacity-80">{weather?.description || t('dashboard.loading')}</div>
             </div>
             <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{weather?.city || 'Satna'}</div>
                <div className="flex flex-col items-end gap-1">
                   <span className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm"><Droplets size={10} /> {weather?.humidity}%</span>
                   <span className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm"><Wind size={10} /> {weather?.windSpeed} km/h</span>
                </div>
             </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
             <span className="text-emerald-100">{t('dashboard.live_imd')}</span>
             <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )
    },
    { 
      id: 'crop', 
      to: '/crop', 
      size: 'md',
      color: 'card hover:border-emerald-500/30',
      icon: Leaf,
      label: t('nav.crop'),
      render: () => (
        <div className="flex flex-col h-full">
           <div className="flex items-center gap-3 mb-4">
              <Leaf size={24} className="text-emerald-500" />
              <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('nav.crop')}</div>
           </div>
           <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold leading-tight">{t('dashboard.crop_system')}</p>
           <div className="mt-auto flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">{t('dashboard.ai_ready')}</span>
           </div>
        </div>
      )
    },
    { 
      id: 'market', 
      to: '/market', 
      size: 'md',
      color: 'card hover:border-blue-500/30',
      icon: TrendingUp,
      label: t('nav.market'),
      render: () => {
        const latest = marketData?.trends?.[marketData.trends.length - 1];
        const trend = 2.4;
        return (
          <div className="flex flex-col h-full">
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <TrendingUp size={24} className="text-blue-500" />
                   <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('nav.market')}</div>
                </div>
                <div className="text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">+{trend}%</div>
             </div>
             <div className="mt-auto">
                <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">₹{latest?.price?.toLocaleString() || '---'}</div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t('dashboard.mandi_desc')}</p>
             </div>
          </div>
        );
      }
    },
    { 
      id: 'fertilizer', to: '/fertilizer', size: 'sm',
      color: 'card hover:border-orange-500/30 flex items-center gap-4',
      icon: FlaskConical, label: t('nav.fertilizer'),
      render: () => ( <><FlaskConical size={20} className="text-orange-500" /><div className="text-xs font-black text-gray-900 dark:text-white uppercase">{t('nav.fertilizer')}</div></> )
    },
    { 
      id: 'labour', to: '/labour', size: 'sm',
      color: 'card hover:border-purple-500/30 flex items-center gap-4',
      icon: Users, label: t('nav.labour'),
      render: () => ( <><Users size={20} className="text-purple-500" /><div className="text-xs font-black text-gray-900 dark:text-white uppercase">{t('nav.labour')}</div></> )
    },
    { 
      id: 'news', to: '/news', size: 'sm',
      color: 'card hover:border-sky-500/30 flex items-center gap-4',
      icon: Newspaper, label: t('nav.news'),
      render: () => ( <><Newspaper size={20} className="text-sky-500" /><div className="text-xs font-black text-gray-900 dark:text-white uppercase">{t('nav.news')}</div></> )
    },
    { 
      id: 'schemes', to: '/schemes', size: 'sm',
      color: 'card hover:border-amber-500/30 flex items-center gap-4',
      icon: Landmark, label: t('nav.schemes'),
      render: () => ( <><Landmark size={20} className="text-amber-500" /><div className="text-xs font-black text-gray-900 dark:text-white uppercase">{t('nav.schemes')}</div></> )
    },
    { 
      id: 'map', to: '/map', size: 'md',
      color: 'card hover:border-teal-500/30',
      icon: Map, label: t('nav.map'),
      render: () => (
        <div className="flex flex-col h-full">
           <div className="flex items-center gap-3 mb-4">
              <Map size={24} className="text-teal-500" />
              <div className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('nav.map')}</div>
           </div>
           <p className="text-[10px] text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-auto">{t('dashboard.map_desc')}</p>
        </div>
      )
    },
  ];

  const alerts = [
    { type: 'warning', text: t('dashboard.alerts.locust'), icon: '🦗' },
    { type: 'success', text: t('dashboard.alerts.pms'), icon: '💰' },
    { type: 'info', text: t('dashboard.alerts.wheat'), icon: '🌾' }
  ];

  return (
    <div className="page-wrapper max-w-7xl mx-auto px-4 sm:px-6">
      {/* ── Header Command Bar ──────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
           <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                 {t('dashboard.command_center')}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1 rounded-full border border-gray-100 dark:border-slate-800 shadow-sm">
                 <RefreshCw size={10} className="text-emerald-500 animate-spin-slow" /> {t('dashboard.live_sync')}
              </span>
           </div>
           <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-3 leading-none">
              {t(greetingKey)}, {user?.name?.split(' ')[0] || t('auth.farmer')} <Sparkles className="text-amber-400" size={28} />
           </h1>
           <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-3 flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-slate-800 rounded-xl">Personal</button>
              <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Farm Data</button>
           </div>
           <button onClick={() => window.location.reload()} className="w-11 h-11 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all group">
              <RefreshCw size={18} className="text-gray-500 group-hover:rotate-180 transition-transform duration-500" />
           </button>
        </div>
      </div>

      {/* ── Alerts News Ticker ──────────────────────────── */}
      <div className="relative mb-10 group cursor-pointer overflow-hidden rounded-2xl bg-gray-900 p-1 border border-white/5 shadow-xl">
         <div className="flex items-center h-10 px-4 gap-6 animate-ticker hover:pause">
            {[...alerts, ...alerts].map((a, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                 <span className="text-lg">{a.icon}</span>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{a.text}</span>
                 <div className="h-1 w-1 rounded-full bg-white/20 ml-4" />
              </div>
            ))}
         </div>
      </div>

      {/* ── The Bento Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto">
         {modules.map((m) => (
           <div
             key={m.id}
             onClick={() => navigate(m.to)}
             className={clsx(
               "group relative cursor-pointer overflow-hidden",
               m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 rounded-[2rem] p-8' : 
               m.size === 'md' ? 'col-span-1 sm:col-span-1 row-span-1' : 'col-span-1 sm:col-span-1 row-span-1 !p-5',
               m.id === 'weather' ? 'text-white shadow-xl hover:-translate-y-1 transition-all duration-300' : 'dark:text-white',
               m.color
             )}
           >
             {m.id === 'weather' && (
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
             )}
             {m.render()}
           </div>
         ))}

         {/* Extra Bento Items: Support Card */}
         <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl hover:-translate-y-1 transition-all" onClick={() => navigate('/chat')}>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <div className="flex items-center gap-4 mb-4">
               <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Zap size={20} />
               </div>
               <div className="text-[10px] font-black uppercase tracking-[0.2em]">{t('dashboard.kisan_mitra')}</div>
            </div>
            <h3 className="text-lg font-black tracking-tight leading-tight">{t('dashboard.expert_advisory')}</h3>
         </div>

         {/* Secondary Stats Card */}
         <div className="col-span-1 sm:col-span-2 lg:col-span-2 card flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Schemes</span>
               <Award className="text-amber-500" size={18} />
            </div>
            <div>
               <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">12 <span className="text-xs text-gray-400 font-bold">New</span></div>
               <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Available for you</p>
            </div>
         </div>
      </div>

      {/* ── Bottom Section: Quick Tips & Info ──────────────── */}
      <div className="mt-12 grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
               <ShieldCheck className="text-emerald-500" size={20} /> {t('dashboard.farming_intel')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
               {[
                 { title: t('dashboard.tips.soil.title'), desc: t('dashboard.tips.soil.desc'), icon: '🧪', color: 'border-indigo-100 dark:border-indigo-900/30' },
                 { title: t('dashboard.tips.market.title'), desc: t('dashboard.tips.market.desc'), icon: '📉', color: 'border-emerald-100 dark:border-emerald-900/30' }
               ].map((tip, i) => (
                 <div key={i} className={clsx("p-6 rounded-3xl border bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all", tip.color)}>
                    <div className="flex items-start gap-4">
                       <span className="text-2xl">{tip.icon}</span>
                       <div>
                          <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-wide mb-1">{tip.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{tip.desc}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-gray-50 dark:bg-slate-900/80 rounded-[2.5rem] p-8 border border-gray-100 dark:border-slate-800">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">{t('dashboard.sync_status')}</h3>
            <div className="space-y-6">
               {[
                 { label: t('dashboard.nodes.sat'), status: 'Optimal', color: 'bg-green-500' },
                 { label: t('dashboard.nodes.market'), status: 'Stable', color: 'bg-green-500' },
                 { label: t('dashboard.nodes.ai'), status: 'Active', color: 'bg-emerald-500' }
               ].map(node => (
                 <div key={node.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{node.label}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black uppercase text-gray-900 dark:text-white">{node.status}</span>
                       <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", node.color)} />
                    </div>
                 </div>
               ))}
            </div>
            <button onClick={() => navigate('/news')} className="w-full mt-10 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all">
               {t('dashboard.view_logs')}
            </button>
         </div>
      </div>

      {/* ── Custom Animations ─────────────────────────────── */}
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pause {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
