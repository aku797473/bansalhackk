import { useTranslation } from 'react-i18next';
import { Landmark, FileText, CheckCircle2, IndianRupee, ArrowRight, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { schemesAPI } from '../services/api';
import * as Icons from 'lucide-react';
import { usePageAnimation } from '../hooks/usePageAnimation';

const FALLBACK_SCHEMES = [
  { id: 1, title: 'PM-KISAN Samman Nidhi', titleHi: 'पीएम-किसान सम्मान निधि', description: '₹6,000/year direct income support to small & marginal farmers in 3 installments.', descriptionHi: 'छोटे और सीमांत किसानों को ₹6,000 प्रति वर्ष की सीधी आय सहायता।', benefit: '₹6,000/year', benefitHi: '₹6,000/वर्ष', tags: ['Income', 'Direct Benefit'], tagsHi: ['आय', 'प्रत्यक्ष लाभ'], iconName: 'IndianRupee', color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', link: 'https://pmkisan.gov.in' },
  { id: 2, title: 'Pradhan Mantri Fasal Bima Yojana', titleHi: 'प्रधानमंत्री फसल बीमा योजना', description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage.', descriptionHi: 'फसल नुकसान/क्षति से पीड़ित किसानों को वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।', benefit: 'Up to ₹2L cover', benefitHi: '₹2 लाख तक कवर', tags: ['Insurance', 'Crop Loss'], tagsHi: ['बीमा', 'फसल नुकसान'], iconName: 'ShieldCheck', color: 'from-blue-500 to-cyan-400', bg: 'bg-blue-50 dark:bg-blue-900/20', link: 'https://pmfby.gov.in' },
  { id: 3, title: 'Kisan Credit Card', titleHi: 'किसान क्रेडिट कार्ड', description: 'Provides farmers with affordable credit for agricultural needs at subsidized interest rates.', descriptionHi: 'किसानों को सब्सिडी वाली ब्याज दरों पर कृषि जरूरतों के लिए सस्ता ऋण प्रदान करता है।', benefit: '4% Interest Rate', benefitHi: '4% ब्याज दर', tags: ['Credit', 'Loan'], tagsHi: ['क्रेडिट', 'ऋण'], iconName: 'CreditCard', color: 'from-purple-500 to-violet-400', bg: 'bg-purple-50 dark:bg-purple-900/20', link: 'https://www.nabard.org/content1.aspx?id=572' },
  { id: 4, title: 'Soil Health Card Scheme', titleHi: 'मृदा स्वास्थ्य कार्ड योजना', description: 'Provides soil health cards to farmers with crop-wise recommendations for nutrients.', descriptionHi: 'किसानों को पोषक तत्वों की फसल-वार सिफारिशों के साथ मृदा स्वास्थ्य कार्ड प्रदान करता है।', benefit: 'Free Soil Testing', benefitHi: 'मुफ्त मिट्टी परीक्षण', tags: ['Soil', 'Advisory'], tagsHi: ['मिट्टी', 'सलाह'], iconName: 'FlaskConical', color: 'from-amber-500 to-orange-400', bg: 'bg-amber-50 dark:bg-amber-900/20', link: 'https://soilhealth.dac.gov.in' },
  { id: 5, title: 'PM Krishi Sinchai Yojana', titleHi: 'पीएम कृषि सिंचाई योजना', description: 'Ensures access to protective irrigation to all agricultural farms with water use efficiency.', descriptionHi: 'सभी कृषि खेतों को जल उपयोग दक्षता के साथ संरक्षित सिंचाई तक पहुंच सुनिश्चित करता है।', benefit: 'Irrigation Support', benefitHi: 'सिंचाई सहायता', tags: ['Water', 'Irrigation'], tagsHi: ['पानी', 'सिंचाई'], iconName: 'Droplets', color: 'from-sky-500 to-blue-400', bg: 'bg-sky-50 dark:bg-sky-900/20', link: 'https://pmksy.gov.in' },
  { id: 6, title: 'e-NAM (National Agriculture Market)', titleHi: 'ई-नाम (राष्ट्रीय कृषि बाजार)', description: 'Online trading platform for agricultural commodities to get better prices for produce.', descriptionHi: 'उपज के लिए बेहतर मूल्य पाने हेतु कृषि वस्तुओं के लिए ऑनलाइन ट्रेडिंग प्लेटफॉर्म।', benefit: 'Better Market Price', benefitHi: 'बेहतर बाजार मूल्य', tags: ['Market', 'Trading'], tagsHi: ['बाजार', 'व्यापार'], iconName: 'TrendingUp', color: 'from-rose-500 to-pink-400', bg: 'bg-rose-50 dark:bg-rose-900/20', link: 'https://enam.gov.in' },
];

export default function Schemes() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const { data: response, isLoading } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const { data } = await schemesAPI.getSchemes();
      return data;
    },
    retry: 1,
    staleTime: 15 * 60 * 1000,
  });

  // Always show data — use API data if available, fallback to static
  const schemes = response?.data?.length ? response.data : FALLBACK_SCHEMES;

  return (
    <div ref={ref} className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="anim-header mb-10 text-center sm:text-left">
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-3 mb-2">
          <Landmark className="text-emerald-500" size={32} />
          {t('schemes.title')}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">
          {t('schemes.subtitle')}
        </p>
      </div>

      {isLoading && schemes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-slate-400 animate-pulse">{t('schemes.loading')}</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {schemes.map((scheme) => {
          const Icon = Icons[scheme.iconName] || Icons.Landmark;
          return (
          <div key={scheme.id} className="anim-card card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative flex flex-col h-full">
            
            {/* Top right decoration */}
            <div className={clsx('absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br', scheme.color)} />

            <div className="flex items-start gap-5 relative z-10">
              <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', scheme.bg)}>
                <Icon size={26} className={clsx('text-transparent bg-clip-text bg-gradient-to-br', scheme.color)} style={{ color: 'inherit' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                  {lang === 'hi' ? scheme.titleHi : scheme.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    {lang === 'hi' ? (scheme.benefitHi || scheme.benefit) : scheme.benefit}
                  </span>
                  {(lang === 'hi' ? (scheme.tagsHi || scheme.tags) : scheme.tags).map(t => (
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
              <span>{t('schemes.apply')}</span>
              <ExternalLink size={18} className="group-hover/btn:scale-110 group-hover/btn:translate-x-1 transition-transform" />
            </a>
          </div>
          );
        })}
      </div>
    </div>
  );
}
