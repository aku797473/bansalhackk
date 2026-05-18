import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usePageAnimation } from '../hooks/usePageAnimation';
import { Star, ChatText, PaperPlaneRight, Sparkle, ChatCircleText, Quotes, Info } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Feedback() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(t('feedback.error_rating'));
      return;
    }
    if (!suggestion.trim()) {
      toast.error(t('feedback.error_suggestion'));
      return;
    }

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setRating(0);
      setHoverRating(0);
      setSuggestion('');
      toast.success(t('feedback.success'));
    }, 1200);
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/30 border border-indigo-400/20 mb-6 mx-auto">
            <Sparkle size={14} weight="fill" className="animate-pulse" />
            {t('feedback.badge')}
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none font-outfit mb-5">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t('feedback.title')}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto leading-relaxed">
            {t('feedback.subtitle')}
          </p>
        </div>

        {/* Feedback Form Card */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[3rem] p-8 sm:p-14 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-12">
            
            {/* Rating Section */}
            <div className="flex flex-col items-center space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                   <Star size={18} weight="fill" className="text-indigo-600 dark:text-indigo-400" />
                 </div>
                 {t('feedback.rate_exp')}
              </h2>
              
              <div className="flex items-center justify-center gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <Star 
                      size={48} 
                      weight={(hoverRating || rating) >= star ? "fill" : "duotone"}
                      className={clsx(
                        "transition-colors duration-300",
                        (hoverRating || rating) >= star 
                          ? "text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" 
                          : "text-slate-200 dark:text-slate-700"
                      )} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {rating === 0 ? t('feedback.select_star') : t(`feedback.rating_${rating}`)}
              </p>
            </div>

            {/* Suggestion Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3 ml-2">
                 <ChatCircleText size={16} weight="bold" className="text-indigo-500" /> 
                 {t('feedback.share_thoughts')}
              </label>
              <textarea 
                className="w-full min-h-[180px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-none leading-relaxed" 
                placeholder={t('feedback.placeholder')}
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
              />
            </div>

            {/* User Info & Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                 <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                   <Quotes size={20} weight="fill" className="text-slate-400" />
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('feedback.posting_as')}</p>
                   <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{user?.name || t('feedback.anonymous')}</p>
                 </div>
              </div>
              
              <button 
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <Sparkle className="animate-spin" size={20} />
                ) : (
                  <>
                    <PaperPlaneRight size={20} weight="fill" />
                    {t('feedback.submit_btn')}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
