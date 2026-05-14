import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  Cloud, Leaf, TrendingUp, Users, FlaskConical, Map,
  ArrowRight, AlertTriangle, RefreshCw, Droplets, Wind,
  Bell, TrendingDown, Calendar, FileDown, CheckCircle2,
  Newspaper, Landmark, ShieldCheck, Sparkles, Zap, Sun, Award,
  ChevronRight, Activity
} from 'lucide-react';
import { weatherAPI, marketAPI, labourAPI } from '../services/api';
import clsx from 'clsx';
import logo from '../assets/logo.png';

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
  const { data: weather } = useQuery({
    queryKey: ['weather-current'],
    queryFn: async () => {
      try {
        const { data } = await weatherAPI.getCurrent(24.6005, 80.8322);
        return data.data;
      } catch {
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Market Query
  const { data: marketData } = useQuery({
    queryKey: ['market-trends-dashboard'],
    queryFn: async () => {
       const { data } = await marketAPI.getTrends('Wheat', 'Madhya Pradesh', 'Satna');
       return data.data;
    },
    staleTime: 30 * 60 * 1000,
    retry: false,
    onError: () => null,
  });

  const modules = [
    { 
      id: 'weather', 
      to: '/weather', 
      size: 'lg',
      color: 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-500/30',
      icon: Cloud,
      label: t('nav.weather'),
      render: () => (
        <div className="flex flex-col h-full justify-between relative z-10 text-white">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-5xl sm:text-6xl mb-3">{getWeatherEmoji(weather?.icon)}</div>
               <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">{Math.round(weather?.temperature || 0)}°C</div>
               <div className="text-sm font-medium opacity-90 mt-1 capitalize">{weather?.description || t('dashboard.loading')}</div>
             </div>
             <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-2">{weather?.city || 'Satna'}</div>
                <div className="flex flex-col items-end gap-2">
                   <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm"><Droplets size={12} /> {weather?.humidity}%</span>
                   <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm"><Wind size={12} /> {weather?.windSpeed} km/h</span>
                </div>
             </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 flex justify-between items-center text-xs font-bold uppercase tracking-widest">
             <span className="text-blue-100 flex items-center gap-2"><Activity size={14} className="animate-pulse text-blue-300"/> {t('dashboard.live_imd')}</span>
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 transition-colors">
               <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
             </div>
          </div>
        </div>
      )
    },
    { 
      id: 'crop', 
      to: '/crop', 
      size: 'md',
      color: 'card hover:border-emerald-500/30 group',
      icon: Leaf,
      label: t('nav.crop'),
      render: () => (
        <div className="flex flex-col h-full">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Leaf size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
           </div>
           <div className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{t('nav.crop')}</div>
           <p className="text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed mt-1 mb-4">{t('dashboard.crop_system')}</p>
           <div className="mt-auto flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">{t('dashboard.ai_ready')}</span>
           </div>
        </div>
      )
    },
    { 
      id: 'market', 
      to: '/market', 
      size: 'md',
      color: 'card hover:border-violet-500/30 group',
      icon: TrendingUp,
      label: t('nav.market'),
      render: () => {
        const latest = marketData?.trends?.[marketData.trends.length - 1];
        const trend = 2.4;
        return (
          <div className="flex flex-col h-full">
             <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                   <TrendingUp size={24} className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  <TrendingUp size={10} /> +{trend}%
                </div>
             </div>
             <div className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{t('nav.market')}</div>
             <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800">
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{latest?.price?.toLocaleString() || '---'}</div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">{t('dashboard.mandi_desc')}</p>
             </div>
          </div>
        );
      }
    },
    { 
      id: 'fertilizer', to: '/fertilizer', size: 'sm',
      color: 'card hover:border-amber-500/30 flex items-center justify-between group',
      icon: FlaskConical, label: t('nav.fertilizer'),
      render: () => ( 
        <>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <FlaskConical size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t('nav.fertilizer')}</div>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </> 
      )
    },
    { 
      id: 'labour', to: '/labour', size: 'sm',
      color: 'card hover:border-rose-500/30 flex items-center justify-between group',
      icon: Users, label: t('nav.labour'),
      render: () => ( 
        <>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <Users size={20} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t('nav.labour')}</div>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
        </> 
      )
    },
    { 
      id: 'news', to: '/news', size: 'sm',
      color: 'card hover:border-sky-500/30 flex items-center justify-between group',
      icon: Newspaper, label: t('nav.news'),
      render: () => ( 
        <>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center">
              <Newspaper size={20} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t('nav.news')}</div>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
        </> 
      )
    },
    { 
      id: 'schemes', to: '/schemes', size: 'sm',
      color: 'card hover:border-fuchsia-500/30 flex items-center justify-between group',
      icon: Landmark, label: t('nav.schemes'),
      render: () => ( 
        <>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/20 flex items-center justify-center">
              <Landmark size={20} className="text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t('nav.schemes')}</div>
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-fuchsia-500 group-hover:translate-x-1 transition-all" />
        </> 
      )
    },
    { 
      id: 'map', to: '/map', size: 'md',
      color: 'card hover:border-teal-500/30 group',
      icon: Map, label: t('nav.map'),
      render: () => (
        <div className="flex flex-col h-full">
           <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                <Map size={24} className="text-teal-600 dark:text-teal-400" />
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
           </div>
           <div className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{t('nav.map')}</div>
           <p className="text-xs text-gray-500 dark:text-slate-400 font-medium leading-relaxed mt-1">{t('dashboard.map_desc')}</p>
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16">
        
        {/* Subtle Background SaaS Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full" />
          <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-600/5 blur-[120px] rounded-full" />
        </div>

        {/* ── Header Command Bar ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-200 dark:border-indigo-500/20">
                  {t('dashboard.command_center')}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <RefreshCw size={12} className="text-indigo-500 animate-spin-slow" /> {t('dashboard.live_sync')}
                </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-6 leading-tight">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-600 shadow-xl shadow-indigo-500/20 flex items-center justify-center flex-shrink-0 animate-scale-up">
                   {user?.image
                     ? <img src={user.image} alt={user?.name || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     : <img src={logo} alt="Smart Kisan" className="w-full h-full object-contain scale-110 p-3" />
                   }
                </div>
                <span>{t(greetingKey)}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || t('auth.farmer')}</span></span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-4 flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" /> {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                <button className="px-5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg shadow-sm">{t('dashboard.personal') || 'Personal'}</button>
                <button className="px-5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">{t('dashboard.farm_data') || 'Farm Data'}</button>
            </div>
          </div>
        </div>

        {/* ── The Bento Grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-auto">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.to)}
              className={clsx(
                "relative cursor-pointer overflow-hidden transition-all duration-300",
                m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 rounded-3xl p-6 sm:p-8' : 
                m.size === 'md' ? 'col-span-1 sm:col-span-1 row-span-1 rounded-3xl p-6' : 'col-span-1 sm:col-span-1 row-span-1 rounded-2xl p-5',
                m.id === 'weather' ? 'text-white shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-600/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:text-white shadow-sm hover:shadow-lg',
                "hover:-translate-y-1 active:scale-[0.98]",
                m.color // For border hover effects defined in array
              )}
            >
              {m.id === 'weather' && (
                  <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              )}
              {m.render()}
            </div>
          ))}

          {/* Extra Bento Items: Support Card */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-500/20 hover:-translate-y-1 transition-all" onClick={() => navigate('/chat')}>
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-100">{t('dashboard.kisan_mitra')}</div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight leading-tight relative z-10 max-w-sm">{t('dashboard.expert_advisory')}</h3>
          </div>

          {/* Secondary Stats Card */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.active_schemes')}</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <Award className="text-amber-500" size={20} />
                </div>
              </div>
              <div>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  12 
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1 rounded-full font-bold border border-indigo-100 dark:border-indigo-800">NEW</span>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">{t('dashboard.available_for_you')}</p>
              </div>
          </div>
        </div>

        {/* ── Bottom Section: Quick Tips & Info ──────────────── */}
        <div className="mt-10 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <ShieldCheck className="text-indigo-500" size={18} /> {t('dashboard.farming_intel')}
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { title: t('dashboard.tips.soil.title'), desc: t('dashboard.tips.soil.desc'), icon: '🧪', color: 'bg-white dark:bg-slate-900' },
                  { title: t('dashboard.tips.market.title'), desc: t('dashboard.tips.market.desc'), icon: '📉', color: 'bg-white dark:bg-slate-900' }
                ].map((tip, i) => (
                  <div key={i} className={clsx("p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all", tip.color)}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-100 dark:border-slate-700">
                          {tip.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{tip.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                  </div>
                ))}
              </div>

              {/* ── Intelligence Feed ─────────────────────────── */}
              <div className="mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('dashboard.recent_alerts')}</h3>
                  <Bell size={16} className="text-slate-400" />
                </div>
                <div className="space-y-3 relative z-10">
                  {alerts.map((alert, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer group/alert">
                        <div className="text-xl shrink-0 group-hover/alert:scale-110 transition-transform">{alert.icon}</div>
                        <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">{alert.text}</p>
                      </div>
                  ))}
                </div>
              </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">{t('dashboard.sync_status')}</h3>
                <div className="space-y-5">
                  {[
                    { label: t('dashboard.nodes.sat'), status: 'Optimal', color: 'bg-emerald-500' },
                    { label: t('dashboard.nodes.market'), status: 'Stable', color: 'bg-emerald-500' },
                    { label: t('dashboard.nodes.ai'), status: 'Active', color: 'bg-indigo-500' }
                  ].map(node => (
                    <div key={node.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{node.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{node.status}</span>
                          <div className={clsx("w-2 h-2 rounded-full shadow-sm animate-pulse", node.color)} />
                        </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/news')} className="w-full mt-8 py-3.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                  <Activity size={14} /> {t('dashboard.view_logs')}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
