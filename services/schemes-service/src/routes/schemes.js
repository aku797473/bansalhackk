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
    benefitHi: '₹6,000 / वर्ष',
    tags: ['Financial Aid', 'All Farmers'],
    tagsHi: ['वित्तीय सहायता', 'सभी किसान'],
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
    benefitHi: 'फसल बीमा',
    tags: ['Insurance', 'Risk Mitigation'],
    tagsHi: ['बीमा', 'जोखिम न्यूनीकरण'],
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
    benefitHi: 'कम ब्याज ऋण',
    tags: ['Loan', 'Banking'],
    tagsHi: ['ऋण', 'बैंकिंग'],
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
    benefitHi: 'सिंचाई सब्सिडी',
    tags: ['Irrigation', 'Subsidy'],
    tagsHi: ['सिंचाई', 'सब्सिडी'],
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
    benefitHi: 'बेहतर दाम',
    tags: ['Market', 'Trading'],
    tagsHi: ['बाजार', 'व्यापार'],
    link: 'https://www.enam.gov.in/',
    iconName: 'ArrowRight',
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    id: 'shc',
    title: 'Soil Health Card Scheme',
    titleHi: 'मृदा स्वास्थ्य कार्ड योजना',
    description: 'Provides information to farmers on nutrient status of their soil along with recommendation on appropriate dosage of nutrients.',
    descriptionHi: 'किसानों को उनकी मिट्टी की पोषक स्थिति की जानकारी और पोषक तत्वों की उचित मात्रा की सिफारिश प्रदान करता है।',
    benefit: 'Soil Testing',
    benefitHi: 'मिट्टी परीक्षण',
    tags: ['Soil Health', 'Testing'],
    tagsHi: ['मृदा स्वास्थ्य', 'परीक्षण'],
    link: 'https://soilhealth.dac.gov.in/',
    iconName: 'Activity',
    color: 'from-amber-400 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  },
  {
    id: 'pkvy',
    title: 'Paramparagat Krishi Vikas Yojana',
    titleHi: 'परम्परागत कृषि विकास योजना (PKVY)',
    description: 'Promotes commercial organic production through certified organic farming to improve soil health and increase yields.',
    descriptionHi: 'मिट्टी के स्वास्थ्य में सुधार और पैदावार बढ़ाने के लिए प्रमाणित जैविक खेती के माध्यम से जैविक उत्पादन को बढ़ावा देता है।',
    benefit: 'Organic Farming',
    benefitHi: 'जैविक खेती',
    tags: ['Organic', 'Sustainability'],
    tagsHi: ['जैविक', 'सतत कृषि'],
    link: 'https://pgsindia-ncof.gov.in/',
    iconName: 'Leaf',
    color: 'from-lime-400 to-lime-600',
    bg: 'bg-lime-50 dark:bg-lime-900/20'
  },
  {
    id: 'nmsa',
    title: 'National Mission for Sustainable Agriculture',
    titleHi: 'सतत कृषि के लिए राष्ट्रीय मिशन (NMSA)',
    description: 'Aims at making agriculture more productive, sustainable, and climate-resilient by promoting location-specific integrated farming systems.',
    descriptionHi: 'स्थान-विशिष्ट एकीकृत कृषि प्रणालियों को बढ़ावा देकर कृषि को अधिक उत्पादक, टिकाऊ और जलवायु-लचीला बनाने का लक्ष्य है।',
    benefit: 'Climate Resilience',
    benefitHi: 'जलवायु लचीलापन',
    tags: ['Sustainability', 'Climate'],
    tagsHi: ['सतत कृषि', 'जलवायु'],
    link: 'https://nmsa.dac.gov.in/',
    iconName: 'Sun',
    color: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20'
  },
  {
    id: 'rkvy',
    title: 'Rashtriya Krishi Vikas Yojana',
    titleHi: 'राष्ट्रीय कृषि विकास योजना (RKVY)',
    description: 'Incentivizes states to draw up comprehensive agriculture development plans taking into account agro-climatic conditions, natural issues, and technology.',
    descriptionHi: 'कृषि-जलवायु परिस्थितियों, प्राकृतिक मुद्दों और प्रौद्योगिकी को ध्यान में रखते हुए व्यापक कृषि विकास योजनाएं बनाने के लिए राज्यों को प्रोत्साहित करता है।',
    benefit: 'Development Funds',
    benefitHi: 'विकास कोष',
    tags: ['State Funding', 'Infrastructure'],
    tagsHi: ['राज्य वित्त पोषण', 'बुनियादी ढांचा'],
    link: 'https://rkvy.nic.in/',
    iconName: 'TrendingUp',
    color: 'from-teal-400 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20'
  },
  {
    id: 'pmaasha',
    title: 'Pradhan Mantri Annadata Aay SanraksHan Abhiyan',
    titleHi: 'प्रधानमंत्री अन्नदाता आय संरक्षण अभियान',
    description: 'An umbrella scheme to ensure minimum support price (MSP) to farmers, comprising Price Support Scheme (PSS) and Price Deficiency Payment Scheme (PDPS).',
    descriptionHi: 'किसानों को न्यूनतम समर्थन मूल्य (MSP) सुनिश्चित करने के लिए एक अम्ब्रेला योजना, जिसमें मूल्य समर्थन योजना और मूल्य कमी भुगतान योजना शामिल है।',
    benefit: 'MSP Guarantee',
    benefitHi: 'न्यूनतम समर्थन मूल्य गारंटी',
    tags: ['MSP', 'Income Protection'],
    tagsHi: ['न्यूनतम समर्थन मूल्य', 'आय संरक्षण'],
    link: 'https://agricoop.nic.in/',
    iconName: 'ShieldCheck',
    color: 'from-rose-400 to-rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20'
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
