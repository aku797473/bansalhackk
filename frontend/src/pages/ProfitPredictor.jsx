import { useState } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Sprout, 
  Layers, 
  Wallet, 
  Sparkles, 
  Loader2, 
  ArrowRight,
  Info,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const SOIL_TYPES = [
  'Alluvial (जलोढ़)', 'Black (काली)', 'Red (लाल)', 'Laterite (लेटराइट)', 
  'Desert (रेतीली)', 'Mountain (पहाड़ी)', 'Saline (खारी)'
];

const CROPS = [
  'Wheat (गेंहू)', 'Rice (चावल)', 'Maize (मक्का)', 'Cotton (कपास)', 
  'Sugarcane (गन्ना)', 'Soybean (सोयाबीन)', 'Mustard (सरसों)', 'Vegetables (सब्जियाँ)'
];

export default function ProfitPredictor() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';

  const [form, setForm] = useState({
    landSize: '',
    cropType: 'Wheat (गेंहू)',
    soilType: 'Alluvial (जलोढ़)',
    location: '',
    budget: ''
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const handlePredict = async () => {
    if (!form.landSize || !form.location || !form.budget) {
      toast.error(lang === 'hi' ? 'कृपया सभी जानकारी भरें' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const { data } = await axios.post('/api/ai/predict', form);
      if (data.success) {
        setPrediction(data.data);
        toast.success(lang === 'hi' ? 'भविष्यवाणी तैयार है!' : 'Prediction Ready!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(lang === 'hi' ? 'एआई कनेक्ट करने में विफल' : 'Failed to connect to AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Area */}
      <div className="relative mb-12 text-center">
        <div className="absolute inset-0 -top-10 flex items-center justify-center opacity-10 pointer-events-none">
          <TrendingUp size={200} className="text-green-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
          AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Profit Predictor</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
          Maximize your farm's earnings using advanced AI analysis of your soil, crop choice, and budget.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card p-8 border-none shadow-premium bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
              <Sparkles className="text-green-600" size={24} /> Farm Details
            </h2>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                  <Layers size={14} /> Land Size (Acres)
                </label>
                <input 
                  type="number" 
                  className="input h-14 border-2 rounded-2xl focus:border-green-500" 
                  placeholder="e.g. 5"
                  value={form.landSize}
                  onChange={e => setForm({...form, landSize: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                    <Sprout size={14} /> Planned Crop
                  </label>
                  <select 
                    className="input h-14 border-2 rounded-2xl appearance-none"
                    value={form.cropType}
                    onChange={e => setForm({...form, cropType: e.target.value})}
                  >
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                    <Info size={14} /> Soil Type
                  </label>
                  <select 
                    className="input h-14 border-2 rounded-2xl appearance-none"
                    value={form.soilType}
                    onChange={e => setForm({...form, soilType: e.target.value})}
                  >
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                  <MapPin size={14} /> Location (State/District)
                </label>
                <input 
                  type="text" 
                  className="input h-14 border-2 rounded-2xl focus:border-green-500" 
                  placeholder="e.g. Punjab, Ludhiana"
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400 flex items-center gap-2">
                  <Wallet size={14} /> Investment Budget (₹)
                </label>
                <input 
                  type="number" 
                  className="input h-14 border-2 rounded-2xl focus:border-green-500" 
                  placeholder="e.g. 50000"
                  value={form.budget}
                  onChange={e => setForm({...form, budget: e.target.value})}
                />
              </div>

              <button 
                onClick={handlePredict}
                disabled={loading}
                className={clsx(
                  "w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} /> Analyzing...
                  </>
                ) : (
                  <>
                    Predict Profit <ChevronRight size={24} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Tip Card */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-6 rounded-3xl flex gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="text-amber-600" />
            </div>
            <div>
              <h4 className="font-black text-sm text-amber-900 dark:text-amber-400 uppercase">AI Tip</h4>
              <p className="text-xs text-amber-800/70 dark:text-amber-400/70 leading-relaxed mt-1">
                Combining Soil Health data with localized market trends gives 40% more accurate predictions.
              </p>
            </div>
          </div>
        </div>

        {/* Prediction Output */}
        <div className="lg:col-span-7 h-full">
          {prediction ? (
            <div className="card p-8 border-none shadow-premium bg-white dark:bg-slate-900 h-full animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                  <TrendingUp className="text-green-600" size={32} /> Analysis Result
                </h2>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                  AI Generated
                </div>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                  {prediction}
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-gray-100 dark:border-white/5 grid sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors">
                  Download Report (PDF)
                </button>
                <button className="flex items-center justify-center gap-2 py-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl font-bold text-sm hover:bg-green-100 transition-colors">
                  Share with Experts
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-gray-100 dark:border-slate-800 rounded-[3rem]">
              <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6">
                <TrendingUp size={48} className="text-gray-300 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-gray-400 dark:text-slate-600">Ready for Analysis</h3>
              <p className="text-gray-400 dark:text-slate-700 mt-2 max-w-xs mx-auto text-sm font-medium">
                Fill in your farm details and click the button to see your predicted profit and strategy.
              </p>
              <div className="mt-10 flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-200 dark:bg-slate-800" />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
