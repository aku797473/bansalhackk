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
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-400 font-inter overflow-x-hidden">
      
      {/* ── Background Noise & Gradients ──────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-[100] h-20 border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <img src={logo} className="w-5 h-5 sm:w-6 sm:h-6 invert brightness-0" alt="logo" />
             </div>
             <span className="text-lg sm:text-xl font-black tracking-tighter uppercase">Smart Kisan <span className="text-emerald-500">AI</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
             {['ecosystem', 'technology', 'network'].map(item => (
               <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-emerald-400 transition-colors">{t(`landing.nav.${item}`)}</a>
             ))}
          </div>

          <div className="flex items-center gap-4">
             <LanguageSelector showLabel={true} align="right" />
             <button 
               onClick={() => navigate('/login')}
               className="h-11 px-6 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-xl shadow-white/5"
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 animate-fade-in">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">{t('landing.hero_badge')}</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight sm:leading-[1.1] tracking-tighter mb-8 animate-slide-up">
                     {t('landing.title').split(' ').slice(0, -2).join(' ')} <br className="hidden sm:block" />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">{t('landing.title').split(' ').slice(-2).join(' ')}</span>
                  </h1>

                  <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed animate-slide-up [animation-delay:100ms]">
                     {t('landing.subtitle')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start flex-wrap gap-4 animate-slide-up [animation-delay:200ms]">
                     <button 
                        onClick={() => navigate('/login')}
                        className="h-16 px-10 w-full sm:w-auto bg-emerald-500 text-slate-950 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                     >
                        {t('landing.get_started')} <ArrowRight size={20} />
                     </button>
                     <button className="h-16 px-10 w-full sm:w-auto border border-white/10 bg-white/5 backdrop-blur-md font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                        <PlayCircle size={20} /> {t('landing.watch_demo')}
                     </button>
                  </div>

                  <div className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 opacity-40 grayscale animate-fade-in [animation-delay:400ms]">
                     <div className="text-sm font-black tracking-widest uppercase">{t('landing.partners')}</div>
                     <span className="text-xl font-black tracking-tighter">AGMARKNET</span>
                     <span className="text-xl font-black tracking-tighter">IMD INDIA</span>
                  </div>
               </div>

               <div className="relative group animate-scale-up">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative aspect-square rounded-[2.5rem] bg-slate-900 border border-white/10 overflow-hidden shadow-3xl">
                     <img src={ultraHero} alt="Futuristic Farming" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                     
                     {/* Floating Cards */}
                     <div className="absolute top-10 right-4 sm:right-10 p-4 sm:p-6 glass-dark border-white/10 rounded-3xl shadow-2xl animate-bounce-sm">
                        <div className="flex items-center gap-3 mb-2">
                           <TrendingUp className="text-emerald-400" size={18} />
                           <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{t('landing.mandi_card')}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black">₹2,450 <span className="text-[10px] text-emerald-400 font-bold tracking-widest">+12%</span></div>
                     </div>

                     <div className="absolute bottom-10 left-4 sm:left-10 p-4 sm:p-6 glass-dark border-white/10 rounded-3xl shadow-2xl animate-float-up [animation-delay:1s]">
                        <div className="flex items-center gap-3 mb-2">
                           <Cloud className="text-blue-400" size={18} />
                           <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">{t('landing.weather_card')}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-black">0.2mm <span className="text-[10px] text-slate-500 font-bold tracking-widest">{t('landing.expected')}</span></div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </header>

      {/* ── Feature Bento ─────────────────────────────────── */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 sm:mb-20">
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6 block">{t('landing.eco_badge')}</span>
               <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">{t('landing.eco_title').split(' ').slice(0, 2).join(' ')} <br className="hidden sm:block" /> {t('landing.eco_title').split(' ').slice(2).join(' ')}</h2>
               <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                  {t('landing.eco_desc')}
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {modules(t).map((m) => (
                 <div key={m.key} className="group relative p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden">
                    <div className={clsx("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700", m.color)} />
                    
                    <div className={clsx("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-8 sm:mb-10 shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br", m.color)}>
                       <m.icon className="text-white" size={24} />
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-4 uppercase">{m.label}</h3>
                    <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">{m.desc}</p>
                    
                    <div className="mt-8 sm:mt-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                       {t('landing.init_module')} <ArrowRight size={14} />
                    </div>
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
                  {t('landing.infra_title').split(' ').slice(0, 2).join(' ')} <br />
                  {t('landing.infra_title').split(' ').slice(2).join(' ')} <br />
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
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 animate-ping-slow">
                     <MousePointer2 className="text-emerald-600" size={32} />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Final Call ────────────────────────────────────── */}
      <section className="py-24 sm:py-48 px-4 sm:px-6 relative bg-slate-950">
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-12 shadow-3xl shadow-emerald-500/20">
               <img src={logo} className="w-8 h-8 sm:w-12 sm:h-12 invert brightness-0" alt="logo" />
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-none mb-12">{t('landing.final_title').split(' ').slice(0, 2).join(' ')} <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{t('landing.final_title').split(' ').slice(2).join(' ')}</span></h2>
            <p className="text-lg sm:text-2xl text-slate-400 font-medium mb-12 sm:mb-16 max-w-2xl mx-auto">
               {t('landing.final_desc')}
            </p>
            <button 
               onClick={() => navigate('/login')}
               className="h-16 px-10 sm:h-24 sm:px-20 w-full sm:w-auto bg-white text-slate-950 text-base sm:text-xl font-black uppercase tracking-[0.2em] rounded-2xl sm:rounded-[2.5rem] hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5"
            >
               {t('landing.init_portal')}
            </button>
            
            <div className="mt-24 grid grid-cols-3 gap-12 opacity-30">
               {[
                 { icon: ShieldCheck, label: 'Secure' },
                 { icon: Zap, label: 'Instant' },
                 { icon: Award, label: 'Verified' }
               ].map(item => (
                 <div key={item.label} className="flex flex-col items-center gap-3">
                    <item.icon size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{item.label}</span>
                 </div>
               ))}
            </div>
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
