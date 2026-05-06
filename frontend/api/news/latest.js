import Parser from 'rss-parser';

const parser = new Parser({
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

// Fallback data in case all feeds fail
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

export default async function handler(req, res) {
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
        const feed = await parser.parseURL(url);
        const mappedItems = feed.items.map(item => {
          // Extract image from various possible tags
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
            id: item.guid || item.link,
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
      } catch (err) {
        console.error(`Failed to fetch feed ${url}:`, err.message);
      }
    }

    if (allItems.length === 0) {
      return res.status(200).json({ success: true, data: fallbackNews[targetLang] });
    }

    // Sort by date and limit to 12 items
    const sortedItems = allItems
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 12);

    res.status(200).json({ success: true, data: sortedItems });
  } catch (error) {
    console.error('Final News API Error:', error);
    res.status(200).json({ success: true, data: fallbackNews[targetLang] });
  }
}
