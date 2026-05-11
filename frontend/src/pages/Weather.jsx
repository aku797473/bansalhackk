import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { weatherAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Droplets, Wind, Thermometer, AlertTriangle, RefreshCw, Calendar, CheckCircle2, ShieldCheck, Sun, CloudRain, CloudLightning, CloudFog, Cloud, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

const WEATHER_EMOJIS = { '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const getEmoji = (icon) => WEATHER_EMOJIS[icon?.slice(0, 2)] || '🌡️';

// Instant fallback so the UI never blocks
const FALLBACK_WEATHER = {
  city: 'Satna', country: 'IN',
  lat: 24.6005, lon: 80.8322,
  temperature: 32, feelsLike: 35, humidity: 68, windSpeed: 12,
  description: 'Partly Cloudy', icon: '02d', alerts: [],
  forecast: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    tempMax: 30 + i, tempMin: 22 + i,
    description: ['Sunny','Partly Cloudy','Light Rain','Cloudy','Clear','Sunny','Partly Cloudy'][i],
    icon: ['01d','02d','10d','03d','01n','01d','02d'][i],
    humidity: 60 + i * 2,
    estimated: i >= 5,
  })),
  isFallback: true,
};

export default function Weather() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const [citySearch, setCitySearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading: loading, refetch, isFetching: searching } = useQuery({
    queryKey: ['weather', searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        const res = await weatherAPI.getByCity(searchQuery);
        return res.data.data;
      }

      // Fast geo: 1.5s timeout, then immediately fall back
      const getPosition = () => new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        const timer = setTimeout(() => resolve(null), 1500);
        navigator.geolocation.getCurrentPosition(
          pos => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
          () => { clearTimeout(timer); resolve(null); },
          { timeout: 1500, maximumAge: 600000 }
        );
      });

      const pos = await getPosition();
      const lat = pos?.lat || 24.6005;
      const lon = pos?.lon || 80.8322;

      const res = await weatherAPI.getCurrent(lat, lon);
      const d = res.data.data;
      // Pad forecast to 7 days on the frontend (backend may return 5 from free tier cache)
      if (d?.forecast) {
        while (d.forecast.length < 7) {
          const last = d.forecast[d.forecast.length - 1];
          const prev = d.forecast[d.forecast.length - 2] || last;
          const nextDate = new Date(last.date);
          nextDate.setDate(nextDate.getDate() + 1);
          d.forecast.push({
            date:      nextDate.toISOString().split('T')[0],
            tempMax:   Math.round((last.tempMax + prev.tempMax) / 2),
            tempMin:   Math.round((last.tempMin + prev.tempMin) / 2),
            description: last.description,
            icon:      last.icon,
            humidity:  Math.round((last.humidity + prev.humidity) / 2),
            estimated: true,
          });
        }
      }
      return d;
    },
    staleTime: 10 * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Show fallback data right away — never show full-page skeleton
  const displayData = data || FALLBACK_WEATHER;
  const isRealData = data && !data.isFallback;

  const fetchByLocation = () => {
    setSearchQuery('');
    refetch();
  };

  const searchCity = () => {
    if (!citySearch.trim()) return;
    setSearchQuery(citySearch.trim());
  };

  // Only show skeleton on the very first cold load (no fallback yet rendered)
  if (loading && !displayData) return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="skeleton h-48 mb-4" />
      <div className="grid grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
    </div>
  );

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-4 py-6">
      <div className="anim-header page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">{t('weather.title')}</h1>
          <p className="page-subtitle">
            {t('weather.current')}
            {searching && <span className="ml-2 text-xs text-primary animate-pulse">{t('common.updating', 'Updating…')}</span>}
            {displayData?.isFallback && !searching && <span className="ml-2 text-xs text-amber-500">{t('weather.fallback_notice', 'Showing estimate — fetching live data…')}</span>}
          </p>
        </div>
        <button onClick={fetchByLocation} className={`btn-ghost p-2 ${searching ? 'animate-spin' : ''}`}><RefreshCw size={16} /></button>
      </div>

      {/* Search */}
      <div className="anim-card flex gap-2 mb-6">
        <input className="input flex-1" placeholder={t('market.search')}
          value={citySearch} onChange={e => setCitySearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchCity()} />
        <button onClick={searchCity} disabled={searching} className="btn-primary">
          {searching ? '...' : t('common.submit')}
        </button>
      </div>

      {displayData && (
        <>
          {/* Alerts */}
          {displayData.alerts?.length > 0 && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm">{t('weather.alerts')}</p>
                {displayData.alerts.map((a, i) => <p key={i} className="text-sm text-red-600">{a.message}</p>)}
              </div>
            </div>
          )}

          {/* Current */}
          <div className="anim-card bg-gradient-to-br from-sky-400 to-blue-600 rounded-[2.5rem] p-8 text-white shadow-premium mb-8 relative overflow-hidden group">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 relative z-10">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-sky-50 font-bold tracking-wide">
                  <MapPin size={18} />
                  <span className="text-lg">{displayData.city}, {displayData.country}</span>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <span className="text-8xl drop-shadow-lg animate-bounce-sm">{getEmoji(displayData.icon)}</span>
                  <div>
                    <h2 className="text-8xl font-black tracking-tighter drop-shadow-md leading-none">{Math.round(displayData.temperature)}°</h2>
                    <p className="text-xl font-bold text-sky-100 capitalize mt-2 flex items-center gap-2">
                       {displayData.description} 
                       <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                       <span className="text-xs uppercase tracking-widest opacity-70">{isRealData ? t('weather.real_time') : t('weather.estimate', 'Estimate')}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 md:flex md:flex-col gap-2 sm:gap-6 bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/20 w-full md:w-auto">
                {[
                  { icon: Thermometer, label: t('weather.feels_like'), val: `${Math.round(displayData.feelsLike)}°C` },
                  { icon: Droplets,    label: t('weather.humidity'),   val: `${displayData.humidity}%` },
                  { icon: Wind,        label: t('weather.wind'),       val: `${displayData.windSpeed} km/h` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-white sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-sky-100/70 leading-tight">{label}</p>
                      <p className="text-sm sm:text-lg font-black">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          {displayData.forecast?.length > 0 && (
            <div className="anim-fade mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                {t('weather.outlook')} <Calendar className="text-primary" />
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
                {displayData.forecast.map((day, i) => (
                  <div key={i} className={clsx(
                    'min-w-[140px] snap-start border rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden group',
                    i === 0 
                      ? 'border-primary shadow-lg shadow-primary/20 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/20' 
                      : 'border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm'
                  )}>
                    {i === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl group-hover:scale-150 transition-transform" />}
                    <p className={clsx("text-[10px] font-black uppercase tracking-widest mb-3 relative z-10", i === 0 ? "text-primary dark:text-emerald-400" : "text-gray-400")}>
                      {i === 0 ? t('common.today') : new Date(day.date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <span className="text-4xl block mb-4 drop-shadow-sm group-hover:scale-110 transition-transform relative z-10">{getEmoji(day.icon)}</span>
                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1 relative z-10">{day.tempMax}°</p>
                    <p className="text-xs font-bold text-gray-400 mb-4 relative z-10">{day.tempMin}°</p>
                    <div className={clsx(
                      "text-[10px] font-black py-1.5 rounded-full uppercase tracking-tighter relative z-10 flex items-center justify-center gap-1",
                      i === 0 ? "bg-primary text-white" : "bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400"
                    )}>
                      <Droplets size={10} /> {day.humidity}%
                    </div>
                    {day.estimated && (
                      <p className="text-[8px] font-bold text-gray-300 dark:text-slate-600 mt-2 uppercase tracking-widest">Est.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Farming Advisory Checklist */}
          <div className="anim-fade card bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 overflow-hidden shadow-xl p-0">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
               <h3 className="font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest text-xs flex items-center gap-2">
                 <ShieldCheck size={18} /> {t('weather.advisory_title')}
               </h3>
               <span className="text-[10px] font-black text-emerald-600 uppercase">{t('weather.updated')}: {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="p-6 grid sm:grid-cols-2 gap-4">
               {[
                 { label: t('weather.irrigation_req', 'Irrigation Required'), check: displayData.temperature > 35, desc: t('weather.temp_tip', 'High evapotranspiration') },
                 { label: t('weather.fungal_risk', 'Risk of Fungal Attack'), check: displayData.humidity > 85, desc: t('weather.pest_tip', 'Watch for pests') }
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
