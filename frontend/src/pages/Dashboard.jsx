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
      color: 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-2xl shadow-indigo-500/40',
      label: t('nav.weather'),
      render: () => (
        <div className="flex flex-col h-full justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
          <div className="relative z-10">
            <div className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-100 mb-4">{t('nav.weather')}</div>
            <div className="flex items-start">
              <div className="text-8xl sm:text-9xl font-black tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]">{Math.round(weather?.temperature || 0)}°</div>
            </div>
            <div className="text-sm font-black mt-6 uppercase tracking-[0.2em] bg-white/20 w-fit px-6 py-2 rounded-xl border border-white/30 backdrop-blur-md">
              {weather?.description || t('dashboard.loading')}
            </div>
          </div>
          <div className="flex justify-between items-end relative z-10 pt-10">
             <div>
               <div className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80">{weather?.city || 'Satna'}</div>
               <div className="text-[13px] font-black mt-2 uppercase tracking-widest text-indigo-100">{weather?.humidity}% HUMIDITY</div>
             </div>
             <div className="px-8 py-4 bg-white text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all">OPEN</div>
          </div>
        </div>
      )
    },
    { 
      id: 'crop', to: '/crop', size: 'md',
      color: 'bg-white dark:bg-slate-900 border-2 border-emerald-500/20 shadow-emerald-500/10',
      label: t('nav.crop'),
      render: () => (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6">{t('nav.crop')}</div>
            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">{t('dashboard.crop_system')}</div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-8">
             <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg">HEALTH OPTIMAL</span>
             <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">→</div>
          </div>
        </div>
      )
    },
    { 
      id: 'market', to: '/market', size: 'md',
      color: 'bg-white dark:bg-slate-900 border-2 border-indigo-500/20 shadow-indigo-500/10',
      label: t('nav.market'),
      render: () => {
        const latest = marketData?.trends?.[marketData.trends.length - 1];
        return (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6">{t('nav.market')}</div>
              <div className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">₹{latest?.price?.toLocaleString() || '2,450'}</div>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-4">{t('dashboard.mandi_desc')}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 self-end">→</div>
          </div>
        );
      }
    },
    { id: 'fertilizer', to: '/fertilizer', size: 'sm', label: t('nav.fertilizer'), color: 'border-amber-500/20' },
    { id: 'labour', to: '/labour', size: 'sm', label: t('nav.labour'), color: 'border-rose-500/20' },
    { id: 'news', to: '/news', size: 'sm', label: t('nav.news'), color: 'border-sky-500/20' },
    { id: 'schemes', to: '/schemes', size: 'sm', label: t('nav.schemes'), color: 'border-fuchsia-500/20' },
    { id: 'map', to: '/map', size: 'md', label: t('nav.map'), desc: t('dashboard.map_desc'), color: 'border-teal-500/20' },
    { id: 'buyer', to: '/buyer', size: 'sm', label: t('nav.buyer'), color: 'border-emerald-500/20' },
    { id: 'profit_predictor', to: '/profit-predictor', size: 'sm', label: t('nav.profit_predictor'), color: 'border-indigo-500/20' },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-48 pb-20 relative z-10">
        
        {/* Massive Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16 mb-24">
          <div className="space-y-10">
            <div className="flex items-center gap-4">
                <div className="px-6 py-2 bg-white text-black text-[11px] font-black uppercase tracking-[0.5em] rounded-full shadow-2xl animate-bounce-slow">
                   COMMAND CENTER v1.0
                </div>
            </div>
            <h1 className="text-8xl sm:text-9xl lg:text-[10rem] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.75]">
                <span className="block opacity-30 text-3xl sm:text-4xl font-black tracking-[0.3em] mb-6 uppercase">{t(greetingKey)}</span>
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent uppercase drop-shadow-sm">
                  {user?.name?.split(' ')[0] || t('auth.farmer')}
                </span>
            </h1>
            <div className="flex items-center gap-6">
               <p className="text-[12px] text-slate-500 dark:text-slate-100 font-black uppercase tracking-[0.4em] bg-white/10 dark:bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
                  {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
               </p>
               <div className="h-2 w-32 bg-gradient-to-r from-indigo-600 to-pink-500 rounded-full shadow-lg shadow-indigo-500/20" />
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <button onClick={() => navigate('/sos')} className="px-16 py-6 bg-red-600 text-white text-[13px] font-black uppercase tracking-[0.5em] rounded-3xl shadow-[0_30px_60px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all animate-pulse border-4 border-white/20">
               CRITICAL SOS
             </button>
          </div>
        </div>

        {/* Bento Grid - Colored & Large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 auto-rows-auto">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.to)}
              className={clsx(
                "group cursor-pointer overflow-hidden transition-all duration-500 border-2",
                m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-2 rounded-[3.5rem] p-14' : 
                m.size === 'md' ? 'col-span-1 row-span-1 rounded-[3rem] p-12' : 'col-span-1 row-span-1 rounded-[2.5rem] p-10',
                m.color || 'bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 backdrop-blur-2xl',
                "hover:-translate-y-4 shadow-2xl transition-all duration-500"
              )}
            >
              {m.render ? m.render() : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-6">{m.label}</div>
                    {m.desc && <p className="text-[12px] text-slate-500 dark:text-slate-300 font-bold leading-relaxed uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{m.desc}</p>}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 self-end group-hover:scale-110 transition-transform">→</div>
                </div>
              )}
            </div>
          ))}

          {/* Expert Card - Neon Nexus */}
          <div className="col-span-1 sm:col-span-2 bg-slate-900 dark:bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[3.5rem] p-14 text-white flex flex-col justify-between cursor-pointer hover:-translate-y-4 transition-all shadow-[0_40px_100px_rgba(79,70,229,0.4)] border-2 border-indigo-500/30 relative overflow-hidden group" onClick={() => navigate('/chat')}>
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-indigo-500/40 transition-all duration-1000" />
              <div className="relative z-10">
                <div className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-10">NEURAL ADVISORY LINK</div>
                <h3 className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.85] max-w-sm uppercase">{t('dashboard.expert_advisory')}</h3>
              </div>
              <div className="relative z-10 flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.4em] mt-16 bg-white text-slate-900 w-fit px-12 py-5 rounded-[2rem] shadow-2xl hover:bg-indigo-500 hover:text-white transition-all">
                INITIATE PORTAL <span>→</span>
              </div>
          </div>
        </div>

        {/* Global Architecture Footer */}
        <div className="mt-40 border-t-4 border-slate-900 dark:border-white/10 pt-20">
           <div className="flex flex-col md:flex-row items-start justify-between gap-20">
              <div className="flex flex-col gap-6">
                 <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.5em]">{t('dashboard.sync_status')}</span>
                 <div className="flex items-center gap-6">
                    <div className="h-3 w-3 rounded-full bg-indigo-600 animate-ping shadow-[0_0_20px_rgba(79,70,229,1)]" />
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-[0.3em] uppercase">SYSTEMS ONLINE & ENCRYPTED</span>
                 </div>
              </div>
              <div className="flex gap-20 sm:gap-32">
                 {[
                   { label: t('dashboard.nodes.sat'), status: 'OPTIMAL', color: 'text-indigo-600' },
                   { label: t('dashboard.nodes.market'), status: 'STABLE', color: 'text-emerald-500' },
                   { label: t('dashboard.nodes.ai'), status: 'ACTIVE', color: 'text-fuchsia-500' }
                 ].map(node => (
                   <div key={node.label} className="flex flex-col gap-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{node.label}</span>
                      <span className={clsx("text-lg font-black tracking-[0.2em]", node.color)}>{node.status}</span>
                      <div className={clsx("h-1.5 w-12 rounded-full", node.color.replace('text-', 'bg-'))} />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
