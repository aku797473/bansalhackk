import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMap } from '../contexts/MapContext';

import {
  MapPin, Navigation, Map, Ruler, Trash2, StopCircle, PlayCircle, Focus
} from 'lucide-react';
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
    <div className="page-wrapper animate-fade-in">

      {/* ── Header ───────────────────────────────────── */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
              <Map size={22} className="text-primary" />
            </span>
            <span>{t('map.title')}</span>
          </h1>
          <p className="page-subtitle text-gray-500 font-medium mt-1">{t('map.subtitle')}</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-slate-800">
          <button onClick={() => setTileMode('street')} className={clsx('px-4 py-2 rounded-xl text-xs font-bold transition-colors uppercase tracking-widest', tileMode === 'street' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800')}>{t('map.street')}</button>
          <button onClick={() => setTileMode('satellite')} className={clsx('px-4 py-2 rounded-xl text-xs font-bold transition-colors uppercase tracking-widest', tileMode === 'satellite' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800')}>{t('map.satellite')}</button>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6">

        {/* ── Interactive Map ── */}
        <div className="xl:flex-1 relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-950" style={{ height: 'clamp(320px, 58vh, 700px)' }}>
          <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 1 }} />
          
          {/* Map Overlay Controls */}
          <button onClick={centerOnUser} className="absolute bottom-6 right-6 z-[1000] w-14 h-14 bg-white dark:bg-slate-800 text-primary dark:text-white rounded-[2rem] shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <Focus size={24} />
          </button>
          
          <div className="absolute top-6 left-6 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">
            {t('map.tap_tip')}
          </div>
        </div>

        {/* ── Sidebar Controls ── */}
        <div className="xl:w-80 shrink-0 flex flex-col gap-6">
          
          {/* Tracking Card */}
          <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white flex items-center gap-2">
                <Navigation size={16} className="text-blue-500" /> {t('map.gps_tracking')}
              </h2>
              {isTracking && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-center">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{speed}</p>
                <p className="text-[10px] font-bold text-blue-800/60 dark:text-blue-200/60 uppercase tracking-widest">km/h</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 text-center">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{(distance).toFixed(0)}</p>
                <p className="text-[10px] font-bold text-blue-800/60 dark:text-blue-200/60 uppercase tracking-widest">{t('map.meters')}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={toggleTracking} className={clsx("flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95", isTracking ? "bg-red-500 text-white shadow-red-500/20" : "bg-blue-500 text-white shadow-blue-500/20")}>
                {isTracking ? <StopCircle size={16} /> : <PlayCircle size={16} />}
                {isTracking ? t('map.stop') : t('map.start')}
              </button>
              <button onClick={clearTracking} disabled={trackPoints.length === 0} className="w-12 h-12 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Measurement Card */}
          <div className="card bg-white dark:bg-slate-900 border-none shadow-xl p-6 flex flex-col gap-4 flex-1">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 dark:text-white flex items-center gap-2">
              <Ruler size={16} className="text-green-500" /> {t('map.area_measurement')}
            </h2>

            <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
              <p className="text-4xl font-black text-green-600 dark:text-green-400 mb-1">{area.acres.toFixed(2)}</p>
              <p className="text-xs font-bold text-green-800/60 dark:text-green-200/60 uppercase tracking-widest">{t('map.total_acres')}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="text-lg font-black text-gray-700 dark:text-slate-200">{area.hectares.toFixed(2)}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('map.hectares')}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-700 dark:text-slate-200">{Math.round(area.sqm).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('map.sq_meters')}</p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] text-gray-400 font-medium mb-3 text-center">{t('map.points_added', { count: fieldPoints.length })}</p>
              <button onClick={clearField} disabled={fieldPoints.length === 0} className="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50">
                <Trash2 size={16} /> {t('map.clear_boundary')}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
