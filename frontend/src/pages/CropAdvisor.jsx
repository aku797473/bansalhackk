import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cropAPI } from '../services/api';
import { Leaf, Sparkles, Calendar, Droplets, CheckCircle, RefreshCw, Trash2, ShieldCheck, Info, FileDown } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto px-4 py-6 page-enter animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2 tracking-tighter">
            <Leaf className="text-primary" size={24} />
            <span>{t('crop.title')}</span>
          </h1>
          <p className="page-subtitle text-gray-500 font-medium">{t('crop.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={clear} className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Trash2 size={16} /> <span className="hidden sm:inline">{t('crop.clear_result')}</span>
            </button>
          )}
          <button onClick={() => window.location.reload()} className="btn-icon bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm" title={t('dashboard.labels.refresh', 'Refresh')}>
            <RefreshCw size={16} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card shadow-xl border-none bg-white dark:bg-slate-900">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">{t('market.live_mandi_desc', 'Provide field details')}</h2>
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

        {/* Result */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Primary crop */}
              <div className="card bg-white dark:bg-slate-900 border-2 border-primary/20 shadow-2xl overflow-hidden relative group p-0">
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
                        <p className="font-black text-gray-800 dark:text-white text-sm">{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fertilizers */}
              <div className="card shadow-md">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t('crop.fertilizers')}</h3>
                <div className="flex flex-wrap gap-2">
                  {result.fertilizers?.map(f => <span key={f} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-900/30">{f}</span>)}
                </div>
              </div>

              {/* Tips */}
              <div className="card shadow-md">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t('crop.tips')}</h3>
                <ul className="space-y-3">
                  {result.tips?.map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-slate-400 flex items-start gap-3 group">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <span className="font-medium leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Calendar button */}
              <button onClick={() => fetchCalendar(result.primaryCrop)}
                className="btn-secondary w-full h-14 rounded-2xl justify-center gap-2 font-bold hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all">
                <Calendar size={18} /> <span>{t('crop.view_calendar')}</span>
              </button>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-slate-900/50 border-dashed border-2">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center text-4xl mb-6 animate-bounce-sm">🌱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('crop.get_ai_rec', 'Get AI Recommendation')}</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 max-w-xs mx-auto font-medium">{t('crop.get_ai_rec_desc', 'Fill in the details to see the best crops for your region.')}</p>
            </div>
          )}

          {/* Calendar */}
          {calendar && (
            <div className="card shadow-xl border-none bg-white dark:bg-slate-900 animate-slide-up">
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
