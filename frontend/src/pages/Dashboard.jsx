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
      color: 'bg-indigo-600 dark:bg-indigo-600/90 text-white',
      label: t('nav.weather'),
      render: () => (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-sm font-black uppercase tracking-widest opacity-60 mb-2">{t('nav.weather')}</div>
            <div className="flex items-start">
              <div className="text-7xl sm:text-8xl font-black tracking-tighter">{Math.round(weather?.temperature || 0)}°</div>
            </div>
            <div className="text-sm font-bold opacity-80 mt-2 uppercase tracking-widest">{weather?.description || t('dashboard.loading')}</div>
          </div>
          <div className="flex justify-between items-end">
             <div>
               <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{weather?.city || 'Satna'}</div>
               <div className="text-xs font-bold mt-1">{weather?.humidity}% HUMIDITY</div>
             </div>
             <div className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">OPEN</div>
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
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{t('nav.crop')}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{t('dashboard.crop_system')}</div>
          </div>
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ACTIVE</span>
             <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white">→</div>
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
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{t('nav.market')}</div>
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">₹{latest?.price?.toLocaleString() || '2,450'}</div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">{t('dashboard.mandi_desc')}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white self-end">→</div>
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
    <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-20 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg">
                  {t('dashboard.version')}
                </div>
            </div>
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.85]">
                <span className="block opacity-40 text-xl sm:text-2xl font-bold tracking-tight mb-4">{t(greetingKey)},</span>
                <span className="uppercase">{user?.name?.split(' ')[0] || t('auth.farmer')}</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] mt-8 bg-white/50 dark:bg-slate-900/50 w-fit px-4 py-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/sos')} className="px-8 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-red-500/30 hover:scale-105 active:scale-95 transition-all">
               EMERGENCY SOS
             </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.to)}
              className={clsx(
                "cursor-pointer overflow-hidden transition-all duration-500 border",
                m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-2 rounded-[2.5rem] p-10' : 
                m.size === 'md' ? 'col-span-1 row-span-1 rounded-[2rem] p-8' : 'col-span-1 row-span-1 rounded-3xl p-6',
                m.id === 'weather' ? m.color : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-500/50 hover:-translate-y-2',
                "shadow-sm hover:shadow-2xl transition-all"
              )}
            >
              {m.render ? m.render() : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">{m.label}</div>
                    {m.desc && <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-tight">{m.desc}</p>}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white self-end">→</div>
                </div>
              )}
            </div>
          ))}

          {/* Expert Card */}
          <div className="col-span-1 sm:col-span-2 bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between cursor-pointer hover:-translate-y-2 transition-all shadow-2xl shadow-indigo-500/20" onClick={() => navigate('/chat')}>
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-6">EXPERT AI ADVISORY</div>
                <h3 className="text-4xl font-black tracking-tighter leading-tight max-w-xs">{t('dashboard.expert_advisory')}</h3>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest mt-8">
                CONSULT NOW <span>→</span>
              </div>
          </div>
        </div>

        {/* Sync Status - Text Only */}
        <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-10">
           <div className="flex flex-wrap items-center justify-between gap-10">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.sync_status')}</span>
                 <span className="text-xs font-bold text-slate-900 dark:text-white">ENCRYPTED DATA CHANNEL ACTIVE</span>
              </div>
              <div className="flex gap-12">
                 {[
                   { label: t('dashboard.nodes.sat'), status: 'OPTIMAL' },
                   { label: t('dashboard.nodes.market'), status: 'STABLE' },
                   { label: t('dashboard.nodes.ai'), status: 'ACTIVE' }
                 ].map(node => (
                   <div key={node.label} className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{node.label}</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{node.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
