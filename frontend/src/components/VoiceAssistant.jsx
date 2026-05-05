import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Volume2, Languages } from 'lucide-react';
import clsx from 'clsx';

// ─── Command Maps ─────────────────────────────────────────────────────────────
// NOTE: hi arrays include BOTH romanized AND Devanagari script because
// the browser returns Devanagari when lang=hi-IN
const COMMANDS = {
  weather: {
    en: ['weather', 'forecast', 'climate'],
    hi: ['mausam', 'mosam', 'barish', 'dhoop',
         'मौसम', 'बारिश', 'धूप', 'आज का मौसम', 'तापमान'],
    route: '/weather',
    responseEn: 'Opening weather forecast',
    responseHi: 'मौसम जानकारी खोल रहे हैं',
  },
  market: {
    en: ['market', 'mandi', 'price', 'rate', 'crop rate', 'crop price'],
    hi: ['mandi', 'bhav', 'rate', 'dam', 'keemat', 'bazar',
         'मंडी', 'भाव', 'दाम', 'कीमत', 'बाजार', 'अनाज'],
    route: '/market',
    responseEn: 'Checking market prices',
    responseHi: 'मंडी भाव देख रहे हैं',
  },
  crop: {
    en: ['crop', 'farming advice', 'fasal', 'agriculture'],
    hi: ['fasal', 'kheti', 'bona', 'kisan',
         'फसल', 'खेती', 'बोना', 'किसान', 'खेती-बाड़ी', 'फसलें'],
    route: '/crop',
    responseEn: 'Opening crop advisor',
    responseHi: 'फसल सलाह खोल रहे हैं',
  },
  fertilizer: {
    en: ['fertilizer', 'manure', 'khad'],
    hi: ['khad', 'urvarak', 'khaad',
         'खाद', 'उर्वरक', 'दवाई', 'कीटनाशक'],
    route: '/fertilizer',
    responseEn: 'Opening fertilizer guide',
    responseHi: 'खाद की जानकारी खोल रहे हैं',
  },
  labour: {
    en: ['labour', 'worker', 'mazdoor', 'help'],
    hi: ['mazdoor', 'majdoor', 'kaamgaar',
         'मजदूर', 'मज़दूर', 'काम', 'कामगार', 'मदद'],
    route: '/labour',
    responseEn: 'Finding nearby workers',
    responseHi: 'पास के मज़दूर ढूंढ रहे हैं',
  },
  news: {
    en: ['news', 'khabar', 'update'],
    hi: ['khabar', 'samachar',
         'खबर', 'समाचार', 'ताज़ा', 'न्यूज़', 'ख़बर'],
    route: '/news',
    responseEn: 'Fetching latest farming news',
    responseHi: 'ताजा खबरें देख रहे हैं',
  },
  home: {
    en: ['home', 'dashboard', 'back', 'main'],
    hi: ['ghar', 'wapas',
         'घर', 'वापस', 'होम', 'मुख्य', 'डैशबोर्ड'],
    route: '/',
    responseEn: 'Going back to dashboard',
    responseHi: 'डैशबोर्ड पर वापस जा रहे हैं',
  },
};

// ─── Hints for each language ─────────────────────────────────────────────────
const HINTS = {
  en: '"Weather", "Mandi rates", "Crop advice"',
  hi: '"मौसम", "मंडी भाव", "फसल सलाह"',
};

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [isOpen, setIsOpen]           = useState(false);
  const [lang, setLang]               = useState('hi'); // default to Hindi
  const [status, setStatus]           = useState('idle'); // idle | listening | processing | done
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // ── Build recognition instance ───────────────────────────────────────────
  const buildRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.continuous      = false;
    r.interimResults  = true;
    r.lang            = lang === 'hi' ? 'hi-IN' : 'en-IN';
    return r;
  }, [lang]);

  // ── Speak response ───────────────────────────────────────────────────────
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u  = new SpeechSynthesisUtterance(text);
    u.lang   = lang === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate   = 0.9;
    window.speechSynthesis.speak(u);
  };

  // ── Process spoken command ───────────────────────────────────────────────
  const processCommand = useCallback((text) => {
    setStatus('processing');
    const lower = text.toLowerCase();

    for (const key of Object.keys(COMMANDS)) {
      const cmd     = COMMANDS[key];
      const keywords = lang === 'hi' ? [...cmd.hi, ...cmd.en] : [...cmd.en, ...cmd.hi];
      const matched  = keywords.some(k => lower.includes(k));
      if (matched) {
        console.log(`Command matched: ${key}, navigating to: ${cmd.route}`);
        const response = lang === 'hi' ? cmd.responseHi : cmd.responseEn;
        speak(response);
        setStatus('done');
        setTimeout(() => {
          setIsOpen(false);
          setIsListening(false);
          setStatus('idle');
          setTranscript('');
          navigate(cmd.route);
        }, 1200);
        return;
      }
    }

    // No match
    speak(lang === 'hi' ? 'समझ नहीं आया, फिर कोशिश करें' : 'Not understood, please try again');
    setStatus('idle');
  }, [lang, navigate]);

  // ── Start / Stop listening ───────────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const r = buildRecognition();
    if (!r) { alert('Speech recognition is not supported in this browser.'); return; }

    setTranscript('');
    setStatus('listening');
    recognitionRef.current = r;

    r.onresult = (event) => {
      const current = event.resultIndex;
      const text    = event.results[current][0].transcript;
      setTranscript(text);
      if (event.results[current].isFinal) processCommand(text);
    };

    r.onend  = () => { setIsListening(false); if (status === 'listening') setStatus('idle'); };
    r.onerror = () => { setIsListening(false); setStatus('idle'); };

    r.start();
    setIsListening(true);
  };

  // Rebuild recognition when language changes
  useEffect(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setStatus('idle');
    }
  }, [lang]);

  const statusLabel = {
    idle:       lang === 'hi' ? 'बोलने के लिए दबाएं' : 'Tap to speak',
    listening:  lang === 'hi' ? 'सुन रहे हैं...'   : 'Listening...',
    processing: lang === 'hi' ? 'समझ रहे हैं...'    : 'Processing...',
    done:       lang === 'hi' ? 'हो गया! ✅'        : 'Done! ✅',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div className="mb-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-7 w-80 border border-white/50 dark:border-slate-700/50 animate-slide-up transform origin-bottom-right">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Volume2 size={14} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide">
                {lang === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
              </h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm transition-all"
              >
                <Languages size={12} />
                {lang === 'hi' ? 'हिंदी' : 'EN'}
              </button>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mic Button Area */}
          <div className="flex flex-col items-center gap-6 py-2">
            <div className="relative group">
              {/* Outer pulsing rings */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-400/20 scale-150 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-0 rounded-full bg-emerald-400/40 scale-125 animate-ping" style={{ animationDuration: '2s' }} />
                </>
              )}
              
              <button
                onClick={toggleListening}
                className={clsx(
                  'relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl z-10 border-4 border-white dark:border-slate-800',
                  isListening     ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 scale-110 shadow-emerald-500/50' :
                  status === 'done' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                  'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:scale-105'
                )}
              >
                {isListening
                  ? <Mic size={36} className="text-white drop-shadow-md animate-pulse" />
                  : status === 'done' 
                    ? <Volume2 size={36} className="text-white drop-shadow-md" />
                    : <MicOff size={36} className="text-slate-400 dark:text-slate-500 transition-colors group-hover:text-emerald-500" />
                }
              </button>
            </div>

            <div className="text-center w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
              <p className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mb-1">
                {statusLabel[status]}
              </p>
              <p className="text-base font-medium text-slate-700 dark:text-slate-200 min-h-[1.5rem] px-2 truncate">
                {transcript ? `"${transcript}"` : (lang === 'hi' ? '"मंडी भाव दिखाओ"' : '"Show Market prices"')}
              </p>
            </div>
          </div>

          {/* Hints */}
          <div className="mt-2 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {lang === 'hi' ? 'कहें: ' : 'Try saying: '}<span className="text-slate-600 dark:text-slate-400">{HINTS[lang]}</span>
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white dark:bg-slate-800 text-emerald-600 border border-slate-200 dark:border-slate-700 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(16,185,129,0.2)] transition-all duration-300 hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Mic size={26} className="relative z-10 group-hover:scale-110 transition-transform duration-300" />
          
          {/* Notification dot */}
          <span className="absolute top-3 right-3 w-3.5 h-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-2 border-white dark:border-slate-800 shadow-sm animate-pulse" />
        </button>
      )}
    </div>
  );
}
