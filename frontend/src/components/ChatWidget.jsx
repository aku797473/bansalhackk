import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import { MessageCircle, X, Send, Trash2, ChevronDown, Bot, Mic, MicOff } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import clsx from 'clsx';

export default function ChatWidget() {
  const { t, i18n } = useTranslation();
  const { user }    = useAuth();
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chat.welcome', 'Hi! I am Kisan Mitra. Ask me anything about farming! 🌾') }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('kisan_chat_session_id');
    if (saved) return saved;
    const newId = uuid();
    localStorage.setItem('kisan_chat_session_id', newId);
    return newId;
  });
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => setIsListening(false);
    }
  }, [i18n.language]);

  const toggleListening = () => {
    if (!recognition.current) return alert('Speech recognition not supported in this browser.');
    if (isListening) {
      recognition.current.stop();
    } else {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await chatAPI.getHistory(sessionId);
        if (data.success && data.data && data.data.length > 0) {
          setMessages(data.data);
        }
      } catch (err) {
        console.warn('Could not fetch chat history');
      }
    };
    if (open) fetchHistory();
  }, [open, sessionId]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async (overrideText) => {
    const text = typeof overrideText === 'string' ? overrideText : input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await chatAPI.sendMessage(text, sessionId, i18n.language || 'en');
      const reply = data.data.reply;
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
      speak(reply); // Voice reply
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: t('chat.error', "⚠️ Sorry, I'm having trouble right now. Please try again.") }]);
    } finally { setLoading(false); }
  };

  const clearChat = () => {
    const newId = uuid();
    chatAPI.clearHistory(sessionId).catch(() => {});
    setMessages([{ role: 'assistant', content: t('chat.welcome', 'Hi! I am Kisan Mitra. Ask me anything about farming! 🌾') }]);
    setSessionId(newId);
    localStorage.setItem('kisan_chat_session_id', newId);
  };

  const QUICK = [
    t('chat.quick1', 'When to sow wheat?'),
    t('chat.quick2', 'Tell me about PM-KISAN'),
    t('chat.quick3', 'How to do crop insurance?'),
    t('chat.quick4', 'DAP fertilizer quantity')
  ];

  return (
    <>
      {/* Floating button — bottom LEFT */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.3)] transition-all duration-300 flex items-center justify-center group overflow-hidden',
          open ? 'bg-slate-800 dark:bg-slate-700 rotate-0' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:-translate-y-1 active:scale-95'
        )}
        aria-label="Open Kisan Mitra chat">
        {!open && <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
        
        {open ? <X size={24} className="text-white relative z-10" /> : (
          <div className="relative z-10 flex items-center justify-center">
            <MessageCircle size={28} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat window — anchored to bottom LEFT */}
      {open && (
        <div className="fixed bottom-28 left-6 z-50 w-80 sm:w-96 rounded-[2rem] shadow-2xl border border-white/50 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl overflow-hidden animate-slide-up flex flex-col transition-colors transform origin-bottom-left"
          style={{ maxHeight: '70vh' }}>
          
          {/* Header */}
          <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shrink-0 shadow-md">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <Bot size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base tracking-wide">{t('chat.title', 'Kisan Mitra')}</p>
              <p className="text-xs text-indigo-100 font-medium flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                Online
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
            {messages.map((msg, i) => (
              <div key={i} className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-indigo-200 dark:border-indigo-800">
                    <span className="text-sm">🌾</span>
                  </div>
                )}
                <div className={clsx(
                  'max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm font-medium'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 shadow-sm border border-indigo-200 dark:border-indigo-800">
                  <span className="text-sm">🌾</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3.5 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-5 pt-3 pb-2 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
              {QUICK.map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="shrink-0 text-[11px] font-bold tracking-wide bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3.5 py-1.5 rounded-full hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm hover:shadow-md transition-all active:scale-95">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-4 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 transition-colors shrink-0">
            <button onClick={toggleListening}
              className={clsx(
                "p-3 rounded-xl transition-all duration-300 shadow-sm",
                isListening ? "bg-red-500 text-white animate-pulse shadow-red-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}>
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input ref={inputRef} className="input flex-1 text-sm py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-indigo-500 rounded-xl"
              placeholder={isListening ? t('chat.listening', 'Listening...') : t('chat.placeholder', 'Ask about farming...')}
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading} />
            <button onClick={send} disabled={!input.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl shrink-0 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md shadow-indigo-600/20 transition-all active:scale-95">
              <Send size={18} className="translate-x-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
