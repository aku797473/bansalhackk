import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cropAPI, weatherAPI } from '../services/api';
import { Plant, Robot, Calendar, Drop, CheckCircle, ArrowCounterClockwise, Trash, ShieldCheck, Info, FileArrowDown, Plus, CaretRight, Sparkle, Wind, ThermometerHot, Gauge, MapPin, Flask, CloudRain, Lightning } from '@phosphor-icons/react';
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
  const [liveWeather, setLiveWeather] = useState(null);
  const [fetchingWeather, setFetchingWeather] = useState(false);

  // Load from localStorage & Auto-detect Live Location on mount
  useEffect(() => {
    const f = localStorage.getItem('sk_crop_form');
    const r = localStorage.getItem('sk_crop_result');
    const c = localStorage.getItem('sk_crop_calendar');
    if (f) setForm(JSON.parse(f));
    if (r) setResult(JSON.parse(r));
    if (c) setCalendar(JSON.parse(c));
    
    // Auto fill state, district and weather info from GPS location
    fetchLiveWeather();
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

  // Helper: fuzzy match a string against a list of options
  const fuzzyMatch = (input, options) => {
    if (!input) return null;
    const norm = s => s.toLowerCase().replace(/[\s\-_.]/g, '');
    const inp = norm(input);
    // exact match first
    const exact = options.find(o => norm(o) === inp);
    if (exact) return exact;
    // partial / includes match
    const partial = options.find(o => norm(o).includes(inp) || inp.includes(norm(o)));
    return partial || null;
  };

  // Fetch live weather + reverse geocode → auto-fill ALL fields
  const fetchLiveWeather = async () => {
    setFetchingWeather(true);
    try {
      // 1. Get GPS coordinates
      const pos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
          err => {
            if (err.code === err.PERMISSION_DENIED) {
              toast.error('Location permission denied. Please allow location access.');
            }
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
      });

      // 2. Reverse geocode with Nominatim (OpenStreetMap — free, no key)
      let detectedState = null;
      let detectedDistrict = null;
      let detectedCity = null;
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lon}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const geoData = await geoRes.json();
        const addr = geoData?.address || {};

        // State detection
        const rawState = addr.state || addr.state_district || '';
        detectedState = fuzzyMatch(rawState, STATES);

        // District detection — Nominatim uses county/district/city_district for Indian districts
        const rawDistrict =
          addr.county ||
          addr.district ||
          addr.city_district ||
          addr.state_district ||
          addr.town ||
          addr.city ||
          '';
        const districtOptions = detectedState ? (DISTRICTS_DATA[detectedState] || []) : [];
        detectedDistrict = fuzzyMatch(rawDistrict, districtOptions);

        // Fallback city label for badge
        detectedCity = addr.city || addr.town || addr.county || addr.village || rawState;
      } catch {
        // Nominatim failed — skip geocoding, still fill weather
      }

      // 3. Fetch weather data
      const res = await weatherAPI.getCurrent(pos.lat, pos.lon, 'en');
      const d = res.data?.data;
      if (!d) throw new Error('No weather data');

      // 4. Estimate annual rainfall from humidity
      const estimatedRainfall =
        d.humidity >= 80 ? 1400 :
        d.humidity >= 65 ? 1000 :
        d.humidity >= 50 ? 700 : 400;

      // 5. Build live weather badge info
      const cityLabel = detectedCity || d.city;
      const stateLabel = detectedState || '';
      const districtLabel = detectedDistrict || '';

      setLiveWeather({
        temperature: Math.round(d.temperature),
        humidity: d.humidity,
        rainfall: estimatedRainfall,
        city: cityLabel,
        state: stateLabel,
        district: districtLabel,
        fetchedAt: new Date().toLocaleTimeString(),
      });

      // 6. Auto-fill all detected fields
      const newState = detectedState || form.state;
      const newDistrict = detectedDistrict || (detectedState ? (DISTRICTS_DATA[detectedState]?.[0] || form.district) : form.district);
      const updatedForm = {
        ...form,
        temperature: Math.round(d.temperature),
        humidity: d.humidity,
        rainfall: estimatedRainfall,
        state: newState,
        district: newDistrict,
      };
      setForm(updatedForm);

      // 7. Toast summary
      const parts = [`🌡️ ${Math.round(d.temperature)}°C`, `💧 ${d.humidity}%`];
      if (detectedState) parts.push(`📍 ${detectedState}`);
      if (detectedDistrict) parts.push(`🏘️ ${detectedDistrict}`);
      toast.success(`✅ Live data filled! ${parts.join('  ')}`);

      // 8. Auto-submit recommendation
      handleSubmit(updatedForm);

    } catch (err) {
      if (err.message !== 'Geolocation not supported' && err.code !== 1) {
        toast.error('Could not fetch live weather. Please enter manually.');
      }
    } finally {
      setFetchingWeather(false);
    }
  };

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

  const handleSubmit = async (formOverride = null) => {
    setLoading(true);
    setResult(null);
    try {
      const dataToSubmit = formOverride || form;
      const { data } = await cropAPI.recommend({ ...dataToSubmit, language: i18n.language || 'en' });
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
      <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
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
      <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
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
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-emerald-100 selection:text-emerald-900 pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white leading-tight font-outfit">
              {t('crop.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-2 max-w-lg leading-relaxed">
              {t('crop.subtitle')}
            </p>
          </div>
          {result && (
            <button onClick={clear} className="h-11 px-5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-all active:scale-95 shrink-0">
              <Trash size={16} weight="bold" />
              {t('crop.clear_result')}
            </button>
          )}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* ══ LEFT — Input Form ══ */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-7 sm:p-9 shadow-xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-56 h-56 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

              {/* Form header + Live button */}
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Gauge size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {t('crop.historical_model')}
                </h2>

                <button
                  type="button"
                  onClick={fetchLiveWeather}
                  disabled={fetchingWeather}
                  title="Auto-fill all fields from your GPS location"
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 border",
                    fetchingWeather
                      ? "bg-sky-50 dark:bg-sky-500/10 text-sky-400 border-sky-200 dark:border-sky-800 cursor-not-allowed"
                      : liveWeather
                      ? "bg-sky-600 text-white border-sky-500 hover:bg-sky-700 shadow-lg shadow-sky-500/25"
                      : "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50 hover:bg-sky-100 dark:hover:bg-sky-500/20"
                  )}
                >
                  {fetchingWeather ? (
                    <><div className="w-3 h-3 border-2 border-sky-400/30 border-t-sky-500 rounded-full animate-spin" /> Detecting...</>
                  ) : (
                    <><MapPin size={13} weight="fill" /> {liveWeather ? 'GPS Active' : 'Use My Location'}</>
                  )}
                </button>
              </div>

              {/* Live badge */}
              {liveWeather && (
                <div className="mb-6 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-500/10 dark:to-indigo-500/10 border border-sky-200 dark:border-sky-800/50 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-400">
                  <div className="flex items-center gap-3 px-4 pt-3 pb-2 border-b border-sky-100 dark:border-sky-800/30">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                    </span>
                    <p className="text-xs font-black text-sky-700 dark:text-sky-300 truncate flex-1">
                      📍 {liveWeather.city}{liveWeather.state ? `, ${liveWeather.state}` : ''}
                    </p>
                    <span className="text-[9px] text-sky-400/70 font-semibold">{liveWeather.fetchedAt}</span>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-sky-100 dark:divide-sky-800/30 px-0">
                    {[
                      { label: 'Temp', val: `${liveWeather.temperature}°C`, emoji: '🌡️' },
                      { label: 'Humidity', val: `${liveWeather.humidity}%`, emoji: '💧' },
                      { label: 'Rainfall', val: `~${liveWeather.rainfall}mm`, emoji: '🌧️' },
                    ].map(({ label, val, emoji }) => (
                      <div key={label} className="flex flex-col items-center py-2 px-1">
                        <span className="text-[10px] text-sky-500/60 font-semibold">{emoji} {label}</span>
                        <span className="text-xs font-black text-sky-700 dark:text-sky-300">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Select label={t('crop.soil_type')} value={form.soilType} onChange={v => set('soilType', v)} options={SOIL_TYPES} icon={Plant} />
                  <Select label={t('crop.season')} value={form.season} onChange={v => set('season', v)} options={SEASONS} icon={Calendar} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Select label={t('crop.state')} value={form.state} onChange={v => set('state', v)} options={STATES} icon={MapPin} />
                    {liveWeather?.state && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-sky-500 text-white text-[8px] font-black rounded-full">GPS</span>}
                  </div>
                  <div className="relative">
                    <Select label={t('crop.district_label')} value={form.district} onChange={v => set('district', v)} options={districts} icon={MapPin} />
                    {liveWeather?.district && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-sky-500 text-white text-[8px] font-black rounded-full">GPS</span>}
                  </div>
                </div>



                <div className="relative">
                  <NumberInput label={t('crop.rainfall')} value={form.rainfall} onChange={v => set('rainfall', v)} min={0} max={3000} unit="mm" icon={Wind} />
                  {liveWeather && <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-black rounded-full">EST</span>}
                </div>

                {/* Soil nutrients */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-4 block">{t('crop.soil_nutrients')}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['nitrogen','phosphorus','potassium'].map(k => (
                      <div key={k} className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-slate-500 text-center capitalize">{k}</span>
                        <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {LEVELS.map(l => (
                            <button
                              key={l}
                              onClick={() => set(k, l)}
                              className={clsx(
                                "py-2 rounded-xl text-xs font-bold transition-all",
                                form[k] === l
                                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
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

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={clsx(
                    "w-full h-14 rounded-[1.5rem] font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 mt-2",
                    liveWeather && !result
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30 animate-pulse-slow"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25"
                  )}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('crop.thinking')}</span>
                    </div>
                  ) : (
                    <>
                      <Plant size={20} weight="duotone" />
                      <span>{liveWeather && !result ? '✨ Get My Crop Recommendation' : t('crop.recommend_btn')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT — Results / Ready State ══ */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-600">

                {/* Primary crop card */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-xl relative group">
                  <div className="h-44 sm:h-56 relative overflow-hidden">
                    <img src={cropsImg} alt="Crops" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
                    <div className="absolute top-5 left-5">
                      <div className="px-3 py-1.5 bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white text-xs font-bold shadow-lg">
                        {t('crop.scientific_rec')}
                      </div>
                    </div>
                    {liveWeather && (
                      <div className="absolute top-5 right-5 px-3 py-1.5 bg-sky-500/90 backdrop-blur-xl rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        GPS Powered
                      </div>
                    )}
                  </div>

                  <div className="p-7 sm:p-10 pt-0 relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 mb-2 block">{t('crop.primary_crop_title')}</span>
                        <h3 className="text-5xl sm:text-7xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter leading-none font-outfit">
                          {translateOption(result.primaryCrop)}
                        </h3>
                      </div>
                      {result.isFallback && (
                        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl border border-amber-100 dark:border-amber-800/50 self-start shrink-0">
                          {t('crop.historical_model')}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-8 pb-7 border-b border-slate-100 dark:border-slate-800/50">
                      <span className="text-xs font-semibold text-slate-400">{t('crop.alternatives_label')}</span>
                      {result.alternativeCrops?.map(c => (
                        <span key={c} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold">
                          {translateOption(c)}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: t('crop.sowing_time'), val: result.sowingTime },
                        { label: t('crop.harvest_time'), val: result.harvestTime },
                        { label: t('crop.water_req'), val: result.waterRequirement },
                        { label: t('crop.expected_yield'), val: result.expectedYield || t('crop.high') }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 transition-colors">
                          <p className="text-slate-400 text-[10px] font-bold mb-1">{item.label}</p>
                          <p className="font-black text-slate-900 dark:text-white text-xs tracking-tight leading-tight">{translateOption(item.val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Fertilizers + Confidence */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-7 shadow-xl">
                    <h3 className="text-xs font-bold text-slate-400 mb-5">{t('crop.fertilizers')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.fertilizers?.map(f => (
                        <span key={f} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-100 dark:border-indigo-800/50">
                          {translateOption(f, 'fertilizer')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] p-7 shadow-xl">
                    <h3 className="text-xs font-bold text-slate-400 mb-4">{t('crop.confidence')}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{(result.confidence * 100).toFixed(0)}%</span>
                      <span className="text-xs font-bold text-emerald-500">{t('crop.high_accuracy')}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-draw shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${result.confidence * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-7 sm:p-9 shadow-xl">
                  <h3 className="text-xs font-bold text-slate-400 mb-6">{t('crop.expert_insights')}</h3>
                  <div className="grid gap-3">
                    {result.tips?.map((tip, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                        </div>
                        <p className="text-sm font-semibold leading-relaxed text-slate-600 dark:text-slate-300">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar CTA */}
                <button
                  onClick={() => fetchCalendar(result.primaryCrop)}
                  className="w-full h-14 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <Calendar size={22} weight="fill" />
                  <span>{t('crop.view_calendar')}</span>
                </button>

                {/* Calendar */}
                {calendar && (
                  <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] p-7 sm:p-10 shadow-xl animate-in fade-in slide-in-from-top-8 duration-600">
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100 dark:border-slate-800/50">
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 font-outfit">{calendar.crop}</h3>
                        <p className="text-xs font-semibold text-slate-400">{t('crop.crop_calendar')}</p>
                      </div>
                      <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <Calendar size={28} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="space-y-10 relative before:absolute before:left-[52px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                      {calendar.activities?.map((a, i) => (
                        <div key={i} className="flex gap-8 text-sm relative z-10 group">
                          <div className="w-24 shrink-0 flex flex-col items-end pt-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-500 text-base leading-none">{translateOption(a.month)}</span>
                            <span className="text-[10px] font-semibold text-slate-400 mt-1">Phase {i+1}</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="absolute -left-[57px] top-2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-[3px] border-emerald-500 group-hover:scale-125 transition-transform z-20 shadow" />
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-none mb-2 tracking-tight group-hover:text-emerald-600 transition-colors capitalize">{a.activity}</h4>
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-w-md">
                              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed italic">"{a.notes}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            ) : liveWeather ? (
              /* ── GPS DATA READY — Show full summary + big CTA ── */
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Live data summary card */}
                <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                      </span>
                      <p className="text-sm font-bold text-white/80">Live GPS Data Captured</p>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-1">
                      📍 {liveWeather.city}
                    </h3>
                    {(liveWeather.state || liveWeather.district) && (
                      <p className="text-white/70 font-semibold text-sm mb-8">
                        {[liveWeather.district, liveWeather.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[
                        { label: 'Temperature', val: `${liveWeather.temperature}°C`, icon: '🌡️', tag: 'LIVE' },
                        { label: 'Humidity', val: `${liveWeather.humidity}%`, icon: '💧', tag: 'LIVE' },
                        { label: 'Est. Rainfall', val: `${liveWeather.rainfall}mm`, icon: '🌧️', tag: 'EST' },
                      ].map(({ label, val, icon, tag }) => (
                        <div key={label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{icon}</span>
                            <span className="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded-full">{tag}</span>
                          </div>
                          <p className="text-xl font-black">{val}</p>
                          <p className="text-[10px] text-white/60 font-semibold">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <p className="text-[10px] text-white/60 font-semibold mb-1">🏛️ State</p>
                        <p className="font-black text-base">{form.state}</p>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                        <p className="text-[10px] text-white/60 font-semibold mb-1">🏘️ District</p>
                        <p className="font-black text-base truncate">{form.district}</p>
                      </div>
                    </div>
                    {/* Big recommend CTA */}
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full h-14 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-2xl shadow-black/20 hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <><div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> Analyzing your field...</>
                      ) : (
                        <><Plant size={20} weight="duotone" /> Get AI Crop Recommendation →</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Soil info reminder */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-9 h-9 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Info size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1">GPS data auto-filled ✅</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Temperature, humidity, state & district detected from your location. You can still adjust soil type, season & nutrients in the form, then hit <strong>Get AI Crop Recommendation</strong>.
                    </p>
                  </div>
                </div>
              </div>

            ) : (
              /* ── Empty state ── */
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 group hover:border-emerald-400/50 transition-all duration-500">
                <div className="w-20 h-20 rounded-[1.5rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 transition-transform">
                  <Plant size={40} weight="duotone" className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">{t('crop.get_ai_rec')}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs leading-relaxed mb-6">
                  {t('crop.get_ai_rec_desc')}
                </p>
                <button
                  onClick={fetchLiveWeather}
                  disabled={fetchingWeather}
                  className="flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sky-500/25 hover:bg-sky-700 active:scale-95 transition-all"
                >
                  {fetchingWeather
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Detecting location...</>
                    : <><MapPin size={16} weight="fill" /> Start with My GPS Location</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══ GPS MAP — Shows BELOW the grid when location is tracked ══ */}
        {liveWeather?.lat !== undefined || liveWeather ? (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center">
                <MapPin size={16} weight="fill" className="text-sky-600 dark:text-sky-400" />
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Your Field Location
              </h2>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-xs font-bold border border-sky-200 dark:border-sky-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                Live GPS
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900" style={{ height: '340px' }}>
              {/* OpenStreetMap iframe embed — free, no API key */}
              <iframe
                title="GPS Location Map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(form.longitude || 78.9629) - 0.5}%2C${(form.latitude || 20.5937) - 0.5}%2C${(form.longitude || 78.9629) + 0.5}%2C${(form.latitude || 20.5937) + 0.5}&layer=mapnik&marker=${liveWeather.lat || 20.5937}%2C${liveWeather.lon || 78.9629}`}
                className="w-full h-full border-0"
                loading="lazy"
                style={{ filter: 'contrast(1.05) saturate(1.1)' }}
              />
              {/* Map overlay label */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="text-xs font-black text-slate-800 dark:text-white">📍 {liveWeather.city}{liveWeather.state ? `, ${liveWeather.state}` : ''}</p>
                {liveWeather.district && <p className="text-[10px] text-slate-500 font-semibold mt-0.5">🏘️ {liveWeather.district}</p>}
              </div>
              <div className="absolute top-4 right-4 bg-sky-600/90 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-black">GPS ACTIVE</span>
              </div>
            </div>
          </div>
        ) : null}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          from { width: 0; opacity: 0; }
          to { opacity: 1; }
        }
        .animate-draw { animation: draw 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
        }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}} />
    </div>
  );
}
