import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { newsAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import {
  Newspaper, ExternalLink, Calendar, RefreshCw,
  Play, Pause, Square, Volume2, VolumeX, Mic, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePageAnimation } from '../hooks/usePageAnimation';
import clsx from 'clsx';

// ── Web Speech TTS Hook ────────────────────────────────────────────
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const utterRef = useRef(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setCurrentIdx(-1);
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setPaused(false);
  }, []);

  // Read a sequence of texts one by one
  const readAll = useCallback((texts, lang = 'en') => {
    window.speechSynthesis.cancel();
    if (!texts || texts.length === 0) return;

    const langCode = lang === 'hi' ? 'hi-IN' : 'en-IN';
    let idx = 0;

    const speakNext = () => {
      if (idx >= texts.length) {
        setSpeaking(false);
        setPaused(false);
        setCurrentIdx(-1);
        return;
      }
      const utt = new SpeechSynthesisUtterance(texts[idx]);
      utt.lang = langCode;
      utt.rate = 0.92;
      utt.pitch = 1.05;

      // Pick a good voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.lang.startsWith(lang === 'hi' ? 'hi' : 'en') && v.localService
      ) || voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
      if (preferred) utt.voice = preferred;

      utt.onstart = () => { setSpeaking(true); setPaused(false); setCurrentIdx(idx); };
      utt.onend = () => { idx++; speakNext(); };
      utt.onerror = () => { idx++; speakNext(); };

      utterRef.current = utt;
      window.speechSynthesis.speak(utt);
    };

    speakNext();
  }, []);

  // Read a single item
  const readOne = useCallback((text, lang = 'en', idx = 0) => {
    window.speechSynthesis.cancel();
    const langCode = lang === 'hi' ? 'hi-IN' : 'en-IN';
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode;
    utt.rate = 0.92;
    utt.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith(lang === 'hi' ? 'hi' : 'en') && v.localService
    ) || voices.find(v => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
    if (preferred) utt.voice = preferred;

    utt.onstart = () => { setSpeaking(true); setPaused(false); setCurrentIdx(idx); };
    utt.onend = () => { setSpeaking(false); setCurrentIdx(-1); };
    utt.onerror = () => { setSpeaking(false); setCurrentIdx(-1); };

    utterRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  return { speaking, paused, currentIdx, readAll, readOne, stop, pause, resume };
}

// ── Animated Waveform ─────────────────────────────────────────────
function Waveform({ active }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-[3px] rounded-full bg-emerald-400 transition-all',
            active ? 'animate-bounce' : 'h-1 opacity-30'
          )}
          style={active ? {
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + i * 0.1}s`,
            height: `${8 + i * 4}px`
          } : {}}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function News() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';
  const [voiceLang, setVoiceLang] = useState(lang);
  const [autoRead, setAutoRead] = useState(false);

  const { speaking, paused, currentIdx, readAll, readOne, stop, pause, resume } = useSpeech();

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
    onError: () => toast.error('Failed to fetch latest news')
  });

  // Auto-read on page open if toggled
  useEffect(() => {
    if (autoRead && news.length > 0 && !speaking) {
      const texts = news.map((item, i) =>
        `${voiceLang === 'hi' ? 'समाचार' : 'News'} ${i + 1}. ${item.title}. ${item.description || ''}`
      );
      // Small delay to let voices load
      setTimeout(() => readAll(texts, voiceLang), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRead, news]);

  const handleReadAll = () => {
    if (speaking && !paused) {
      pause();
      return;
    }
    if (paused) {
      resume();
      return;
    }
    const texts = news.map((item, i) =>
      `${voiceLang === 'hi' ? 'समाचार' : 'News'} ${i + 1}. ${item.title}. ${item.description || ''}`
    );
    readAll(texts, voiceLang);
  };

  const handleReadOne = (item, idx) => {
    if (speaking && currentIdx === idx) { stop(); return; }
    const text = `${item.title}. ${item.description || ''}`;
    readOne(text, voiceLang, idx);
  };

  return (
    <div ref={ref} className="page-wrapper pb-20">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 mb-4 inline-block">
            Bharat News Hub
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-none flex items-center gap-3">
            <Newspaper className="text-primary" size={40} />
            {t('news.title', 'Samachar')}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">{t('news.subtitle', 'Latest agricultural & rural news')}</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary h-12 px-6 flex items-center gap-2 rounded-2xl shadow-sm transition-all active:scale-95">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs font-black uppercase tracking-widest text-primary">Refresh</span>
        </button>
      </div>

      {/* ── AI Voice Reader Panel ─────────────────────────────── */}
      <div className="mb-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Mic size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">AI Voice Reader</p>
              <h3 className="font-black text-lg leading-tight">
                {speaking && !paused
                  ? (voiceLang === 'hi' ? 'पढ़ा जा रहा है...' : 'Reading aloud...')
                  : (voiceLang === 'hi' ? 'समाचार सुनें' : 'Listen to News')}
              </h3>
            </div>
            <div className="ml-auto">
              <Waveform active={speaking && !paused} />
            </div>
          </div>

          {/* Progress */}
          {speaking && (
            <div className="mb-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                {voiceLang === 'hi' ? 'अभी पढ़ रहे हैं' : 'Now Reading'}
              </p>
              <p className="text-sm font-bold leading-snug line-clamp-2">
                {news[currentIdx]?.title || '...'}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-white/60 font-bold">
                <ChevronRight size={12} />
                {currentIdx + 1} / {news.length}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Toggle */}
            <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
              {['en', 'hi'].map(l => (
                <button
                  key={l}
                  onClick={() => { stop(); setVoiceLang(l); }}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                    voiceLang === l ? 'bg-white text-emerald-700 shadow-md' : 'text-white/70 hover:text-white'
                  )}
                >
                  {l === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
                </button>
              ))}
            </div>

            {/* Play / Pause / Stop */}
            <button
              onClick={handleReadAll}
              disabled={news.length === 0 || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-2xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              {speaking && !paused
                ? <><Pause size={16} /> {voiceLang === 'hi' ? 'रोकें' : 'Pause'}</>
                : paused
                  ? <><Play size={16} /> {voiceLang === 'hi' ? 'जारी रखें' : 'Resume'}</>
                  : <><Play size={16} /> {voiceLang === 'hi' ? 'सभी पढ़ें' : 'Read All'}</>
              }
            </button>

            {speaking && (
              <button
                onClick={stop}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 text-white rounded-2xl font-black text-sm hover:bg-white/30 transition-all backdrop-blur-sm"
              >
                <Square size={14} fill="white" /> {voiceLang === 'hi' ? 'बंद करें' : 'Stop'}
              </button>
            )}

            {/* Auto-read toggle */}
            <button
              onClick={() => { stop(); setAutoRead(p => !p); }}
              className={clsx(
                'ml-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all',
                autoRead ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
            >
              {autoRead ? <Volume2 size={14} /> : <VolumeX size={14} />}
              {voiceLang === 'hi' ? 'खुलने पर पढ़ें' : 'Auto-Read'}
            </button>
          </div>
        </div>
      </div>

      {/* ── News Grid ────────────────────────────────────────── */}
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
            <div
              key={i}
              className={clsx(
                'anim-card card p-0 overflow-hidden group flex flex-col bg-white dark:bg-slate-900 border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10',
                currentIdx === i
                  ? 'border-emerald-400 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                  : 'border-gray-100 dark:border-slate-800'
              )}
            >
              {/* Image */}
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="block shrink-0">
                <div className="w-full h-48 relative overflow-hidden bg-gray-100 dark:bg-slate-800">
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
                  {/* Currently reading badge */}
                  {currentIdx === i && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500 rounded-lg text-white text-[10px] font-black flex items-center gap-1.5">
                      <Waveform active={speaking && !paused} />
                    </div>
                  )}
                </div>
              </a>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-3 font-medium">
                  <Calendar size={12} />
                  {new Date(item.pubDate).toLocaleDateString(
                    i18n.language === 'hi' ? 'hi-IN' : 'en-IN',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-1">
                  {item.description}
                </p>

                {/* Footer: Read more + TTS button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-slate-800/50">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider hover:underline"
                  >
                    {t('news.read_more', 'Read More')}
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  {/* Per-card voice button */}
                  <button
                    onClick={() => handleReadOne(item, i)}
                    className={clsx(
                      'w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95',
                      currentIdx === i && speaking
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                    )}
                    title={voiceLang === 'hi' ? 'यह खबर सुनें' : 'Listen to this news'}
                  >
                    {currentIdx === i && speaking ? <Pause size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
          <Newspaper className="mx-auto text-gray-300 dark:text-slate-700 mb-4" size={48} />
          <p className="text-gray-500 dark:text-slate-400 font-medium">{t('news.no_news', 'No news available')}</p>
        </div>
      )}
    </div>
  );
}
