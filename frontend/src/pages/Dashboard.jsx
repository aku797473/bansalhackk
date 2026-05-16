import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { weatherAPI, marketAPI } from '../services/api';
import ThreeBackground from '../components/ThreeBackground';
import clsx from 'clsx';

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

  const { data: weather } = useQuery({
    queryKey: ['weather-current'],
    queryFn: async () => {
      try {
        const { data } = await weatherAPI.getCurrent(24.6005, 80.8322);
        return data.data;
      } catch { return null; }
    },
    staleTime: 10 * 60 * 1000,
  });

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
      id: 'weather', to: '/weather', size: 'lg',
      color: 'bg-indigo-600/95 dark:bg-indigo-600/80 text-white backdrop-blur-3xl border-white/20',
      label: t('nav.weather'),
      render: () => (
        <div className="flex flex-col h-full justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{t('nav.weather')}</div>
            <div className="flex items-start">
              <div className="text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-2xl">{Math.round(weather?.temperature || 0)}°</div>
            </div>
            <div className="text-[10px] font-black opacity-80 mt-4 uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-1.5 rounded-lg border border-white/10">{weather?.description || t('dashboard.loading')}</div>
          </div>
          <div className="flex justify-between items-end relative z-10">
             <div>
               <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">{weather?.city || 'Satna'}</div>
               <div className="text-[10px] font-black mt-1 uppercase tracking-widest text-indigo-100">{weather?.humidity}% HUMIDITY CONTROL</div>
             </div>
             <div className="px-5 py-2.5 bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border border-white/20 backdrop-blur-md hover:bg-white hover:text-indigo-600 transition-all">SYSTEM ACTIVE</div>
          </div>
        </div>
      )
    },
    { 
      id: 'crop', to: '/crop', size: 'md',
      label: t('nav.crop'),
      render: () => (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4">{t('nav.crop')}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{t('dashboard.crop_system')}</div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">HEALTH OPTIMAL</span>
             <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 shadow-inner">→</div>
          </div>
        </div>
      )
    },
    { 
      id: 'market', to: '/market', size: 'md',
      label: t('nav.market'),
      render: () => {
        const latest = marketData?.trends?.[marketData.trends.length - 1];
        return (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4">{t('nav.market')}</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">₹{latest?.price?.toLocaleString() || '2,450'}</div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">{t('dashboard.mandi_desc')}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 shadow-inner self-end">→</div>
          </div>
        );
      }
    },
    { id: 'fertilizer', to: '/fertilizer', size: 'sm', label: t('nav.fertilizer') },
    { id: 'labour', to: '/labour', size: 'sm', label: t('nav.labour') },
    { id: 'news', to: '/news', size: 'sm', label: t('nav.news') },
    { id: 'schemes', to: '/schemes', size: 'sm', label: t('nav.schemes') },
    { id: 'map', to: '/map', size: 'md', label: t('nav.map'), desc: t('dashboard.map_desc') },
    { id: 'buyer', to: '/buyer', size: 'sm', label: t('nav.buyer') },
    { id: 'profit_predictor', to: '/profit-predictor', size: 'sm', label: t('nav.profit_predictor') },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 relative z-10">
        
        {/* Balanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-black text-[8px] font-black uppercase tracking-[0.4em] rounded-full">
                   DASHBOARD v1.0
                </div>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85]">
                <span className="block opacity-20 text-xl sm:text-2xl font-black tracking-[0.2em] mb-2 uppercase">{t(greetingKey)}</span>
                <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase">
                  {user?.name?.split(' ')[0] || t('auth.farmer')}
                </span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.4em] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl px-5 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
               <div className="h-0.5 w-16 bg-indigo-600 rounded-full" />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
             <button onClick={() => navigate('/sos')} className="px-10 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-red-500/20 hover:scale-105 active:scale-95 transition-all border border-red-500/10">
               EMERGENCY SOS
             </button>
          </div>
        </div>

        {/* Bento Grid - Refined Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 auto-rows-auto">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.to)}
              className={clsx(
                "group cursor-pointer overflow-hidden transition-all duration-500 border",
                m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-2 rounded-[2.5rem] p-10 sm:p-12' : 
                m.size === 'md' ? 'col-span-1 row-span-1 rounded-[2rem] p-8 sm:p-10' : 'col-span-1 row-span-1 rounded-[1.75rem] p-6 sm:p-8',
                m.id === 'weather' ? m.color : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/40 hover:-translate-y-2',
                "shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
              )}
            >
              {m.render ? m.render() : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4">{m.label}</div>
                    {m.desc && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tight opacity-60 group-hover:opacity-100 transition-opacity">{m.desc}</p>}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 shadow-inner self-end group-hover:scale-110 transition-transform">→</div>
                </div>
              )}
            </div>
          ))}

          {/* Expert Card - Refined */}
          <div className="col-span-1 sm:col-span-2 bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] p-10 sm:p-12 text-white flex flex-col justify-between cursor-pointer hover:-translate-y-2 transition-all shadow-[0_20px_60px_rgba(79,70,229,0.2)] border border-white/10 relative overflow-hidden group" onClick={() => navigate('/chat')}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-all duration-1000" />
              <div className="relative z-10">
                <div className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-6">NEURAL ADVISORY</div>
                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] max-w-sm uppercase">{t('dashboard.expert_advisory')}</h3>
              </div>
              <div className="relative z-10 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] mt-10 bg-white/10 w-fit px-8 py-4 rounded-xl border border-white/10 hover:bg-white hover:text-slate-900 transition-all">
                CONSULT NOW <span>→</span>
              </div>
          </div>
        </div>

        {/* System Architecture */}
        <div className="mt-24 border-t border-slate-200 dark:border-slate-800 pt-12">
           <div className="flex flex-col md:flex-row items-start justify-between gap-12">
              <div className="flex flex-col gap-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('dashboard.sync_status')}</span>
                 <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                    <span className="text-[11px] font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase">SYSTEMS ENCRYPTED & ACTIVE</span>
                 </div>
              </div>
              <div className="flex gap-12 sm:gap-20">
                 {[
                   { label: t('dashboard.nodes.sat'), status: 'OPTIMAL', color: 'text-indigo-600' },
                   { label: t('dashboard.nodes.market'), status: 'STABLE', color: 'text-emerald-600' },
                   { label: t('dashboard.nodes.ai'), status: 'ACTIVE', color: 'text-indigo-600' }
                 ].map(node => (
                   <div key={node.label} className="flex flex-col gap-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">{node.label}</span>
                      <span className={clsx("text-[10px] font-black tracking-widest", node.color)}>{node.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
