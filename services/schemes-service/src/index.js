const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());

const schemes = [
  {
    id: 1,
    name: "PM Kisan Samman Nidhi",
    nameHi: "पीएम किसान सम्मान निधि",
    description: "Income support of Rs. 6000 per year to all farmer families across the country in three equal installments.",
    descriptionHi: "देश के सभी किसान परिवारों को तीन समान किश्तों में प्रति वर्ष 6000 रुपये की आय सहायता।",
    benefit: "₹6,000/year",
    eligibility: "All land-holding farmer families",
    eligibilityHi: "सभी भूमिधारक किसान परिवार",
    category: "Income Support",
    applyLink: "https://pmkisan.gov.in",
    ministry: "Ministry of Agriculture"
  },
  {
    id: 2,
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    nameHi: "प्रधानमंत्री फसल बीमा योजना",
    description: "Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities.",
    descriptionHi: "प्राकृतिक आपदाओं से फसल नुकसान झेलने वाले किसानों को वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।",
    benefit: "Full crop loss coverage",
    eligibility: "All farmers growing notified crops",
    eligibilityHi: "अधिसूचित फसल उगाने वाले सभी किसान",
    category: "Insurance",
    applyLink: "https://pmfby.gov.in",
    ministry: "Ministry of Agriculture"
  },
  {
    id: 3,
    name: "Kisan Credit Card (KCC)",
    nameHi: "किसान क्रेडिट कार्ड",
    description: "Provides farmers with affordable credit for agricultural needs including seeds, fertilizers and equipment.",
    descriptionHi: "किसानों को बीज, उर्वरक और उपकरण सहित कृषि आवश्यकताओं के लिए किफायती ऋण प्रदान करता है।",
    benefit: "Credit up to ₹3 lakh at 4% interest",
    eligibility: "All farmers, sharecroppers and tenant farmers",
    eligibilityHi: "सभी किसान, बटाईदार और किरायेदार किसान",
    category: "Credit",
    applyLink: "https://www.rbi.org.in",
    ministry: "Ministry of Finance"
  },
  {
    id: 4,
    name: "Soil Health Card Scheme",
    nameHi: "मृदा स्वास्थ्य कार्ड योजना",
    description: "Provides soil health cards to farmers with crop-wise recommendations for nutrients and fertilizers.",
    descriptionHi: "किसानों को पोषक तत्वों और उर्वरकों की फसल-वार सिफारिशों के साथ मृदा स्वास्थ्य कार्ड प्रदान करता है।",
    benefit: "Free soil testing & recommendations",
    eligibility: "All farmers",
    eligibilityHi: "सभी किसान",
    category: "Soil Health",
    applyLink: "https://soilhealth.dac.gov.in",
    ministry: "Ministry of Agriculture"
  },
  {
    id: 5,
    name: "PM Krishi Sinchai Yojana",
    nameHi: "पीएम कृषि सिंचाई योजना",
    description: "Aims to enhance water use efficiency and provide water to every agricultural field.",
    descriptionHi: "जल उपयोग दक्षता बढ़ाने और हर कृषि क्षेत्र में पानी उपलब्ध कराने का लक्ष्य।",
    benefit: "Subsidy on irrigation equipment",
    eligibility: "All farmers with agricultural land",
    eligibilityHi: "कृषि भूमि वाले सभी किसान",
    category: "Irrigation",
    applyLink: "https://pmksy.gov.in",
    ministry: "Ministry of Jal Shakti"
  }
];

app.get('/schemes', (req, res) => {
  res.json({ success: true, data: schemes, total: schemes.length });
});

app.get('/schemes/:id', (req, res) => {
  const scheme = schemes.find(s => s.id === parseInt(req.params.id));
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json({ success: true, data: scheme });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'schemes-service' }));

app.listen(PORT, () => console.log(`📋 Schemes Service running on port ${PORT}`));
