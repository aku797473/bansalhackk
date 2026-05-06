const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5009;

app.use(cors());
app.use(express.json());

const newsData = {
  en: [
    { id: 1, title: "PM Kisan Installment", description: "Government releases latest installment of PM Kisan Samman Nidhi.", category: "Govt", date: "Today", source: "Agri Dept" },
    { id: 2, title: "Monsoon Update", description: "Good rainfall predicted across major regions.", category: "Weather", date: "Yesterday", source: "IMD" }
  ],
  hi: [
    { id: 1, title: "पीएम किसान किस्त", description: "सरकार ने पीएम किसान की ताजा किस्त जारी की।", category: "सरकार", date: "आज", source: "कृषि विभाग" },
    { id: 2, title: "मानसून अपडेट", description: "प्रमुख क्षेत्रों में अच्छी बारिश की भविष्यवाणी।", category: "मौसम", date: "कल", source: "IMD" }
  ]
};

app.get('/news/latest', (req, res) => {
  const lang = req.query.lang || 'en';
  res.json({ success: true, data: newsData[lang] || newsData.en });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'news-service' }));

app.listen(PORT, () => console.log(`📰 News Service running on port ${PORT}`));
