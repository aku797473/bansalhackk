import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import {
  Cloud, Leaf, FlaskConical, TrendingUp, Users, MessageCircle, Map,
  ArrowRight, ShieldCheck, Zap, ChevronRight, Globe, BarChart3, 
  Smartphone, Award, CheckCircle2, Star, Quote, Landmark
} from 'lucide-react';
import clsx from 'clsx';
import logo from '../assets/logo.png';
import premiumHero from '../smart_kisan_hero_bg_1778305723903.png';

const features = [
  {
    icon: Cloud,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    accent: '#0ea5e9',
    key: 'weather',
    emoji: '🌦️',
    size: 'lg', 
  },
  {
    icon: Leaf,
    color: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    accent: '#16a34a',
    key: 'crop',
    emoji: '🌱',
    size: 'md',
  },
  {
    icon: TrendingUp,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    accent: '#2563eb',
    key: 'market',
    emoji: '📈',
    size: 'md',
  },
  {
    icon: FlaskConical,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    accent: '#d97706',
    key: 'fertilizer',
    emoji: '🧪',
    size: 'lg',
  },
  {
    icon: Users,
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    accent: '#9333ea',
    key: 'labour',
    emoji: '👷',
    size: 'md',
  },
  {
    icon: Map,
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
    accent: '#0d9488',
    key: 'map',
    emoji: '🗺️',
    size: 'md',
  },
];

const stats = [
  { value: '1M+', key: 'farmers', icon: Users },
  { value: '500+', key: 'mandis', icon: Landmark },
  { value: '28',    key: 'states', icon: Globe },
  { value: '24/7', key: 'support', icon: Zap },
];

const trustedBy = [
  { name: 'AGMARKNET', label: 'Official Prices' },
  { name: 'IMD INDIA', label: 'Satellite Data' },
  { name: 'ICAR', label: 'Scientific Models' },
  { name: 'PM-KISAN', label: 'Scheme Sync' },
];

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden selection:bg-primary selection:text-white">

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 h-20 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group cursor-pointer shrink-0" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
              <img src={logo} alt="Logo" className="w-6 h-6 invert brightness-0" />
            </div>
            <div className="flex flex-col">
               <span className="font-black text-gray-900 dark:text-white text-xl tracking-tighter leading-none">Smart Kisan</span>
               <span className="text-[9px] text-primary dark:text-emerald-400 font-black uppercase tracking-[0.2em]">{t('landing.v2')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden lg:flex items-center gap-8 mr-4">
               {['features', 'steps', 'impact'].map(item => (
                 <a key={item} href={`#${item}`} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">{t(`landing.nav.${item}`, item)}</a>
               ))}
            </nav>
            <LanguageSelector showLabel={true} align="right" />
            <button onClick={() => navigate('/login')} className="btn-primary h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              {t('landing.get_started_btn')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img src={premiumHero} alt="Premium Farm" className="w-full h-full object-cover opacity-30 dark:opacity-40 animate-fade-in" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white dark:from-slate-950 dark:via-slate-950/40 dark:to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 border border-primary/20 dark:border-primary/10 text-primary dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] rounded-full mb-10 shadow-premium animate-slide-down">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('landing.official_partners')}
          </div>

          <h1 className="text-fluid-xl font-black text-gray-900 dark:text-white leading-[0.95] tracking-tighter mb-8 animate-slide-up"
              dangerouslySetInnerHTML={{ __html: t('landing.empowering') }} />

          <p className="text-lg sm:text-2xl text-gray-500 dark:text-slate-400 max-w-3xl mx-auto mb-14 font-medium leading-relaxed animate-slide-up [animation-delay:100ms]">
            {t('landing.hero_desc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up [animation-delay:200ms]">
            <button onClick={() => navigate('/login')} className="btn-primary h-18 px-12 text-base font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 w-full sm:w-auto group">
              <span>{t('landing.get_started')}</span> 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="h-18 px-10 text-base font-black uppercase tracking-widest text-gray-600 dark:text-slate-300 hover:text-primary transition-all border-2 border-transparent hover:border-primary/20 rounded-2xl">
              {t('landing.learn_more')}
            </button>
          </div>

          {/* Floating Showcase */}
          <div className="mt-24 relative max-w-4xl mx-auto animate-scale-up [animation-delay:400ms]">
             <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 blur-[100px] rounded-full" />
             <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/20 blur-[100px] rounded-full" />
             <div className="relative glass-dark p-2 rounded-[2.5rem] border border-white/20 shadow-3xl overflow-hidden group">
                <img src={premiumHero} className="w-full rounded-[2rem] shadow-inner group-hover:scale-[1.02] transition-transform duration-1000" alt="Platform Dashboard" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-10 text-left">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="badge-verified bg-white/20 backdrop-blur-md text-white border-white/20">
                         <ShieldCheck size={10} /> {t('landing.verified')}
                      </div>
                      <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">LIVE MANDI FEED</div>
                   </div>
                   <h3 className="text-white text-2xl font-black tracking-tight">{t('landing.hero_title')}</h3>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── Trusted By Strip ──────────────────────────────── */}
      <section className="py-16 border-y border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
           <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-12">{t('landing.trusted_by')}</p>
           <div className="flex flex-wrap justify-center gap-12 sm:gap-24 opacity-50 dark:opacity-40">
             {trustedBy.map(brand => (
               <div key={brand.name} className="flex flex-col items-center">
                 <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter grayscale">{brand.name}</span>
                 <span className="text-[8px] font-bold uppercase tracking-widest mt-1">{brand.label}</span>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* ── Stats Bento ───────────────────────────────────── */}
      <section id="impact" className="py-24 sm:py-32 bg-white dark:bg-slate-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map(({ value, key, icon: Icon }) => (
              <div key={key} className="p-8 rounded-[2rem] bg-gray-50/50 dark:bg-slate-900/50 border border-gray-100 dark:border-white/5 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-primary dark:text-emerald-400" />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">{value}</div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{t(`landing.stats_label.${key}`)}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">{t(`landing.stats_desc.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────── */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50/50 dark:bg-black/20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-24">
            <span className="px-4 py-1.5 bg-primary/10 text-primary dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-primary/10 mb-6 inline-block">{t('landing.platform_ecosystem')}</span>
            <h2 className="text-fluid-lg font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-none">
               {t('landing.features_title')}
            </h2>
            <p className="text-xl text-gray-500 dark:text-slate-400 font-medium">
              {t('landing.unified_dashboard')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            {features.map(({ icon: Icon, color, accent, key, emoji, size }, i) => (
              <div
                key={key}
                onClick={() => navigate('/login')}
                className={clsx(
                  "group relative rounded-[2.5rem] p-10 overflow-hidden border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer",
                  size === 'lg' ? 'md:col-span-7' : 'md:col-span-5',
                  i === 0 && 'md:row-span-2 md:h-full'
                )}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-transparent to-primary/5 -translate-y-1/2 translate-x-1/4 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                
                <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500", color)}>
                  <Icon size={26} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight flex items-center gap-3">
                   <span className="text-3xl">{emoji}</span> {t(`landing.feat_${key}`)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                  {t(`landing.feat_${key}_desc`)}
                </p>

                <div className="absolute bottom-8 right-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500" style={{ color: accent }}>
                   {t('landing.explore_module')} <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps Section ─────────────────────────────────── */}
      <section id="steps" className="py-24 sm:py-32 bg-white dark:bg-slate-950 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
             <div className="flex-1 text-center lg:text-left">
                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-blue-100 dark:border-blue-900/20 mb-8 inline-block">{t('landing.simple_workflow')}</span>
                <h2 className="text-fluid-lg font-black text-gray-900 dark:text-white mb-10 tracking-tighter leading-none">
                   {t('landing.steps_title')}
                </h2>
                <div className="space-y-12">
                   {['01', '02', '03'].map(step => (
                     <div key={step} className="flex flex-col sm:flex-row items-center lg:items-start gap-6 group">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 dark:bg-primary/20 text-primary dark:text-emerald-400 flex items-center justify-center font-black text-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                           {step}
                        </div>
                        <div>
                           <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 uppercase tracking-tight">{t(`landing.steps.${step}.title`)}</h3>
                           <p className="text-base text-gray-500 dark:text-slate-400 font-medium">{t(`landing.steps.${step}.desc`)}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="flex-1 relative">
                <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="relative bg-gray-900 rounded-[3rem] p-4 shadow-3xl border border-white/10 overflow-hidden">
                   <div className="flex items-center gap-2 mb-4 px-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20" />
                   </div>
                   <img src={premiumHero} alt="Onboarding" className="w-full rounded-[2rem]" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="py-24 sm:py-48 px-6 bg-gray-900 dark:bg-black overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white dark:from-slate-950 to-transparent" />
         
         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-24">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 block">{t('landing.success_stories')}</span>
               <h2 className="text-fluid-lg font-black text-white tracking-tighter leading-none mb-4">{t('landing.farmer_stories')}</h2>
               <div className="flex items-center justify-center gap-1 text-amber-400">
                  {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {['ramlal', 'sunita', 'jagdish'].map((id) => (
                 <div key={id} className="relative group">
                    <div className="absolute inset-0 bg-white/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative p-10 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-sm h-full flex flex-col">
                       <Quote size={40} className="text-primary mb-8 opacity-40" />
                       <p className="text-lg text-white/80 font-medium italic leading-relaxed mb-10 flex-1">
                         "{t(`landing.testimonials.${id}.text`)}"
                       </p>
                       <div className="flex items-center gap-4 mt-auto">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-3xl">
                             {id === 'ramlal' ? '👨‍🌾' : id === 'sunita' ? '👩‍🌾' : '🧑‍🌾'}
                          </div>
                          <div className="text-left">
                             <p className="text-white font-black text-base tracking-tight">{t(`landing.testimonials.${id}.name`)}</p>
                             <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{t(`landing.testimonials.${id}.role`)}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────── */}
      <section className="py-24 sm:py-48 px-6 bg-white dark:bg-slate-950 overflow-hidden">
         <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[4rem] bg-gradient-to-br from-primary-dark to-primary p-12 sm:p-24 text-center text-white overflow-hidden shadow-premium group">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
               
               <div className="relative z-10">
                  <div className="w-20 h-20 rounded-[1.75rem] bg-white flex items-center justify-center mx-auto mb-12 shadow-2xl animate-bounce-sm">
                     <img src={logo} alt="Logo" className="w-10 h-10" />
                  </div>
                  <h2 className="text-fluid-lg font-black mb-8 tracking-tighter leading-[0.95]">{t('landing.start_free')}</h2>
                  <p className="text-xl text-green-100/80 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                    {t('landing.join_millions')}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button onClick={() => navigate('/login')} className="bg-white text-primary h-20 px-14 rounded-2xl font-black uppercase tracking-[0.2em] shadow-3xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 text-lg group">
                      {t('landing.get_started')} <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  
                  <div className="mt-20 flex flex-wrap justify-center gap-8 sm:gap-16">
                     {[
                       { icon: ShieldCheck, label: t('landing.secure') },
                       { icon: Zap, label: t('landing.fast_setup') },
                       { icon: Award, label: t('landing.free_forever') }
                     ].map(({ icon: Icon, label }) => (
                       <div key={label} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                          <Icon size={18} />
                          <span>{label}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-950 pt-24 pb-12 px-6 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20">
             <div className="flex flex-col items-center md:items-start gap-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <img src={logo} alt="Logo" className="w-5 h-5 invert brightness-0" />
                   </div>
                   <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Smart Kisan</span>
                </div>
                <p className="text-sm text-gray-500 font-medium text-center md:text-left max-w-xs">{t('landing.hero_sub')}</p>
             </div>
             
             <div className="flex flex-wrap justify-center gap-10 sm:gap-20">
                {['product', 'company', 'resources'].map(section => (
                  <div key={section} className="flex flex-col items-center md:items-start gap-6">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{section}</span>
                    <ul className="flex flex-col items-center md:items-start gap-4">
                       {[1,2,3].map(i => (
                         <li key={i}><a href="#" className="text-sm font-bold text-gray-600 dark:text-slate-400 hover:text-primary transition-colors">Link Item {i}</a></li>
                       ))}
                    </ul>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="pt-12 border-t border-gray-50 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
             <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.25em] text-center md:text-left leading-relaxed">
                {t('landing.footer_tag')}
             </p>
             <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
               <a href="#" className="hover:text-primary transition-colors tracking-[0.4em]">PRIVACY</a>
               <a href="#" className="hover:text-primary transition-colors tracking-[0.4em]">TERMS</a>
               <a href="#" className="hover:text-primary transition-colors tracking-[0.4em]">CONTACT</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
