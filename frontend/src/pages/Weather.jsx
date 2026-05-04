import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { weatherAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Droplets, Wind, Thermometer, AlertTriangle, RefreshCw } from 'lucide-react';
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
      return new Promise((resolve) => {
        navigator.geolocation?.getCurrentPosition(
          async ({ coords: { latitude: lat, longitude: lon } }) => {
            const res = await weatherAPI.getCurrent(lat, lon);
            resolve(res.data.data);
          },
          async () => {
            const res = await weatherAPI.getCurrent(24.6005, 80.8322); // Satna, MP
            resolve(res.data.data);
          }
        );
      });
    },
    staleTime: 30 * 60 * 1000, // 30 mins
    onError: () => toast.error(searchQuery ? 'City not found' : 'Weather unavailable')
  });

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
        <input className="input flex-1" placeholder={t('market.search', 'Search city...')}
          value={citySearch} onChange={e => setCitySearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchCity()} />
        <button onClick={searchCity} disabled={searching} className="btn-primary">
          {searching ? '...' : t('common.submit', 'Search')}
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
          <div className="card bg-gradient-to-br from-sky-50 to-blue-100 border-sky-200 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm text-sky-700">
                  <MapPin size={14} />{data.city}, {data.country}
                  {data.isMock && <span className="badge badge-yellow">Demo</span>}
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-6xl">{getEmoji(data.icon)}</span>
                  <div>
                    <p className="text-5xl font-bold text-gray-900">{Math.round(data.temperature)}°</p>
                    <p className="text-sm text-gray-500 capitalize">{data.description}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  { icon: Thermometer, label: t('weather.feels_like'), val: `${Math.round(data.feelsLike)}°C` },
                  { icon: Droplets,    label: t('weather.humidity'),   val: `${data.humidity}%` },
                  { icon: Wind,        label: t('weather.wind'),       val: `${data.windSpeed} km/h` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={14} className="text-sky-500" />
                    <span className="text-gray-500">{label}:</span>
                    <span className="font-semibold text-gray-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-day forecast */}
          {data.forecast?.length > 0 && (
            <>
              <h2 className="font-semibold text-gray-800 mb-3">{t('weather.forecast')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {data.forecast.map((day, i) => (
                  <div key={i} className={clsx(
                    'card text-center p-4',
                    i === 0 && 'border-sky-200 bg-sky-50'
                  )}>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      {i === 0 ? t('common.today', 'Today') : new Date(day.date).toLocaleDateString(t('common.locale', 'en-US'), { weekday: 'short' })}
                    </p>
                    <span className="text-2xl block mb-2">{getEmoji(day.icon)}</span>
                    <p className="font-bold text-gray-900">{day.tempMax}°</p>
                    <p className="text-xs text-gray-400">{day.tempMin}°</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize leading-tight">{day.description}</p>
                    <p className="text-xs text-sky-500 mt-1">💧{day.humidity}%</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Farm advice */}
          <div className="card mt-5 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
            <h3 className="font-semibold text-gray-800 mb-2">🌾 {t('crop.tips', 'Farming Advice')}</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {data.humidity > 80 && <li>• {t('weather.humidity_high', 'Humidity is high — risk of fungal disease.')}</li>}
              {data.temperature > 38 && <li>• {t('weather.temp_high', 'Temperature is high. Irrigated early morning.')}</li>}
              {data.windSpeed > 30 && <li>• {t('weather.wind_high', 'High wind — avoid pesticide spray.')}</li>}
              {(!data.alerts || data.alerts.length === 0) && <li>• {t('weather.no_alerts')} — {t('weather.good_time', 'Good time for farming activities.')}</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
