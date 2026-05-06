const Parser = require('rss-parser');
const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['image', 'image'],
      ['enclosure', 'enclosure']
    ]
  }
});

const FEEDS = {
  en: [
    'https://krishijagran.com/rss/news/',
    'https://www.thehindubusinessline.com/economy/agri-business/?service=rss'
  ],
  hi: [
    'https://hindi.krishijagran.com/rss/news/'
  ]
};

const fallbackNews = {
  en: [
    { 
      id: "f1", title: "PM Kisan 17th Installment Released", 
      description: "Hon'ble Prime Minister has released the 17th installment of PM-KISAN scheme.", 
      category: "Govt", pubDate: new Date().toISOString(), source: "PIB India",
      imageUrl: "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000&auto=format&fit=crop",
      link: "https://pmkisan.gov.in"
    }
  ],
  hi: [
    { 
      id: "f1", title: "पीएम किसान की 17वीं किस्त जारी", 
      description: "माननीय प्रधानमंत्री ने पीएम-किसान योजना की 17वीं किस्त जारी की है।", 
      category: "सरकार", pubDate: new Date().toISOString(), source: "पीआईबी भारत",
      imageUrl: "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000&auto=format&fit=crop",
      link: "https://pmkisan.gov.in"
    }
  ]
};

module.exports = async (req, res) => {
  const { lang = 'en' } = req.query;
  const targetLang = lang === 'hi' ? 'hi' : 'en';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const feedUrls = FEEDS[targetLang];
    const allItems = [];

    for (const url of feedUrls) {
      try {
        console.log(`Fetching feed: ${url}`);
        const feed = await parser.parseURL(url);
        if (feed && feed.items) {
          const mappedItems = feed.items.map(item => {
            let imageUrl = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop";
            
            if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
              imageUrl = item.mediaContent.$.url;
            } else if (item.enclosure && item.enclosure.url) {
              imageUrl = item.enclosure.url;
            } else if (item.content && item.content.includes('<img')) {
              const match = item.content.match(/src="([^"]+)"/);
              if (match) imageUrl = match[1];
            }

            return {
              id: item.guid || item.link || Math.random().toString(),
              title: item.title,
              description: item.contentSnippet || item.description || "",
              category: "Agriculture",
              pubDate: item.pubDate || new Date().toISOString(),
              source: feed.title || "Agri News",
              imageUrl: imageUrl,
              link: item.link
            };
          });
          allItems.push(...mappedItems);
        }
      } catch (err) {
        console.error(`Error in ${url}:`, err.message);
      }
    }

    if (allItems.length === 0) {
      console.log('No items found, returning fallback');
      return res.status(200).json({ success: true, data: fallbackNews[targetLang] });
    }

    const sortedItems = allItems
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 12);

    res.status(200).json({ success: true, data: sortedItems });
  } catch (error) {
    console.error('Global API Error:', error);
    res.status(200).json({ success: true, data: fallbackNews[targetLang] });
  }
};
