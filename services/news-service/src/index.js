const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5009;

app.use(cors());
app.use(express.json());

const newsData = {
  en: [
    { id: 1, title: "PM Kisan Samman Nidhi: New installment released", summary: "Government releases latest installment of PM Kisan Samman Nidhi scheme benefiting crores of farmers.", category: "Government", date: new Date().toISOString(), source: "Ministry of Agriculture" },
    { id: 2, title: "Monsoon forecast: Good rainfall expected this season", summary: "IMD predicts normal to above-normal monsoon rainfall across major agricultural regions of India.", category: "Weather", date: new Date().toISOString(), source: "IMD India" },
    { id: 3, title: "MSP increased for Kharif crops", summary: "Cabinet approves hike in Minimum Support Price for major Kharif crops to boost farmer income.", category: "Policy", date: new Date().toISOString(), source: "Government of India" },
    { id: 4, title: "New drought-resistant wheat variety developed", summary: "ICAR scientists develop new wheat variety that can withstand drought conditions and give higher yield.", category: "Research", date: new Date().toISOString(), source: "ICAR" },
    { id: 5, title: "Crop insurance claims: Faster processing announced", summary: "PMFBY scheme to process crop insurance claims within 45 days using AI-based assessment technology.", category: "Insurance", date: new Date().toISOString(), source: "Ministry of Agriculture" },
  ],
  hi: [
    { id: 1, title: "पीएम किसान सम्मान निधि: नई किस्त जारी", summary: "सरकार ने पीएम किसान सम्मान निधि योजना की नई किस्त जारी की, करोड़ों किसानों को फायदा।", category: "सरकार", date: new Date().toISOString(), source: "कृषि मंत्रालय" },
    { id: 2, title: "मानसून पूर्वानुमान: इस मौसम अच्छी बारिश की उम्मीद", summary: "IMD ने भारत के प्रमुख कृषि क्षेत्रों में सामान्य से अधिक मानसून वर्षा की भविष्यवाणी की है।", category: "मौसम", date: new Date().toISOString(), source: "IMD भारत" },
    { id: 3, title: "खरीफ फसलों के लिए MSP बढ़ाया गया", summary: "किसानों की आय बढ़ाने के लिए प्रमुख खरीफ फसलों के न्यूनतम समर्थन मूल्य में वृद्धि को मंजूरी।", category: "नीति", date: new Date().toISOString(), source: "भारत सरकार" },
    { id: 4, title: "नई सूखा-प्रतिरोधी गेहूं की किस्म विकसित", summary: "ICAR वैज्ञानिकों ने नई गेहूं की किस्म विकसित की जो सूखे की स्थिति में अधिक उपज दे सकती है।", category: "अनुसंधान", date: new Date().toISOString(), source: "ICAR" },
    { id: 5, title: "फसल बीमा दावे: तेज प्रसंस्करण की घोषणा", summary: "PMFBY योजना AI तकनीक से 45 दिनों में फसल बीमा दावों का निपटान करेगी।", category: "बीमा", date: new Date().toISOString(), source: "कृषि मंत्रालय" },
  ]
};

app.get('/news/latest', (req, res) => {
  const lang = req.query.lang || 'en';
  const news = newsData[lang] || newsData.en;
  res.json({ success: true, data: news });
});

app.get('/news/:id', (req, res) => {
  const lang = req.query.lang || 'en';
  const news = (newsData[lang] || newsData.en).find(n => n.id === parseInt(req.params.id));
  if (!news) return res.status(404).json({ success: false, message: 'News not found' });
  res.json({ success: true, data: news });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'news-service' }));

app.listen(PORT, () => console.log(`📰 News Service running on port ${PORT}`));
