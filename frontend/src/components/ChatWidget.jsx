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
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center',
          open ? 'bg-gray-700 dark:bg-slate-700 rotate-0' : 'bg-primary hover:bg-primary-dark hover:scale-110'
        )}
        aria-label="Open Kisan Mitra chat">
        {open ? <X size={22} className="text-white" /> : (
          <div className="relative">
            <MessageCircle size={24} className="text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-pulse-slow" />
          </div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden animate-slide-up flex flex-col transition-colors"
          style={{ maxHeight: '70vh' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t('chat.title', 'Kisan Mitra')}</p>
              <p className="text-xs text-green-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block animate-pulse" />
                Online
              </p>
            </div>
            <button onClick={clearChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors" title="Clear">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3 bg-gray-50 dark:bg-slate-950 transition-colors">
            {messages.map((msg, i) => (
              <div key={i} className={clsx('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs">🌾</span>
                  </div>
                )}
                <div className={clsx(
                  'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 border border-gray-100 dark:border-slate-700 rounded-bl-sm shadow-sm'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xs">🌾</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 px-3 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500 animate-bounce"
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
            <div className="px-3 pt-2 pb-1 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto scrollbar-thin">
              {QUICK.map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="shrink-0 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shrink-0">
            <button onClick={toggleListening}
              className={clsx(
                "p-2.5 rounded-xl transition-all duration-300",
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200"
              )}>
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input ref={inputRef} className="input flex-1 text-sm py-2"
              placeholder={isListening ? t('chat.listening', 'Listening...') : t('chat.placeholder', 'Ask about farming...')}
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading} />
            <button onClick={send} disabled={!input.trim() || loading}
              className="btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
