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
        className="btn-ghost text-xs gap-1.5 px-2.5 py-1.5 rounded-lg flex items-center">
        <Globe size={14} className="text-gray-500 dark:text-slate-400" />
        {showLabel && <span className="font-medium">{currentLang.label}</span>}
        <ChevronDown size={12} className={clsx('text-gray-400 transition-transform', langOpen && 'rotate-180')} />
      </button>

      {langOpen && (
        <div className={clsx(
          "absolute mt-2 w-40 bg-white dark:bg-slate-800 rounded-2xl shadow-card-lg border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-slide-down",
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)}
              className={clsx(
                'w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl',
                i18n.language === l.code ? 'text-primary font-semibold' : 'text-gray-700 dark:text-slate-300'
              )}>
              <span>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
