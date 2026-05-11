import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { marketAPI } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, ReferenceDot
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, MapPin, Package, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import mandiImg from '../assets/mandi-scene.png';
import { usePageAnimation } from '../hooks/usePageAnimation';

const TrendIcon = ({ trend, size = 14 }) => {
  if (trend === 'up')     return <TrendingUp size={size} className="text-green-500" />;
  if (trend === 'down')   return <TrendingDown size={size} className="text-red-500" />;
  return <Minus size={size} className="text-gray-400" />;
};

const STATES = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka','Andhra Pradesh','Telangana','West Bengal','Odisha','Assam','Tamil Nadu'];

const FALLBACK_PRICES = [
  { commodity:'Wheat',   variety:'Dara',    state:'Punjab',          market:'Amritsar', modalPrice:2350, minPrice:2200, maxPrice:2500, changePercent:1.2 },
  { commodity:'Rice',    variety:'Basmati', state:'Haryana',         market:'Karnal',   modalPrice:3800, minPrice:3600, maxPrice:4000, changePercent:0.8 },
  { commodity:'Soybean', variety:'Yellow',  state:'Madhya Pradesh',  market:'Satna',    modalPrice:4200, minPrice:4000, maxPrice:4400, changePercent:-0.5 },
  { commodity:'Onion',   variety:'Nashik',  state:'Maharashtra',     market:'Nashik',   modalPrice:1800, minPrice:1600, maxPrice:2000, changePercent:3.2 },
  { commodity:'Tomato',  variety:'Hybrid',  state:'Karnataka',       market:'Kolar',    modalPrice:2100, minPrice:1800, maxPrice:2400, changePercent:-1.1 },
  { commodity:'Potato',  variety:'Jyoti',   state:'Uttar Pradesh',   market:'Agra',     modalPrice:1200, minPrice:1100, maxPrice:1350, changePercent:0.3 },
  { commodity:'Cotton',  variety:'Medium',  state:'Gujarat',         market:'Rajkot',   modalPrice:6200, minPrice:5900, maxPrice:6500, changePercent:0.6 },
  { commodity:'Maize',   variety:'Yellow',  state:'Bihar',           market:'Patna',    modalPrice:1900, minPrice:1800, maxPrice:2050, changePercent:1.8 },
];

const FALLBACK_TRENDS = {
  trends: Array.from({ length: 35 }, (_, i) => ({
    date: new Date(Date.now() - (34-i) * 86400000).toISOString().split('T')[0],
    price: 2200 + Math.round(Math.sin(i * 0.4) * 120 + i * 4),
    type: i < 30 ? 'historical' : 'forecast'
  }))
};

const FALLBACK_COMMODITIES = ['Wheat','Rice','Maize','Soybean','Cotton','Onion','Tomato','Potato','Mustard','Gram'];

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

export default function Market() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  
  // Selection State
  const [selState, setSelState]       = useState('Punjab');
  const [selDistrict, setSelDistrict] = useState('Amritsar');
  const [selCommodity, setSelCommodity] = useState('Wheat');
  const [search, setSearch]           = useState('');

  const translateOption = (opt, ns = 'market') => {
    const keys = [
      `${ns}.states.${opt}`,
      `crop.states.${opt}`,
      `crop.districts.${opt}`,
      `${ns}.items.${opt}`,
      `common.${opt.toLowerCase()}`
    ];
    for (const key of keys) {
      const val = t(key);
      if (val !== key) return val;
    }
    return opt;
  };

  // Initial Data (Commodities & States)
  const { data: metaData } = useQuery({
    queryKey: ['market-meta'],
    queryFn: async () => {
      try {
        const [c, s] = await Promise.all([marketAPI.getCommodities(), marketAPI.getStates()]);
        return {
          commodities: c.data.data || [],
          states: s.data.data || []
        };
      } catch { return { commodities: FALLBACK_COMMODITIES, states: STATES }; }
    },
    staleTime: 60 * 60 * 1000,
  });

  // Dynamic Districts Query
  const { data: districtsData } = useQuery({
    queryKey: ['market-districts', selState],
    queryFn: async () => {
      if (!selState) return [];
      const res = await marketAPI.getDistricts(selState);
      return res.data.data || [];
    },
    enabled: !!selState,
  });

  // Dynamic Prices Query
  const { data: pricesData, isLoading: pricesLoading } = useQuery({
    queryKey: ['market-prices', selState, selDistrict, selCommodity],
    queryFn: async () => {
      try {
        const res = await marketAPI.getPrices(selState, selCommodity, selDistrict);
        return res.data.data.prices || [];
      } catch { return FALLBACK_PRICES; }
    },
    retry: 1,
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', selCommodity, selState, selDistrict],
    queryFn: async () => {
      if (!selCommodity) return null;
      try {
        const res = await marketAPI.getTrends(selCommodity, selState, selDistrict);
        return res.data.data;
      } catch { return FALLBACK_TRENDS; }
    },
    enabled: !!selCommodity,
    retry: 1,
  });

  const prices      = pricesData || FALLBACK_PRICES;
  const commodities = metaData?.commodities || FALLBACK_COMMODITIES;
  const availableStates = metaData?.states || STATES;
  const loading = pricesLoading;

  const filteredPrices = useMemo(() => {
    if (!prices) return [];
    return prices.filter(p => {
      const matchSearch = !search || 
        p.commodity.toLowerCase().includes(search.toLowerCase()) ||
        p.market.toLowerCase().includes(search.toLowerCase()) ||
        p.district?.toLowerCase().includes(search.toLowerCase());
      
      const matchState = !selState || p.state === selState;
      const matchDist = !selDistrict || p.market === selDistrict;
      
      return matchSearch && matchState && matchDist;
    });
  }, [prices, search, selState, selDistrict]);

  // Analytics derived from trends OR current prices
  const analytics = useMemo(() => {
    // Priority 1: Real Trends from API
    if (trends && trends.trends && trends.trends.length > 0 && !trends.isFallback) {
      const data = trends.trends;
      const historical = data.filter(d => d.type === 'historical');
      const forecast = data.filter(d => d.type === 'forecast');
      const currentPrice = historical[historical.length - 1]?.price || 0;
      const pastPrices = historical.map(d => d.price);
      return {
        currentPrice,
        high30: Math.max(...pastPrices),
        low30: Math.min(...pastPrices),
        futurePrice: forecast[forecast.length - 1]?.price || currentPrice,
        expectedChange: currentPrice ? ((forecast[forecast.length - 1]?.price - currentPrice) / currentPrice) * 100 : 0
      };
    }

    // Priority 2: Derive from current table data
    if (filteredPrices.length > 0) {
      const modalPrices = filteredPrices.map(p => p.modalPrice).filter(p => !!p);
      if (modalPrices.length > 0) {
        const avgPrice = Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length);
        return {
          currentPrice: avgPrice,
          high30: Math.max(...modalPrices),
          low30: Math.min(...modalPrices),
          futurePrice: Math.round(avgPrice * 1.05), // Mock forecast
          expectedChange: 5.0
        };
      }
    }
    
    return null;
  }, [trends, filteredPrices]);

  const handleStateChange = (val) => {
    setSelState(val);
    setSelDistrict(''); // Reset district when state changes
  };

  const districts = districtsData || DISTRICTS_DATA[selState] || [];

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-xs text-gray-500 font-bold mb-1">{new Date(label).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-lg font-black text-primary">₹{data.price.toLocaleString()}</p>
          <div className="mt-1">
            <span className={clsx(
              "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md",
              data.type === 'historical' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            )}>
              {t(`market.${data.type}`, data.type)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={ref} className="page-wrapper max-w-7xl">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="anim-header flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/20 mb-4 inline-block">{t('market.analytics', 'Mandi Analytics')}</span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3 leading-none">
            {t('market.insights', 'Market Insights')} <TrendingUp className="text-blue-500" size={32} />
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-3 text-sm sm:text-base max-w-xl">
            {t('market.insights_desc', 'Track historical prices and view AI-driven forecasts across districts in India.')}
          </p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-secondary h-12 px-6 self-start sm:self-end text-xs font-black uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95">
          <RefreshCw size={14} /> {t('dashboard.labels.refresh', 'Refresh Data')}
        </button>
      </div>

      {/* ── Imagery & Header ─────────────────────────────────────── */}
      <div className="anim-card relative h-64 rounded-[2.5rem] overflow-hidden mb-8 shadow-premium">
         <img src={mandiImg} alt="Mandi scene" className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
         <div className="absolute bottom-8 left-8 text-white">
            <div className="badge-verified mb-3 bg-white/20 text-white border-white/30 backdrop-blur-md">{t('market.official_source', 'Official Data Source: Agmarknet')}</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter">{t('market.live_mandi', 'Real-Time Mandi Board')}</h2>
            <p className="text-white/70 font-medium mt-1">{t('market.live_mandi_desc', 'Live rates from over 500+ markets across India')}</p>
         </div>
      </div>

      {/* ── Filters Strip ─────────────────────────────────────── */}
      <div className="anim-card bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-5 sm:p-7 mb-8 shadow-premium">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-1.5"><MapPin size={12} className="text-primary"/> {t('crop.state')}</label>
            <div className="relative group">
              <select className="input rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 font-bold text-sm shadow-sm appearance-none cursor-pointer hover:border-primary transition-colors" value={selState} onChange={e => handleStateChange(e.target.value)}>
                {availableStates.map(s => <option key={s} value={s}>{translateOption(s, 'crop')}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                <RefreshCw size={12} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-1.5"><MapPin size={12} className="text-primary"/> {t('crop.district_label')}</label>
            <div className="relative group">
              <select className="input rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 font-bold text-sm shadow-sm appearance-none cursor-pointer hover:border-primary transition-colors" value={selDistrict} onChange={e => setSelDistrict(e.target.value)} disabled={!selState}>
                <option value="">{t('market.all_districts', 'All Districts')}</option>
                {districts.map(d => <option key={d} value={d}>{translateOption(d, 'crop')}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                <RefreshCw size={12} />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-1.5"><Package size={12} className="text-primary"/> {t('market.commodity')} / {t('market.variety')}</label>
            <div className="relative group">
              <select className="input rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 font-bold text-sm shadow-sm appearance-none cursor-pointer hover:border-primary transition-colors" value={selCommodity} onChange={e => setSelCommodity(e.target.value)}>
                <option value="">{t('market.select_commodity')}</option>
                {commodities.map(c => <option key={c} value={c}>{t(`market.items.${c}`, c)}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-primary transition-colors">
                <RefreshCw size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Area ───────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        
        {/* Chart Column (Spans 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="anim-card card border-none shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  {selCommodity ? t(`market.items.${selCommodity}`, selCommodity) : t('market.select_commodity')} {t('market.price_trend')}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {selDistrict ? `${selDistrict}, ` : ''}{selState ? t(`market.states.${selState}`, selState) : 'India'} • {t('market.horizon')}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div> {t('market.historical', 'Historical')}</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500 border-dashed"></div> {t('market.forecast', 'AI Forecast')}</span>
              </div>
            </div>

            {trendsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : trends?.trends ? (
              <div className="h-[300px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trends.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} 
                      tickFormatter={d => new Date(d).toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric' })} 
                      axisLine={false} 
                      tickLine={false} 
                      minTickGap={20}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} 
                      tickFormatter={v => `₹${v}`} 
                      axisLine={false} 
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    
                    {/* Render historical as Area */}
                    <Area 
                      type="monotone" 
                      dataKey={d => d.type === 'historical' ? d.price : null} 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      connectNulls={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                    />
                    
                    {/* Render forecast as dashed line */}
                    <Line 
                      type="monotone" 
                      dataKey={d => d.type === 'forecast' ? d.price : null} 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      strokeDasharray="5 5" 
                      dot={false}
                      connectNulls={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400 font-bold">
                {t('market.no_trend', 'No trend data available for this selection.')}
              </div>
            )}
          </div>
        </div>

        {/* Analytics Column */}
        <div className="flex flex-col gap-4">
          {analytics ? (
            <>
              <div className="bg-harvest-sunset rounded-[2.5rem] p-7 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                <p className="text-xs font-black uppercase tracking-widest text-white/80 mb-1">{t('market.current_modal', 'Current Modal Price')}</p>
                <div className="flex items-end gap-2 relative z-10">
                  <h2 className="text-5xl font-black tracking-tighter drop-shadow-sm">₹{analytics.currentPrice.toLocaleString()}</h2>
                  <span className="text-sm font-bold text-white/70 mb-2">{t('market.per_quintal', '/ Quintal')}</span>
                </div>
              </div>

              <div className="card shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{t('market.range_30d', '30-Day Historical Range')}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('market.lowest', 'Lowest')}</p>
                    <p className="text-xl font-black text-red-500">₹{analytics.low30.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-100 dark:bg-slate-800"></div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('market.highest', 'Highest')}</p>
                    <p className="text-xl font-black text-green-500">₹{analytics.high30.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className={clsx(
                "border rounded-[2rem] p-6 shadow-sm",
                analytics.expectedChange > 0 ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30" : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">{t('market.forecast_15d', '15-Day AI Forecast')}</p>
                  <div className={clsx(
                    "p-2 rounded-xl",
                    analytics.expectedChange > 0 ? "bg-green-100 text-green-600 dark:bg-green-900/40" : "bg-red-100 text-red-600 dark:bg-red-900/40"
                  )}>
                    {analytics.expectedChange > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <h3 className={clsx(
                    "text-3xl font-black tracking-tight",
                    analytics.expectedChange > 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  )}>
                    {analytics.expectedChange > 0 ? '+' : ''}{analytics.expectedChange.toFixed(1)}%
                  </h3>
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-2">{t('market.expected_to_reach', 'Expected to reach')} <span className="font-black text-gray-900 dark:text-white">₹{analytics.futurePrice.toLocaleString()}</span></p>
              </div>
            </>
          ) : (
            <div className="h-full bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border border-gray-100 dark:border-white/5 border-dashed flex items-center justify-center text-center p-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('market.select_to_view', 'Select a commodity to view analytics')}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Today's Mandi Board ───────────────────────────────── */}
      <div className="anim-fade card p-0 overflow-hidden shadow-2xl border-none relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              {t('market.table_title', 'Live Mandi Board')}
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('market.table_subtitle', "Today's Modal Prices")}</p>
          </div>
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              className="input pl-10 h-11 text-sm rounded-2xl bg-gray-50 dark:bg-slate-800 border-none shadow-inner w-full sm:w-64 focus:ring-2 focus:ring-blue-500/20 transition-all" 
              placeholder={t('market.search_table', 'Search table...')} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto scrollbar-none relative z-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800/50">
                {[
                  { id: 'commodity', label: t('market.headers.commodity') },
                  { id: 'variety', label: t('market.headers.variety') },
                  { id: 'market', label: t('market.headers.market') },
                  { id: 'prices', label: t('market.headers.modal_avg'), className: 'text-center' },
                  { id: 'trend', label: t('market.headers.trend'), className: 'text-right' }
                ].map(h => (
                  <th key={h.id} className={clsx("px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 whitespace-nowrap", h.className)}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="skeleton h-8 w-full rounded-xl" /></td></tr>
                ))
              ) : filteredPrices.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-400 font-bold text-xs uppercase tracking-widest italic">{t('market.no_market_data', 'No market data found')}</td></tr>
              ) : filteredPrices.map((p, i) => (
                <tr key={i} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group cursor-default">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {p.commodity === 'Wheat' ? '🌾' : p.commodity === 'Onion' ? '🧅' : p.commodity === 'Tomato' ? '🍅' : p.commodity === 'Potato' ? '🥔' : '📦'}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 dark:text-white block leading-none mb-1">{t(`market.items.${p.commodity}`, p.commodity)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{p.state}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-gray-500 uppercase">{p.variety}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                      <MapPin size={12} className="text-blue-500" />
                      {p.market}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-black text-lg text-blue-600 dark:text-blue-400 leading-none">₹{p.modalPrice?.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">₹{p.minPrice} - ₹{p.maxPrice}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className={clsx(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-xs shadow-sm",
                      p.changePercent > 0 ? "bg-green-500 text-white shadow-green-500/20" : 
                      p.changePercent < 0 ? "bg-red-500 text-white shadow-red-500/20" : 
                      "bg-gray-100 text-gray-500 dark:bg-slate-800"
                    )}>
                      {p.changePercent > 0 ? <TrendingUp size={14} /> : p.changePercent < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
                      <span>{p.changePercent > 0 ? '+' : ''}{p.changePercent}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
