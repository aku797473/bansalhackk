const express = require('express');
const router = express.Router();
const axios = require('axios');
const Redis = process.env.MOCK_REDIS_KAFKA ? require('../../../../utils/mockRedis') : require('ioredis');
const { Kafka } = process.env.MOCK_REDIS_KAFKA ? require('../../../../utils/mockKafka') : require('kafkajs');
const WeatherHistory = require('../models/WeatherHistory');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null
});
redis.on('error', (err) => console.warn('⚠️  Redis not available:', err.message));

// Kafka producer (lazy init)
let producer = null;
const initKafka = async () => {
  try {
    const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER || 'localhost:9092'] });
    producer = kafka.producer();
    await producer.connect();
    console.log('✅ Kafka producer connected (weather)');
  } catch (err) {
    console.warn('⚠️  Kafka not available:', err.message);
  }
};
initKafka();

const OWM_KEY = process.env.OPENWEATHER_API_KEY || 'demo';
const CACHE_TTL = 30 * 60; // 30 minutes

// Mock weather data for demo (when API key not set)
const getMockWeather = (lat, lon) => ({
  city:        'Demo Location',
  country:     'IN',
  lat, lon,
  temperature: 32,
  feelsLike:   35,
  humidity:    68,
  windSpeed:   12,
  description: 'Partly Cloudy',
  icon:        '02d',
  alerts:      [],
  forecast: Array.from({ length: 5 }, (_, i) => ({
    date:        new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    tempMax:     30 + Math.floor(Math.random() * 8),
    tempMin:     22 + Math.floor(Math.random() * 5),
    description: ['Sunny', 'Cloudy', 'Light Rain', 'Thunderstorm', 'Clear'][i],
    icon:        ['01d', '03d', '10d', '11d', '01n'][i],
    humidity:    60 + Math.floor(Math.random() * 25),
  })),
  isMock: true,
});

// GET /weather/history
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const history = await WeatherHistory.find({ userId }).sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /weather/current?lat=28.6&lon=77.2
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon are required' });
    }

    const userId = req.headers['x-user-id'] || 'anonymous';

    const cacheKey = `weather:current:${parseFloat(lat).toFixed(2)}:${parseFloat(lon).toFixed(2)}`;
    const isRedisReady = redis.status === 'ready';
    const cached = isRedisReady ? await redis.get(cacheKey) : null;
    if (cached) {
      const data = JSON.parse(cached);
      WeatherHistory.create({ userId, lat, lon, city: data.city, temperature: data.temperature, description: data.description, searchType: 'current' }).catch(console.error);
      return res.json({ success: true, data, cached: true });
    }

    if (!OWM_KEY || OWM_KEY === 'demo' || OWM_KEY.includes('your_')) {
      const mock = getMockWeather(lat, lon);
      if (isRedisReady) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(mock)).catch(() => {});
      WeatherHistory.create({ userId, lat, lon, city: mock.city, temperature: mock.temperature, description: mock.description, searchType: 'current' }).catch(console.error);
      return res.json({ success: true, data: mock });
    }

    // Real OpenWeatherMap API
    const [current, forecast] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&cnt=40`),
    ]);

    const c = current.data;
    const dailyForecast = [];
    const seen = new Set();
    for (const item of forecast.data.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!seen.has(date) && dailyForecast.length < 5) {
        seen.add(date);
        dailyForecast.push({
          date,
          tempMax:     item.main.temp_max,
          tempMin:     item.main.temp_min,
          description: item.weather[0].description,
          icon:        item.weather[0].icon,
          humidity:    item.main.humidity,
        });
      }
    }

    const weatherData = {
      city:        c.name,
      country:     c.sys.country,
      lat:         c.coord.lat,
      lon:         c.coord.lon,
      temperature: c.main.temp,
      feelsLike:   c.main.feels_like,
      humidity:    c.main.humidity,
      windSpeed:   c.wind.speed,
      description: c.weather[0].description,
      icon:        c.weather[0].icon,
      alerts:      [],
      forecast:    dailyForecast,
    };

    // Check for severe weather alerts
    const severe = ['thunderstorm', 'tornado', 'storm', 'heavy rain', 'flood', 'hail'];
    if (severe.some(w => c.weather[0].description.toLowerCase().includes(w))) {
      weatherData.alerts = [{ type: 'severe', message: `Severe weather: ${c.weather[0].description}` }];
      if (producer) {
        await producer.send({
          topic: 'weather.alert',
          messages: [{ value: JSON.stringify({ lat, lon, alert: weatherData.alerts[0] }) }],
        });
      }
    }

    if (isRedisReady) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(weatherData)).catch(() => {});
    WeatherHistory.create({ userId, lat, lon, city: weatherData.city, temperature: weatherData.temperature, description: weatherData.description, searchType: 'current' }).catch(console.error);
    res.json({ success: true, data: weatherData });
  } catch (err) {
    console.error('Weather API error (falling back to mock):', err.message);
    const { lat, lon } = req.query;
    const mock = getMockWeather(lat || 28.6, lon || 77.2);
    res.json({ success: true, data: mock, note: 'Using fallback data due to API error' });
  }
});

// GET /weather/by-city?city=Delhi
router.get('/by-city', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ success: false, message: 'city is required' });

    const userId = req.headers['x-user-id'] || 'anonymous';

    const cacheKey = `weather:city:${city.toLowerCase()}`;
    const isRedisReady = redis.status === 'ready';
    const cached = isRedisReady ? await redis.get(cacheKey) : null;
    if (cached) {
       const data = JSON.parse(cached);
       WeatherHistory.create({ userId, lat: data.lat, lon: data.lon, city: data.city, temperature: data.temperature, description: data.description, searchType: 'by-city' }).catch(console.error);
       return res.json({ success: true, data, cached: true });
    }

    if (!OWM_KEY || OWM_KEY === 'demo' || OWM_KEY.includes('your_')) {
      const mock = { ...getMockWeather(28.6, 77.2), city };
      if (isRedisReady) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(mock)).catch(() => {});
      WeatherHistory.create({ userId, lat: mock.lat, lon: mock.lon, city: mock.city, temperature: mock.temperature, description: mock.description, searchType: 'by-city' }).catch(console.error);
      return res.json({ success: true, data: mock });
    }

    const { data } = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OWM_KEY}&units=metric`
    );
    const result = {
      city: data.name, country: data.sys.country,
      lat: data.coord.lat, lon: data.coord.lon,
      temperature: data.main.temp, feelsLike: data.main.feels_like,
      humidity: data.main.humidity, windSpeed: data.wind.speed,
      description: data.weather[0].description, icon: data.weather[0].icon,
      alerts: [],
    };
    if (isRedisReady) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    WeatherHistory.create({ userId, lat: result.lat, lon: result.lon, city: result.city, temperature: result.temperature, description: result.description, searchType: 'by-city' }).catch(console.error);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Weather API error (city fallback):', err.message);
    const { city } = req.query;
    const mock = { ...getMockWeather(28.6, 77.2), city: city || 'Unknown' };
    res.json({ success: true, data: mock, note: 'Using fallback data due to API error' });
  }
});

// GET /weather/map-markers
router.get('/map-markers', async (req, res) => {
  try {
    const cacheKey = 'weather:all:map-markers';
    const isRedisReady = redis.status === 'ready';
    if (isRedisReady) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const cities = ['Indore', 'Ludhiana', 'Amritsar', 'Pune', 'Nagpur', 'Nashik', 'Rajkot', 'Kanpur', 'Patna', 'Bhopal'];
    const markers = await Promise.all(cities.map(async (city) => {
      try {
        const cityCacheKey = `weather:city:${city.toLowerCase()}`;
        let data;
        const cityCached = isRedisReady ? await redis.get(cityCacheKey) : null;
        
        if (cityCached) {
          data = JSON.parse(cityCached);
        } else if (!OWM_KEY || OWM_KEY === 'demo' || OWM_KEY.includes('your_')) {
          data = { ...getMockWeather(28.6, 77.2), city };
        } else {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OWM_KEY}&units=metric`
          );
          data = {
            city: response.data.name,
            lat: response.data.coord.lat,
            lon: response.data.coord.lon,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
          };
          if (isRedisReady) await redis.setex(cityCacheKey, CACHE_TTL, JSON.stringify(data)).catch(() => {});
        }

        return {
          lat: data.lat,
          lng: data.lon,
          type: 'weather',
          title: data.city,
          info: `${data.temperature}°C · ${data.description}`,
          detail: `Humidity: ${data.humidity || 60}% · Real-time data`
        };
      } catch (e) {
        return null;
      }
    }));

    const result = markers.filter(m => m !== null);
    if (isRedisReady) {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
