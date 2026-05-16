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
      color: 'bg-indigo-600 text-white',
      label: t('nav.weather'),
      render: () => (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-4">{t('nav.weather')}</div>
            <div className="text-7xl sm:text-9xl font-black tracking-tighter leading-none">{Math.round(weather?.temperature || 0)}°</div>
            <div className="text-sm font-bold mt-4 uppercase tracking-widest">{weather?.description || t('dashboard.loading')}</div>
          </div>
          <div className="flex justify-between items-end">
             <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{weather?.city || 'Satna'}</div>
             <div className="px-6 py-3 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">VIEW DETAILS</div>
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
            <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">{t('nav.crop')}</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{t('dashboard.crop_system')}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white self-end font-black shadow-inner">→</div>
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
              <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">{t('nav.market')}</div>
              <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">₹{latest?.price?.toLocaleString() || '2,450'}</div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-4">{t('dashboard.mandi_desc')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white self-end font-black shadow-inner">→</div>
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
    <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-40 pb-20 relative z-10">
        
        {/* Balanced Header */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-indigo-600" />
            <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600">COMMAND CENTER v1.0</div>
          </div>
          
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.8] uppercase">
            <span className="block opacity-20 text-2xl sm:text-3xl font-black tracking-[0.2em] mb-4">{t(greetingKey)},</span>
            {user?.name?.split(' ')[0] || t('auth.farmer')}
          </h1>
          
          <div className="mt-12 flex flex-wrap items-center gap-8">
             <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.4em] border-l-2 border-indigo-600 pl-6">
                {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
             </p>
             <button onClick={() => navigate('/sos')} className="px-10 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
               EMERGENCY SOS
             </button>
          </div>
        </div>

        {/* Bento Grid - Professional Sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-auto">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => navigate(m.to)}
              className={clsx(
                "group cursor-pointer overflow-hidden transition-all duration-500",
                m.size === 'lg' ? 'col-span-1 sm:col-span-2 row-span-2 rounded-[2.5rem] p-10 sm:p-12' : 
                m.size === 'md' ? 'col-span-1 row-span-1 rounded-[2rem] p-8 sm:p-10' : 'col-span-1 row-span-1 rounded-[1.75rem] p-6 sm:p-8',
                m.id === 'weather' ? m.color : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-600/20 hover:shadow-2xl hover:-translate-y-2'
              )}
            >
              {m.render ? m.render() : (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-6">{m.label}</div>
                    {m.desc && <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-tight opacity-60">{m.desc}</p>}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white self-end font-black shadow-inner group-hover:scale-110 transition-transform">→</div>
                </div>
              )}
            </div>
          ))}

          {/* Expert Card - Balanced Contrast */}
          <div className="col-span-1 sm:col-span-2 bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-10 sm:p-12 text-white flex flex-col justify-between cursor-pointer hover:-translate-y-2 transition-all shadow-2xl border-2 border-indigo-600/30" onClick={() => navigate('/chat')}>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 mb-8">ADVISORY LINK</div>
                <h3 className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.85] uppercase max-w-sm">{t('dashboard.expert_advisory')}</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.5em] mt-12 group">
                CONSULT NOW <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
          </div>
        </div>

        {/* System Architecture Section */}
        <div className="mt-32 border-t border-slate-200 dark:border-slate-800 pt-16">
           <div className="flex flex-col md:flex-row items-start justify-between gap-16">
              <div className="flex flex-col gap-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{t('dashboard.sync_status')}</span>
                 <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse shadow-[0_0_15px_rgba(79,70,229,1)]" />
                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-[0.4em] uppercase">SYSTEMS ACTIVE</span>
                 </div>
              </div>
              <div className="flex gap-16 sm:gap-24">
                 {[
                   { label: t('dashboard.nodes.sat'), status: 'OPTIMAL' },
                   { label: t('dashboard.nodes.market'), status: 'STABLE' },
                   { label: t('dashboard.nodes.ai'), status: 'ACTIVE' }
                 ].map(node => (
                   <div key={node.label} className="flex flex-col gap-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">{node.label}</span>
                      <span className="text-base font-black tracking-[0.2em] text-slate-900 dark:text-white">{node.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
