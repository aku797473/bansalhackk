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

const FALLBACK_WEATHER = {
  city: 'Satna',
  temperature: 32,
  description: 'Partly Cloudy',
  icon: '02d'
};

export default function Dashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const { t, i18n } = useTranslation();
  const greetingKey = getGreetingKey();
  const locale = i18n.language === 'hi' ? 'hi-IN' : 'en-US';

  const { data: weather } = useQuery({
    queryKey: ['weather-current', 'v5'],
    queryFn: async () => {
      try {
        const getPosition = () => new Promise((resolve) => {
          if (!navigator.geolocation) {
            console.log("Dashboard Geolocation not supported by browser");
            return resolve(null);
          }
          const timer = setTimeout(() => {
            console.log("Dashboard Geolocation timeout triggered");
            resolve(null);
          }, 15000);
          
          navigator.geolocation.getCurrentPosition(
            pos => {
              clearTimeout(timer);
              console.log("Dashboard Location success:", pos);
              resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            },
            err => {
              clearTimeout(timer);
              console.log("Dashboard Location error:", err);
              resolve(null);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
          );
        });
        const pos = await getPosition();
        const lat = pos?.lat || 24.6005;
        const lon = pos?.lon || 80.8322;

        const fetchWithTimeout = (promise, ms) => Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]);

        const res = await fetchWithTimeout(weatherAPI.getCurrent(lat, lon), 15000);
        console.log("Dashboard Weather Data fetched:", res.data?.data);
        return res.data?.data || FALLBACK_WEATHER;
      } catch (err) {
        console.warn('Dashboard weather load failed:', err.message);
        return FALLBACK_WEATHER;
      }
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
            <span className="text-xs font-bold text-white/80">{t('nav.weather')}</span>
            <div className="text-6xl sm:text-7xl font-extrabold tracking-tight mt-2 leading-none">{Math.round(weather?.temperature ?? FALLBACK_WEATHER.temperature)}°</div>
            <div className="text-sm font-medium mt-2 capitalize opacity-90">{weather?.description || FALLBACK_WEATHER.description}</div>
          </div>
          <div className="flex justify-between items-center mt-6">
             <div className="text-xs font-medium opacity-85">{weather?.city || FALLBACK_WEATHER.city}</div>
             <div className="px-4 py-2 bg-white text-indigo-600 rounded-full text-xs font-semibold shadow-md transition-all hover:scale-102">View Weather</div>
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
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t('nav.crop')}</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-3 leading-tight">{t('dashboard.crop_system')}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 self-end font-semibold shadow-sm transition-transform group-hover:translate-x-1">→</div>
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
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{t('nav.market')}</span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-3 leading-none">₹{latest?.price?.toLocaleString() || '2,450'}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">{t('dashboard.mandi_desc')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 self-end font-semibold shadow-sm transition-transform group-hover:translate-x-1">→</div>
          </div>
        );
      }
    },
    { id: 'fertilizer', to: '/fertilizer', size: 'sm', label: t('nav.fertilizer') },
    { id: 'labour', to: '/labour', size: 'sm', label: t('nav.labour') },
    { id: 'news', to: '/news', size: 'sm', label: t('nav.news') },
    { id: 'schemes', to: '/schemes', size: 'sm', label: t('nav.schemes') },
    { id: 'map', to: '/map', size: 'md', label: t('nav.map'), desc: t('dashboard.map_desc') },
    { id: 'seller', to: '/seller', size: 'sm', label: t('nav.seller') },
    { id: 'buyer', to: '/buyer', size: 'sm', label: t('nav.buyer') },
    { id: 'profit_predictor', to: '/profit-predictor', size: 'sm', label: t('nav.profit_predictor') },
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <ThreeBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 relative z-10">
        
        {/* Balanced Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Dashboard</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            <span className="block text-slate-400 dark:text-slate-500 text-lg sm:text-xl font-medium mb-1">{t(greetingKey)},</span>
            {user?.name?.split(' ')[0] || t('auth.farmer')}
          </h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-4">
             <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
             </p>
             <button 
               onClick={() => navigate('/sos')} 
               className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full shadow-lg shadow-red-600/10 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
             >
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
               Emergency SOS
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
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{m.label}</span>
                    {m.desc && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">{m.desc}</p>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 self-end font-semibold shadow-sm transition-transform group-hover:translate-x-1">→</div>
                </div>
              )}
            </div>
          ))}

          {/* Expert Card - Balanced Contrast */}
          <div className="col-span-1 sm:col-span-2 bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 text-white flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-all shadow-xl border border-indigo-500/20" onClick={() => navigate('/crop')}>
              <div>
                <div className="text-xs font-bold text-indigo-400 mb-6">Expert Advisory</div>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight max-w-sm">{t('dashboard.expert_advisory')}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold mt-10 group">
                Consult Now <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
          </div>
        </div>

        {/* System Architecture Section */}
        <div className="mt-20 border-t border-slate-200 dark:border-slate-800/80 pt-10">
           <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="flex flex-col gap-2">
                 <span className="text-xs font-medium text-slate-400">{t('dashboard.sync_status')}</span>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">All Systems Operational</span>
                 </div>
              </div>
              <div className="flex gap-12 sm:gap-16">
                 {[
                   { label: t('dashboard.nodes.sat'), status: 'Optimal' },
                   { label: t('dashboard.nodes.market'), status: 'Stable' },
                   { label: t('dashboard.nodes.ai'), status: 'Active' }
                 ].map(node => (
                   <div key={node.label} className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-400">{node.label}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{node.status}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
