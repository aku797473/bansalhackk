const express = require('express');
const router = express.Router();

const SCHEMES = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN Samman Nidhi',
    titleHi: 'पीएम-किसान सम्मान निधि',
    description: 'Financial benefit of ₹6,000 per year given to eligible farmer families across the country in three equal installments.',
    descriptionHi: 'पात्र किसान परिवारों को प्रति वर्ष ₹6,000 का वित्तीय लाभ तीन समान किस्तों में दिया जाता है।',
    benefit: '₹6,000 / Year',
    tags: ['Financial Aid', 'All Farmers'],
    link: 'https://pmkisan.gov.in/',
    iconName: 'IndianRupee',
    color: 'from-orange-400 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    description: 'Provides comprehensive insurance cover against failure of the crop helping in stabilizing the income of farmers.',
    descriptionHi: 'फसल की विफलता के खिलाफ व्यापक बीमा कवर प्रदान करता है जिससे किसानों की आय स्थिर करने में मदद मिलती है।',
    benefit: 'Crop Insurance',
    tags: ['Insurance', 'Risk Mitigation'],
    link: 'https://pmfby.gov.in/',
    iconName: 'CheckCircle2',
    color: 'from-green-400 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC)',
    titleHi: 'किसान क्रेडिट कार्ड (KCC)',
    description: 'Provides adequate and timely credit support from the banking system to the farmers for their cultivation needs.',
    descriptionHi: 'किसानों को उनकी खेती की जरूरतों के लिए बैंकिंग प्रणाली से पर्याप्त और समय पर ऋण सहायता प्रदान करता है।',
    benefit: 'Low Interest Loans',
    tags: ['Loan', 'Banking'],
    link: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1782650',
    iconName: 'Landmark',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'pmksy',
    title: 'Pradhan Mantri Krishi Sinchayee Yojana',
    titleHi: 'प्रधानमंत्री कृषि सिंचाई योजना',
    description: 'Aims to improve farm productivity and ensure better utilization of the resources in the country. "Per Drop More Crop".',
    descriptionHi: 'खेत की उत्पादकता में सुधार और देश में संसाधनों का बेहतर उपयोग सुनिश्चित करना इसका उद्देश्य है। "प्रति बूंद अधिक फसल"।',
    benefit: 'Irrigation Subsidy',
    tags: ['Irrigation', 'Subsidy'],
    link: 'https://pmksy.gov.in/',
    iconName: 'FileText',
    color: 'from-cyan-400 to-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20'
  },
  {
    id: 'enam',
    title: 'National Agriculture Market (e-NAM)',
    titleHi: 'राष्ट्रीय कृषि बाजार (e-NAM)',
    description: 'A pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market.',
    descriptionHi: 'एक अखिल भारतीय इलेक्ट्रॉनिक ट्रेडिंग पोर्टल जो एक एकीकृत राष्ट्रीय बाजार बनाने के लिए मौजूदा APMC मंडियों को नेटवर्क करता है।',
    benefit: 'Better Prices',
    tags: ['Market', 'Trading'],
    link: 'https://www.enam.gov.in/',
    iconName: 'ArrowRight',
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  }
];

// GET / returns the list of schemes
router.get('/', (req, res) => {
  try {
    // In a real app, this might pull from a DB
    res.status(200).json({ success: true, data: SCHEMES });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schemes' });
  }
});

module.exports = router;
