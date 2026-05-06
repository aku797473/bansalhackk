const mongoose = require('mongoose');
const axios = require('axios');
const Redis = require('ioredis');

// --- MongoDB Configuration ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  cachedDb = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return cachedDb;
}

const WeatherHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  city: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  temperature: { type: Number },
  description: { type: String },
  searchType: { type: String, enum: ['current', 'by-city'], required: true },
  timestamp: { type: Date, default: Date.now }
});
const WeatherHistory = mongoose.models.WeatherHistory || mongoose.model('WeatherHistory', WeatherHistorySchema);

// --- Redis Configuration ---
const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
let redis = null;
try {
  redis = new Redis(redisUrl, { maxRetriesPerRequest: 1, retryStrategy: () => null });
} catch (e) {
  console.warn('Redis init failed:', e.message);
}

const OWM_KEY = process.env.OPENWEATHER_API_KEY || 'demo';
const CACHE_TTL = 30 * 60;

const getMockWeather = (lat, lon) => ({
  city: 'Demo Location', country: 'IN', lat, lon, temperature: 32, feelsLike: 35,
  humidity: 68, windSpeed: 12, description: 'Partly Cloudy', icon: '02d', alerts: [],
  forecast: Array.from({ length: 5 }, (_, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    tempMax: 30 + Math.floor(Math.random() * 8), tempMin: 22 + Math.floor(Math.random() * 5),
    description: ['Sunny', 'Cloudy', 'Light Rain', 'Thunderstorm', 'Clear'][i],
    icon: ['01d', '03d', '10d', '11d', '01n'][i],
    humidity: 60 + Math.floor(Math.random() * 25),
  })),
  isMock: true
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  if (req.method === 'OPTIONS') return res.status(200).end();

  await connectToDatabase().catch(e => console.warn('DB connect failed:', e.message));

  const { path } = req.query; // For routing within the function if needed, or use separate files
  const endpoint = req.url.split('?')[0].split('/').pop();

  try {
    if (endpoint === 'history') {
      const userId = req.headers['x-user-id'] || 'anonymous';
      if (mongoose.connection.readyState !== 1) return res.json({ success: true, data: [], note: 'DB disconnected' });
      const history = await WeatherHistory.find({ userId }).sort({ timestamp: -1 }).limit(15);
      return res.json({ success: true, data: history });
    }

    if (endpoint === 'current') {
      const { lat, lon } = req.query;
      if (!lat || !lon) return res.status(400).json({ success: false, message: 'lat/lon required' });
      const userId = req.headers['x-user-id'] || 'anonymous';
      const cacheKey = `weather:current:${parseFloat(lat).toFixed(2)}:${parseFloat(lon).toFixed(2)}`;
      
      let cached = null;
      if (redis) cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

      let weatherData;
      if (!OWM_KEY || OWM_KEY === 'demo') {
        weatherData = getMockWeather(lat, lon);
      } else {
        const [curr, fore] = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&cnt=40`)
        ]);
        // ... transformation logic (same as original)
        const c = curr.data;
        const dailyForecast = [];
        const seen = new Set();
        for (const item of fore.data.list) {
          const date = item.dt_txt.split(' ')[0];
          if (!seen.has(date) && dailyForecast.length < 5) {
            seen.add(date);
            dailyForecast.push({
              date, tempMax: item.main.temp_max, tempMin: item.main.temp_min,
              description: item.weather[0].description, icon: item.weather[0].icon,
              humidity: item.main.humidity
            });
          }
        }
        weatherData = {
          city: c.name, country: c.sys.country, lat: c.coord.lat, lon: c.coord.lon,
          temperature: c.main.temp, feelsLike: c.main.feels_like, humidity: c.main.humidity,
          windSpeed: c.wind.speed, description: c.weather[0].description, icon: c.weather[0].icon,
          alerts: [], forecast: dailyForecast
        };
      }

      if (redis) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(weatherData)).catch(() => {});
      if (mongoose.connection.readyState === 1) {
        WeatherHistory.create({ userId, lat, lon, city: weatherData.city, temperature: weatherData.temperature, description: weatherData.description, searchType: 'current' }).catch(() => {});
      }
      return res.json({ success: true, data: weatherData });
    }

    if (endpoint === 'by-city') {
      const { city } = req.query;
      if (!city) return res.status(400).json({ success: false, message: 'city required' });
      const userId = req.headers['x-user-id'] || 'anonymous';
      const cacheKey = `weather:city:${city.toLowerCase()}`;
      
      let cached = null;
      if (redis) cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });

      let result;
      if (!OWM_KEY || OWM_KEY === 'demo') {
        result = { ...getMockWeather(28.6, 77.2), city };
      } else {
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OWM_KEY}&units=metric`);
        result = {
          city: data.name, country: data.sys.country, lat: data.coord.lat, lon: data.coord.lon,
          temperature: data.main.temp, feelsLike: data.main.feels_like, humidity: data.main.humidity,
          windSpeed: data.wind.speed, description: data.weather[0].description, icon: data.weather[0].icon, alerts: []
        };
      }

      if (redis) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
      if (mongoose.connection.readyState === 1) {
        WeatherHistory.create({ userId, lat: result.lat, lon: result.lon, city: result.city, temperature: result.temperature, description: result.description, searchType: 'by-city' }).catch(() => {});
      }
      return res.json({ success: true, data: result });
    }

    res.status(404).json({ success: false, message: 'Endpoint not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
