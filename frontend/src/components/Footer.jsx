import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 pt-20 pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 uppercase">
              SmartKisan
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-sm leading-relaxed uppercase tracking-widest">
              Empowering farmers with advanced agricultural intelligence and real-time market data. Built for the future of sustainable farming.
            </p>
          </div>
          
          <div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">Platform</div>
            <ul className="space-y-4">
              {['Dashboard', 'Market', 'Weather', 'Expert AI'].map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => navigate(`/${item.toLowerCase().replace(' ', '-')}`)}
                    className="text-xs font-black text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">Resources</div>
            <ul className="space-y-4">
              {['Privacy', 'Terms', 'Support', 'Contact'].map((item) => (
                <li key={item}>
                  <button className="text-xs font-black text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors uppercase tracking-widest">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-slate-100 dark:border-slate-900 gap-6">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            © {year} SMARTKISAN TECHNOLOGIES. ALL RIGHTS RESERVED.
          </div>
          <div className="flex gap-8">
             <div className="h-0.5 w-12 bg-indigo-600" />
             <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">ENCRYPTED SECURE CONNECTION</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
