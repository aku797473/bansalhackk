import { useTranslation } from 'react-i18next';
import { Landmark, FileText, CheckCircle2, IndianRupee, ArrowRight, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

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
    icon: IndianRupee,
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
    icon: CheckCircle2,
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
    icon: Landmark,
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
    icon: FileText,
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
    icon: ArrowRight,
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  }
];

export default function Schemes() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-enter animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-3 mb-2">
          <Landmark className="text-emerald-500" size={32} />
          {lang === 'hi' ? 'सरकारी योजनाएं (Government Schemes)' : 'Government Schemes'}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
          {lang === 'hi' ? 'किसानों के लिए प्रमुख सरकारी योजनाएं और सब्सिडी' : 'Key government schemes and subsidies available for farmers.'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {SCHEMES.map((scheme) => (
          <div key={scheme.id} className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative flex flex-col h-full">
            
            {/* Top right decoration */}
            <div className={clsx('absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br', scheme.color)} />

            <div className="flex items-start gap-5 relative z-10">
              <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', scheme.bg)}>
                <scheme.icon size={26} className={clsx('text-transparent bg-clip-text bg-gradient-to-br', scheme.color)} style={{ color: 'inherit' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                  {lang === 'hi' ? scheme.titleHi : scheme.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    {scheme.benefit}
                  </span>
                  {scheme.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed font-medium mb-6 relative z-10 flex-1">
              {lang === 'hi' ? scheme.descriptionHi : scheme.description}
            </p>

            <a href={scheme.link} target="_blank" rel="noopener noreferrer" 
               className="mt-auto inline-flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 hover:bg-primary hover:text-white text-gray-700 dark:text-slate-300 transition-colors font-bold group/btn relative z-10">
              <span>{lang === 'hi' ? 'अधिक जानकारी देखें' : 'View Details & Apply'}</span>
              <ExternalLink size={18} className="group-hover/btn:scale-110 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
