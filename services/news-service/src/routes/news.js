const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'description']
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

router.get('/latest', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    let url = '';

    if (lang === 'hi') {
      // Hindi Agriculture News
      url = 'https://news.google.com/rss/search?q=खेती+OR+किसानी+OR+कृषि&hl=hi&gl=IN&ceid=IN:hi';
    } else {
      // English Agriculture News
      url = 'https://news.google.com/rss/search?q=agriculture+OR+farming+India&hl=en-IN&gl=IN&ceid=IN:en';
    }

    const feed = await parser.parseURL(url);

    // Clean up and format the items
    const articles = feed.items.map(item => {
      // Extract image from description HTML or media:content if available
      let imageUrl = null;
      if (item['media:content'] && item['media:content'].$) {
        imageUrl = item['media:content'].$.url;
      } else if (item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }

      // Clean HTML from description
      let cleanDesc = item.description 
        ? item.description.replace(/<[^>]+>/g, '').trim() 
        : '';
      
      // Limit description length
      if (cleanDesc.length > 150) {
        cleanDesc = cleanDesc.substring(0, 150) + '...';
      }

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        source: item.source || 'Google News',
        description: cleanDesc,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop' // Fallback farming image
      };
    }).slice(0, 12); // Get top 12 articles

    res.json({ success: true, data: articles });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch news' });
  }
});

module.exports = router;
