import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import {
  CloudSun, Plant, TrendUp, Users, Flask, MapPin,
  ArrowRight, WarningCircle, ArrowCounterClockwise, Drop, Wind,
  Bell, TrendDown, Calendar, FileArrowDown, CheckCircle,
  Newspaper, Bank, ShieldCheck, ChatCircleText, Lightning, Sun, Trophy,
  CaretRight, Pulse, Bug, ChartLineUp, TestTube, Sparkle, Storefront, Star
} from '@phosphor-icons/react';
import { weatherAPI, marketAPI, labourAPI } from '../services/api';
import clsx from 'clsx';
import logo from '../assets/kisan-logo-new.jpg';
import { RealisticSun, RealisticCloud } from '../components/WeatherIcons';

const WEATHER_EMOJIS = { '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const getWeatherEmoji = (icon) => {
  const code = icon?.slice(0, 2);
  if (code === '01') return <RealisticSun size={64} className="animate-pulse" />;
  if (code === '02' || code === '03') return (
    <div className="relative">
      <RealisticSun size={48} className="absolute -top-3 -right-3" />
      <RealisticCloud size={64} />
    </div>
  );
  if (code === '04') return <RealisticCloud size={64} />;
  return <div className="text-6xl">{WEATHER_EMOJIS[code] || '🌡️'}</div>;
};

function getGreetingKey() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'dashboard.greeting_morning';
  if (h >= 12 && h < 17) return 'dashboard.greeting_afternoon';
  if (h >= 17 && h < 22) return 'dashboard.greeting_evening';
  return 'dashboard.greeting_night';
}

const Sparkline = ({ color = "#10b981" }) => (
  <svg viewBox="0 0 100 30" className="w-24 h-8 overflow-visible">
    <path
      d="M0,25 C10,20 15,28 25,15 C35,2 45,18 55,10 C65,2 75,15 85,5 L100,8"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      className="animate-draw"
      style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw 2s ease-out forwards' }}
    />
  </svg>
);

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
  });

  // Market Query
  const { data: marketData } = useQuery({
    queryKey: ['market-trends-dashboard'],
    queryFn: async () => {
       const { data } = await marketAPI.getTrends('Wheat', 'Madhya Pradesh', 'Satna');
       return data.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const modules = [
    { 
      id: 'weather', 
      to: '/weather', 
      size: 'lg',
      color: 'card hover:border-sky-400 hover:shadow-premium bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 shadow-indigo-500/40 relative overflow-hidden group',
      icon: CloudSun,
      label: t('nav.weather'),
      render: () => (
        <div className="flex flex-col h-full justify-between relative z-10 text-white">
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="flex justify-between items-start">
             <div className="relative z-20">
               <div className="mb-6 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">{getWeatherEmoji(weather?.icon)}</div>
               <div className="flex items-start">
                 <div className="text-6xl sm:text-8xl font-black tracking-tighter drop-shadow-xl font-outfit">
                   {Math.round(weather?.temperature || 0)}
                 </div>
                 <span className="text-3xl font-light opacity-80 mt-2 ml-1">°C</span>
               </div>
               <div className="text-sm font-bold opacity-100 mt-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit border border-white/20 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 {weather?.description || t('dashboard.loading')}
               </div>
             </div>
             <div className="text-right relative z-20">
                <div className="flex items-center justify-end gap-2 text-[11px] font-black uppercase tracking-widest opacity-90 mb-6 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl shadow-inner border border-white/10">
                  <MapPin size={16} weight="fill" className="text-red-400 animate-bounce" /> {weather?.city || 'Satna'}
                </div>
                <div className="flex flex-col items-end gap-4">
                   <div className="flex flex-col items-end bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5 group-hover:bg-white/20 transition-colors">
                     <span className="text-[10px] uppercase font-black opacity-70 mb-0.5 tracking-wider">{t('weather.humidity')}</span>
                     <span className="flex items-center gap-2 text-base font-black"><Drop size={18} weight="duotone" className="text-blue-200" /> {weather?.humidity}%</span>
                   </div>
                   <div className="flex flex-col items-end bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm border border-white/5 group-hover:bg-white/20 transition-colors">
                     <span className="text-[10px] uppercase font-black opacity-70 mb-0.5 tracking-wider">{t('weather.wind')}</span>
                     <span className="flex items-center gap-2 text-base font-black"><Wind size={18} weight="bold" className="text-blue-100" /> {weather?.windSpeed} <span className="text-[10px]">km/h</span></span>
                   </div>
                </div>
             </div>
          </div>
          <div className="mt-8 pt-5 border-t border-white/20 flex justify-between items-center relative z-20">
             <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,1)]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-50 drop-shadow-sm">{t('dashboard.live_imd')}</span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-indigo-600 transition-all duration-300 shadow-lg border border-white/30 cursor-pointer">
               <ArrowRight size={22} weight="bold" className="group-hover:translate-x-1.5 transition-transform" />
             </div>
          </div>
        </div>
      )
    },
    { 
      id: 'crop', 
      to: '/crop', 
      size: 'md',
      color: 'card hover:border-emerald-500/40 hover:shadow-premium group overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60',
      icon: Plant,
      label: t('nav.crop'),
      render: () => (
        <div className="flex flex-col h-full relative z-10">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 group-hover:scale-150 transition-all duration-700 ease-out" />
            <div className="flex items-center justify-between mb-6 relative z-20">
              <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Plant size={32} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="bg-white/80 dark:bg-emerald-500/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <Sparkle size={18} weight="fill" className="text-emerald-500 animate-pulse" />
              </div>
           </div>
           <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 font-outfit relative z-20">{t('nav.crop')}</div>
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 relative z-20">{t('dashboard.crop_system')}</p>
           <div className="mt-auto pt-6 border-t border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">{t('dashboard.ai_ready')}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>
           </div>
        </div>
      )
    },
    { 
      id: 'market', 
      to: '/market', 
      size: 'md',
      color: 'card hover:border-violet-500/40 hover:shadow-premium group overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60',
      icon: TrendUp,
      label: t('nav.market'),
      render: () => {
        const latest = marketData?.trends?.[marketData.trends.length - 1];
        return (
          <div className="flex flex-col h-full relative z-10">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 group-hover:scale-150 transition-all duration-700 ease-out" />
             <div className="flex justify-between items-start mb-6 relative z-20">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/40 dark:to-violet-800/20 flex items-center justify-center border border-violet-200 dark:border-violet-700/50 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                   <TrendUp size={32} weight="duotone" className="text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                     <TrendUp size={14} weight="bold" /> +2.4%
                   </div>
                   <div className="mt-3 bg-white/50 dark:bg-slate-800/50 rounded-lg px-2 py-1 backdrop-blur-sm"><Sparkline /></div>
                </div>
             </div>
             <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 font-outfit relative z-20">{t('nav.market')}</div>
             <div className="mt-auto pt-6 border-t border-violet-100 dark:border-violet-900/30 flex items-end justify-between relative z-20">
                <div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">₹{latest?.price?.toLocaleString() || '2,450'}</div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider mt-1">{t('dashboard.mandi_desc')}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-violet-50 dark:group-hover:bg-violet-900/30 transition-colors mb-1">
                  <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
             </div>
          </div>
        );
      }
    },
    { 
      id: 'fertilizer', to: '/fertilizer', size: 'sm',
      color: 'card hover:border-amber-500/40 hover:shadow-premium flex items-center justify-between group py-5 px-6 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden',
      icon: Flask, label: t('nav.fertilizer'),
      render: () => ( 
        <>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/20 flex items-center justify-center border border-amber-200 dark:border-amber-700/50 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 shadow-md">
              <Flask size={28} weight="duotone" className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">{t('nav.fertilizer')}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{t('fertilizer.ai_verified')}</div>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-amber-50 dark:group-hover:bg-amber-900/30 transition-colors relative z-10">
            <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </> 
      )
    },
    { 
      id: 'labour', to: '/labour', size: 'sm',
      color: 'card hover:border-rose-500/40 hover:shadow-premium flex items-center justify-between group py-5 px-6 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden',
      icon: Users, label: t('nav.labour'),
      render: () => ( 
        <>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/40 dark:to-rose-800/20 flex items-center justify-center border border-rose-200 dark:border-rose-700/50 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-md">
              <Users size={28} weight="duotone" className="text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">{t('nav.labour')}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t('labour.verified_post')}</div>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-rose-50 dark:group-hover:bg-rose-900/30 transition-colors relative z-10">
            <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </> 
      )
    },
    { 
      id: 'news', to: '/news', size: 'sm',
      color: 'card hover:border-sky-500/40 hover:shadow-premium flex items-center justify-between group py-5 px-6 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden',
      icon: Newspaper, label: t('nav.news'),
      render: () => ( 
        <>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all duration-500" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/40 dark:to-sky-800/20 flex items-center justify-center border border-sky-200 dark:border-sky-700/50 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-md">
              <Newspaper size={28} weight="duotone" className="text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">{t('nav.news')}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">{t('dashboard.live_sync')}</div>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-sky-50 dark:group-hover:bg-sky-900/30 transition-colors relative z-10">
            <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </> 
      )
    },
    { 
      id: 'schemes', to: '/schemes', size: 'sm',
      color: 'card hover:border-fuchsia-500/40 hover:shadow-premium flex items-center justify-between group py-5 px-6 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden',
      icon: Bank, label: t('nav.schemes'),
      render: () => ( 
        <>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-fuchsia-500/10 rounded-full blur-2xl group-hover:bg-fuchsia-500/20 transition-all duration-500" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-900/40 dark:to-fuchsia-800/20 flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-700/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-md">
              <Bank size={28} weight="duotone" className="text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">{t('nav.schemes')}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                <div className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest">{t('dashboard.active_schemes')}</div>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-fuchsia-50 dark:group-hover:bg-fuchsia-900/30 transition-colors relative z-10">
            <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-fuchsia-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </> 
      )
    },
    { 
      id: 'map', to: '/map', size: 'md',
      color: 'card hover:border-teal-500/40 hover:shadow-premium group overflow-hidden backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60',
      icon: MapPin, label: t('nav.map'),
      render: () => (
        <div className="flex flex-col h-full relative z-10">
           <div className="absolute -right-8 -top-8 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 group-hover:scale-150 transition-all duration-700 ease-out" />
           <div className="flex items-center justify-between mb-6 relative z-20">
              <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/20 flex items-center justify-center border border-teal-200 dark:border-teal-700/50 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <MapPin size={32} weight="duotone" className="text-teal-600 dark:text-teal-400" />
              </div>
              <div className="bg-white/80 dark:bg-teal-500/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-teal-100 dark:border-teal-800/50 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                  <span className="text-[10px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">{t('schemes.gps_active')}</span>
                </div>
              </div>
           </div>
           <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2 font-outfit relative z-20">{t('nav.map')}</div>
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 relative z-20">{t('dashboard.map_desc')}</p>
           <div className="mt-auto flex justify-end relative z-20">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
                <CaretRight size={24} weight="bold" className="text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1.5 transition-all duration-300" />
              </div>
           </div>
        </div>
      )
    },
    { 
      id: 'buyer', to: '/buyer', size: 'sm',
      color: 'card hover:border-emerald-500/40 hover:shadow-premium flex items-center justify-between group py-5 px-6 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden',
      icon: Storefront, label: t('nav.buyer'),
      render: () => ( 
        <>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-700/50 group-hover:scale-110 transition-transform duration-500 shadow-md">
              <Storefront size={28} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">{t('nav.buyer')}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t('buyer.verified')}</div>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors relative z-10">
            <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </> 
      )
    },
    { 
      id: 'profit_predictor', to: '/profit-predictor', size: 'sm',
      color: 'card hover:border-indigo-500/40 hover:shadow-premium flex items-center justify-between group py-5 px-6 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden',
      icon: ChartLineUp, label: t('nav.profit_predictor'),
      render: () => ( 
        <>
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/20 flex items-center justify-center border border-indigo-200 dark:border-indigo-700/50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-md">
              <ChartLineUp size={28} weight="duotone" className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-outfit">{t('nav.profit_predictor')}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI {t('dashboard.ai_ready')}</div>
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors relative z-10">
            <CaretRight size={20} weight="bold" className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </> 
      )
    },
  ];

  const alerts = [
    { type: 'warning', text: t('dashboard.alerts.locust'), icon: Bug, color: "text-red-500 bg-red-100/50 dark:bg-red-900/20", border: "border-red-100 dark:border-red-900/30" },
    { type: 'success', text: t('dashboard.alerts.pms'), icon: Bank, color: "text-emerald-500 bg-emerald-100/50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/30" },
    { type: 'info', text: t('dashboard.alerts.wheat'), icon: Plant, color: "text-indigo-500 bg-indigo-100/50 dark:bg-indigo-900/20", border: "border-indigo-100 dark:border-indigo-900/30" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20">
        
        {/* Subtle Background SaaS Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-600/5 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-600/3 blur-[100px] rounded-full" />
        </div>

        {/* ── Header Command Bar ──────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
                  <Lightning size={14} weight="fill" className="animate-pulse" />
                  {t('dashboard.version')}
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Star size={14} weight="fill" className="text-amber-500" />
                {t('schemes.premium_member')}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-2xl flex items-center justify-center flex-shrink-0">
                     {user?.image
                       ? <img src={user.image} alt={user?.name || 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                       : <img src={logo} alt="Smart Kisan" className="w-full h-full object-cover filter contrast-[1.1] brightness-[1.1]" />
                     }
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg flex items-center justify-center">
                    <CheckCircle size={14} weight="fill" className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] sm:leading-[0.9]">
                      <span className="block opacity-60 text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t(greetingKey)},</span>
                      <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        {user?.name?.split(' ')[0] || t('auth.farmer')}
                      </span>
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 w-fit px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                      <Calendar size={18} weight="duotone" className="text-indigo-500" /> 
                      {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl shadow-slate-200/40 dark:shadow-none hidden sm:flex">
                <button className="px-6 py-2.5 text-xs font-black bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">{t('dashboard.personal')}</button>
                <button className="px-6 py-2.5 text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">{t('dashboard.farm_data')}</button>
            </div>
            <button onClick={() => navigate('/sos')} className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-all animate-pulse">
               <WarningCircle size={28} weight="fill" />
            </button>
          </div>
        </div>

        {/* ── The Bento Grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-auto">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.to)}
              className={clsx(
                "relative cursor-pointer overflow-hidden transition-all duration-500 border border-transparent",
                m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 rounded-[2.5rem] p-8 sm:p-10' : 
                m.size === 'md' ? 'col-span-1 sm:col-span-1 row-span-1 rounded-[2rem] p-7' : 'col-span-1 sm:col-span-1 row-span-1 rounded-3xl p-6',
                m.id === 'weather' ? 'text-white' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/60 dark:border-slate-800/60 dark:text-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:border-slate-700',
                "hover:-translate-y-2 active:scale-[0.98]",
                m.color 
              )}
            >
              {m.id === 'weather' && (
                  <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
              )}
              {m.render()}
            </div>
          ))}

          {/* Kisan Mitra Card */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-500/30 hover:-translate-y-2 transition-all duration-500" onClick={() => navigate('/chat')}>
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">
                    <ChatCircleText size={32} weight="duotone" className="text-white" />
                </div>
                <div className="flex flex-col">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 mb-1">{t('dashboard.kisan_mitra')}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-100">AI Assistant Online</span>
                  </div>
                </div>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tighter leading-[1.1] relative z-10 max-w-sm mb-6">
                {t('dashboard.expert_advisory')}
              </h3>
              <div className="relative z-10 flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit border border-white/10 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                 <span className="text-sm font-black uppercase tracking-widest">{t('chat.send')}</span>
                 <ArrowRight size={18} weight="bold" />
              </div>
          </div>

          {/* Active Schemes Card */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{t('dashboard.active_schemes')}</span>
                  <div className="h-1 w-12 bg-amber-500 rounded-full" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 flex items-center justify-center border border-amber-100 dark:border-amber-800/50 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">
                  <Trophy className="text-amber-500" size={28} weight="duotone" />
                </div>
              </div>
              <div>
                <div className="text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-6">
                  12 
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1 rounded-lg font-black border border-indigo-100 dark:border-indigo-800/50 tracking-widest animate-bounce-sm uppercase">{t('schemes.new_badge')}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest opacity-60">{t('schemes.verified_badge')}</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500 mt-6 flex items-center gap-2">
                   <CheckCircle size={18} weight="fill" className="text-emerald-500" />
                   {t('dashboard.available_for_you')}
                </p>
              </div>
          </div>
        </div>

        {/* ── Bottom Section: Quick Tips & Info ──────────────── */}
        <div className="mt-16 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                    <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={20} weight="fill" />
                  </div>
                  {t('dashboard.farming_intel')}
                </h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 ml-6 hidden sm:block" />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { title: t('dashboard.tips.soil.title'), desc: t('dashboard.tips.soil.desc'), icon: TestTube, accent: 'text-indigo-600', bg: 'from-indigo-50/50 to-indigo-100/30' },
                  { title: t('dashboard.tips.market.title'), desc: t('dashboard.tips.market.desc'), icon: ChartLineUp, accent: 'text-emerald-600', bg: 'from-emerald-50/50 to-emerald-100/30' }
                ].map((tip, i) => (
                  <div key={i} className="p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-500 group/tip">
                      <div className="flex flex-col gap-6">
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm transition-transform group-hover/tip:scale-110 group-hover/tip:rotate-3", tip.accent)}>
                          <tip.icon size={28} weight="duotone" />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 dark:text-white text-lg mb-2 tracking-tight group-hover/tip:text-indigo-600 transition-colors">{tip.title}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{tip.desc}</p>
                        </div>
                      </div>
                  </div>
                ))}
              </div>

              {/* Intelligence Feed */}
              <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{t('dashboard.recent_alerts')}</h3>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <Bell size={20} weight="duotone" className="text-slate-400 animate-swing" />
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  {alerts.map((alert, idx) => (
                      <div key={idx} className={clsx("flex gap-5 p-5 rounded-2xl border transition-all cursor-pointer group/alert hover:scale-[1.01]", alert.border, "bg-slate-50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg")}>
                        <div className={clsx("w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 transition-all group-hover/alert:scale-110 shadow-inner", alert.color)}>
                          <alert.icon size={24} weight="duotone" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-200">{alert.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alert Center</span>
                             <div className="w-1 h-1 rounded-full bg-slate-300" />
                             <span className="text-[10px] font-bold text-slate-400">{t('dashboard.just_now')}</span>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-32">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('dashboard.sync_status')}</h3>
                  <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800/50">{t('common.secure')}</div>
                </div>
                <div className="space-y-8">
                  {[
                    { label: t('dashboard.nodes.sat'), status: t('dashboard.status.optimal'), color: 'bg-emerald-500', icon: CloudSun },
                    { label: t('dashboard.nodes.market'), status: t('dashboard.status.stable'), color: 'bg-emerald-500', icon: TrendUp },
                    { label: t('dashboard.nodes.ai'), status: t('dashboard.status.active'), color: 'bg-indigo-500', icon: Lightning }
                  ].map(node => (
                    <div key={node.label} className="flex items-center justify-between group/node">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/node:text-indigo-500 transition-colors">
                              <node.icon size={20} weight="duotone" />
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover/node:text-slate-900 dark:group-hover/node:text-white transition-colors">{node.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-inner">{node.status}</span>
                          <div className={clsx("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] animate-pulse", node.color)} />
                        </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 p-6 rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <ShieldCheck size={20} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-End</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">Encrypted Tunnel</div>
                      </div>
                   </div>
                   <button onClick={() => navigate('/news')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-3">
                     <Pulse size={16} weight="bold" /> {t('dashboard.view_logs')}
                   </button>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: draw 2s ease-out forwards;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        @keyframes bounce-sm {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-sm {
          animation: bounce-sm 2s infinite ease-in-out;
        }
        @keyframes swing {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-swing {
          animation: swing 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
