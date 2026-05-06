const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());

const schemes = [
  {
    id: 1,
    title: "PM Kisan Samman Nidhi",
    titleHi: "पीएम किसान सम्मान निधि",
    description: "Income support of Rs. 6000 per year to all farmer families across the country in three equal installments.",
    descriptionHi: "देश के सभी किसान परिवारों को तीन समान किश्तों में प्रति वर्ष 6000 रुपये की आय सहायता।",
    benefit: "₹6,000/year",
    benefitHi: "₹6,000/वर्ष",
    tags: ["Income", "Direct Transfer"],
    tagsHi: ["आय सहायता", "सीधा लाभ"],
    iconName: "Landmark",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    link: "https://pmkisan.gov.in"
  },
  {
    id: 2,
    title: "Pradhan Mantri Fasal Bima Yojana",
    titleHi: "प्रधानमंत्री फसल बीमा योजना",
    description: "Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities.",
    descriptionHi: "प्राकृतिक आपदाओं से फसल नुकसान झेलने वाले किसानों को वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।",
    benefit: "Full coverage",
    benefitHi: "पूर्ण सुरक्षा",
    tags: ["Insurance", "Protection"],
    tagsHi: ["बीमा", "सुरक्षा"],
    iconName: "ShieldCheck",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    link: "https://pmfby.gov.in"
  },
  {
    id: 3,
    title: "Kisan Credit Card (KCC)",
    titleHi: "किसान क्रेडिट कार्ड",
    description: "Provides farmers with affordable credit for agricultural needs including seeds, fertilizers and equipment.",
    descriptionHi: "किसानों को बीज, उर्वरक और उपकरण सहित कृषि आवश्यकताओं के लिए किफायती ऋण प्रदान करता है।",
    benefit: "4% Interest",
    benefitHi: "4% ब्याज दर",
    tags: ["Credit", "Loan"],
    tagsHi: ["ऋण", "लोन"],
    iconName: "CreditCard",
    color: "from-orange-500 to-red-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    link: "https://www.rbi.org.in"
  },
  {
    id: 4,
    title: "Soil Health Card",
    titleHi: "मृदा स्वास्थ्य कार्ड",
    description: "Provides soil health cards to farmers with crop-wise recommendations for nutrients and fertilizers.",
    descriptionHi: "किसानों को पोषक तत्वों और उर्वरकों की फसल-वार सिफारिशों के साथ मृदा स्वास्थ्य कार्ड प्रदान करता है।",
    benefit: "Free testing",
    benefitHi: "मुफ्त परीक्षण",
    tags: ["Soil", "Analysis"],
    tagsHi: ["मिट्टी", "विश्लेषण"],
    iconName: "FileText",
    color: "from-amber-500 to-yellow-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    link: "https://soilhealth.dac.gov.in"
  }
];

app.get('/schemes', (req, res) => {
  res.json({ success: true, data: schemes });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'schemes-service' }));

app.listen(PORT, () => console.log(`📋 Schemes Service running on port ${PORT}`));
