import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Sparkle } from '@phosphor-icons/react';

const LOADING_QUOTES = {
  en: [
    "Sowing the seeds of digital growth...",
    "Nurturing your fields with smart decisions...",
    "Connecting markets, empowering farmers...",
    "Analyzing weather patterns for the perfect harvest...",
    "Fetching the best market rates for you..."
  ],
  hi: [
    "डिजिटल विकास के बीज बो रहे हैं...",
    "स्मार्ट निर्णयों से अपने खेतों को समृद्ध बना रहे हैं...",
    "बाजारों को जोड़ना, किसानों को सशक्त बनाना...",
    "उत्कृष्ट फसल के लिए मौसम का विश्लेषण किया जा रहा है...",
    "आपके लिए सर्वोत्तम मंडी भाव लाए जा रहे हैं..."
  ]
};

export default function LoadingScreen() {
  const { i18n } = useTranslation();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    const quotes = isHi ? LOADING_QUOTES.hi : LOADING_QUOTES.en;
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, [isHi]);

  const currentQuotes = isHi ? LOADING_QUOTES.hi : LOADING_QUOTES.en;
  const quote = currentQuotes[quoteIndex] || currentQuotes[0];

  return (
    <div className="fixed inset-0 bg-[#F8FAFC]/90 dark:bg-[#0B1120]/95 backdrop-blur-md flex flex-col items-center justify-center z-[9999] transition-all duration-300">
      <div className="relative flex flex-col items-center gap-8 max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Glow circles */}
        <div className="absolute w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -top-12" />
        <div className="absolute w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -bottom-12" />

        {/* Premium Animation Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-0.5 shadow-2xl shadow-emerald-500/20 dark:shadow-emerald-950/20 animate-spin duration-3000">
            <div className="w-full h-full bg-[#F8FAFC] dark:bg-[#0B1120] rounded-[1.9rem]" />
          </div>
          <div className="absolute text-4xl animate-bounce-sm flex items-center justify-center">
             🌾
          </div>
          {/* Subtle micro sparkles */}
          <Sparkle size={18} weight="fill" className="absolute -top-1 -right-1 text-amber-400 animate-pulse" />
          <Sparkle size={12} weight="fill" className="absolute -bottom-1 -left-1 text-emerald-400 animate-pulse delay-500" />
        </div>

        {/* Brand/App Identity */}
        <div className="space-y-2 mt-4 relative z-10 font-outfit">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
            Smart <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent">Kisan</span>
          </h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
            {isHi ? "आपका डिजिटल कृषक मित्र" : "YOUR DIGITAL FARMING PARTNER"}
          </p>
        </div>

        {/* Inspiring Dynamic Bilingual Quote */}
        <div className="min-h-[48px] flex items-center justify-center mt-2 px-4 relative z-10">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed animate-pulse">
            "{quote}"
          </p>
        </div>

        {/* Custom Progress Bar Loader */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full animate-progress-indeterminate animate-pulse" />
        </div>
      </div>
    </div>
  );
}

