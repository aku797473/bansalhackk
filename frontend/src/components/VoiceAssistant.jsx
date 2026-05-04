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
        const response = lang === 'hi' ? cmd.responseHi : cmd.responseEn;
        speak(response);
        setStatus('done');
        setTimeout(() => {
          navigate(cmd.route);
          setIsOpen(false);
          setIsListening(false);
          setStatus('idle');
          setTranscript('');
        }, 1500);
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
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 w-76 border border-gray-100 dark:border-slate-700 animate-scale-up">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Volume2 size={16} className="text-primary" />
              {lang === 'hi' ? 'आवाज़ सहायक' : 'Voice Assistant'}
            </h3>
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(l => l === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Languages size={12} />
                {lang === 'hi' ? 'हिंदी' : 'English'}
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Mic Button */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ping-slow" />
              )}
              <button
                onClick={toggleListening}
                className={clsx(
                  'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg',
                  isListening     ? 'bg-red-500 scale-110' :
                  status === 'done' ? 'bg-green-500' :
                  'bg-primary hover:bg-emerald-600 hover:scale-105'
                )}
              >
                {isListening
                  ? <Mic size={32} className="text-white animate-pulse" />
                  : <MicOff size={32} className="text-white" />
                }
              </button>
            </div>

            <div className="text-center w-full">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {statusLabel[status]}
              </p>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 italic min-h-[1.5rem] px-2 truncate">
                {transcript || (lang === 'hi' ? '"मंडी भाव दिखाओ"' : '"Show Market prices"')}
              </p>
            </div>
          </div>

          {/* Hints */}
          <div className="mt-2 pt-4 border-t border-gray-100 dark:border-slate-700/50">
            <p className="text-[10px] text-gray-400 text-center">
              {lang === 'hi' ? 'कहें: ' : 'Try: '}{HINTS[lang]}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-emerald-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group relative"
        >
          <Mic size={24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
        </button>
      )}
    </div>
  );
}
