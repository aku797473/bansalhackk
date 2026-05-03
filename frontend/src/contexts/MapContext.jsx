import { createContext, useContext, useState, useEffect } from 'react';

const MapContext = createContext();

export function MapProvider({ children }) {
  // Persistence Keys
  const STORAGE_KEY = 'smart_kisan_map_data';

  // State
  const [trackPoints, setTrackPoints] = useState([]);
  const [fieldPoints, setFieldPoints] = useState([]);
  const [distance, setDistance] = useState(0);
  const [area, setArea] = useState({ sqm: 0, acres: 0, hectares: 0 });
  const [tileMode, setTileMode] = useState('satellite');
  const [isTracking, setIsTracking] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.trackPoints) setTrackPoints(parsed.trackPoints);
        if (parsed.fieldPoints) setFieldPoints(parsed.fieldPoints);
        if (parsed.distance) setDistance(parsed.distance);
        if (parsed.area) setArea(parsed.area);
        if (parsed.tileMode) setTileMode(parsed.tileMode);
        // We don't restore isTracking automatically to prevent accidental GPS usage on load
      } catch (err) {
        console.error("Failed to load map data from localStorage:", err);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToSave = {
      trackPoints,
      fieldPoints,
      distance,
      area,
      tileMode
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [trackPoints, fieldPoints, distance, area, tileMode]);

  const clearTracking = () => {
    setTrackPoints([]);
    setDistance(0);
    setIsTracking(false);
  };

  const clearField = () => {
    setFieldPoints([]);
    setArea({ sqm: 0, acres: 0, hectares: 0 });
  };

  const value = {
    trackPoints, setTrackPoints,
    fieldPoints, setFieldPoints,
    distance, setDistance,
    area, setArea,
    tileMode, setTileMode,
    isTracking, setIsTracking,
    clearTracking,
    clearField
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
