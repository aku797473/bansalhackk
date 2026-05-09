import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cropAPI } from '../services/api';
import { Leaf, Sparkles, Calendar, Droplets, CheckCircle, RefreshCw, Trash2, ShieldCheck, Info, FileDown, Plus } from 'lucide-react';
import cropsImg from '../assets/crops-closeup.png';
import toast from 'react-hot-toast';

const SOIL_TYPES = ['loamy', 'clay', 'sandy', 'silty', 'peaty', 'chalky'];
const SEASONS    = ['Kharif', 'Rabi', 'Zaid'];
const STATES     = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka','Andhra Pradesh','Telangana','West Bengal','Odisha','Assam','Tamil Nadu'];
const LEVELS     = ['Low', 'Medium', 'High'];

export default function CropAdvisor() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const translateOption = (opt, ns = 'crop') => {
    // Attempt to find in specific namespaces
    const keys = [
      `${ns}.states.${opt}`,
      `${ns}.items.${opt}`,
      `${ns}.soil_types.${opt}`,
      `${ns}.seasons.${opt}`,
      `${ns}.levels.${opt.toLowerCase()}`,
      `common.months.${opt}`,
      `auth.${opt.toLowerCase()}`,
      `common.${opt.toLowerCase()}`
    ];
    
    for (const key of keys) {
      const val = t(key);
      if (val !== key) return val;
    }
    return t(opt, opt);
  };

  const [form, setForm] = useState({
    soilType: 'loamy', soilPH: 6.5, nitrogen: 'Medium', phosphorus: 'Medium', potassium: 'Medium',
    temperature: 28, humidity: 65, rainfall: 800, season: 'Kharif', state: 'Punjab', district: '',
  });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [calendar, setCalendar] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const f = localStorage.getItem('sk_crop_form');
    const r = localStorage.getItem('sk_crop_result');
    const c = localStorage.getItem('sk_crop_calendar');
    if (f) setForm(JSON.parse(f));
    if (r) setResult(JSON.parse(r));
    if (c) setCalendar(JSON.parse(c));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('sk_crop_form', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (result) localStorage.setItem('sk_crop_result', JSON.stringify(result));
    else localStorage.removeItem('sk_crop_result');
  }, [result]);

  useEffect(() => {
    if (calendar) localStorage.setItem('sk_crop_calendar', JSON.stringify(calendar));
    else localStorage.removeItem('sk_crop_calendar');
  }, [calendar]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const clear = () => {
    if (window.confirm('Clear all data?')) {
      setResult(null);
      setCalendar(null);
      localStorage.removeItem('sk_crop_result');
      localStorage.removeItem('sk_crop_calendar');
      toast.success('Cleared successfully');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await cropAPI.recommend({ ...form, language: i18n.language || 'en' });
      setResult(data.data);
      toast.success(t('common.success', 'Recommendation ready!'));
    } catch { toast.error(t('common.error', 'Try again')); }
    finally { setLoading(false); }
  };

  const fetchCalendar = async (crop) => {
    try {
      const { data } = await cropAPI.calendar(crop, form.state, i18n.language || 'en');
      setCalendar(data.data);
    } catch {}
  };

  const Select = ({ label, value, onChange, options }) => (
    <div>
      <label className="label">{label}</label>
      <select className="input dark:bg-slate-900 border-2" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{translateOption(o)}</option>)}
      </select>
    </div>
  );

  const NumberInput = ({ label, value, onChange, min, max, unit }) => (
    <div>
      <label className="label">{label} {unit && <span className="text-gray-400 font-medium">({unit})</span>}</label>
      <input type="number" className="input dark:bg-slate-900 border-2" value={value} min={min} max={max}
        onChange={e => onChange(Number(e.target.value))} />
    </div>
  );

  return (
    <div className="page-wrapper max-w-6xl">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title flex items-center gap-3 tracking-tighter">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl shadow-inner">
               <Leaf className="text-emerald-600 animate-bounce-sm" size={28} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400">
              {t('crop.title')}
            </span>
          </h1>
          <p className="page-subtitle mt-2">{t('crop.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {result && (
            <button onClick={clear} className="btn-danger h-11 px-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
              <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> 
              <span>{t('crop.clear_result')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card border-none shadow-premium relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/10">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-3">
              <Plus className="bg-emerald-500 text-white rounded-lg p-1" size={18} />
              <span>{t('crop.historical_model')}</span>
            </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Select label={t('crop.soil_type')} value={form.soilType} onChange={v => set('soilType', v)} options={SOIL_TYPES} />
              <Select label={t('crop.season')}    value={form.season}   onChange={v => set('season', v)}   options={SEASONS} />
            </div>
            <Select label={t('crop.state')} value={form.state} onChange={v => set('state', v)} options={STATES} />
            <div>
              <label className="label">{t('crop.district_label')}</label>
              <input className="input dark:bg-slate-900 border-2" placeholder={t('crop.district_placeholder')} value={form.district} onChange={e => set('district', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label={t('crop.temperature')} value={form.temperature} onChange={v => set('temperature', v)} min={5} max={50} unit="°C" />
              <NumberInput label={t('weather.humidity')} value={form.humidity} onChange={v => set('humidity', v)} min={0} max={100} unit="%" />
            </div>
            <NumberInput label={t('crop.rainfall')} value={form.rainfall} onChange={v => set('rainfall', v)} min={0} max={3000} unit="mm" />
            <div className="pt-2">
              <label className="label text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">{t('crop.soil_nutrients', 'Soil Nutrients (N-P-K)')}</label>
              <div className="grid grid-cols-3 gap-3">
                {['nitrogen','phosphorus','potassium'].map(k => (
                  <div key={k} className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase text-center">{k}</p>
                    <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl">
                      {LEVELS.map(l => (
                        <button key={l} onClick={() => set(k, l)}
                          title={translateOption(l)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${form[k] === l ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}`}>
                          {translateOption(l)[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full h-14 rounded-2xl justify-center mt-8 text-base font-bold shadow-lg shadow-primary/20 active:scale-[0.98]">
            {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> <span>{t('crop.thinking', 'Thinking...')}</span></> : <><Sparkles size={18} className="mr-2" /><span>{t('crop.recommend_btn')}</span></>}
          </button>
        </div>

        </div>

        {/* Result Column */}
        <div className="lg:col-span-7 space-y-6">
          {result && (
            <>
              {/* Primary crop */}
              <div className="card border-2 border-primary/20 shadow-2xl overflow-hidden relative group p-0">
                <div className="h-40 relative overflow-hidden">
                   <img src={cropsImg} alt="Healthy crops" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
                   <div className="absolute top-4 left-4">
                      <div className="badge-verified bg-white/20 text-white border-white/30 backdrop-blur-md">{t('crop.scientific_rec', 'Scientific Recommendation')}</div>
                   </div>
                </div>

                <div className="p-8 pt-0 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t('crop.primary_crop_title')}</p>
                      <h3 className="text-5xl font-black text-primary tracking-tighter leading-none">{translateOption(result.primaryCrop)}</h3>
                    </div>
                    {result.isFallback && <span className="badge badge-yellow">{t('crop.historical_model', 'Historical Model')}</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 py-1">{t('crop.alternatives_label')}</span>
                    {result.alternativeCrops?.map(c => (
                      <span key={c} className="px-3 py-1 bg-gray-50 dark:bg-slate-800 rounded-full text-[10px] font-black text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-white/5">{translateOption(c)}</span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: '🌱', label: t('crop.sowing_time'), val: result.sowingTime },
                      { icon: '🌾', label: t('crop.harvest_time'), val: result.harvestTime },
                      { icon: '💧', label: t('crop.water_req'), val: result.waterRequirement },
                      { icon: '📦', label: t('crop.expected_yield'), val: result.expectedYield || t('crop.high', 'High') }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                        <p className="text-gray-400 text-[9px] font-black uppercase mb-1 tracking-widest whitespace-nowrap">{item.icon} {item.label}</p>
                        <p className="font-black text-gray-800 dark:text-white text-sm">{translateOption(item.val)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fertilizers */}
              <div className="card shadow-md">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t('crop.fertilizers')}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.fertilizers?.map(f => <span key={f} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900/30">{translateOption(f, 'fertilizer')}</span>)}
                </div>
              </div>



              {/* Tips & Confidence */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-sm border border-emerald-100 dark:border-emerald-800 relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">{t('crop.confidence')}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-inner" style={{ width: `${result.confidence * 100}%` }} />
                  </div>
                  <span className="font-black text-gray-900 dark:text-white">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                  {result.tips?.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-slate-400 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="font-medium">{tip}</span>
                    </li>
                  ))}
              </ul>

              <button onClick={() => fetchCalendar(result.primaryCrop)}
                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]">
                <Calendar size={18} /> <span>{t('crop.view_calendar')}</span>
              </button>
            </>
          )}

          {/* Calendar */}
          {calendar && (
            <div className="card shadow-premium border-none animate-slide-up">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 border-b border-gray-100 dark:border-white/5 pb-4 flex items-center gap-2">
                <Calendar size={14} className="text-primary" />
                <span>{calendar.crop} — {t('crop.crop_calendar', 'Crop Calendar')}</span>
              </h3>
              <div className="space-y-6 relative before:absolute before:left-[47px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-slate-800">
                {calendar.activities?.map((a, i) => (
                  <div key={i} className="flex gap-6 text-sm relative z-10 group">
                    <div className="w-24 shrink-0 font-black text-primary uppercase tracking-tighter text-right pt-0.5">
                      {translateOption(a.month)}
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[21px] top-2 w-2.5 h-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-primary group-hover:scale-125 transition-transform" />
                      <p className="font-black text-gray-900 dark:text-white text-base leading-none mb-1.5 uppercase tracking-tight">{a.activity}</p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs font-medium leading-relaxed italic">"{a.notes}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
