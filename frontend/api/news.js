const FEEDS = {
  en: "https://news.google.com/rss/search?q=agriculture+india&hl=en-IN&gl=IN&ceid=IN:en",
  hi: "https://news.google.com/rss/search?q=कृषि+समाचार&hl=hi&gl=IN&ceid=IN:hi"
};

module.exports = async (req, res) => {
  const { lang = 'en' } = req.query;
  const targetLang = lang === 'hi' ? 'hi' : 'en';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const rssUrl = FEEDS[targetLang];
    // Using a public RSS-to-JSON proxy to avoid manual XML parsing
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status === 'ok' && data.items) {
      const agriImages = [
        "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000",
        "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1000",
        "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000",
        "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1000",
        "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000",
        "https://images.unsplash.com/photo-1561470508-fd4df1ed90b2?q=80&w=1000",
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000"
      ];

      const mappedItems = data.items.map((item, index) => ({
        id: item.guid || index,
        title: item.title,
        description: item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        category: "Live News",
        pubDate: item.pubDate,
        source: item.author || "Google News",
        imageUrl: item.enclosure?.link || item.thumbnail || agriImages[index % agriImages.length],
        link: item.link
      }));
      
      return res.status(200).json({ success: true, data: mappedItems });
    }

    throw new Error('API failed');
  } catch (error) {
    console.error('News API Error:', error.message);
    // Return a slightly randomized version of your Hindi/English JSON as fallback
    // so it ALWAYS works even if the external API is down
    const fallbackUrl = `https://${req.headers.host}/news_${targetLang}.json`;
    try {
      const fbResp = await fetch(fallbackUrl);
      const fbData = await fbResp.json();
      res.status(200).json(fbData);
    } catch (e) {
      res.status(200).json({ success: false, message: "News temporarily unavailable" });
    }
  }
};
