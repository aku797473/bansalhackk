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
      <nav className="fixed top-0 inset-x-0 z-[100] px-2 sm:px-4 pt-4">
        <div className="max-w-7xl mx-auto h-16 sm:h-20 border border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-[1.5rem] px-4 sm:px-8 flex items-center justify-between shadow-2xl">
          <div className="flex flex-col leading-none">
             <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase">Smart<span className="text-emerald-600">Kisan</span></span>
             <span className="text-xs font-semibold text-slate-500 mt-0.5">Agriculture Portal</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
             <button 
               onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
               className="hidden xs:flex px-4 py-2 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold rounded-full hover:scale-102 transition-all shadow-sm items-center gap-1.5"
             >
               📥 Install App
             </button>
             <LanguageSelector showLabel={false} align="right" />
             <button 
               onClick={() => navigate('/login')}
               className="px-5 sm:px-8 py-2 sm:py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold rounded-full hover:scale-102 transition-all shadow-md"
             >
               {t('landing.login')}
             </button>
          </div>
        </div>
      </nav>

      <header className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden">
         
         {/* Side 1: Content (Heading size refined and inline-blocked) */}
         <div className="w-full lg:w-1/2 min-h-[70vh] lg:min-h-screen flex items-center px-6 sm:px-12 lg:px-24 pt-32 sm:pt-36 lg:pt-24 relative z-20 bg-white dark:bg-slate-950">
            <div className="max-w-xl w-full">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 text-slate-800 rounded-full mb-6 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">
                  <span className="text-xs font-semibold tracking-wide capitalize">{t('landing.hero_badge')}</span>
               </div>

               <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 sm:mb-8 uppercase text-black dark:text-black">
                  {t('landing.title')}
               </h1>

               <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg mb-8 sm:mb-12 leading-relaxed tracking-tight">
                  {t('landing.subtitle')}
               </p>

               <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <button 
                     onClick={() => navigate('/login')}
                     className="w-full sm:w-auto h-12 px-8 bg-slate-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-full shadow-md hover:scale-102 active:scale-98 transition-all"
                  >
                     {t('landing.get_started')}
                  </button>
                  <button 
                     onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
                     className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-full shadow-md hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                     📥 Download App
                  </button>
                  <button onClick={() => { document.querySelector('.features-section').scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group py-2">
                     Learn More ↓
                  </button>
               </div>
            </div>
         </div>

         {/* Side 2: 3D Visual */}
         <div className="w-full lg:w-1/2 h-[50vh] sm:h-[60vh] lg:h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-900/10 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
            <div className="absolute inset-0 z-10">
               <ThreeHero key="landing-hero-3d-v3" />
            </div>
            <div className="absolute inset-x-0 top-0 h-32 z-20 bg-gradient-to-b from-white dark:from-slate-950 to-transparent lg:hidden" />
            <div className="absolute inset-y-0 left-0 w-32 z-20 bg-gradient-to-r from-white dark:from-slate-950 to-transparent hidden lg:block" />
         </div>
      </header>

      {/* Stats Section - Normalized Sizes */}
      <section className="py-24 sm:py-32 border-y border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/10 px-4">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-16">
               {[
                 { label: 'Active Users', value: '1.2M+' },
                 { label: 'Mandi Covered', value: '450+' },
                 { label: 'AI Accuracy', value: '98.4%' },
                 { label: 'Data Nodes', value: '24/7' }
               ].map((stat) => (
                 <div key={stat.label} className="text-center lg:text-left group">
                    <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">{stat.value}</div>
                    <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Feature Grid - Cleaned Descriptions */}
      <section className="features-section py-24 sm:py-32 px-4 sm:px-8">
         <div className="max-w-7xl mx-auto">
            <div className="mb-16 sm:mb-24">
               <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4">Platform Features</div>
               <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 max-w-4xl">{t('landing.eco_title')}</h2>
               <p className="text-lg text-slate-500 font-medium max-w-2xl">{t('landing.eco_desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {['weather', 'crop', 'market'].map((key, index) => (
                 <div key={key} className="p-8 sm:p-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-emerald-600 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-lg">
                    <div className="text-xs font-semibold text-slate-400 group-hover:text-emerald-600 mb-8">0{index + 1}</div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3">{t(`landing.modules.${key}.label`)}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{t(`landing.modules.${key}.desc`)}</p>
                    <div className="mt-8 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                       →
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
               <span className="text-2xl font-bold tracking-tight uppercase">Smart<span className="text-emerald-600">Kisan</span></span>
               <p className="text-xs text-slate-400">© 2026 Smart Kisan Agri-Tech Platform</p>
            </div>
            <div className="flex gap-8 text-xs font-semibold text-slate-500">
               <a href="#" className="hover:text-emerald-600 transition-colors">Security</a>
               <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
               <a href="#" className="hover:text-emerald-600 transition-colors">System Status</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
