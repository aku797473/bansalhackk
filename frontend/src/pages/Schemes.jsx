import { useTranslation } from 'react-i18next';
import { CheckCircle, Bank, ArrowRight, ArrowSquareOut, ShieldCheck, CreditCard, Flask, Drop, ChartLineUp, Info, Star, Lightning, CaretRight } from '@phosphor-icons/react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { schemesAPI } from '../services/api';
import { usePageAnimation } from '../hooks/usePageAnimation';

const FALLBACK_SCHEMES = [
  { id: 1, title: 'PM-KISAN Samman Nidhi', titleHi: 'पीएम-किसान सम्मान निधि', description: '₹6,000/year direct income support to small & marginal farmers in 3 installments.', descriptionHi: 'छोटे और सीमांत किसानों को ₹6,000 प्रति वर्ष की सीधी आय सहायता।', benefit: '₹6,000/year', benefitHi: '₹6,000/वर्ष', tags: ['Income', 'Direct Benefit'], tagsHi: ['आय', 'प्रत्यक्ष लाभ'], icon: Bank, color: 'emerald', link: 'https://pmkisan.gov.in' },
  { id: 2, title: 'Pradhan Mantri Fasal Bima Yojana', titleHi: 'प्रधानमंत्री फसल बीमा योजना', description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage.', descriptionHi: 'फसल नुकसान/क्षति से पीड़ित किसानों को वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।', benefit: 'Up to ₹2L cover', benefitHi: '₹2 लाख तक कवर', tags: ['Insurance', 'Crop Loss'], tagsHi: ['बीमा', 'फसल नुकसान'], icon: ShieldCheck, color: 'blue', link: 'https://pmfby.gov.in' },
  { id: 3, title: 'Kisan Credit Card', titleHi: 'किसान क्रेडिट कार्ड', description: 'Provides farmers with affordable credit for agricultural needs at subsidized interest rates.', descriptionHi: 'किसानों को सब्सिडी वाली ब्याज दरों पर कृषि जरूरतों के लिए सस्ता ऋण प्रदान करता है।', benefit: '4% Interest Rate', benefitHi: '4% ब्याज दर', tags: ['Credit', 'Loan'], tagsHi: ['क्रेडिट', 'ऋण'], icon: CreditCard, color: 'purple', link: 'https://www.nabard.org/content1.aspx?id=572' },
  { id: 4, title: 'Soil Health Card Scheme', titleHi: 'मृदा स्वास्थ्य कार्ड योजना', description: 'Provides soil health cards to farmers with crop-wise recommendations for nutrients.', descriptionHi: 'किसानों को पोषक तत्वों की फसल-वार सिफारिशों के साथ मृदा स्वास्थ्य कार्ड प्रदान करता है।', benefit: 'Free Soil Testing', benefitHi: 'मुफ्त मिट्टी परीक्षण', tags: ['Soil', 'Advisory'], tagsHi: ['मिट्टी', 'सलाह'], icon: Flask, color: 'amber', link: 'https://soilhealth.dac.gov.in' },
  { id: 5, title: 'PM Krishi Sinchai Yojana', titleHi: 'पीएम कृषि सिंचाई योजना', description: 'Ensures access to protective irrigation to all agricultural farms with water use efficiency.', descriptionHi: 'सभी कृषि खेतों को जल उपयोग दक्षता के साथ संरक्षित सिंचाई तक पहुंच सुनिश्चित करता है।', benefit: 'Irrigation Support', benefitHi: 'सिंचाई सहायता', tags: ['Water', 'Irrigation'], tagsHi: ['पानी', 'सिंचाई'], icon: Drop, color: 'sky', link: 'https://pmksy.gov.in' },
  { id: 6, title: 'e-NAM Market', titleHi: 'ई-नाम बाजार', description: 'Online trading platform for agricultural commodities to get better prices for produce.', descriptionHi: 'उपज के लिए बेहतर मूल्य पाने हेतु कृषि वस्तुओं के लिए ऑनलाइन ट्रेडिंग प्लेटफॉर्म।', benefit: 'Better Price', benefitHi: 'बेहतर मूल्य', tags: ['Market', 'Trading'], tagsHi: ['बाजार', 'व्यापार'], icon: ChartLineUp, color: 'rose', link: 'https://enam.gov.in' },
];

const COLOR_MAP = {
  emerald: 'from-emerald-500 to-teal-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/10',
  blue: 'from-blue-500 to-indigo-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 shadow-blue-500/10',
  purple: 'from-purple-500 to-violet-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30 shadow-purple-500/10',
  amber: 'from-amber-500 to-orange-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 shadow-amber-500/10',
  sky: 'from-sky-500 to-blue-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30 shadow-sky-500/10',
  rose: 'from-rose-500 to-pink-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30 shadow-rose-500/10'
};

export default function Schemes() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const { data: response, isLoading } = useQuery({
    queryKey: ['schemes', lang],
    queryFn: async () => {
      const { data } = await schemesAPI.getSchemes(lang);
      return data;
    },
    retry: 1,
    staleTime: 15 * 60 * 1000,
  });

  const schemes = response?.data?.length ? response.data.map((s, i) => ({...s, ...FALLBACK_SCHEMES[i % FALLBACK_SCHEMES.length]})) : FALLBACK_SCHEMES;

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-amber-100 selection:text-amber-900 pt-24 sm:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="px-3.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200/50 dark:border-amber-800/35 flex items-center gap-2">
                <Bank size={14} weight="fill" className="animate-pulse" />
                {t('schemes.government_portal')}
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-500">
                <ShieldCheck size={14} weight="fill" className="text-emerald-500" />
                Verified Government Scheme
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight font-outfit">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                {t('schemes.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-3 max-w-lg leading-relaxed">
              {t('schemes.subtitle')}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
             <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin shadow-2xl shadow-amber-500/20" />
             <p className="text-sm font-semibold text-slate-400 animate-pulse">{t('schemes.loading')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
           {schemes.map((scheme) => {
             const Icon = scheme.icon || Bank;
             const colors = COLOR_MAP[scheme.color] || COLOR_MAP.emerald;
             return (
               <div key={scheme.id} className="card bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] border border-slate-200/50 dark:border-slate-800/50 p-10 shadow-sm hover:shadow-premium hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
                  
                  {/* Decorative Elements */}
                  <div className={clsx("absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-10 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700 bg-gradient-to-br", colors.split(' ')[0])} />
                  
                  <div className="flex items-start gap-8 relative z-10 mb-10">
                     <div className={clsx("w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg group-hover:-rotate-6 group-hover:scale-110 transition-transform duration-500", colors.split(' ').slice(2, 4).join(' '))}>
                        <Icon size={36} weight="duotone" />
                     </div>
                     <div className="flex-1 pt-2">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4 group-hover:text-amber-600 transition-colors font-outfit">
                           {lang === 'hi' ? scheme.titleHi : scheme.title}
                        </h2>
                        <div className="flex flex-wrap gap-3">
                           <div className={clsx("px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2 border shadow-inner", colors.split(' ').slice(4, 7).join(' '))}>
                              <Lightning size={14} weight="fill" className="animate-pulse" />
                              {lang === 'hi' ? (scheme.benefitHi || scheme.benefit) : scheme.benefit}
                           </div>
                           {(lang === 'hi' ? (scheme.tagsHi || scheme.tags) : scheme.tags).map(tag => (
                             <div key={tag} className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 dark:text-slate-400 text-xs font-semibold border border-slate-200/50 dark:border-slate-800/50">
                                {tag}
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="relative z-10 mb-10 flex-1">
                     <div className="bg-white/50 dark:bg-slate-800/40 backdrop-blur-sm rounded-[2rem] p-8 border border-white/20 dark:border-slate-700/30 italic relative overflow-hidden group/text shadow-inner">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover/text:scale-150 transition-transform duration-700" />
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
                           "{lang === 'hi' ? scheme.descriptionHi : scheme.description}"
                        </p>
                     </div>
                  </div>

                  <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="mt-auto h-16 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md text-slate-900 dark:text-white rounded-[2rem] font-bold text-base flex items-center justify-center gap-4 hover:bg-amber-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-amber-500/30 group/btn border border-slate-200/50 dark:border-slate-700/50">
                     {t('schemes.apply')}
                     <CaretRight size={24} weight="bold" className="group-hover/btn:translate-x-2 transition-transform" />
                  </a>
               </div>
             );
           })}
        </div>

        <div className="mt-20 p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-[4rem] text-white shadow-premium relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
           <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
           <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              <div className="flex items-center gap-8">
                 <div className="w-24 h-24 rounded-[2.5rem] bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner group-hover:scale-105 group-hover:rotate-6 transition-all duration-500">
                    <Info size={48} weight="fill" className="text-amber-400 drop-shadow-lg" />
                 </div>
                 <div>
                    <h3 className="text-4xl font-black tracking-tight mb-3 font-outfit">{t('schemes.help_title')}</h3>
                    <p className="text-slate-400 font-bold max-w-sm text-sm leading-relaxed">{t('schemes.help_desc')}</p>
                 </div>
              </div>
              <button className="h-16 px-10 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-slate-900 rounded-[2rem] font-bold text-base hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl">
                 {t('schemes.contact_support')}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
