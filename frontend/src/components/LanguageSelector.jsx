import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',    flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ',   flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்',    flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు',   flag: '🇮🇳' },
];

export default function LanguageSelector({ showLabel = true, align = 'right' }) {
  const { i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <div className="relative" ref={langRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          setLangOpen(!langOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gray-100/80 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-transparent hover:border-gray-300 dark:hover:border-slate-600">
        <Globe size={16} className="text-primary dark:text-emerald-400" />
        {showLabel && <span className="text-[11px] font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">{currentLang.label}</span>}
        <ChevronDown size={14} className={clsx('text-gray-400 transition-transform duration-300', langOpen && 'rotate-180')} />
      </button>

      {langOpen && (
        <div className={clsx(
          "absolute mt-3 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/20 dark:border-white/5 p-2 z-[60] animate-scale-up",
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 px-3 py-2 uppercase tracking-widest">Select Language</div>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)}
              className={clsx(
                'w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-3 transition-all rounded-2xl mb-1 last:mb-0',
                i18n.language === l.code 
                  ? 'bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400' 
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
              )}>
              <span className="text-base">{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
