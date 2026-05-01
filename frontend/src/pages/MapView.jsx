import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Navigation, Layers, Store, ThermometerSun,
  Sprout, Users, Info, X, ExternalLink, Loader2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';
import { marketAPI, weatherAPI, labourAPI, fertilizerAPI } from '../services/api';

/* ─── Config ─────────────────────────────────────────── */
const FILTER_CONFIG = {
  all:     { label: 'All',    emoji: '🗺️', color: '#6b7280', bg: 'bg-gray-100',   text: 'text-gray-700',   accent: 'border-gray-400' },
  market:  { label: 'Market',  emoji: '🏪', color: '#16a34a', bg: 'bg-green-100',  text: 'text-green-800',  accent: 'border-green-500' },
  weather: { label: 'Weather', emoji: '🌦️', color: '#0369a1', bg: 'bg-sky-100',    text: 'text-sky-800',    accent: 'border-sky-500' },
  soil:    { label: 'Soil', emoji: '🌱', color: '#92400e', bg: 'bg-amber-100',  text: 'text-amber-800',  accent: 'border-amber-600' },
  labour:  { label: 'Labour',  emoji: '👷', color: '#7c3aed', bg: 'bg-purple-100', text: 'text-purple-800', accent: 'border-purple-500' },
};

const MAP_TILES = {
  street: {
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr: '© OpenStreetMap contributors',
  },
  topo: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: '© OpenTopoMap · OpenStreetMap',
  },
};

/* ─── Custom div icon factory ───────────────────────── */
function makeIcon(type) {
  const cfg = FILTER_CONFIG[type];
  const html = `
    <div style="
      width:38px; height:38px;
      background:${cfg.color};
      border-radius:50% 50% 50% 4px;
      transform:rotate(-45deg);
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 4px 14px rgba(0,0,0,0.25);
      border:2.5px solid rgba(255,255,255,0.9);
    ">
      <span style="transform:rotate(45deg); font-size:17px; line-height:1;">${cfg.emoji}</span>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [38, 38], iconAnchor: [19, 34], popupAnchor: [0, -34] });
}

/* ─── Popup HTML ─────────────────────────────────────── */
function makePopup(m) {
  const cfg = FILTER_CONFIG[m.type];
  return `
    <div style="font-family:'Inter',sans-serif;min-width:200px;max-width:260px;padding:16px;border-radius:14px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:36px;height:36px;border-radius:10px;background:${cfg.color}18;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
          ${cfg.emoji}
        </div>
        <div>
          <div style="font-weight:700;font-size:14px;color:#111827;line-height:1.2;">${m.title}</div>
          <div style="font-size:10px;font-weight:600;color:${cfg.color};text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">${cfg.label}</div>
        </div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:8px;">
        <div style="color:#374151;font-size:12px;line-height:1.5;">${m.info}</div>
      </div>
      <div style="color:#6b7280;font-size:11px;line-height:1.4;">${m.detail}</div>
    </div>`;
}

/* ─── Component ──────────────────────────────────────── */
export default function MapView() {
  const { t } = useTranslation();
  const mapRef       = useRef(null);
  const instanceRef  = useRef(null);
  const tileRef      = useRef(null);
  const markersRef   = useRef([]);
  
  const [markers, setMarkers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [tileMode, setTileMode] = useState('street');
  const [selected, setSelected] = useState(null);
  const [layerOpen, setLayerOpen] = useState(false);

  /* Fetch all markers from microservices */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [marketRes, weatherRes, labourRes, soilRes] = await Promise.allSettled([
          marketAPI.getMarkers(),
          weatherAPI.getMarkers(),
          labourAPI.getMarkers(),
          fertilizerAPI.getMarkers()
        ]);

        const allMarkers = [];
        if (marketRes.status === 'fulfilled') allMarkers.push(...marketRes.value.data.data);
        if (weatherRes.status === 'fulfilled') allMarkers.push(...weatherRes.value.data.data);
        if (labourRes.status === 'fulfilled') allMarkers.push(...labourRes.value.data.data);
        if (soilRes.status === 'fulfilled') allMarkers.push(...soilRes.value.data.data);

        setMarkers(allMarkers);
      } catch (err) {
        console.error('Failed to fetch map markers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* Initialise map */
  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;

    instanceRef.current = L.map(mapRef.current, {
      center: [22.5, 79.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(instanceRef.current);

    tileRef.current = L.tileLayer(MAP_TILES.street.url, {
      attribution: MAP_TILES.street.attr,
      maxZoom: 18,
    }).addTo(instanceRef.current);

    return () => {
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  /* Render markers whenever filter or markers change */
  const renderMarkersOnMap = useCallback((f, mList) => {
    if (!instanceRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    mList
      .filter(m => (f === 'all' || m.type === f) && m.lat && m.lng)
      .forEach(m => {
        try {
          const marker = L.marker([m.lat, m.lng], { icon: makeIcon(m.type) })
            .addTo(instanceRef.current)
            .bindPopup(makePopup(m), { maxWidth: 280, className: 'kisan-popup' });
          marker.on('click', () => setSelected(m));
          markersRef.current.push(marker);
        } catch (e) {
          console.error('Error rendering marker:', m, e);
        }
      });
  }, []);

  useEffect(() => { 
    renderMarkersOnMap(filter, markers); 
  }, [filter, markers, renderMarkersOnMap]);

  /* Tile mode switch */
  useEffect(() => {
    if (!instanceRef.current || !tileRef.current) return;
    tileRef.current.remove();
    tileRef.current = L.tileLayer(MAP_TILES[tileMode].url, {
      attribution: MAP_TILES[tileMode].attr,
      maxZoom: 18,
    }).addTo(instanceRef.current);
  }, [tileMode]);

  const locateMe = () => {
    if (!navigator.geolocation || !instanceRef.current) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      instanceRef.current.flyTo([coords.latitude, coords.longitude], 11, { duration: 1.5 });
    });
  };

  const counts = Object.fromEntries(
    ['market','weather','soil','labour'].map(type => [type, markers.filter(m => m.type === type).length])
  );

  return (
    <div className="page-wrapper animate-fade-in">

      {/* ── Header ───────────────────────────────────── */}
      <div className="page-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shadow-sm border border-teal-100 dark:border-teal-900/30">
                <MapPin size={22} className="text-teal-600 dark:text-teal-400" />
              </span>
              <span>Smart Kisan Map</span>
            </h1>
            <p className="page-subtitle text-gray-500 font-medium">{t('map.subtitle', 'Market · Weather · Soil · Labour — Live data feed')}</p>
          </div>

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(FILTER_CONFIG).map(([id, cfg]) => (
              <button key={id} onClick={() => setFilter(id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 border-2 uppercase tracking-widest active:scale-95',
                  filter === id
                    ? `${cfg.bg} ${cfg.text} ${cfg.accent} shadow-lg shadow-gray-200 dark:shadow-none scale-105`
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gray-50'
                )}>
                <span className="text-sm">{cfg.emoji}</span>
                <span>{cfg.label}</span>
                {id !== 'all' && (
                  <span className={clsx('px-2 py-0.5 rounded-lg text-[10px] font-black', filter === id ? 'bg-white/60 dark:bg-black/30' : 'bg-gray-100 dark:bg-slate-800')}>
                    {counts[id] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Map + Sidebar layout ──────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* Map */}
        <div className="flex-1 min-w-0 relative">
          {loading && (
            <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-[2.5rem]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="text-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-slate-300 animate-pulse">Syncing Real-time Data...</p>
              </div>
            </div>
          )}

          <div className="map-container relative shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-950" style={{ height: 'clamp(400px, 65vh, 650px)' }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

            {/* Live status badge */}
            <div className="absolute top-6 left-6 z-[1000]">
              <div className="card-glass px-5 py-4 rounded-[1.5rem] shadow-2xl flex flex-col gap-2.5 min-w-[180px] border border-white/20 backdrop-blur-xl">
                <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest flex items-center justify-between">
                  <span>System Live</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-2.5 text-xs font-black text-gray-700 dark:text-slate-200">
                  <Store size={14} className="text-green-500" />
                  <span>Market Prices Active</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-black text-gray-700 dark:text-slate-200">
                  <ThermometerSun size={14} className="text-blue-500" />
                  <span>Weather Monitoring</span>
                </div>
                <div className="mt-1 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>Markers Loaded</span>
                  <span className="text-primary">{markers.filter(m => filter === 'all' || m.type === filter).length}</span>
                </div>
              </div>
            </div>

            {/* Layer toggle */}
            <div className="absolute top-6 right-6 z-[1000]">
              <div className="relative">
                <button
                  onClick={() => setLayerOpen(!layerOpen)}
                  className="card-glass flex items-center gap-2.5 px-5 py-4 rounded-[1.5rem] shadow-2xl text-xs font-black text-gray-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all border border-white/20 backdrop-blur-xl uppercase tracking-widest">
                  <Layers size={16} />
                  <span>{MAP_TILES[tileMode].label}</span>
                </button>
                {layerOpen && (
                  <div className="absolute right-0 mt-3 w-44 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-white/10 py-2.5 animate-scale-up" style={{ zIndex: 1002 }}>
                    {Object.entries(MAP_TILES).map(([key, val]) => (
                      <button key={key} onClick={() => { setTileMode(key); setLayerOpen(false); }}
                        className={clsx(
                          'w-full text-left px-6 py-3.5 text-[10px] font-black hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest',
                          tileMode === key ? 'text-primary bg-primary/5' : 'text-gray-700 dark:text-slate-300'
                        )}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Locate me */}
            <button
              onClick={locateMe}
              title="Locate me"
              className="absolute bottom-8 right-8 z-[1000] w-16 h-16 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-[0_15px_30px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-95 transition-all group">
              <Navigation size={26} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
        <div className="xl:w-80 shrink-0">
          {selected ? (
            <div className="card h-full animate-slide-up shadow-xl border-none bg-white dark:bg-slate-900 flex flex-col p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: `${FILTER_CONFIG[selected.type].color}18` }}>
                    {FILTER_CONFIG[selected.type].emoji}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-base leading-tight">{selected.title}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: FILTER_CONFIG[selected.type].color }}>
                      {FILTER_CONFIG[selected.type].label}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-400 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-gray-50 dark:bg-black/20 rounded-[1.25rem] p-4 border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Information</p>
                  <p className="text-sm text-gray-800 dark:text-slate-200 font-bold leading-relaxed">{selected.info}</p>
                </div>
                <div className="bg-gray-50 dark:bg-black/20 rounded-[1.25rem] p-4 border border-gray-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deep Details</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400 font-medium leading-relaxed italic">"{selected.detail}"</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                  <MapPin size={12} />
                  <span>{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</span>
                </div>
              </div>

              <button
                onClick={() => instanceRef.current?.flyTo([selected.lat, selected.lng], 12, { duration: 1.2 })}
                className="mt-8 btn-primary w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                <Navigation size={14} className="mr-2" /> <span>View on Map</span>
              </button>
            </div>
          ) : (
            <div className="card h-full shadow-xl border-none bg-white dark:bg-slate-900 flex flex-col p-6">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Map Legend</p>
              <div className="space-y-5 mb-8 flex-1">
                {Object.entries(FILTER_CONFIG).filter(([k]) => k !== 'all').map(([type, cfg]) => (
                  <div key={type} className="flex items-center gap-4 group cursor-default">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm transition-transform group-hover:scale-110"
                      style={{ background: `${cfg.color}15` }}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tighter">{cfg.label}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {counts[type]}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium truncate">
                        {type === 'market'  ? 'Mandi prices & trading hours' :
                         type === 'weather' ? 'Live weather & alerts' :
                         type === 'soil'    ? 'Regional soil types & pH' :
                                               'Labour availability & rates'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quick Stats</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Mandis',   value: counts.market,  color: '#16a34a' },
                    { label: 'Weather',  value: counts.weather, color: '#0369a1' },
                    { label: 'Soil',     value: counts.soil,    color: '#92400e' },
                    { label: 'Labour',   value: counts.labour,  color: '#7c3aed' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center border border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-100 dark:hover:bg-slate-800">
                      <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-bold text-center mt-6 uppercase tracking-widest opacity-60">
                Click any marker for details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom info cards ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        {[
          { label: 'Soil Health',  desc: 'Official data & pH',     color: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30', icon: '🌱' },
          { label: 'Labour Force', desc: 'Active availability',   color: 'bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30', icon: '👥' },
          { label: 'Climate',      desc: 'Heat / frost alerts',   color: 'bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-400', border: 'border-sky-100 dark:border-sky-900/30', icon: '🌡️' },
          { label: 'Mandi Rates',  desc: 'Real-time pricing',     color: 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400', border: 'border-green-100 dark:border-green-900/30', icon: '💰' },
        ].map(item => (
          <div key={item.label}
            className={clsx('card p-5 border-2 flex flex-col gap-2 hover:shadow-2xl transition-all cursor-default group', item.color, item.border)}>
            <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <p className="font-black uppercase tracking-tight text-sm">{item.label}</p>
            <p className="text-[10px] font-medium opacity-70 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
