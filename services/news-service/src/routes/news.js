const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAcH_AAIgcDFmZGVmNjgzOTMyNDM0YWFkOWU2NTE0ZDE5MGQ0MTE4Mg@superb-caiman-115199.upstash.io:6379';
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
});

redis.on('connect', () => {
  console.log('✅ Redis Connected to Upstash (News Service)');
});

redis.on('error', (err) => {
  const safeUrl = redisUrl.replace(/:[^:@]+@/, ':***@');
  console.warn(`⚠️  Redis (${safeUrl}) not available in News Service:`, err.message);
});

const CACHE_TTL = 3600; // 1 hour

const parser = new Parser({
  customFields: {
    item: ['media:content', 'description']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

const handleLatestNews = async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const cacheKey = `news:latest:${lang}`;

    // Try Cache
    if (redis.status === 'ready') {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    let url = '';
    if (lang.startsWith('hi')) {
      const query = encodeURIComponent('खेती OR किसानी OR कृषि');
      url = `https://news.google.com/rss/search?q=${query}&hl=hi&gl=IN&ceid=IN:hi`;
    } else {
      const query = encodeURIComponent('agriculture OR farming India');
      url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
    }

    const feed = await parser.parseURL(url);

    const articles = feed.items.map(item => {
      let imageUrl = null;
      if (item['media:content'] && item['media:content'].$) {
        imageUrl = item['media:content'].$.url;
      } else if (item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      let cleanDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : '';
      if (cleanDesc.length > 150) cleanDesc = cleanDesc.substring(0, 150) + '...';

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: item.source || 'Google News',
        description: cleanDesc,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop'
      };
    }).slice(0, 12);

    // Set Cache
    if (redis.status === 'ready') {
      await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(articles)).catch(() => {});
    }

    res.json({ success: true, data: articles });
  } catch (err) {
    console.error('Error fetching news:', err);
    // Fallback to mock data so the UI doesn't break during demo
    const isHi = req.query.lang && req.query.lang.startsWith('hi');
    const mockNews = [
      {
        title: isHi ? 'किसानों के लिए नई योजना शुरू' : 'New Scheme Launched for Farmers',
        link: '#',
        pubDate: new Date().toISOString(),
        source: 'Smart Kisan',
        description: isHi ? 'सरकार ने किसानों की आय दोगुनी करने के लिए नई योजना की घोषणा की है।' : 'Government announces new scheme to double farmers income.',
        imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop'
      },
      {
        title: isHi ? 'गेहूं के एमएसपी में 5% की वृद्धि' : 'Wheat MSP Increased by 5%',
        link: '#',
        pubDate: new Date().toISOString(),
        source: 'Smart Kisan',
        description: isHi ? 'रबी विपणन सत्र के लिए गेहूं के न्यूनतम समर्थन मूल्य में 5% की वृद्धि की गई है।' : 'Minimum Support Price for wheat has been increased by 5% for the Rabi marketing season.',
        imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1000&auto=format&fit=crop'
      }
    ];
    res.json({ success: true, data: mockNews, fallback: true });
  }
};

router.get('/', handleLatestNews);
router.get('/latest', handleLatestNews);

module.exports = router;
