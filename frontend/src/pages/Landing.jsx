import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import {
  Cloud, Leaf, FlaskConical, TrendingUp, Users, Map,
  ArrowRight, ShieldCheck, Zap, ChevronRight, Globe, 
  Award, Star, Quote, Landmark, PlayCircle, MousePointer2
} from 'lucide-react';
import clsx from 'clsx';
import logo from '../assets/logo.png';
import ultraHero from '../assets/ultra-hero.png';

const modules = (t) => [
  {
    icon: Cloud,
    label: t('landing.modules.weather.label'),
    desc: t('landing.modules.weather.desc'),
    color: 'from-blue-500 to-cyan-400',
    key: 'weather',
    delay: '0'
  },
  {
    icon: Leaf,
    label: t('landing.modules.crop.label'),
    desc: t('landing.modules.crop.desc'),
    color: 'from-emerald-500 to-teal-400',
    key: 'crop',
    delay: '100'
  },
  {
    icon: TrendingUp,
    label: t('landing.modules.market.label'),
    desc: t('landing.modules.market.desc'),
    color: 'from-amber-500 to-orange-400',
    key: 'market',
    delay: '200'
  }
];

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-600 font-inter overflow-x-hidden transition-colors duration-300">
      
      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-4 pt-4">
        <div className="max-w-5xl mx-auto h-16 border border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl px-6 flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <img src={logo} className="w-5 h-5 invert brightness-0" alt="logo" />
             </div>
             <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Smart Kisan <span className="text-emerald-600">AI</span></span>
          </div>

          <div className="flex items-center gap-4">
             <LanguageSelector showLabel={false} align="right" />
             <button 
               onClick={() => navigate('/login')}
               className="h-9 px-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
             >
               {t('landing.login')}
             </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <header className="relative pt-32 pb-16 px-4">
         <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-full mb-6">
                     <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{t('landing.hero_badge')}</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white">
                     {t('landing.title')}
                  </h1>

                  <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                     {t('landing.subtitle')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                     <button 
                        onClick={() => navigate('/login')}
                        className="h-14 px-8 w-full sm:w-auto bg-slate-900 dark:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                     >
                        {t('landing.get_started')} <ArrowRight size={16} />
                     </button>
                     <button className="h-14 px-8 w-full sm:w-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                        <PlayCircle size={18} className="text-emerald-600" /> {t('landing.watch_demo')}
                     </button>
                  </div>
               </div>

               <div className="relative">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                     <img src={ultraHero} alt="Smart Kisan" className="w-full rounded-2xl" />
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* ── Steps Section ─────────────────────────────────── */}
      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800">
         <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-16">{t('landing.steps_title')}</h2>
            
            <div className="grid md:grid-cols-3 gap-12">
               {['01', '02', '03'].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                     <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg font-black text-emerald-600 mb-6 shadow-sm">
                        {step}
                     </div>
                     <h3 className="text-base font-bold uppercase tracking-tight mb-3 text-slate-900 dark:text-white">{t(`landing.steps.${step}.title`)}</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t(`landing.steps.${step}.desc`)}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────── */}
      <section className="py-20 px-4">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 block">{t('landing.eco_badge')}</span>
               <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-6">{t('landing.eco_title')}</h2>
               <p className="text-base text-slate-500 max-w-xl mx-auto font-medium">
                  {t('landing.eco_desc')}
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {modules(t).map((m) => (
                 <div key={m.key} className="group p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 transition-all cursor-pointer shadow-sm">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-800 text-emerald-600">
                       <m.icon size={20} />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight mb-3 uppercase text-slate-900 dark:text-white">{m.label}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{m.desc}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                       {t('landing.init_module')} <ArrowRight size={14} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="py-16 bg-slate-900 dark:bg-black text-white">
         <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {['farmers', 'accuracy', 'savings'].map(key => (
               <div key={key}>
                  <span className="block text-3xl font-black mb-1 text-emerald-500">{t(`landing.stats.${key}`).split(' ')[0]}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t(`landing.stats.${key}`).split(' ').slice(1).join(' ')}</span>
               </div>
            ))}
         </div>
      </section>

      {/* ── Tech Section ──────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-slate-950 px-4">
         <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 block">{t('landing.infra_badge')}</span>
               <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-10 text-slate-900 dark:text-white">{t('landing.infra_title')}</h2>
               <div className="space-y-8 text-left max-w-xl mx-auto lg:mx-0">
                  {[
                    { title: t('landing.infra.sat.title'), desc: t('landing.infra.sat.desc') },
                    { title: t('landing.infra.market.title'), desc: t('landing.infra.market.desc') },
                    { title: t('landing.infra.ai.title'), desc: t('landing.infra.ai.desc') }
                  ].map(item => (
                    <div key={item.title} className="flex gap-4 group">
                       <div className="w-1 h-auto bg-emerald-500 rounded-full" />
                       <div>
                          <h4 className="text-sm font-bold uppercase tracking-tight mb-1 dark:text-white">{item.title}</h4>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex-1">
               <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-3 border border-slate-100 dark:border-slate-800">
                  <img src={ultraHero} alt="Infrastructure" className="w-full rounded-2xl grayscale opacity-80" />
               </div>
            </div>
         </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30 px-4">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white mb-16">{t('landing.testimonials_title')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
               {['t1', 't2'].map(key => (
                  <div key={key} className="p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed italic">
                        "{t(`landing.testimonials.${key}.text`)}"
                     </p>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${key}`} alt="User" />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{t(`landing.testimonials.${key}.name`)}</h4>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t(`landing.testimonials.${key}.role`)}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Final Call ────────────────────────────────────── */}
      <section className="py-20 px-4 text-center bg-slate-900 dark:bg-black text-white overflow-hidden relative">
         <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-8">{t('landing.final_title')}</h2>
            <p className="text-base text-slate-400 mb-10">
               {t('landing.final_desc')}
            </p>
            <button 
               onClick={() => navigate('/login')}
               className="h-14 px-10 bg-white dark:bg-emerald-600 text-slate-900 dark:text-white font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
            >
               {t('landing.init_portal')}
            </button>
         </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-12 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 px-4">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
               {t('landing.footer_text')}
            </p>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <a href="#" className="hover:text-emerald-500 transition-colors">Privacy</a>
               <a href="#" className="hover:text-emerald-500 transition-colors">Nodes</a>
               <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
