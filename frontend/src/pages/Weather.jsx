import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { weatherAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Droplets, Wind, Thermometer, AlertTriangle, RefreshCw, Calendar, CheckCircle2, ShieldCheck, Sun, CloudRain, CloudLightning, CloudFog, Cloud, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const WEATHER_EMOJIS = { '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const getEmoji = (icon) => WEATHER_EMOJIS[icon?.slice(0, 2)] || '🌡️';

export default function Weather() {
  const { t } = useTranslation();
  const [citySearch, setCitySearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Weather Query
  const { data, isLoading: loading, refetch, isFetching: searching } = useQuery({
    queryKey: ['weather', searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const res = await weatherAPI.getByCity(searchQuery);
        return res.data.data;
      }
      
      // Default to Satna immediately to avoid blocking UI
      // We will handle geolocation as a separate effect or refetch
      const res = await weatherAPI.getCurrent(24.6005, 80.8322); 
      return res.data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 mins
  });

  // Handle geolocation in the background to avoid blocking the initial load
  useEffect(() => {
    if (!searchQuery && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude: lat, longitude: lon } }) => {
          try {
            const res = await weatherAPI.getCurrent(lat, lon);
            // We can manually update the query cache or just let the user refetch if needed
            // For hackathon, let's just refetch if we get a better location
            if (res.data.data.city !== 'Satna') {
               // Update logic if needed, but for now, we've shown data fast
            }
          } catch (e) {}
        },
        null,
        { timeout: 5000 }
      );
    }
  }, []);

  const fetchByLocation = () => {
    setSearchQuery('');
    refetch();
  };

  const searchCity = () => {
    if (!citySearch.trim()) return;
    setSearchQuery(citySearch.trim());
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="skeleton h-48 mb-4" />
      <div className="grid grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 page-enter">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('weather.title')}</h1>
          <p className="page-subtitle">{t('weather.current')}</p>
        </div>
        <button onClick={fetchByLocation} className="btn-ghost p-2"><RefreshCw size={16} /></button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input className="input flex-1" placeholder={t('market.search')}
          value={citySearch} onChange={e => setCitySearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchCity()} />
        <button onClick={searchCity} disabled={searching} className="btn-primary">
          {searching ? '...' : t('common.submit')}
        </button>
      </div>

      {data && (
        <>
          {/* Alerts */}
          {data.alerts?.length > 0 && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm">{t('weather.alerts')}</p>
                {data.alerts.map((a, i) => <p key={i} className="text-sm text-red-600">{a.message}</p>)}
              </div>
            </div>
          )}

          {/* Current */}
          <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-premium mb-8 relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-sky-50 font-bold tracking-wide">
                  <MapPin size={18} />
                  <span className="text-lg">{data.city}, {data.country}</span>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <span className="text-8xl drop-shadow-lg animate-bounce-sm">{getEmoji(data.icon)}</span>
                  <div>
                    <h2 className="text-8xl font-black tracking-tighter drop-shadow-md leading-none">{Math.round(data.temperature)}°</h2>
                    <p className="text-xl font-bold text-sky-100 capitalize mt-2 flex items-center gap-2">
                       {data.description} 
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                       <span className="text-xs uppercase tracking-widest opacity-70">{t('weather.real_time')}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col gap-6 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 w-full md:w-auto">
                {[
                  { icon: Thermometer, label: t('weather.feels_like'), val: `${Math.round(data.feelsLike)}°C` },
                  { icon: Droplets,    label: t('weather.humidity'),   val: `${data.humidity}%` },
                  { icon: Wind,        label: t('weather.wind'),       val: `${data.windSpeed} km/h` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-100/70">{label}</p>
                      <p className="text-lg font-black">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          {data.forecast?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                {t('weather.outlook')} <Calendar className="text-primary" />
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                {data.forecast.map((day, i) => (
                  <div key={i} className={clsx(
                    'min-w-[140px] snap-start bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border rounded-3xl p-5 text-center transition-all hover:-translate-y-2 hover:shadow-xl',
                    i === 0 ? 'border-primary shadow-lg bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-100 dark:border-white/5'
                  )}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                      {i === 0 ? t('common.today') : new Date(day.date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <span className="text-4xl block mb-4 drop-shadow-sm">{getEmoji(day.icon)}</span>
                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{day.tempMax}°</p>
                    <p className="text-xs font-bold text-gray-400 mb-4">{day.tempMin}°</p>
                    <div className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[10px] font-black py-1 rounded-full uppercase tracking-tighter">
                      💧 {day.humidity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Farming Advisory Checklist */}
          <div className="card bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 overflow-hidden shadow-xl p-0">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
               <h3 className="font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest text-xs flex items-center gap-2">
                 <ShieldCheck size={18} /> {t('weather.advisory_title')}
               </h3>
               <span className="text-[10px] font-black text-emerald-600 uppercase">{t('weather.updated')}: {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="p-6 grid sm:grid-cols-2 gap-4">
               {[
                 { label: t('weather.irrigation_req', 'Irrigation Required'), check: data.temperature > 35, desc: t('weather.temp_tip', 'High evapotranspiration') },
                 { label: t('weather.fungal_risk', 'Risk of Fungal Attack'), check: data.humidity > 85, desc: t('weather.pest_tip', 'Watch for pests') }
               ].map((item, idx) => (
                 <div key={idx} className={clsx(
                   'p-4 rounded-2xl border flex items-center gap-4 transition-all',
                   item.check ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30'
                 )}>
                    <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm', item.check ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white')}>
                       {item.check ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                       <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{item.label}</p>
                       <p className="text-[10px] font-bold text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
               <Info size={12} /> {t('weather.advisory_disclaimer')}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
