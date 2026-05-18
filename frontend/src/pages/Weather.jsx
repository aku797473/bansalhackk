import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { weatherAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Drop, Wind, Thermometer, Warning, ArrowCounterClockwise, Calendar, CheckCircle, ShieldCheck, Sun, CloudRain, CloudLightning, CloudFog, Cloud, Info, MagnifyingGlass, Sparkle, Lightning } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';
import { RealisticSun, RealisticCloud } from '../components/WeatherIcons';

const WEATHER_EMOJIS = { '01': '☀️', '02': '🌤️', '03': '⛅', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
const getEmoji = (icon, size = 48) => {
  const code = icon?.slice(0, 2);
  if (code === '01') return <RealisticSun size={size * 1.5} className="animate-bounce-sm mx-auto" />;
  if (code === '02' || code === '03') return (
    <div className="relative mx-auto" style={{ width: size * 1.5, height: size * 1.5 }}>
      <RealisticSun size={size} className="absolute -top-1 -right-1" />
      <RealisticCloud size={size * 1.2} className="absolute bottom-0 left-0" />
    </div>
  );
  if (code === '04') return <RealisticCloud size={size * 1.5} className="mx-auto" />;
  return <span style={{ fontSize: size }}>{WEATHER_EMOJIS[code] || '🌡️'}</span>;
};

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
    queryKey: ['weather', searchQuery, i18n.language, 'v9'],
    queryFn: async () => {
      try {
        const activeLang = i18n.language || 'en';
        if (searchQuery) {
          const res = await weatherAPI.getByCity(searchQuery, activeLang);
          return res.data.data || FALLBACK_WEATHER;
        }

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

        const res = await weatherAPI.getCurrent(lat, lon, activeLang);
        const d = res.data.data;
        
        if (d && (!d.forecast || d.forecast.length === 0)) {
          d.forecast = FALLBACK_WEATHER.forecast; 
        } else if (d && d.forecast && d.forecast.length < 7) {
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
              icon:        last.icon,
              humidity:    Math.round((last.humidity + prev.humidity) / 2),
              estimated: true,
            });
          }
        }
        return d || FALLBACK_WEATHER;
      } catch (err) {
        console.warn('Weather API unavailable, using fallback:', err.message);
        return FALLBACK_WEATHER;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime:    15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: FALLBACK_WEATHER,
  });

  const displayData = data || FALLBACK_WEATHER;
  const isRealData = data && !data.isFallback;

  const fetchByLocation = () => {
    setSearchQuery('');
    setCitySearch('');
    refetch();
  };

  const searchCity = () => {
    if (!citySearch.trim()) return;
    setSearchQuery(citySearch.trim());
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-sky-100 selection:text-sky-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="px-4 py-1.5 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-semibold rounded-full border border-sky-200/50 dark:border-sky-800/35 flex items-center gap-2">
                <Sparkle size={14} weight="fill" className="animate-pulse" />
                Real-Time Weather
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs font-medium text-slate-500">
                <Lightning size={14} weight="fill" className="text-amber-500" />
                Radar Connected
              </div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none font-outfit">
              <span className="bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                {t('weather.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 max-w-lg leading-relaxed flex items-center gap-3">
              {t('weather.current')}
              {searching && <span className="text-sky-500 animate-pulse text-xs font-semibold ml-2">Updating...</span>}
              {displayData?.isFallback && !searching && <span className="text-amber-500 text-xs font-semibold ml-2">Estimated</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group flex-1 sm:w-64">
                <input 
                  className="w-full h-14 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl px-12 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                  placeholder={t('weather.search_placeholder')}
                  value={citySearch} 
                  onChange={e => setCitySearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchCity()} 
                />
                <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
             </div>
             <button onClick={fetchByLocation} className="w-14 h-14 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl flex items-center justify-center text-slate-500 hover:text-sky-500 hover:border-sky-500 transition-all shadow-premium">
                <ArrowCounterClockwise size={22} weight="bold" className={clsx(searching && "animate-spin")} />
             </button>
          </div>
        </div>

        {displayData && (
          <div className="space-y-8">
            {/* Alerts */}
            {displayData.alerts?.length > 0 && (
              <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-5 duration-500">
                <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                   <Warning size={24} weight="fill" className="animate-pulse" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Alert Issued</p>
                  {displayData.alerts.map((a, i) => <p key={i} className="text-sm font-bold text-red-700 dark:text-red-300">{a.message}</p>)}
                </div>
              </div>
            )}

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 rounded-[3rem] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 relative z-10">
                <div className="text-center lg:text-left w-full lg:w-auto">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <MapPin size={20} weight="fill" className="text-white" />
                    </div>
                    <span className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-md">{displayData.city}, {displayData.country}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-10 sm:gap-14">
                    <div className="drop-shadow-[0_10px_30px_rgba(255,255,255,0.3)] transform group-hover:scale-110 transition-transform duration-700">
                      {getEmoji(displayData.icon, 100)}
                    </div>
                    <div>
                      <div className="flex items-start">
                         <h2 className="text-8xl sm:text-[11rem] font-black tracking-tighter drop-shadow-2xl leading-none">{Math.round(displayData.temperature)}°</h2>
                         <span className="text-3xl sm:text-5xl font-light opacity-50 mt-4 sm:mt-10 ml-2">C</span>
                      </div>
                      <p className="text-xl sm:text-3xl font-black text-sky-100 capitalize mt-4 flex items-center justify-center lg:justify-start gap-4">
                         {displayData.description} 
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 lg:flex lg:flex-col gap-6 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-white/20 w-full lg:w-72 shadow-2xl">
                  {[
                    { icon: Thermometer, label: t('weather.feels_like'), val: `${Math.round(displayData.feelsLike)}°C`, color: 'text-orange-300' },
                    { icon: Drop,        label: t('weather.humidity'),   val: `${displayData.humidity}%`, color: 'text-blue-300' },
                    { icon: Wind,        label: t('weather.wind'),       val: `${displayData.windSpeed} <span class="text-[10px]">km/h</span>`, color: 'text-sky-300' },
                  ].map(({ icon: Icon, label, val, color }) => (
                    <div key={label} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left group/stat">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover/stat:bg-white group-hover/stat:text-blue-600 transition-all duration-300">
                        <Icon size={24} weight="duotone" className="group-hover/stat:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1 leading-tight">{label}</p>
                        <p className={clsx("text-sm sm:text-2xl font-black", color)} dangerouslySetInnerHTML={{ __html: val }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7-day outlook */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center">
                    <Calendar className="text-sky-600 dark:text-sky-400" size={20} weight="fill" />
                  </div>
                  {t('weather.outlook')}
                </h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 ml-6" />
              </div>
              
              <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
                {displayData.forecast?.map((day, i) => (
                  <div key={i} className={clsx(
                    'min-w-[160px] snap-start border rounded-[2.5rem] p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-premium relative overflow-hidden group',
                    i === 0 
                      ? 'bg-white/80 dark:bg-slate-900/80 border-sky-500 shadow-xl shadow-sky-500/20' 
                      : 'border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl'
                  )}>
                    {i === 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-sky-500/10 rounded-full blur-xl animate-pulse" />}
                    <p className={clsx("text-xs font-bold mb-4", i === 0 ? "text-sky-600" : "text-slate-400")}>
                      {i === 0 ? t('common.today') : new Date(day.date).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{getEmoji(day.icon, 40)}</div>
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{day.tempMax}°</span>
                      <span className="text-sm font-bold text-slate-400">{day.tempMin}°</span>
                    </div>
                    <div className={clsx(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight",
                      i === 0 ? "bg-sky-600 text-white shadow-lg shadow-sky-500/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}>
                      <Drop size={12} weight="bold" /> {day.humidity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farming Advisory Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-sm relative group">
              <div className="bg-slate-50 dark:bg-slate-800/30 p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                 <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                     <ShieldCheck size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                   </div>
                   {t('weather.advisory_title')}
                 </h3>
                 <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-xs font-medium text-slate-400">Updated: {new Date().toLocaleTimeString()}</span>
                 </div>
              </div>
              
              <div className="p-8 sm:p-12 grid sm:grid-cols-2 gap-8">
                 {[
                   { label: t('weather.irrigation_req'), check: displayData.temperature > 35, desc: t('weather.temp_tip'), icon: Drop, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                   { label: t('weather.fungal_risk'), check: displayData.humidity > 85, desc: t('weather.pest_tip'), icon: Warning, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' }
                 ].map((item, idx) => (
                   <div key={idx} className={clsx(
                     'p-8 rounded-[2rem] border transition-all hover:scale-[1.02] duration-300 flex items-start gap-6',
                     item.check ? 'bg-white dark:bg-slate-800/50 border-emerald-200 dark:border-emerald-800 shadow-xl shadow-emerald-500/5' : 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800'
                   )}>
                      <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner', item.check ? 'bg-emerald-500 text-white' : item.bg + ' ' + item.color)}>
                         {item.check ? <CheckCircle size={28} weight="fill" /> : <item.icon size={28} weight="duotone" />}
                      </div>
                      <div>
                         <p className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2 uppercase tracking-tight">{item.label}</p>
                         <p className="text-xs font-bold text-slate-500 leading-relaxed">{item.desc}</p>
                         {item.check && (
                           <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
                             <Lightning size={14} weight="fill" /> {t('weather.high_priority')}
                           </div>
                         )}
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400">
                 <Info size={14} className="text-slate-400" /> {t('weather.advisory_disclaimer')}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-sm {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-sm {
          animation: bounce-sm 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
