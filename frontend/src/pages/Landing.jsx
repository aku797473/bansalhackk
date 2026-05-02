import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Cloud, Leaf, FlaskConical, TrendingUp, Users, MessageCircle,
  ArrowRight, Sprout, MapPin, ShieldCheck, Zap, ChevronRight
} from 'lucide-react';
import logo from '../assets/logo.png';

const features = [
  {
    icon: Cloud,
    color: 'bg-sky-50 text-sky-600',
    accent: '#0ea5e9',
    key: 'weather',
    emoji: '🌦️',
  },
  {
    icon: Leaf,
    color: 'bg-green-50 text-green-600',
    accent: '#16a34a',
    key: 'crop',
    emoji: '🌱',
  },
  {
    icon: FlaskConical,
    color: 'bg-amber-50 text-amber-600',
    accent: '#d97706',
    key: 'fertilizer',
    emoji: '🧪',
  },
  {
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-600',
    accent: '#2563eb',
    key: 'market',
    emoji: '📈',
  },
  {
    icon: Users,
    color: 'bg-purple-50 text-purple-600',
    accent: '#9333ea',
    key: 'labour',
    emoji: '👷',
  },
  {
    icon: MessageCircle,
    color: 'bg-teal-50 text-teal-600',
    accent: '#0d9488',
    key: 'chat',
    emoji: '💬',
  },
];

const stats = [
  { value: '10L+', label: 'Farmers',   desc: 'Registered Farmers' },
  { value: '500+', label: 'Mandis', desc: 'Markets Covered' },
  { value: '15+',  label: 'States',   desc: 'States Active' },
  { value: '24/7', label: 'Support', desc: 'Support Available' },
];

const testimonials = [
  { name: 'Ramlal Verma', role: 'Wheat Farmer, UP', text: 'Smart Kisan gives me real-time market rates. I earned ₹40,000 more last season.', avatar: '👨‍🌾' },
  { name: 'Sunita Devi', role: 'Rice Farmer, Bihar', text: 'Accurate weather information. Helped me save my crop.', avatar: '👩‍🌾' },
  { name: 'Jagdish Singh', role: 'Vegetable Grower, Punjab', text: 'Fertilizer and labour info in one place. Saved both time and money.', avatar: '🧑‍🌾' },
];

const trustedBy = ['🏛️ NABARD', '🌿 ICAR', '🏦 SBI Agri', '🇮🇳 PM-KISAN'];

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden animate-fade-in">

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-white/5" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden">
              <img src={logo} alt="Smart Kisan Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-gray-900 dark:text-white text-xl tracking-tighter">Smart Kisan</span>
            <span className="hidden sm:block px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-900/20 ml-2">Beta</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <button onClick={() => navigate('/login')} className="text-sm font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest hidden sm:flex">
              Login
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary h-12 px-6 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95">
              <span>Get Started</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40 px-4 sm:px-6">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-900/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full mb-12 shadow-2xl float-up">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
            <Sprout size={14} className="text-green-500" />
            <span>Digital Companion for Farmers — AI Powered</span>
          </div>

          <h1 className="text-fluid-xl font-black text-gray-900 dark:text-white text-balance mb-10 float-up-2 tracking-tighter leading-[0.95]">
            {t('landing.hero_title')}
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-14 text-balance float-up-3 font-medium leading-relaxed italic">
            {t('landing.hero_sub')}
          </p>

          <div className="flex flex-col xs:flex-row gap-5 justify-center float-up-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary h-16 px-10 text-base font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95">
              <span>{t('landing.get_started')}</span> <ArrowRight size={20} />
            </button>
            <button className="btn-secondary h-16 px-10 text-base font-black uppercase tracking-widest rounded-2xl border-2 dark:bg-slate-900 dark:border-slate-800 hover:scale-105 active:scale-95">
              <span>{t('landing.learn_more')}</span>
            </button>
          </div>

          {/* Trusted by */}
          <div className="mt-24 flex flex-col items-center gap-8 float-up-4 opacity-70">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Trusted & Supported by</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-10">
              {trustedBy.map(t => (
                <span key={t} className="text-sm text-gray-400 font-black grayscale hover:grayscale-0 transition-all cursor-default uppercase tracking-widest">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ───────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-gray-50/50 dark:bg-black/20 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 sm:gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center group">
                <p className="text-4xl sm:text-5xl font-black text-primary tracking-tighter mb-2 group-hover:scale-110 transition-transform">{s.value}</p>
                <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{s.label}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 sm:mb-24">
            <span className="px-4 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-green-100 dark:border-green-900/20 mb-6 inline-block">Platform Ecosystem</span>
            <h2 className="text-fluid-lg font-black text-gray-900 dark:text-white mb-6 tracking-tighter leading-none">
              {t('landing.features_title')}
            </h2>
            <p className="text-lg text-gray-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              AI-powered smart tools to enhance your farming lifecycle — all in one unified dashboard.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map(({ icon: Icon, color, accent, key, emoji }) => (
              <div
                key={key}
                className="bg-gray-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-10 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 group cursor-default"
              >
                <div className={`w-16 h-16 rounded-2xl ${color} dark:bg-opacity-20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-black text-gray-900 dark:text-white mb-4 text-xl tracking-tight flex items-center gap-3">
                  <span className="text-2xl">{emoji}</span> <span>{t(`landing.feat_${key}`)}</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  {t(`landing.feat_${key}_desc`)}
                </p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all group-hover:gap-3" style={{ color: accent }}>
                  <span>Explore Module</span> <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-gray-50 dark:bg-black/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-blue-100 dark:border-blue-900/20 mb-6 inline-block">Simple Workflow</span>
            <h2 className="text-fluid-lg font-black text-gray-900 dark:text-white tracking-tighter leading-none">
              Start in 3 Easy Steps
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-12 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {[
              { step: '01', title: 'Register', desc: 'Create a free account in 2 minutes', icon: '📝' },
              { step: '02', title: 'Get Insights', desc: 'Weather, rates, crop advice all in one place', icon: '📊' },
              { step: '03', title: 'Grow Farming', desc: 'Make better decisions with AI help', icon: '🚀' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="flex flex-col items-center text-center gap-6 relative">
                <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-primary/20 flex items-center justify-center text-4xl shadow-2xl transition-transform hover:scale-110">
                  {icon}
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary/60 mb-2 tracking-[0.3em]">STEP {step}</div>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 uppercase tracking-tight">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-amber-100 dark:border-amber-900/20 mb-6 inline-block">Success Stories</span>
            <h2 className="text-fluid-lg font-black text-gray-900 dark:text-white tracking-tighter leading-none">
              Farmer Stories
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-10 shadow-sm transition-all hover:shadow-2xl hover:border-primary/20">
                <div className="text-2xl mb-6">⭐⭐⭐⭐⭐</div>
                <p className="text-base text-gray-600 dark:text-slate-300 leading-relaxed mb-8 font-medium italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl shadow-lg shadow-gray-100 dark:shadow-none">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-base tracking-tight">{t.name}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-primary-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }} />
        <div className="relative max-w-3xl mx-auto text-center text-white">
          <div className="w-20 h-20 rounded-[1.75rem] bg-white flex items-center justify-center text-4xl mx-auto mb-10 border border-white/30 shadow-2xl overflow-hidden">
            <img src={logo} alt="Smart Kisan Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-fluid-lg font-black mb-8 tracking-tighter leading-[0.9]">Start Today — For Free</h2>
          <p className="text-lg sm:text-xl text-green-100 mb-14 font-medium opacity-90 text-balance">
            Join millions of farmers and transform your traditional farming into a data-driven smart business.
          </p>
          <div className="flex flex-col xs:flex-row gap-5 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-primary h-18 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all inline-flex items-center justify-center gap-3 shadow-2xl text-base group">
              <span>{t('landing.get_started')}</span> <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-green-100 opacity-80">
            <span className="flex items-center gap-2.5"><ShieldCheck size={16} /> <span>Secure</span></span>
            <span className="flex items-center gap-2.5"><Zap size={16} /> <span>Fast Setup</span></span>
            <span className="flex items-center gap-2.5">💯 <span>Free Forever</span></span>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white overflow-hidden shadow-sm shrink-0">
              <img src={logo} alt="Smart Kisan Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">Smart Kisan</span>
          </div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] text-center">
            © 2025 Smart Kisan — For farmers, by farmers. Made with ❤️ in India
          </p>
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
