import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import clsx from 'clsx';
import ThreeHero from '../components/ThreeHero';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-600 font-sans overflow-x-hidden transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-[100] px-4 pt-4">
        <div className="max-w-5xl mx-auto h-16 border border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl px-6 flex items-center justify-between shadow-sm">
          <div className="flex flex-col leading-none">
             <span className="text-lg font-black tracking-tighter uppercase">Smart<span className="text-indigo-600">Kisan</span></span>
             <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mt-0.5">AgriTech</span>
          </div>

          <div className="flex items-center gap-6">
             <LanguageSelector showLabel={false} align="right" />
             <button 
               onClick={() => navigate('/login')}
               className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border-b-2 border-indigo-600/20 hover:border-indigo-600 transition-all"
             >
               {t('landing.login')}
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-24 px-4 overflow-hidden">
         <ThreeHero />
         <div className="max-w-6xl mx-auto relative z-10 text-center lg:text-left">
            <div className="max-w-3xl">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg mb-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t('landing.hero_badge')}</span>
               </div>

               <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-10 uppercase">
                  {t('landing.title').split(' ').map((word, i) => (
                    <span key={i} className={clsx("block", i % 2 !== 0 && "text-indigo-600")}>{word}</span>
                  ))}
               </h1>

               <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-bold max-w-xl mb-12 leading-tight uppercase tracking-tight">
                  {t('landing.subtitle')}
               </p>

               <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button 
                     onClick={() => navigate('/login')}
                     className="h-16 px-10 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-all"
                  >
                     {t('landing.get_started')}
                  </button>
                  <button onClick={() => { document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' }); }} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                     EXPLORE INTERFACE ↓
                  </button>
               </div>
            </div>
         </div>
      </header>

      {/* Stats Section */}
      <section className="py-24 border-y border-slate-100 dark:border-slate-800">
         <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               {[
                 { label: 'ACTIVE USERS', value: '1.2M+' },
                 { label: 'MANDI COVERED', value: '450+' },
                 { label: 'AI ACCURACY', value: '98.4%' },
                 { label: 'DATA NODES', value: '24/7' }
               ].map((stat) => (
                 <div key={stat.label} className="text-center md:text-left">
                    <div className="text-4xl font-black tracking-tighter mb-2">{stat.value}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Feature Grid - Minimalist */}
      <section className="features-section py-32 px-4 bg-slate-50 dark:bg-slate-900/30">
         <div className="max-w-6xl mx-auto">
            <div className="mb-24">
               <h2 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase mb-6 leading-none">{t('landing.eco_title')}</h2>
               <p className="text-xl text-slate-500 font-bold max-w-2xl uppercase tracking-tight">{t('landing.eco_desc')}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
               {['weather', 'crop', 'market'].map((key) => (
                 <div key={key} className="p-12 bg-white dark:bg-slate-950 hover:bg-indigo-600 hover:text-white transition-all duration-500 cursor-pointer group">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-12 opacity-40 group-hover:opacity-100">0{key === 'weather' ? 1 : key === 'crop' ? 2 : 3}</div>
                    <h3 className="text-3xl font-black tracking-tighter uppercase mb-6">{t(`landing.modules.${key}.label`)}</h3>
                    <p className="text-sm font-bold opacity-60 group-hover:opacity-100 leading-relaxed uppercase tracking-tight">{t(`landing.modules.${key}.desc`)}</p>
                    <div className="mt-12 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                       ACCESS MODULE →
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
               <span className="text-2xl font-black tracking-tighter uppercase">SmartKisan</span>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 AGRI-INTELLIGENCE SYSTEMS</p>
            </div>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-500">
               <a href="#" className="hover:text-indigo-600 transition-colors">PRIVACY</a>
               <a href="#" className="hover:text-indigo-600 transition-colors">TERMS</a>
               <a href="#" className="hover:text-indigo-600 transition-colors">GITHUB</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
