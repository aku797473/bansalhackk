import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 1. Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Can be 'hi-IN' for Hindi
  }

  const handleResult = useCallback((event) => {
    const current = event.resultIndex;
    const text = event.results[current][0].transcript.toLowerCase();
    setTranscript(text);

    if (event.results[current].isFinal) {
      processCommand(text);
    }
  }, []);

  const processCommand = (command) => {
    // Navigation Logic
    if (command.includes('weather') || command.includes('mausam') || command.includes('mosam')) {
      speak('Opening weather forecast');
      navigate('/weather');
    } else if (command.includes('market') || command.includes('mandi') || command.includes('rate') || command.includes('price')) {
      speak('Checking market prices');
      navigate('/market');
    } else if (command.includes('crop') || command.includes('fasal') || command.includes('kheti')) {
      speak('Opening crop advisor');
      navigate('/crop');
    } else if (command.includes('fertilizer') || command.includes('khad')) {
      speak('Opening fertilizer guide');
      navigate('/fertilizer');
    } else if (command.includes('labour') || command.includes('mazdoor') || command.includes('worker')) {
      speak('Finding nearby workers');
      navigate('/labour');
    } else if (command.includes('map') || command.includes('field')) {
      speak('Opening smart field map');
      navigate('/map');
    } else if (command.includes('news') || command.includes('khabar')) {
      speak('Fetching latest farming news');
      navigate('/news');
    } else if (command.includes('home') || command.includes('dashboard')) {
      speak('Going back to dashboard');
      navigate('/');
    }
    
    // Close after processing
    setTimeout(() => {
      setIsOpen(false);
      setIsListening(false);
    }, 2000);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
    }
    setIsListening(!isListening);
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = handleResult;
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
  }, [handleResult]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 w-72 border border-gray-100 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Volume2 size={16} className="text-primary" />
              Smart Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 py-4">
            <button
              onClick={toggleListening}
              className={clsx(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                isListening ? "bg-red-500 animate-pulse" : "bg-primary hover:bg-emerald-600"
              )}
            >
              {isListening ? <Mic size={32} className="text-white" /> : <MicOff size={32} className="text-white" />}
            </button>
            
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                {isListening ? 'Listening...' : 'Tap to speak'}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 italic min-h-[1.25rem]">
                {transcript || 'Say "Market prices" or "Weather"'}
              </p>
            </div>
          </div>
          
          <div className="mt-2 pt-4 border-t border-gray-50 dark:border-slate-700/50">
            <p className="text-[10px] text-gray-400 text-center italic">Try: "What is the Mandi rate?"</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-emerald-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group"
        >
          <Mic size={24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
        </button>
      )}
    </div>
  );
};

export default VoiceAssistant;
