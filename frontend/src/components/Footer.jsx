import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const platformLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Weather', path: '/weather' },
    { label: 'Market Trends', path: '/market' },
    { label: 'Crop Advisor', path: '/crop' },
  ];

  const toolLinks = [
    { label: 'Seller Portal', path: '/seller' },
    { label: 'Buyer Portal', path: '/buyer' },
    { label: 'Labour Market', path: '/labour' },
    { label: 'Profit Predictor', path: '/profit-predictor' },
  ];

  const resourceLinks = [
    { label: 'Government Schemes', path: '/schemes' },
    { label: 'Agri News', path: '/news' },
    { label: 'Community', path: '/community' },
    { label: 'SOS Help', path: '/sos' },
  ];

  return (
    <footer className="bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200/60 dark:border-slate-800/60 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white mb-3">
              Smart<span className="text-indigo-600">Kisan</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Empowering farmers with AI-driven agricultural intelligence and real-time market insights.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map(({ label, path }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {toolLinks.map(({ label, path }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map(({ label, path }) => (
                <li key={label}>
                  <button
                    onClick={() => navigate(path)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200/60 dark:border-slate-800/60 gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {year} SmartKisan. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> for Indian Farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
