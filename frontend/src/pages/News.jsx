import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { newsAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, ArrowSquareOut, Calendar, ArrowsClockwise, Play, Pause, Square, SpeakerHigh, SpeakerNone, Microphone, CaretRight, ArrowCounterClockwise, Sparkle, Lightning, Info } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { usePageAnimation } from '../hooks/usePageAnimation';
import clsx from 'clsx';

// ── Web Speech TTS Hook ────────────────────────────────────────────
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const utterRef = useRef(null);
  const sessionRef = useRef(0); 
  const isMounted = useRef(true);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setCurrentIdx(-1);
    sessionRef.current++; 
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setPaused(false);
  }, []);

  const getBestVoice = useCallback((langCode) => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    return (
      voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase() && v.name.includes('Google')) ||
      voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase()) ||
      voices.find(v => v.lang.startsWith(langCode.split('-')[0]))
    );
  }, []);

  useEffect(() => {
    const loadVoices = () => { window.speechSynthesis.getVoices(); };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      window.speechSynthesis.cancel();
    };
  }, []);

  const readAll = useCallback((texts, lang = 'en') => {
    window.speechSynthesis.cancel();
    const sessionId = ++sessionRef.current;
    
    if (!texts || texts.length === 0) {
      setSpeaking(false); setPaused(false); setCurrentIdx(-1); return;
    }

    const langCode = lang === 'hi' ? 'hi-IN' : 'en-IN';
    let idx = 0;

    const speakNext = () => {
      if (!isMounted.current || sessionId !== sessionRef.current || idx >= texts.length) {
        if (sessionId === sessionRef.current) { setSpeaking(false); setPaused(false); setCurrentIdx(-1); }
        return;
      }

      const utt = new SpeechSynthesisUtterance(texts[idx]);
      utt.lang = langCode; utt.rate = 1.0; utt.pitch = 1.0;
      const voice = getBestVoice(langCode);
      if (voice) utt.voice = voice;

      utt.onstart = () => { if (isMounted.current && sessionId === sessionRef.current) { setSpeaking(true); setPaused(false); setCurrentIdx(idx); } };
      utt.onend = () => { if (isMounted.current && sessionId === sessionRef.current) { idx++; speakNext(); } };
      utt.onerror = () => { if (isMounted.current && sessionId === sessionRef.current) { idx++; speakNext(); } };

      utterRef.current = utt;
      window.speechSynthesis.speak(utt);
    };
    setTimeout(speakNext, 50);
  }, [getBestVoice]);

  const readOne = useCallback((text, lang = 'en', idx = 0) => {
    window.speechSynthesis.cancel();
    const sessionId = ++sessionRef.current;
    const langCode = lang === 'hi' ? 'hi-IN' : 'en-IN';
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode; utt.rate = 1.0; utt.pitch = 1.0;
    const voice = getBestVoice(langCode);
    if (voice) utt.voice = voice;

    utt.onstart = () => { if (isMounted.current && sessionId === sessionRef.current) { setSpeaking(true); setPaused(false); setCurrentIdx(idx); } };
    utt.onend = () => { if (isMounted.current && sessionId === sessionRef.current) { setSpeaking(false); setCurrentIdx(-1); } };
    utt.onerror = () => { if (isMounted.current && sessionId === sessionRef.current) { setSpeaking(false); setCurrentIdx(-1); } };

    utterRef.current = utt;
    setTimeout(() => { if (isMounted.current && sessionId === sessionRef.current) window.speechSynthesis.speak(utt); }, 50);
  }, [getBestVoice]);

  return { speaking, paused, currentIdx, readAll, readOne, stop, pause, resume };
}

// ── Animated Waveform ─────────────────────────────────────────────
function Waveform({ active }) {
  return (
    <div className="flex items-end gap-[4px] h-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className={clsx('w-1 rounded-full bg-white transition-all', active ? 'animate-bounce' : 'h-1 opacity-30')}
          style={active ? { animationDelay: `${i * 0.1}s`, animationDuration: `${0.6 + i * 0.1}s`, height: `${10 + i * 4}px` } : {}}
        />
      ))}
    </div>
  );
}

export default function News() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';
  const [voiceLang, setVoiceLang] = useState(lang);
  const [autoRead, setAutoRead] = useState(false);
  const hasTriggeredAutoRead = useRef(false);

  const { speaking, paused, currentIdx, readAll, readOne, stop, pause, resume } = useSpeech();

  const { data: news = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['news', lang],
    queryFn: async () => {
      const { data } = await newsAPI.getLatest(lang);
      if (!data.success) throw new Error('Failed to fetch news');
      return data.data;
    },
    onError: () => toast.error('Failed to fetch latest news')
  });

  useEffect(() => {
    if (autoRead && news.length > 0 && !hasTriggeredAutoRead.current) {
      hasTriggeredAutoRead.current = true;
      const texts = news.map((item, i) => `${t('news.samachar')} ${i + 1}. ${item.title}. ${item.description || ''}`);
      setTimeout(() => readAll(texts, voiceLang), 600);
    }
    if (!autoRead) hasTriggeredAutoRead.current = false;
  }, [autoRead, news, t, voiceLang, readAll]);

  const handleReadAll = () => {
    if (speaking && !paused) { pause(); return; }
    if (paused) { resume(); return; }
    const texts = news.map((item, i) => `${t('news.samachar')} ${i + 1}. ${item.title}. ${item.description || ''}`);
    readAll(texts, voiceLang);
  };

  const handleReadOne = (item, idx) => {
    if (speaking && currentIdx === idx) { stop(); return; }
    const text = `${item.title}. ${item.description || ''}`;
    readOne(text, voiceLang, idx);
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-24 sm:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>

            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-black leading-tight font-outfit">
              {t('news.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-3 max-w-lg leading-relaxed">
              {t('news.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={() => refetch()} className="h-14 px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3">
                <ArrowCounterClockwise size={18} weight="bold" className={clsx("text-emerald-600", loading && "animate-spin")} />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{t('news.refresh')}</span>
             </button>
          </div>
        </div>

        {/* AI Voice Reader Panel */}
        <div className="mb-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-8 sm:p-12 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                     <Microphone size={32} weight="fill" className={clsx(speaking && !paused && "animate-pulse")} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/70 mb-1">{t('news.ai_voice_reader')}</p>
                    <h3 className="text-3xl font-black tracking-tight">
                       {speaking && !paused ? t('news.reading_aloud') : t('news.listen_news')}
                    </h3>
                  </div>
               </div>
               <Waveform active={speaking && !paused} />
            </div>

            {speaking && (
              <div className="mb-10 p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <p className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-2">
                   <Sparkle size={14} weight="fill" />
                   {t('news.now_reading')}
                </p>
                <h4 className="text-lg font-bold leading-snug line-clamp-2 italic">
                   "{news[currentIdx]?.title || '...'}"
                </h4>
                <div className="mt-4 flex items-center gap-3">
                   <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${((currentIdx + 1) / news.length) * 100}%` }} />
                   </div>
                   <span className="text-xs font-semibold text-white/70">{currentIdx + 1} / {news.length}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-black/10 backdrop-blur-xl rounded-2xl p-1.5 border border-white/5">
                {['en', 'hi'].map(l => (
                  <button key={l} onClick={() => { stop(); setVoiceLang(l); }} className={clsx("px-5 py-2.5 rounded-xl text-xs font-semibold transition-all", voiceLang === l ? "bg-white text-emerald-800 shadow-xl" : "text-white/60 hover:text-white")}>
                    {l === 'en' ? t('news.voice_lang_en') : t('news.voice_lang_hi')}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleReadAll} disabled={news.length === 0 || loading} className="h-14 px-8 bg-white text-emerald-800 rounded-2xl font-bold text-sm shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50">
                  {speaking && !paused ? <Pause size={20} weight="bold" /> : <Play size={20} weight="fill" />}
                  {speaking && !paused ? t('news.pause') : paused ? t('news.resume') : t('news.read_all')}
                </button>

                {speaking && (
                  <button onClick={stop} className="h-14 px-8 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center gap-3">
                    <Square size={18} weight="fill" />
                    {t('news.stop')}
                  </button>
                )}
              </div>

              <button onClick={() => { stop(); setAutoRead(p => !p); }} className={clsx("sm:ml-auto h-14 px-8 rounded-2xl font-bold text-xs transition-all flex items-center gap-3 border", autoRead ? "bg-white/20 border-white/20 text-white" : "bg-black/10 border-white/5 text-white/50 hover:bg-black/20")}>
                {autoRead ? <SpeakerHigh size={18} weight="fill" /> : <SpeakerNone size={18} weight="bold" />}
                {t('news.auto_read')}
              </button>
            </div>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white dark:bg-slate-900 rounded-[2.5rem] h-[450px] animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {news.map((item, i) => (
              <div key={i} className={clsx("bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border overflow-hidden flex flex-col group hover:shadow-premium hover:-translate-y-2 transition-all duration-500", currentIdx === i ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-emerald-500/10" : "border-slate-200/50 dark:border-slate-800/50")}>
                <div className="h-52 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={item.imageUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop'; }} />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-semibold border border-white/10">{item.source}</div>
                  {currentIdx === i && (
                    <div className="absolute inset-0 bg-emerald-600/20 backdrop-blur-[2px] flex items-center justify-center">
                       <Waveform active={speaking && !paused} />
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
                    <Calendar size={14} weight="bold" />
                    {new Date(item.pubDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-4 line-clamp-3 group-hover:text-emerald-600 transition-colors font-outfit">{item.title}</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-6 italic">"{item.description}"</p>

                  <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-emerald-600 hover:translate-x-1 transition-transform">
                       {t('news.read_more')}
                       <ArrowSquareOut size={14} weight="bold" />
                    </a>
                    <button onClick={() => handleReadOne(item, i)} className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-90", currentIdx === i && speaking ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600")}>
                       {currentIdx === i && speaking ? <Pause size={20} weight="fill" /> : <SpeakerHigh size={20} weight="fill" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
             <Newspaper size={64} className="mx-auto text-slate-200 mb-6" weight="duotone" />
             <p className="text-xl font-black text-slate-400 italic">{t('news.no_news')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
