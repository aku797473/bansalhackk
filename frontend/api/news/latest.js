const newsData = {
  en: [
    { 
      id: 1, 
      title: "PM Kisan 17th Installment Released", 
      description: "Hon'ble Prime Minister has released the 17th installment of PM-KISAN scheme, benefiting over 9.26 crore farmers across India.", 
      category: "Govt", 
      pubDate: new Date().toISOString(), 
      source: "PIB India",
      imageUrl: "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000&auto=format&fit=crop",
      link: "https://pmkisan.gov.in"
    },
    { 
      id: 2, 
      title: "New Subsidy for Drip Irrigation Systems", 
      description: "State government announces 80% subsidy for small and marginal farmers on micro-irrigation equipment to save water and improve yields.", 
      category: "Schemes", 
      pubDate: new Date(Date.now() - 43200000).toISOString(), 
      source: "Agri Ministry",
      imageUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000&auto=format&fit=crop",
      link: "https://agricoop.nic.in"
    },
    { 
      id: 3, 
      title: "Wheat Procurement Prices Increased", 
      description: "The Cabinet Committee on Economic Affairs has approved an increase in the Minimum Support Price (MSP) for wheat for the 2026 season.", 
      category: "Market", 
      pubDate: new Date(Date.now() - 86400000).toISOString(), 
      source: "Economic Times",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1000&auto=format&fit=crop",
      link: "https://economictimes.indiatimes.com"
    },
    { 
      id: 4, 
      title: "Organic Certification Now Simplified", 
      description: "FSSAI introduces a new unified portal for organic farmers to get certification faster and reach international markets.", 
      category: "Business", 
      pubDate: new Date(Date.now() - 129600000).toISOString(), 
      source: "FSSAI",
      imageUrl: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=1000&auto=format&fit=crop",
      link: "https://fssai.gov.in"
    },
    { 
      id: 5, 
      title: "Smart Drone Technology for Pest Control", 
      description: "Indian startups are introducing affordable drone spraying services for farmers, reducing chemical usage by up to 30%.", 
      category: "Tech", 
      pubDate: new Date(Date.now() - 172800000).toISOString(), 
      source: "TechAgri",
      imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=1000&auto=format&fit=crop",
      link: "https://example.com/tech"
    }
  ],
  hi: [
    { 
      id: 1, 
      title: "पीएम किसान की 17वीं किस्त जारी", 
      description: "माननीय प्रधानमंत्री ने पीएम-किसान योजना की 17वीं किस्त जारी की है, जिससे पूरे भारत में 9.26 करोड़ से अधिक किसानों को लाभ होगा।", 
      category: "सरकार", 
      pubDate: new Date().toISOString(), 
      source: "पीआईबी भारत",
      imageUrl: "https://images.unsplash.com/photo-1595067331631-f8442707b864?q=80&w=1000&auto=format&fit=crop",
      link: "https://pmkisan.gov.in"
    },
    { 
      id: 2, 
      title: "ड्रिप सिंचाई प्रणालियों के लिए नई सब्सिडी", 
      description: "राज्य सरकार ने छोटे और सीमांत किसानों के लिए सूक्ष्म सिंचाई उपकरणों पर 80% सब्सिडी की घोषणा की है।", 
      category: "योजनाएं", 
      pubDate: new Date(Date.now() - 43200000).toISOString(), 
      source: "कृषि मंत्रालय",
      imageUrl: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000&auto=format&fit=crop",
      link: "https://agricoop.nic.in"
    },
    { 
      id: 3, 
      title: "गेहूं के समर्थन मूल्य में वृद्धि", 
      description: "आर्थिक मामलों की कैबिनेट समिति ने 2026 सीजन के लिए गेहूं के न्यूनतम समर्थन मूल्य (MSP) में वृद्धि को मंजूरी दे दी है।", 
      category: "बाजार", 
      pubDate: new Date(Date.now() - 86400000).toISOString(), 
      source: "इकोनॉमिक टाइम्स",
      imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1000&auto=format&fit=crop",
      link: "https://economictimes.indiatimes.com"
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
