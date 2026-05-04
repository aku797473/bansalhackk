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

const TrendIcon = ({ trend, size = 14 }) => {
  if (trend === 'up')     return <TrendingUp size={size} className="text-green-500" />;
  if (trend === 'down')   return <TrendingDown size={size} className="text-red-500" />;
  return <Minus size={size} className="text-gray-400" />;
};

export default function Market() {
  const { t } = useTranslation();
  
  // Selection State
  const [selState, setSelState]       = useState('Madhya Pradesh');
  const [selDistrict, setSelDistrict] = useState('Rewa');
  const [selCommodity, setSelCommodity] = useState('Wheat');
  const [search, setSearch]           = useState('');

  // Queries
  const { data: initData, isLoading: initLoading } = useQuery({
    queryKey: ['market-init'],
    queryFn: async () => {
      const [p, s, c] = await Promise.all([marketAPI.getPrices(), marketAPI.getStates(), marketAPI.getCommodities()]);
      return {
        prices: p.data.data.prices || [],
        states: s.data.data || [],
        commodities: c.data.data || []
      };
    },
    onError: () => toast.error('Market data unavailable')
  });

  const { data: districts = [] } = useQuery({
    queryKey: ['districts', selState],
    queryFn: async () => {
      if (!selState) return [];
      const res = await marketAPI.getDistricts(selState);
      return res.data.data || [];
    },
    enabled: !!selState,
    onSuccess: (data) => {
      if (data.length > 0 && !data.includes(selDistrict)) {
        setSelDistrict(data[0]);
      }
    }
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', selCommodity, selState, selDistrict],
    queryFn: async () => {
      if (!selCommodity) return null;
      const res = await marketAPI.getTrends(selCommodity, selState, selDistrict);
      return res.data.data;
    },
    enabled: !!selCommodity,
  });

  const prices = initData?.prices || [];
  const states = initData?.states || [];
  const commodities = initData?.commodities || [];
  const loading = initLoading;

  const filteredPrices = useMemo(() => prices.filter(p => {
    const matchSearch = !search || p.commodity.toLowerCase().includes(search.toLowerCase());
    const matchState  = !selState || p.state === selState;
    const matchDist   = !selDistrict || p.market === selDistrict;
    // If district is selected, filter tightly. If not, just state.
    if (selDistrict) return matchSearch && matchState && matchDist;
    return matchSearch && matchState;
  }), [prices, search, selState, selDistrict]);

  // Analytics derived from trends
  const analytics = useMemo(() => {
    if (!trends || !trends.trends || trends.trends.length === 0) return null;
    const data = trends.trends;
    const historical = data.filter(d => d.type === 'historical');
    const forecast = data.filter(d => d.type === 'forecast');
    
    const currentPrice = historical[historical.length - 1]?.price || 0;
    const pastPrices = historical.map(d => d.price);
    const high30 = Math.max(...pastPrices);
    const low30 = Math.min(...pastPrices);
    
    const futurePrice = forecast[forecast.length - 1]?.price || currentPrice;
    const expectedChange = currentPrice ? ((futurePrice - currentPrice) / currentPrice) * 100 : 0;
    
    return {
      currentPrice, high30, low30, futurePrice, expectedChange
    };
  }, [trends]);

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-xs text-gray-500 font-bold mb-1">{new Date(label).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-lg font-black text-primary">₹{data.price.toLocaleString()}</p>
          <div className="mt-1">
            <span className={clsx(
              "text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md",
              data.type === 'historical' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            )}>
              {data.type}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 page-enter">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/20 mb-3 inline-block">Mandi Analytics</span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Market Insights <TrendingUp className="text-blue-500" />
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-2 text-sm max-w-xl">
            Track historical prices and view AI-driven forecasts across districts in India.
          </p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-secondary h-10 px-4 self-start md:self-end text-xs rounded-xl hidden sm:flex">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* ── Filters Strip ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2rem] p-4 sm:p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1.5"><MapPin size={12}/> State</label>
            <select className="input rounded-2xl bg-gray-50 dark:bg-slate-800 border-none font-semibold text-sm" value={selState} onChange={e => setSelState(e.target.value)}>
              <option value="">All States</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1.5"><MapPin size={12}/> District</label>
            <select className="input rounded-2xl bg-gray-50 dark:bg-slate-800 border-none font-semibold text-sm" value={selDistrict} onChange={e => setSelDistrict(e.target.value)} disabled={!selState}>
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 flex items-center gap-1.5"><Package size={12}/> Commodity / Ingredient</label>
            <select className="input rounded-2xl bg-gray-50 dark:bg-slate-800 border-none font-semibold text-sm" value={selCommodity} onChange={e => setSelCommodity(e.target.value)}>
              <option value="">Select Commodity</option>
              {commodities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Area ───────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        
        {/* Chart Column (Spans 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  {selCommodity || 'Select Commodity'} Price Trend
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {selDistrict ? `${selDistrict}, ` : ''}{selState || 'India'} • 45 Day Horizon
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div> Historical</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500 border-dashed"></div> AI Forecast</span>
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
                      tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
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
                No trend data available for this selection.
              </div>
            )}
          </div>
        </div>

        {/* Analytics Column */}
        <div className="flex flex-col gap-4">
          {analytics ? (
            <>
              <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-1">Current Modal Price</p>
                <div className="flex items-end gap-2">
                  <h2 className="text-5xl font-black tracking-tighter">₹{analytics.currentPrice.toLocaleString()}</h2>
                  <span className="text-sm font-bold text-emerald-100 mb-2">/ Quintal</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">30-Day Historical Range</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lowest</p>
                    <p className="text-xl font-black text-red-500">₹{analytics.low30.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-px bg-gray-100 dark:bg-slate-800"></div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Highest</p>
                    <p className="text-xl font-black text-green-500">₹{analytics.high30.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className={clsx(
                "border rounded-[2rem] p-6 shadow-sm",
                analytics.expectedChange > 0 ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30" : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">15-Day AI Forecast</p>
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
                <p className="text-xs font-semibold text-gray-500 mt-2">Expected to reach <span className="font-black text-gray-900 dark:text-white">₹{analytics.futurePrice.toLocaleString()}</span></p>
              </div>
            </>
          ) : (
            <div className="h-full bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border border-gray-100 dark:border-white/5 border-dashed flex items-center justify-center text-center p-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select a commodity to view analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Today's Mandi Board ───────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Live Mandi Board</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Today's Modal Prices</p>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              className="input pl-9 h-10 text-sm rounded-xl bg-white dark:bg-slate-800" 
              placeholder="Search table..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-sm">
            <thead className="bg-white dark:bg-slate-900">
              <tr>
                {['Commodity', 'Variety', 'Market', 'Min', 'Modal (Avg)', 'Max', 'Trend'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="skeleton h-6 w-full rounded-md" /></td></tr>
                ))
              ) : filteredPrices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 font-bold text-xs uppercase tracking-widest">No market data found</td></tr>
              ) : filteredPrices.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-lg">{p.commodity === 'Wheat' ? '🌾' : p.commodity === 'Onion' ? '🧅' : p.commodity === 'Tomato' ? '🍅' : p.commodity === 'Potato' ? '🥔' : '📦'}</div>
                      <span className="font-black text-gray-900 dark:text-white">{p.commodity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">{p.variety}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">{p.market}</td>
                  <td className="px-6 py-4 text-gray-400">₹{p.minPrice?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-lg">₹{p.modalPrice?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">₹{p.maxPrice?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <TrendIcon trend={p.trend} size={16} />
                      <span className={clsx('text-xs font-black',
                        p.changePercent > 0 ? 'text-green-500' : p.changePercent < 0 ? 'text-red-500' : 'text-gray-400'
                      )}>
                        {p.changePercent > 0 ? '+' : ''}{p.changePercent}%
                      </span>
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
