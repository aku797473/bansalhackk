import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMap } from '../contexts/MapContext';
import { buyerAPI } from '../services/api';

import {
  MapPin, NavigationArrow, MapTrifold, Ruler, Trash, StopCircle, PlayCircle, Target
} from '@phosphor-icons/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';
import * as turf from '@turf/turf';

export default function MapView() {
  const { t } = useTranslation();
  
  const { 
    trackPoints, setTrackPoints,
    fieldPoints, setFieldPoints,
    distance, setDistance,
    area, setArea,
    tileMode, setTileMode,
    isTracking, setIsTracking,
    clearTracking: contextClearTracking,
    clearField: contextClearField
  } = useMap();

  // Leaflet refs
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const trackPolylineRef = useRef(null);
  const fieldPolygonRef = useRef(null);
  const fieldMarkersRef = useRef(null);

  // Geolocation tracking
  const watchIdRef = useRef(null);

  // Local UI states only
  const [speed, setSpeed] = useState(0); // km/h

  const MAP_TILES = {
    street: { label: 'Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap' },
    satellite: { label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Esri, Maxar, Earthstar Geographics' }
  };

  const [currentLoc, setCurrentLoc] = useState(null);
  const [markers, setMarkers] = useState([]);


  /* ─── Initialize Map ──────────────────────────────────── */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    // Clear any stale Leaflet _leaflet_id left from React StrictMode's double-invoke
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    // Snapshot tileMode to avoid stale closure
    const initialTile = MAP_TILES['satellite'];

    // Initialize Map
    mapRef.current = L.map(container, {
      center: [22.5, 79.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
      doubleClickZoom: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    // Initial Tile
    tileLayerRef.current = L.tileLayer(initialTile.url, {
      attribution: initialTile.attr,
      maxZoom: 20,
    }).addTo(mapRef.current);

    // Initialize Layers
    trackPolylineRef.current = L.polyline([], { color: '#3b82f6', weight: 5, opacity: 0.8 }).addTo(mapRef.current);
    fieldPolygonRef.current = L.polygon([], { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.4, weight: 3 }).addTo(mapRef.current);
    fieldMarkersRef.current = L.layerGroup().addTo(mapRef.current);

    // User Marker Icon
    const userIcon = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 0 15px rgba(0,0,0,0.4);"></div>`,
      className: '', iconSize: [20,20], iconAnchor: [10,10]
    });
    userMarkerRef.current = L.marker([0, 0], { icon: userIcon, zIndexOffset: 1000 });

    // Handle Map Clicks (Field Measurement)
    mapRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setFieldPoints(prev => [...prev, [lat, lng]]);
    });

    // Request initial position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        if (!mapRef.current) return;
        const initialLoc = [coords.latitude, coords.longitude];
        setCurrentLoc(initialLoc);
        userMarkerRef.current.setLatLng(initialLoc).addTo(mapRef.current);
        mapRef.current.flyTo(initialLoc, 16, { duration: 1.5 });
      }, () => {}, { enableHighAccuracy: true });
    }

    // Fetch and display markers
    fetchMarkers().then(() => {
      // Check for URL parameters to auto-center
      const params = new URLSearchParams(window.location.search);
      const lat = parseFloat(params.get('lat'));
      const lng = parseFloat(params.get('lng'));
      if (lat && lng && mapRef.current) {
        setTimeout(() => {
          mapRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
        }, 1000);
      }
    });

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // Clean up _leaflet_id so Leaflet can re-initialize on the same DOM node
      if (container) {
        delete container._leaflet_id;
      }
    };
  }, []);

  /* ─── Switch Map Tile ─────────────────────────────────── */
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.remove();
    tileLayerRef.current = L.tileLayer(MAP_TILES[tileMode].url, {
      attribution: MAP_TILES[tileMode].attr,
      maxZoom: 20,
    }).addTo(mapRef.current);
  }, [tileMode]);

  /* ─── GPS Tracking Logic ──────────────────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) return;

    if (isTracking) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        ({ coords }) => {
          if (!mapRef.current) return; // Guard: map may have unmounted
          const newLoc = [coords.latitude, coords.longitude];
          setCurrentLoc(newLoc);
          setSpeed(coords.speed ? (coords.speed * 3.6).toFixed(1) : 0); // m/s to km/h

          // Update user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(newLoc);
            if (!userMarkerRef.current._map && mapRef.current) userMarkerRef.current.addTo(mapRef.current);
          }

          // Add to track points and calculate distance
          setTrackPoints(prev => {
            const newPoints = [...prev, newLoc];
            
            if (prev.length > 0 && mapRef.current) {
              const lastPoint = prev[prev.length - 1];
              const dist = mapRef.current.distance(lastPoint, newLoc);
              setDistance(d => d + dist);
            }

            // Update polyline
            if (trackPolylineRef.current) {
              trackPolylineRef.current.setLatLngs(newPoints);
            }

            // Auto-pan map if tracking
            if (mapRef.current) {
              mapRef.current.panTo(newLoc, { animate: true });
            }

            return newPoints;
          });
        },
        (err) => console.warn('GPS Error:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        setSpeed(0);
      }
    }

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isTracking]);

  /* ─── Sync Track Polyline ─────────────────────────────── */
  useEffect(() => {
    if (trackPolylineRef.current && trackPoints.length > 0) {
      trackPolylineRef.current.setLatLngs(trackPoints);
    }
  }, [trackPoints]);

  /* ─── Field Measurement Logic ─────────────────────────── */
  useEffect(() => {
    if (!fieldPolygonRef.current || !fieldMarkersRef.current) return;

    // Draw polygon
    fieldPolygonRef.current.setLatLngs(fieldPoints);

    // Draw markers for corners
    fieldMarkersRef.current.clearLayers();
    const cornerIcon = L.divIcon({
      html: `<div style="width:12px;height:12px;background:#22c55e;border-radius:50%;border:2px solid white;box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>`,
      className: '', iconSize: [12,12], iconAnchor: [6,6]
    });
    fieldPoints.forEach(pt => {
      L.marker(pt, { icon: cornerIcon, interactive: false }).addTo(fieldMarkersRef.current);
    });

    // Calculate Area using Turf.js
    if (fieldPoints.length >= 3) {
      try {
        // Turf requires the first and last point to be identical to close the polygon
        const turfCoords = fieldPoints.map(p => [p[1], p[0]]); // Leaflet is [lat, lng], Turf is [lng, lat]
        turfCoords.push(turfCoords[0]); 

        const polygon = turf.polygon([turfCoords]);
        const calculatedSqm = turf.area(polygon);
        
        setArea({
          sqm: calculatedSqm,
          acres: calculatedSqm * 0.000247105,
          hectares: calculatedSqm / 10000
        });
      } catch (err) {
        console.error("Area calculation error:", err);
      }
    } else {
      setArea({ sqm: 0, acres: 0, hectares: 0 });
    }
  }, [fieldPoints]);

  const fetchMarkers = async () => {
    try {
      const { data } = await buyerAPI.getMarkers();
      if (data.success && mapRef.current) {
        data.data.forEach(m => {
          const icon = L.divIcon({
            html: `<div class="marker-pin" style="background: ${m.type === 'buyer' ? '#16a34a' : '#3b82f6'}; border: 2px solid white; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; items-center; justify-center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><div style="transform: rotate(45deg); color: white; font-size: 14px;">${m.type === 'buyer' ? '🏪' : '💼'}</div></div>`,
            className: '', iconSize: [30, 30], iconAnchor: [15, 30]
          });
          L.marker([m.lat, m.lng], { icon })
            .bindPopup(`<div style="font-family: Inter, sans-serif; padding: 10px;">
              <h3 style="margin: 0 0 5px; font-weight: 800; color: #1e293b;">${m.title}</h3>
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #64748b;">${m.info}</p>
              <p style="margin: 5px 0 0; font-size: 11px; color: #94a3b8; font-style: italic;">${m.detail}</p>
            </div>`)
            .addTo(mapRef.current);
        });
      }
    } catch (err) {
      console.error('Failed to fetch markers', err);
    }
  };

  /* ─── Handlers ────────────────────────────────────────── */
  const toggleTracking = () => setIsTracking(!isTracking);
  
  const clearTracking = () => {
    contextClearTracking();
    if (trackPolylineRef.current) trackPolylineRef.current.setLatLngs([]);
  };

  const clearField = () => {
    contextClearField();
  };


  const centerOnUser = () => {
    if (currentLoc && mapRef.current) {
      mapRef.current.flyTo(currentLoc, 17, { duration: 1.5 });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        if (!mapRef.current) return;
        const newLoc = [coords.latitude, coords.longitude];
        setCurrentLoc(newLoc);
        if (userMarkerRef.current) userMarkerRef.current.setLatLng(newLoc).addTo(mapRef.current);
        mapRef.current.flyTo(newLoc, 17, { duration: 1.5 });
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans pt-24 sm:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3.5 py-1 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/20 flex items-center gap-2">
              <NavigationArrow size={14} weight="fill" className="animate-pulse" />
              {t('map.gps_active')}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-black leading-tight font-outfit">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              {t('map.title')}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-3 max-w-lg leading-relaxed">
            {t('map.subtitle')}
          </p>
        </div>
        
        <div className="flex bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-1 shadow-premium border border-slate-200/50 dark:border-slate-800/50">
          <button onClick={() => setTileMode('street')} className={clsx('px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest', tileMode === 'street' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white')}>STREET</button>
          <button onClick={() => setTileMode('satellite')} className={clsx('px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest', tileMode === 'satellite' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white')}>SATELLITE</button>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* ── Interactive Map ── */}
        <div className="xl:flex-1 relative rounded-[3rem] overflow-hidden shadow-premium border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950" style={{ height: 'clamp(400px, 65vh, 800px)' }}>
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />
          
          {/* Map Overlay Controls */}
          <button onClick={centerOnUser} className="absolute bottom-8 right-8 z-[1000] w-16 h-16 bg-white dark:bg-slate-800 text-indigo-600 dark:text-white rounded-[2rem] shadow-premium flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-slate-200/50 dark:border-slate-800/50">
            <Target size={28} weight="bold" />
          </button>
          
          <div className="absolute top-8 left-8 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-xl border border-white/20 dark:border-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {t('map.tap_tip')}
          </div>
        </div>

        {/* ── Sidebar Controls ── */}
        <div className="xl:w-96 shrink-0 flex flex-col gap-8">
          
          {/* Tracking Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 shadow-premium flex flex-col gap-6 group relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                  <NavigationArrow size={18} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                </div>
                {t('map.gps_tracking')}
              </h2>
              {isTracking && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>}
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 text-center shadow-sm">
                <p className="text-3xl font-black text-slate-900 dark:text-white font-outfit">{speed}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">KM/H</p>
              </div>
              <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 text-center shadow-sm">
                <p className="text-3xl font-black text-slate-900 dark:text-white font-outfit">{(distance).toFixed(0)}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{t('map.meters')}</p>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button onClick={toggleTracking} className={clsx("flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95", isTracking ? "bg-red-600 text-white shadow-red-500/20" : "bg-indigo-600 text-white shadow-indigo-500/20")}>
                {isTracking ? <StopCircle size={18} weight="bold" /> : <PlayCircle size={18} weight="bold" />}
                {isTracking ? t('map.stop') : t('map.start')}
              </button>
              <button onClick={clearTracking} disabled={trackPoints.length === 0} className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 border border-slate-200/50 dark:border-slate-700/50">
                <Trash size={18} weight="bold" />
              </button>
            </div>
          </div>

          {/* Measurement Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 shadow-premium flex flex-col gap-6 flex-1 group relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                <Ruler size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('map.area_measurement')}
            </h2>

            <div className="bg-emerald-500/10 dark:bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/20 text-center relative z-10 shadow-inner">
              <p className="text-6xl font-black text-emerald-600 dark:text-emerald-400 mb-2 font-outfit leading-none">{area.acres.toFixed(2)}</p>
              <p className="text-[10px] font-black text-emerald-800/60 dark:text-emerald-200/60 uppercase tracking-[0.3em]">{t('map.total_acres')}</p>
            </div>
            
            <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 flex justify-between items-center relative z-10 shadow-sm">
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white font-outfit">{area.hectares.toFixed(2)}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('map.hectares')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-slate-900 dark:text-white font-outfit">{Math.round(area.sqm).toLocaleString()}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('map.sq_meters')}</p>
              </div>
            </div>

            <div className="mt-auto relative z-10">
              <p className="text-[10px] text-slate-400 font-bold mb-4 text-center tracking-widest uppercase">{t('map.points_added', { count: fieldPoints.length })}</p>
              <button onClick={clearField} disabled={fieldPoints.length === 0} className="w-full h-14 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50 border border-red-100 dark:border-red-500/20">
                <Trash size={18} weight="bold" /> {t('map.clear_boundary')}
              </button>
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
