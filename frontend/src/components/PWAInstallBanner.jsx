import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Wifi, Zap } from 'lucide-react';

/**
 * PWAInstallBanner
 * Shows a beautiful install-to-home-screen prompt on mobile & desktop.
 * Dismisses permanently when user taps "Later" and can be retriggered via
 * a floating badge after 3 days.
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showFloatingBadge, setShowFloatingBadge] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Check dismissal timestamp
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const daysSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) {
        // Show floating badge after some time
        const timer = setTimeout(() => setShowFloatingBadge(true), 30000);
        return () => clearTimeout(timer);
      }
    }

    if (ios) {
      // Show iOS install guide after 4s
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }

    // Standard beforeinstallprompt (Chrome/Edge/Samsung)
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setShowFloatingBadge(false);
      localStorage.setItem('pwa-installed', 'true');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Listen to global trigger event
  useEffect(() => {
    const triggerHandler = () => {
      setShowBanner(true);
      setShowFloatingBadge(false);
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') {
            setShowBanner(false);
            setShowFloatingBadge(false);
          }
          setDeferredPrompt(null);
        });
      } else if (isIOS) {
        setShowIOSGuide(true);
      } else {
        // Fallback banner display
        setShowBanner(true);
      }
    };

    window.addEventListener('trigger-pwa-install', triggerHandler);
    return () => window.removeEventListener('trigger-pwa-install', triggerHandler);
  }, [deferredPrompt, isIOS]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) {
      setShowAndroidGuide(true);
      return;
    }

    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
      setShowFloatingBadge(false);
    } else {
      setInstalling(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setTimeout(() => setShowFloatingBadge(true), 5000);
  };

  // ---- iOS Guide Overlay ----
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Install Smart Kisan</h3>
            <button onClick={() => { setShowIOSGuide(false); setShowBanner(false); }} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-slate-300 text-sm mb-4">Add Smart Kisan to your home screen in 3 steps:</p>
          {[
            { step: 1, text: 'Tap the Share button (□↑) at the bottom of Safari' },
            { step: 2, text: 'Scroll down and tap "Add to Home Screen"' },
            { step: 3, text: 'Tap "Add" — done! Open it like any app 🌱' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{step}</span>
              <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
          {/* iOS share arrow illustration */}
          <div className="mt-4 p-3 bg-slate-800 rounded-2xl text-center">
            <span className="text-4xl">⬆️</span>
            <p className="text-slate-400 text-xs mt-1">Look for this icon in Safari's toolbar</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- Android Guide Overlay ----
  if (showAndroidGuide) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Install App Manually</h3>
            <button onClick={() => { setShowAndroidGuide(false); setShowBanner(false); }} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <p className="text-slate-300 text-sm mb-4">To install on your device, please follow these steps:</p>
          {[
            { step: 1, text: 'Tap the 3-dots menu (⋮) in your browser (top right)' },
            { step: 2, text: 'Select "Install App" or "Add to Home screen"' },
            { step: 3, text: 'Follow the prompt to add it to your home screen! 📱' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">{step}</span>
              <p className="text-slate-200 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
          <button 
            onClick={() => { setShowAndroidGuide(false); setShowBanner(false); }}
            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition-all"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // ---- Floating Badge (after dismiss) ----
  if (showFloatingBadge && !showBanner) {
    return (
      <button
        onClick={() => { setShowFloatingBadge(false); setShowBanner(true); localStorage.removeItem('pwa-install-dismissed'); }}
        className="fixed bottom-40 right-4 z-[9998] flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg shadow-emerald-600/40 transition-all hover:scale-105 active:scale-95"
        title="Install Smart Kisan App"
      >
        <Download size={14} />
        Install App
      </button>
    );
  }

  // ---- Main Banner ----
  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] p-3 sm:p-4"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-lg mx-auto bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <span className="text-2xl">🌾</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">Smart Kisan App</h3>
                  <p className="text-slate-400 text-xs mt-0.5">किसान का डिजिटल साथी</p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
                  aria-label="Dismiss install banner"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Feature pills */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {[
                  { icon: <Wifi size={10} />, label: 'Works Offline' },
                  { icon: <Zap size={10} />, label: 'Lightning Fast' },
                  { icon: <Smartphone size={10} />, label: 'Feels Native' },
                ].map(({ icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {icon}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
            Install Smart Kisan on your device for instant access, offline crop data, push alerts, and a full app experience — no browser needed.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleInstall}
              disabled={installing}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-sm py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {installing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Installing…
                </>
              ) : (
                <>
                  <Download size={16} />
                  {isIOS ? 'How to Install' : 'Install Now — Free'}
                </>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 text-slate-400 hover:text-white text-sm font-semibold rounded-2xl hover:bg-slate-800 transition-all"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
