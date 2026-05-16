import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import clsx from 'clsx';
import ThreeHero from '../components/ThreeHero';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-600 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-4 pt-4">
        <div className="max-w-7xl mx-auto h-20 border border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[1.5rem] px-8 flex items-center justify-between shadow-2xl">
          <div className="flex flex-col leading-none">
             <span className="text-2xl font-black tracking-tighter uppercase">Smart<span className="text-emerald-600">Kisan</span></span>
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Universal Agri Identity</span>
          </div>

          <div className="flex items-center gap-8">
             <LanguageSelector showLabel={false} align="right" />
             <button 
               onClick={() => navigate('/login')}
               className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl"
             >
               {t('landing.login')}
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Strict 50/50 Content Split */}
      <header className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden pt-24 lg:pt-0">
         
         {/* Left Side: Clean Typography (No design in background here) */}
         <div className="w-full lg:w-1/2 h-full flex items-center px-8 lg:px-24 py-20 lg:py-0 relative z-20 bg-white dark:bg-slate-950">
            <div className="max-w-xl">
               <div className="inline-flex items-center gap-3 px-6 py-2 bg-emerald-600 text-white rounded-full mb-12 shadow-2xl shadow-emerald-500/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('landing.hero_badge')}</span>
               </div>

               <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black leading-[0.8] tracking-tighter mb-12 uppercase">
                  {t('landing.title').split(' ').map((word, i) => (
                    <span key={i} className={clsx("block", i % 2 !== 0 && "text-emerald-600")}>{word}</span>
                  ))}
               </h1>

               <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-bold max-w-lg mb-16 leading-tight uppercase tracking-tight opacity-80">
                  {t('landing.subtitle')}
               </p>

               <div className="flex flex-col sm:flex-row items-center gap-8">
                  <button 
                     onClick={() => navigate('/login')}
                     className="w-full sm:w-auto h-20 px-16 bg-slate-900 dark:bg-white text-white dark:text-black text-[12px] font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                     {t('landing.get_started')}
                  </button>
                  <button onClick={() => { document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' }); }} className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group">
                     LEARN MORE <span className="inline-block group-hover:translate-y-2 transition-transform ml-2">↓</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Right Side: Massive 3D Visual Section (Design stays here) */}
         <div className="w-full lg:w-1/2 h-[60vh] lg:h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900/10">
            <div className="absolute inset-0 z-10 border-l border-slate-100 dark:border-slate-800">
               <ThreeHero />
            </div>
            {/* Visual Balance Gradient - Ensures text side is clean */}
            <div className="absolute inset-y-0 left-0 w-32 z-20 bg-gradient-to-r from-white dark:from-slate-950 to-transparent pointer-events-none hidden lg:block" />
         </div>
      </header>

      {/* Stats Section */}
      <section className="py-32 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10">
         <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
               {[
                 { label: 'ACTIVE USERS', value: '1.2M+' },
                 { label: 'MANDI COVERED', value: '450+' },
                 { label: 'AI ACCURACY', value: '98.4%' },
                 { label: 'DATA NODES', value: '24/7' }
               ].map((stat) => (
                 <div key={stat.label} className="text-center md:text-left group cursor-default">
                    <div className="text-6xl font-black tracking-tighter mb-4 group-hover:text-emerald-600 transition-colors">{stat.value}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Feature Grid */}
      <section className="features-section py-40 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="mb-32">
               <div className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-6">INTELLIGENCE MODULES</div>
               <h2 className="text-6xl sm:text-9xl font-black tracking-tighter uppercase mb-8 leading-none max-w-4xl">{t('landing.eco_title')}</h2>
               <p className="text-2xl text-slate-500 font-bold max-w-2xl uppercase tracking-tight leading-relaxed">{t('landing.eco_desc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {['weather', 'crop', 'market'].map((key) => (
                 <div key={key} className="p-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3.5rem] hover:border-emerald-600 hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden">
                    <div className="text-[11px] font-black uppercase tracking-[0.4em] mb-16 opacity-40 group-hover:opacity-100 group-hover:text-emerald-600">0{key === 'weather' ? 1 : key === 'crop' ? 2 : 3}</div>
                    <h3 className="text-5xl font-black tracking-tighter uppercase mb-8 leading-none">{t(`landing.modules.${key}.label`)}</h3>
                    <p className="text-lg font-bold opacity-60 group-hover:opacity-100 leading-relaxed uppercase tracking-tight">{t(`landing.modules.${key}.desc`)}</p>
                    <div className="mt-16 w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl font-black group-hover:bg-emerald-600 group-hover:text-white transition-all">
                       →
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
               <span className="text-3xl font-black tracking-tighter uppercase leading-none">Smart<span className="text-emerald-600">Kisan</span></span>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">© 2026 AGRI-INTELLIGENCE SYSTEMS | LOCAL JWT SECURED</p>
            </div>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">
               <a href="#" className="hover:text-emerald-600 transition-colors">IDENTITY</a>
               <a href="#" className="hover:text-emerald-600 transition-colors">VAULT</a>
               <a href="#" className="hover:text-emerald-600 transition-colors">STATUS</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
