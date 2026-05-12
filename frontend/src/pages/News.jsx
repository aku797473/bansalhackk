import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { newsAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageAnimation } from '../hooks/usePageAnimation';

export default function News() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const { 
    data: news = [], 
    isLoading: loading, 
    refetch 
  } = useQuery({
    queryKey: ['news', lang],
    queryFn: async () => {
      const { data } = await newsAPI.getLatest(lang);
      if (!data.success) throw new Error('Failed to fetch news');
      return data.data;
    },
    onError: (err) => {
      toast.error(t('news.error_fetch', 'Failed to fetch latest news'));
      console.error(err);
    }
  });

  const fetchNews = () => refetch();

  return (
    <div ref={ref} className="page-wrapper pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 mb-4 inline-block tracking-tighter">Bharat News Hub</span>
          <h1 className="page-title flex items-center gap-2">
            <Newspaper className="text-primary" size={32} />
            <span>{t('news.title')}</span>
          </h1>
          <p className="page-subtitle">
            {t('news.subtitle')}
          </p>
        </div>
        <button onClick={fetchNews} className="btn-secondary w-full md:w-auto h-12 px-6 flex items-center justify-center md:justify-start gap-2 rounded-2xl shadow-sm transition-all active:scale-95" title={t('dashboard.labels.refresh')}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span className="text-xs font-black uppercase tracking-widest text-primary">Refresh Feed</span>
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="card p-0 overflow-hidden animate-pulse">
              <div className="w-full h-48 bg-gray-200 dark:bg-slate-800" />
              <div className="p-5 space-y-3">
                <div className="w-1/3 h-3 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-5 bg-gray-200 dark:bg-slate-800 rounded" />
                <div className="w-2/3 h-5 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : news.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="anim-card card p-0 overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
              <div className="w-full h-48 relative overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt="News Cover" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop';
                  }}
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                  {item.source}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-3 font-medium">
                  <Calendar size={14} />
                  {new Date(item.pubDate).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mt-auto pt-4 border-t border-gray-50 dark:border-slate-800/50">
                  <span>{t('news.read_more')}</span>
                  <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
          <Newspaper className="mx-auto text-gray-300 dark:text-slate-700 mb-4" size={48} />
          <p className="text-gray-500 dark:text-slate-400 font-medium">{t('news.no_news')}</p>
        </div>
      )}
    </div>
  );
}
