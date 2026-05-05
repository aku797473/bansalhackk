import { useTranslation } from 'react-i18next';
import { Landmark, FileText, CheckCircle2, IndianRupee, ArrowRight, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

import { useQuery } from '@tanstack/react-query';
import { schemesAPI } from '../services/api';
import * as Icons from 'lucide-react';

export default function Schemes() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => {
      const { data } = await schemesAPI.getSchemes();
      return data;
    }
  });

  const schemes = response?.data || [];

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

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-slate-400 animate-pulse">Loading schemes...</p>
        </div>
      )}

      {isError && (
        <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900">
          <p className="text-red-500 font-medium">Failed to load government schemes. Please try again later.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {schemes.map((scheme) => {
          const Icon = Icons[scheme.iconName] || Icons.Landmark;
          return (
          <div key={scheme.id} className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative flex flex-col h-full">
            
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
          );
        })}
      </div>
    </div>
  );
}
