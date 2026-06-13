import { useState } from 'react';
import { Crown, CheckCircle, X, Sparkle, Smiley, ShieldCheck, Heartbeat } from '@phosphor-icons/react';
import toast from 'react-hot-toast';

export default function GoldPaywall({ isOpen, onClose, onUnlock }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setIsProcessing(true);
    toast.loading('Initializing secure payment gateway...', { id: 'payment-toast' });

    // Step 1: Simulate Razorpay Gateway Opening
    setTimeout(() => {
      toast.loading('Processing payment (Simulating Razorpay)...', { id: 'payment-toast' });

      // Step 2: Simulate Successful transaction
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
        toast.success('Payment Received! Welcome to Kisan Gold.', { id: 'payment-toast' });

        // Step 3: Trigger callback after success animation
        setTimeout(() => {
          onUnlock();
          setIsSuccess(false);
          onClose();
        }, 2000);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Modal Card with Premium Gold Glow / Glassmorphism */}
      <div className="relative w-full max-w-lg overflow-hidden bg-slate-900/90 border border-amber-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(245,158,11,0.2)] text-white backdrop-blur-2xl transition-all duration-300">
        
        {/* Golden light leak styling */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        {!isProcessing && !isSuccess && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[450px]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 animate-bounce">
                <Crown size={48} weight="fill" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                Kisan Gold Unlocked!
              </h2>
              <p className="text-slate-300 text-sm">
                Congratulations! You are now a premium member. Enjoy unlimited access to smart features.
              </p>
            </div>
          </div>
        ) : isProcessing ? (
          /* Processing Screen */
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 min-h-[450px]">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-amber-400">Securing Transaction...</h3>
              <p className="text-slate-400 text-xs">Please do not close this window or refresh the page.</p>
            </div>
          </div>
        ) : (
          /* Standard Paywall Screen */
          <div className="p-8 sm:p-10 space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                <Crown size={14} weight="fill" />
                Premium Plan
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white">
                Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">Kisan Gold</span>
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Supercharge your farm yields and double your profits with professional utilities and priority channels.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              {[
                { 
                  icon: Sparkle, 
                  title: 'Advanced AI Crop Forecasting', 
                  desc: 'Get highly accurate custom advice on crop schedules and soil hydration.' 
                },
                { 
                  icon: ShieldCheck, 
                  title: 'Zero Commission Selling', 
                  desc: 'Keep 100% of the revenue. Direct farmer-to-buyer transactions, zero cuts.' 
                },
                { 
                  icon: Heartbeat, 
                  title: '24/7 Priority Veterinary Support', 
                  desc: 'Instant video calls with verified vets for cattle health & vaccination trackers.' 
                }
              ].map((feat, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <feat.icon size={18} weight="duotone" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{feat.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price & Checkout */}
            <div className="flex flex-col items-center pt-2 space-y-4">
              <div className="text-center">
                <span className="text-slate-400 text-xs font-semibold">Special Hackathon Offer</span>
                <div className="flex items-baseline justify-center gap-1.5 mt-1">
                  <span className="text-4xl font-black text-amber-400">₹99</span>
                  <span className="text-slate-400 text-sm">/ year</span>
                  <span className="text-xs text-slate-500 line-through ml-2">₹999</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-sm font-extrabold rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Unlock Kisan Gold Member 👑</span>
              </button>
              
              <p className="text-[10px] text-slate-500">
                By subscribing, you agree to a recurring yearly subscription. Cancel anytime.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
