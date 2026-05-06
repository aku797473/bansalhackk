const newsData = {
  en: [
    { 
      id: 1, 
      title: "PM Kisan Installment Released", 
      description: "The government has released the latest installment of PM Kisan Samman Nidhi. Farmers can check their status on the official portal.", 
      category: "Govt", 
      pubDate: new Date().toISOString(), 
      source: "Agri Dept",
      imageUrl: "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000&auto=format&fit=crop",
      link: "https://pmkisan.gov.in"
    },
    { 
      id: 2, 
      title: "Good Monsoon Predicted for 2026", 
      description: "Meteorological department predicts a healthy monsoon season, which is expected to boost crop yields across major agricultural belts.", 
      category: "Weather", 
      pubDate: new Date(Date.now() - 86400000).toISOString(), 
      source: "IMD",
      imageUrl: "https://images.unsplash.com/photo-1561470508-fd4df1ed90b2?q=80&w=1000&auto=format&fit=crop",
      link: "https://mausam.imd.gov.in"
    },
    { 
      id: 3, 
      title: "Organic Farming Subsidy Announced", 
      description: "New incentives for farmers switching to organic methods. Applications open next month for state-wide programs.", 
      category: "Schemes", 
      pubDate: new Date(Date.now() - 172800000).toISOString(), 
      source: "State Agri",
      imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000&auto=format&fit=crop",
      link: "https://darpg.gov.in"
    }
  ],
  hi: [
    { 
      id: 1, 
      title: "पीएम किसान की किस्त जारी", 
      description: "सरकार ने पीएम किसान सम्मान निधि की ताजा किस्त जारी कर दी है। किसान आधिकारिक पोर्टल पर अपनी स्थिति देख सकते हैं।", 
      category: "सरकार", 
      pubDate: new Date().toISOString(), 
      source: "कृषि विभाग",
      imageUrl: "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000&auto=format&fit=crop",
      link: "https://pmkisan.gov.in"
    },
    { 
      id: 2, 
      title: "2026 के लिए अच्छे मानसून की भविष्यवाणी", 
      description: "मौसम विभाग ने अच्छे मानसून के मौसम की भविष्यवाणी की है, जिससे प्रमुख कृषि क्षेत्रों में फसल की पैदावार बढ़ने की उम्मीद है।", 
      category: "मौसम", 
      pubDate: new Date(Date.now() - 86400000).toISOString(), 
      source: "IMD",
      imageUrl: "https://images.unsplash.com/photo-1561470508-fd4df1ed90b2?q=80&w=1000&auto=format&fit=crop",
      link: "https://mausam.imd.gov.in"
    }
  ]
};

export default function handler(req, res) {
  const { lang = 'en' } = req.query;
  
  // Basic CORS headers for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ 
    success: true, 
    data: newsData[lang] || newsData.en 
  });
}
