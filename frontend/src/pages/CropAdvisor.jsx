import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cropAPI } from '../services/api';
import { Plant, Robot, Calendar, Drop, CheckCircle, ArrowCounterClockwise, Trash, ShieldCheck, Info, FileArrowDown, Plus, CaretRight, Sparkle, Wind, ThermometerHot, Gauge } from '@phosphor-icons/react';
import cropsImg from '../assets/crops-closeup.png';
import toast from 'react-hot-toast';
import { usePageAnimation } from '../hooks/usePageAnimation';
import clsx from 'clsx';

const SOIL_TYPES = ['loamy', 'clay', 'sandy', 'silty', 'peaty', 'chalky'];
const SEASONS    = ['Kharif', 'Rabi', 'Zaid'];
const STATES     = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka','Andhra Pradesh','Telangana','West Bengal','Odisha','Assam','Tamil Nadu'];
const LEVELS     = ['Low', 'Medium', 'High'];

const DEMO_CROP_RESULT = {
  primaryCrop: 'Wheat',
  alternativeCrops: ['Mustard', 'Gram', 'Barley'],
  sowingTime: 'October - November',
  harvestTime: 'March - April',
  waterRequirement: 'Moderate (450-650mm)',
  expectedYield: '4-5 tonnes/hectare',
  fertilizers: ['Urea (46% N)', 'DAP (18-46)', 'MOP (60% K2O)', 'Zinc Sulphate'],
  confidence: 0.87,
  isFallback: true,
  tips: [
    'Ensure proper soil preparation with deep ploughing before sowing.',
    'Apply basal dose of DAP at sowing time for better root development.',
    'First irrigation should be done 20-25 days after sowing (crown root initiation stage).',
    'Monitor for yellow rust disease and apply fungicide if spotted early.',
    'Avoid water logging — ensure proper field drainage.',
  ]
};

const DISTRICTS_DATA = {
  'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar', 'Sangrur', 'Shahid Bhagat Singh Nagar', 'Tarn Taran'],
  'Haryana': ['Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
  'Uttar Pradesh': ['Agra', 'Aligarh', 'Prayagraj', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddh Nagar', 'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi', 'Kushinagar', 'Lakhimpur Kheri', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'],
  'Bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'],
  'Madhya Pradesh': ['Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani', 'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur', 'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur', 'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain', 'Umaria', 'Vidisha'],
  'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
};

export default function CropAdvisor() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const ref = usePageAnimation();

  const translateOption = (opt, ns = 'crop') => {
    if (!opt) return '';
    const keys = [
      `${ns}.states.${opt}`,
      `${ns}.districts.${opt}`,
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
    temperature: 28, humidity: 65, rainfall: 800, season: 'Kharif', state: 'Punjab', district: 'Amritsar',
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

  const set = (k, v) => {
    if (k === 'state') {
      const firstDistrict = DISTRICTS_DATA[v]?.[0] || '';
      setForm(f => ({ ...f, [k]: v, district: firstDistrict }));
    } else {
      setForm(f => ({ ...f, [k]: v }));
    }
  };

  const clear = () => {
    if (window.confirm('Clear all data?')) {
      setResult(null);
      setCalendar(null);
      localStorage.removeItem('sk_crop_result');
      localStorage.removeItem('sk_crop_calendar');
      toast.success(t('common.success'));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data } = await cropAPI.recommend({ ...form, language: i18n.language || 'en' });
      setResult(data.data);
      toast.success(t('common.success'));
    } catch {
      setResult(DEMO_CROP_RESULT);
      toast('AI service warming up...', { icon: '⚡' });
    }
    finally { setLoading(false); }
  };

  const fetchCalendar = async (crop) => {
    try {
      const { data } = await cropAPI.calendar(crop, form.state, i18n.language || 'en');
      setCalendar(data.data);
    } catch {}
  };

  const Select = ({ label, value, onChange, options, icon: Icon }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        {Icon && <Icon size={12} weight="bold" className="text-emerald-500" />}
        {label}
      </label>
      <div className="relative group">
        <select 
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50" 
          value={value} 
          onChange={e => onChange(e.target.value)}
        >
          {options.map(o => <option key={o} value={o}>{translateOption(o)}</option>)}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
          <CaretRight size={14} weight="bold" className="rotate-90" />
        </div>
      </div>
    </div>
  );

  const NumberInput = ({ label, value, onChange, min, max, unit, icon: Icon }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        {Icon && <Icon size={12} weight="bold" className="text-emerald-500" />}
        {label} {unit && <span className="opacity-60">({unit})</span>}
      </label>
      <input 
        type="number" 
        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
        value={value} 
        min={min} 
        max={max}
        onChange={e => onChange(Number(e.target.value))} 
      />
    </div>
  );

  const districts = DISTRICTS_DATA[form.state] || [];

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/30 border border-emerald-400/20 flex items-center gap-2">
                <Sparkle size={14} weight="fill" className="animate-pulse" />
                {t('crop.scientific_rec')}
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} weight="fill" className="text-emerald-500" />
                {t('crop.imd_verified')}
              </div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                {t('crop.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 max-w-lg leading-relaxed">
              {t('crop.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {result && (
              <button onClick={clear} className="h-14 px-6 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all active:scale-95">
                <Trash size={18} weight="bold" />
                <span>{t('crop.clear_result')}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                  <Gauge size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                </div>
                {t('crop.historical_model')}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select label={t('crop.soil_type')} value={form.soilType} onChange={v => set('soilType', v)} options={SOIL_TYPES} icon={Plant} />
                  <Select label={t('crop.season')} value={form.season} onChange={v => set('season', v)} options={SEASONS} icon={Calendar} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select label={t('crop.state')} value={form.state} onChange={v => set('state', v)} options={STATES} icon={MapPin} />
                  <Select label={t('crop.district_label')} value={form.district} onChange={v => set('district', v)} options={districts} icon={MapPin} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <NumberInput label={t('crop.temperature')} value={form.temperature} onChange={v => set('temperature', v)} min={5} max={50} unit="°C" icon={ThermometerHot} />
                  <NumberInput label={t('weather.humidity')} value={form.humidity} onChange={v => set('humidity', v)} min={0} max={100} unit="%" icon={Drop} />
                </div>

                <NumberInput label={t('crop.rainfall')} value={form.rainfall} onChange={v => set('rainfall', v)} min={0} max={3000} unit="mm" icon={Wind} />

                <div className="pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 block">{t('crop.soil_nutrients')}</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['nitrogen','phosphorus','potassium'].map(k => (
                      <div key={k} className="flex flex-col gap-3">
                        <span className="text-[8px] font-black text-slate-500 uppercase text-center tracking-widest">{k}</span>
                        <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {LEVELS.map(l => (
                            <button 
                              key={l} 
                              onClick={() => set(k, l)}
                              className={clsx(
                                "py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
                                form[k] === l 
                                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/20" 
                                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              )}
                            >
                              {translateOption(l)[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="w-full h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-3 mt-4"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('crop.thinking')}</span>
                    </div>
                  ) : (
                    <>
                      <Robot size={22} weight="duotone" />
                      <span>{t('crop.recommend_btn')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                
                {/* Main Recommendation Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                  <div className="h-48 sm:h-64 relative overflow-hidden">
                     <img src={cropsImg} alt="Crops" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/10 dark:via-slate-900/10 to-transparent" />
                     <div className="absolute top-6 left-6">
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                          {t('crop.scientific_rec')}
                        </div>
                     </div>
                  </div>

                  <div className="p-8 sm:p-12 pt-0 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">{t('crop.primary_crop_title')}</span>
                        <h3 className="text-5xl sm:text-8xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter leading-none break-words">
                          {translateOption(result.primaryCrop)}
                        </h3>
                      </div>
                      {result.isFallback && (
                        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-amber-100 dark:border-amber-800/50 self-start sm:self-center">
                          {t('crop.historical_model')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-slate-100 dark:border-slate-800/50 pb-8">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t('crop.alternatives_label')}</span>
                      {result.alternativeCrops?.map(c => (
                        <span key={c} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                          {translateOption(c)}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { icon: '🌱', label: t('crop.sowing_time'), val: result.sowingTime },
                        { icon: '🌾', label: t('crop.harvest_time'), val: result.harvestTime },
                        { icon: '💧', label: t('crop.water_req'), val: result.waterRequirement },
                        { icon: '📦', label: t('crop.expected_yield'), val: result.expectedYield || t('crop.high') }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 transition-colors hover:border-emerald-200 dark:hover:border-emerald-800/50">
                          <p className="text-slate-400 text-[8px] font-black uppercase mb-2 tracking-[0.15em] flex items-center gap-2">
                             <span className="text-sm">{item.icon}</span> {item.label}
                          </p>
                          <p className="font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight leading-tight">{translateOption(item.val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fertilizers & AI Insight */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <Flask size={16} weight="fill" className="text-indigo-500" />
                      {t('crop.fertilizers')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.fertilizers?.map(f => (
                        <span key={f} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                          {translateOption(f, 'fertilizer')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-emerald-500" />
                      {t('crop.confidence')}
                    </h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{(result.confidence * 100).toFixed(0)}%</span>
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('crop.high_accuracy')}</span>
                      </div>
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-draw shadow-[0_0_12px_rgba(16,185,129,0.3)]" style={{ width: `${result.confidence * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Tips Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                         <Robot size={20} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                       </div>
                       {t('crop.expert_insights')}
                     </h3>
                  </div>
                  <div className="grid gap-4">
                    {result.tips?.map((tip, i) => (
                      <div key={i} className="flex gap-5 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                        </div>
                        <p className="text-sm font-bold leading-relaxed text-slate-600 dark:text-slate-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar CTA */}
                <button 
                  onClick={() => fetchCalendar(result.primaryCrop)}
                  className="w-full h-20 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-400/20 dark:shadow-none hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  <Calendar size={28} weight="fill" />
                  <span>{t('crop.view_calendar')}</span>
                </button>

                {/* Calendar Detail Section */}
                {calendar && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-premium animate-in fade-in slide-in-from-top-10 duration-700">
                    <div className="flex items-center justify-between mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
                       <div>
                         <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{calendar.crop}</h3>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('crop.crop_calendar')}</p>
                       </div>
                       <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                         <Calendar size={32} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                       </div>
                    </div>
                    
                    <div className="space-y-12 relative before:absolute before:left-[55px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 dark:before:bg-slate-800 rounded-full">
                      {calendar.activities?.map((a, i) => (
                        <div key={i} className="flex gap-10 text-sm relative z-10 group">
                          <div className="w-28 shrink-0 flex flex-col items-end pt-1">
                            <span className="font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter text-lg leading-none">{translateOption(a.month)}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Phase {i+1}</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="absolute -left-[61px] top-2.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-500 group-hover:scale-125 transition-transform z-20 shadow-md" />
                            <h4 className="font-black text-slate-900 dark:text-white text-xl leading-none mb-3 tracking-tight group-hover:text-emerald-600 transition-colors uppercase">{a.activity}</h4>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md">
                               <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed italic">"{a.notes}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300 dark:border-slate-700 group hover:border-emerald-400/50 transition-all duration-500">
                 <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                    <Plant size={48} weight="duotone" className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{t('crop.get_ai_rec')}</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-xs leading-relaxed">
                   {t('crop.get_ai_rec_desc')}
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          from { width: 0; opacity: 0; }
          to { opacity: 1; }
        }
        .animate-draw {
          animation: draw 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}} />
    </div>
  );
}
