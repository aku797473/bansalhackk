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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-600 font-inter overflow-x-hidden">
      
      {/* ── Background Elements ───────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="fixed top-6 inset-x-0 z-[100] px-6">
        <div className="max-w-6xl mx-auto h-16 sm:h-20 border border-white/40 bg-white/60 backdrop-blur-2xl rounded-[2rem] px-6 sm:px-8 flex items-center justify-between shadow-2xl shadow-slate-200/50 transition-all">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <img src={logo} className="w-5 h-5 sm:w-6 sm:h-6 invert brightness-0" alt="logo" />
             </div>
             <span className="text-lg sm:text-xl font-black tracking-tighter uppercase text-slate-900">Smart Kisan <span className="text-emerald-600">AI</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
             {['ecosystem', 'technology', 'network'].map(item => (
                <a key={item} href={`#${item}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 transition-colors">{t(`landing.nav.${item}`)}</a>
             ))}
          </div>

          <div className="flex items-center gap-4">
             <LanguageSelector showLabel={false} align="right" />
             <button 
               onClick={() => navigate('/login')}
               className="h-10 px-6 bg-slate-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
             >
               {t('landing.login')}
             </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────── */}
      <header className="relative pt-32 sm:pt-48 pb-20 sm:pb-32 px-4 sm:px-6">
         <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
               <div className="text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full mb-8">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                     <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-600">{t('landing.hero_badge')}</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight sm:leading-[1.1] tracking-tighter mb-8 text-slate-900">
                     {t('landing.title')}
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed">
                     {t('landing.subtitle')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start flex-wrap gap-4">
                     <button 
                        onClick={() => navigate('/login')}
                        className="h-16 px-10 w-full sm:w-auto bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
                     >
                        {t('landing.get_started')} <ArrowRight size={16} />
                     </button>
                     <button className="h-16 px-10 w-full sm:w-auto bg-white text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all flex items-center justify-center gap-3">
                        <PlayCircle size={18} className="text-emerald-600" /> {t('landing.watch_demo')}
                     </button>
                  </div>
               </div>

               <div className="relative group">
                  <div className="absolute -inset-10 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
                  <div className="relative bg-white rounded-[3rem] sm:rounded-[4rem] p-4 sm:p-6 shadow-premium border border-slate-100 overflow-hidden">
                     <img src={ultraHero} alt="Smart Kisan Platform" className="w-full rounded-[2rem] sm:rounded-[3.5rem] brightness-110" />
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* ── Steps Section ─────────────────────────────────── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-20">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4 block">{t('landing.steps_badge')}</span>
               <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900">{t('landing.steps_title')}</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
               <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -translate-y-1/2 z-0" />
               {['01', '02', '03'].map((step) => (
                  <div key={step} className="relative z-10 bg-slate-50 flex flex-col items-center text-center">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-600 shadow-xl mb-8">
                        {step}
                     </div>
                     <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-4 text-slate-900">{t(`landing.steps.${step}.title`)}</h3>
                     <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed px-4">{t(`landing.steps.${step}.desc`)}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────── */}
      <section id="ecosystem" className="py-24 sm:py-48 px-4 sm:px-6 relative overflow-hidden">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6 block">{t('landing.eco_badge')}</span>
               <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">{t('landing.eco_title')}</h2>
               <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                  {t('landing.eco_desc')}
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {modules(t).map((m) => (
                 <div key={m.key} className="group relative p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] bg-white border border-slate-100 hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl">
                    <div className={clsx("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-8 sm:mb-10 shadow-sm bg-slate-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all")}>
                       <m.icon size={24} />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-4 uppercase text-slate-900">{m.label}</h3>
                    <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">{m.desc}</p>
                    
                    <div className="mt-8 sm:mt-10 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                       {t('landing.init_module')} <ArrowRight size={14} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="py-20 bg-slate-900 text-white">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
               {['farmers', 'accuracy', 'savings'].map(key => (
                  <div key={key}>
                     <span className="block text-4xl sm:text-5xl font-black mb-2 text-emerald-500">{t(`landing.stats.${key}`).split(' ')[0]}</span>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t(`landing.stats.${key}`).split(' ').slice(1).join(' ')}</span>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Tech Section ──────────────────────────────────── */}
      <section className="py-24 sm:py-48 bg-white text-slate-950 relative overflow-hidden">
         <div className="absolute inset-0 bg-slate-50 opacity-50" />
         <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 w-full text-center lg:text-left">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-8 block">{t('landing.infra_badge')}</span>
               <h2 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12">
                  {t('landing.infra_title')} <br />
                  <span className="text-slate-300">STREAMING</span>
               </h2>
               <div className="space-y-8 text-left">
                  {[
                    { title: t('landing.infra.sat.title'), desc: t('landing.infra.sat.desc') },
                    { title: t('landing.infra.market.title'), desc: t('landing.infra.market.desc') },
                    { title: t('landing.infra.ai.title'), desc: t('landing.infra.ai.desc') }
                  ].map(item => (
                    <div key={item.title} className="flex gap-6 group">
                       <div className="w-1.5 h-12 bg-emerald-500 rounded-full group-hover:h-16 transition-all" />
                       <div>
                          <h4 className="text-lg font-black uppercase tracking-tight mb-1">{item.title}</h4>
                          <p className="text-slate-500 font-medium">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <div className="flex-1 relative group">
               <div className="absolute -inset-10 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
               <div className="relative bg-white rounded-[4rem] p-4 shadow-premium border border-slate-100 overflow-hidden">
                  <img src={ultraHero} alt="Infrastructure" className="w-full rounded-[3.5rem] brightness-125" />
               </div>
            </div>
         </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 sm:py-48 px-4 sm:px-6 bg-slate-50">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4 block">{t('landing.testimonials_title')}</span>
               <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-slate-900">Loved by Farmers</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
               {['t1', 't2'].map(key => (
                  <div key={key} className="p-10 sm:p-16 bg-white rounded-[3rem] border border-slate-100 shadow-sm relative group hover:shadow-2xl transition-all">
                     <Quote className="absolute top-10 right-10 text-emerald-100" size={60} />
                     <p className="text-xl sm:text-2xl font-medium text-slate-700 mb-12 relative z-10 leading-relaxed italic">
                        "{t(`landing.testimonials.${key}.text`)}"
                     </p>
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden">
                           <img src={`https://i.pravatar.cc/100?u=${key}`} alt="User" />
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 uppercase tracking-tight">{t(`landing.testimonials.${key}.name`)}</h4>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(`landing.testimonials.${key}.role`)}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── Final Call ────────────────────────────────────── */}
      <section className="py-24 sm:py-48 px-4 sm:px-6 relative bg-slate-900 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-500/10 to-transparent" />
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] bg-emerald-600 flex items-center justify-center mx-auto mb-12 shadow-3xl shadow-emerald-500/20">
               <img src={logo} className="w-8 h-8 sm:w-12 sm:h-12 invert brightness-0" alt="logo" />
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-12 text-white">{t('landing.final_title')}</h2>
            <p className="text-lg sm:text-2xl text-slate-400 font-medium mb-12 sm:mb-16 max-w-2xl mx-auto">
               {t('landing.final_desc')}
            </p>
            <button 
               onClick={() => navigate('/login')}
               className="h-16 px-10 sm:h-24 sm:px-20 w-full sm:w-auto bg-white text-slate-900 text-base sm:text-xl font-bold uppercase tracking-[0.2em] rounded-2xl sm:rounded-[2.5rem] hover:bg-emerald-500 hover:text-white transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/20"
            >
               {t('landing.init_portal')}
            </button>
         </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-12 border-t border-white/5 px-4 sm:px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-relaxed text-center md:text-left">
               {t('landing.footer_text').split('. ')[0]}. <br className="sm:hidden" />
               {t('landing.footer_text').split('. ')[1]}
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
               <a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a>
               <a href="#" className="hover:text-emerald-400 transition-colors">Nodes</a>
               <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
