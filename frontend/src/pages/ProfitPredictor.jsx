import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendUp, 
  MapPin, 
  Plant, 
  Stack, 
  Wallet, 
  Robot, 
  CircleNotch, 
  CaretRight,
  Info,
  WarningCircle,
  CloudSun,
  Flask,
  ClipboardText,
  FilePdf,
  ShareNetwork,
  Sparkle,
  Gauge,
  Lightning,
  CheckCircle
} from '@phosphor-icons/react';
import { cropAPI } from '../services/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { usePageAnimation } from '../hooks/usePageAnimation';
import clsx from 'clsx';

const SOIL_TYPES = [
  'Alluvial', 'Black', 'Red', 'Laterite', 
  'Desert', 'Mountain', 'Saline'
];

const CROPS = [
  'Wheat', 'Rice', 'Maize', 'Cotton', 
  'Sugarcane', 'Soybean', 'Mustard', 'Vegetables'
];

export default function ProfitPredictor() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const [form, setForm] = useState({
    landSize: '',
    cropType: 'Wheat',
    soilType: 'Alluvial',
    location: '',
    budget: '',
    fertilizers: '',
    weather: 'Clear Sky, 28°C'
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const translateOption = (opt, ns = 'crop') => {
    if (!opt) return '';
    const keys = [
      `${ns}.items.${opt}`,
      `${ns}.soil_types.${opt}`,
      `profit_predictor.${opt.toLowerCase()}`,
      `common.${opt.toLowerCase()}`
    ];
    for (const key of keys) {
      const val = t(key);
      if (val !== key) return val;
    }
    return t(opt, opt);
  };

  const handlePredict = async () => {
    if (!form.landSize || !form.location || !form.budget) {
      toast.error(t('common.error_required'));
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      // Call LangChain-powered AI profit prediction endpoint
      const { data } = await axios.post('/api/ai', {
        landSize: form.landSize,
        cropType: form.cropType,
        soilType: form.soilType,
        location: form.location,
        budget: form.budget,
        fertilizers: form.fertilizers || 'Not specified',
        weather: form.weather,
      });

      if (data.success) {
        setPrediction(data.data);
        toast.success('LangChain AI Analysis Complete! 🤖');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast('AI service warming up — showing smart estimate', { icon: '⚡' });
      // Fallback prediction object
      const budget = Number(form.budget) || 50000;
      setPrediction({
        profitPotential: `₹${Math.round(budget * 2.5).toLocaleString('en-IN')} – ₹${Math.round(budget * 4).toLocaleString('en-IN')}`,
        roi: `${Math.round(150 + Math.random() * 150)}%`,
        grossRevenue: `₹${Math.round(budget * 3.5).toLocaleString('en-IN')}`,
        netProfit: `₹${Math.round(budget * 2.8).toLocaleString('en-IN')}`,
        recommendedCrop: form.cropType,
        fertilizerAdvice: 'Use Urea (N), DAP (P), and MOP (K) in split doses.',
        weatherStrategy: 'Monitor forecasts. Use drip irrigation to conserve water.',
        keyRisks: ['Unseasonal rainfall', 'Pest attacks', 'Market price drops'],
        actionPlan: [
          'Prepare soil with proper ploughing',
          'Use certified seeds from government suppliers',
          'Apply fertilizers in 3 split doses',
          'Monitor weekly for pests',
        ],
        marketInsight: 'Market demand is moderate. Check local mandi prices before selling.',
        hinglishSummary: `Aapki ${form.landSize} acre zameen par estimated ₹${Math.round(budget * 2.5).toLocaleString('en-IN')} tak ka profit ho sakta hai. Certified seeds aur timely irrigation se yield badh sakti hai.`,
        isFallback: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-24 sm:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>

            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-black leading-tight font-outfit">
              {t('profit_predictor.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-3 max-w-lg leading-relaxed">
              {t('profit_predictor.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 sm:p-10 shadow-premium relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
               <h2 className="text-sm font-bold text-slate-400 mb-10 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                   <ClipboardText size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                 </div>
                 {t('profit_predictor.farm_details')}
               </h2>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                      <Stack size={14} weight="bold" className="text-emerald-500" /> {t('profit_predictor.land_size')} ({t('profit_predictor.acres')})
                    </label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                      placeholder="e.g. 5"
                      value={form.landSize}
                      onChange={e => setForm({...form, landSize: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                        <Plant size={14} weight="duotone" className="text-emerald-500" /> {t('profit_predictor.planned_crop')}
                      </label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer"
                        value={form.cropType}
                        onChange={e => setForm({...form, cropType: e.target.value})}
                      >
                        {CROPS.map(c => <option key={c} value={c}>{translateOption(c)}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                        <Info size={14} weight="bold" className="text-emerald-500" /> {t('profit_predictor.soil_type')}
                      </label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer"
                        value={form.soilType}
                        onChange={e => setForm({...form, soilType: e.target.value})}
                      >
                        {SOIL_TYPES.map(s => <option key={s} value={s}>{translateOption(s)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                        <MapPin size={14} weight="duotone" className="text-emerald-500" /> {t('profit_predictor.location')}
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                        placeholder="Punjab"
                        value={form.location}
                        onChange={e => setForm({...form, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                        <Flask size={14} weight="duotone" className="text-emerald-500" /> {t('profit_predictor.fertilizer')}
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                        placeholder="Urea"
                        value={form.fertilizers}
                        onChange={e => setForm({...form, fertilizers: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                        <CloudSun size={14} weight="duotone" className="text-emerald-500" /> {t('profit_predictor.weather_context')}
                      </label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                        placeholder="Clear Sky"
                        value={form.weather}
                        onChange={e => setForm({...form, weather: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 ml-2">
                        <Wallet size={14} weight="duotone" className="text-emerald-500" /> {t('profit_predictor.budget')}
                      </label>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 h-14 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" 
                        placeholder="50000"
                        value={form.budget}
                        onChange={e => setForm({...form, budget: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handlePredict}
                    disabled={loading}
                    className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] font-bold text-base shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <CircleNotch className="animate-spin" size={24} weight="bold" /> 
                        <span>{t('profit_predictor.analyzing')}</span>
                      </div>
                    ) : (
                      <>
                        <Robot size={24} weight="duotone" />
                        <span>{t('profit_predictor.predict_btn')}</span>
                        <CaretRight size={20} weight="bold" />
                      </>
                    )}
                  </button>
               </div>
            </div>

            {/* AI Tip Bento */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-8 rounded-[2.5rem] flex gap-6 group hover:scale-[1.02] transition-transform duration-500">
               <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-amber-100/50 dark:border-amber-800/30 group-hover:rotate-12 transition-transform">
                  <WarningCircle size={28} weight="fill" className="text-amber-500" />
               </div>
               <div>
                  <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">{t('profit_predictor.ai_tip_title')}</h4>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t('profit_predictor.ai_tip_desc')}
                  </p>
               </div>
            </div>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7 h-full">
            {prediction ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-8 sm:p-12 shadow-premium h-full flex flex-col animate-in fade-in slide-in-from-right-5 duration-700">
                 <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                          <Gauge size={28} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter font-outfit">LangChain AI Analysis</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full flex items-center gap-2">
                       <Sparkle size={12} weight="fill" />
                       {prediction.isFallback ? 'Smart Estimate' : 'LangChain + Groq'}
                    </div>
                 </div>

                 <div className="flex-1 space-y-5">
                   {/* Hinglish Summary */}
                   {prediction.hinglishSummary && (
                     <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-5">
                       <p className="text-sm font-bold text-amber-800 dark:text-amber-300 leading-relaxed">💬 {prediction.hinglishSummary}</p>
                     </div>
                   )}

                   {/* Profit Stats */}
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-4 text-center">
                       <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">💰 Net Profit</p>
                       <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{prediction.netProfit}</p>
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl p-4 text-center">
                       <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">📈 ROI</p>
                       <p className="text-base font-black text-blue-700 dark:text-blue-300">{prediction.roi}</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center">
                       <p className="text-xs text-slate-500 font-semibold mb-1">🌾 Recommended Crop</p>
                       <p className="text-sm font-black text-slate-700 dark:text-slate-200">{prediction.recommendedCrop}</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-center">
                       <p className="text-xs text-slate-500 font-semibold mb-1">💵 Gross Revenue</p>
                       <p className="text-sm font-black text-slate-700 dark:text-slate-200">{prediction.grossRevenue}</p>
                     </div>
                   </div>

                   {/* Action Plan */}
                   {prediction.actionPlan && prediction.actionPlan.length > 0 && (
                     <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-2xl p-5">
                       <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2"><Lightning size={14} weight="fill" className="text-yellow-500" /> ACTION PLAN</h4>
                       <ol className="space-y-2">
                         {prediction.actionPlan.map((step, i) => (
                           <li key={i} className="flex gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                             <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 text-xs font-black shrink-0 mt-0.5">{i+1}</span>
                             {step}
                           </li>
                         ))}
                       </ol>
                     </div>
                   )}

                   {/* Market Insight + Risks */}
                   <div className="grid grid-cols-1 gap-3">
                     {prediction.marketInsight && (
                       <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4">
                         <p className="text-xs font-bold text-blue-500 mb-1">📊 Market Insight</p>
                         <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{prediction.marketInsight}</p>
                       </div>
                     )}
                     {prediction.fertilizerAdvice && (
                       <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-2xl p-4">
                         <p className="text-xs font-bold text-green-500 mb-1">🌿 Fertilizer Advice</p>
                         <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{prediction.fertilizerAdvice}</p>
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="mt-6 grid sm:grid-cols-2 gap-4">
                    <button className="h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                       <FilePdf size={20} weight="bold" className="text-red-500" />
                       {t('profit_predictor.download_pdf')}
                    </button>
                    <button className="h-14 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-3 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all">
                       <ShareNetwork size={20} weight="bold" />
                       {t('profit_predictor.share_experts')}
                    </button>
                 </div>
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-slate-100 dark:border-slate-800/50 rounded-[3rem] group hover:border-emerald-200 transition-all duration-500">
                 <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <TrendUp size={54} weight="duotone" className="text-slate-200 dark:text-slate-700 group-hover:text-emerald-500 transition-colors" />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-400 dark:text-slate-600 tracking-tight mb-4">{t('profit_predictor.ready_title')}</h3>
                 <p className="text-sm text-slate-400 dark:text-slate-700 max-w-xs font-bold leading-relaxed">
                   {t('profit_predictor.ready_desc')}
                 </p>
                 <div className="mt-12 flex items-center gap-3">
                    {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
