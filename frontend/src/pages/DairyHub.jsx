import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThreeBackground from '../components/ThreeBackground';
import GoldPaywall from '../components/GoldPaywall';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  Crown, Plus, Trash, ShieldCheck, Heartbeat, VideoCamera, FileText, ArrowUpRight, 
  UserCircle, ShoppingBag, PlusCircle, CheckCircle, Warning, Activity, Calendar
} from '@phosphor-icons/react';

export default function DairyHub() {
  const { user, updateUser } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState('yield'); // 'yield' | 'cattle' | 'marketplace' | 'vet'

  // --- Yield Logging States ---
  const [yieldLogs, setYieldLogs] = useState(() => {
    const saved = localStorage.getItem('sk_dairy_yield');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: 'Jun 08', liters: 12, fat: 4.2 },
      { id: 2, date: 'Jun 09', liters: 15, fat: 4.5 },
      { id: 3, date: 'Jun 10', liters: 14, fat: 4.1 },
      { id: 4, date: 'Jun 11', liters: 18, fat: 4.7 },
      { id: 5, date: 'Jun 12', liters: 16, fat: 4.3 }
    ];
  });
  const [newLiters, setNewLiters] = useState('');
  const [newFat, setNewFat] = useState('');
  const [newDate, setNewDate] = useState('');

  // --- Cattle Tracking States ---
  const [cattleList, setCattleList] = useState(() => {
    const saved = localStorage.getItem('sk_dairy_cattle');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Ganga', breed: 'Gir Cow', age: '4 yrs', lastMilk: '8L', vaccineStatus: 'Fully Vaccinated', nextVaccine: 'Aug 12, 2026' },
      { id: 2, name: 'Jamuna', breed: 'Murrah Buffalo', age: '5 yrs', lastMilk: '10L', vaccineStatus: 'FMD Dose Pending', nextVaccine: 'Jun 28, 2026' }
    ];
  });
  const [showAddCattleModal, setShowAddCattleModal] = useState(false);
  const [cattleName, setCattleName] = useState('');
  const [cattleBreed, setCattleBreed] = useState('Gir Cow');
  const [cattleAge, setCattleAge] = useState('');
  const [cattleLastMilk, setCattleLastMilk] = useState('');

  // --- Marketplace Listing States ---
  const [marketListings, setMarketListings] = useState(() => {
    const saved = localStorage.getItem('sk_dairy_listings');
    return saved ? JSON.parse(saved) : [
      { id: 1, item: 'A2 Fresh Gir Cow Milk', quantity: '50 Liters', price: '₹60/L', status: 'Active', isGold: true },
      { id: 2, item: 'Organic Buffalo Paneer', quantity: '10 Kg', price: '₹380/Kg', status: 'Pending Approval', isGold: false }
    ];
  });
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [listItem, setListItem] = useState('');
  const [listQty, setListQty] = useState('');
  const [listPrice, setListPrice] = useState('');

  // --- Veterinary Consult States ---
  const [isCalling, setIsCalling] = useState(false);
  const [callTimer, setCallTimer] = useState(0);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('sk_dairy_yield', JSON.stringify(yieldLogs));
  }, [yieldLogs]);

  useEffect(() => {
    localStorage.setItem('sk_dairy_cattle', JSON.stringify(cattleList));
  }, [cattleList]);

  useEffect(() => {
    localStorage.setItem('sk_dairy_listings', JSON.stringify(marketListings));
  }, [marketListings]);

  // Video call timer simulation
  useEffect(() => {
    let interval;
    if (isCalling) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // --- Handlers ---
  const handleAddYield = (e) => {
    e.preventDefault();
    if (!newLiters || !newFat) {
      toast.error('Please fill all fields');
      return;
    }
    const logDate = newDate ? new Date(newDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const newLog = {
      id: Date.now(),
      date: logDate,
      liters: parseFloat(newLiters),
      fat: parseFloat(newFat)
    };
    setYieldLogs([...yieldLogs, newLog]);
    setNewLiters('');
    setNewFat('');
    setNewDate('');
    toast.success('Production log recorded successfully!');
  };

  const handleAddCattle = (e) => {
    e.preventDefault();
    if (!cattleName || !cattleAge) {
      toast.error('Please enter Name and Age');
      return;
    }

    // Monetization constraint check:
    if (!user?.isPremium && cattleList.length >= 2) {
      setShowAddCattleModal(false);
      setShowPaywall(true);
      toast.error('Free plan limits to 2 cattle. Unlock Kisan Gold for unlimited cataloging!');
      return;
    }

    const newCow = {
      id: Date.now(),
      name: cattleName,
      breed: cattleBreed,
      age: `${cattleAge} yrs`,
      lastMilk: cattleLastMilk ? `${cattleLastMilk}L` : '0L',
      vaccineStatus: 'Vaccines up-to-date',
      nextVaccine: 'Jul 20, 2026'
    };

    setCattleList([...cattleList, newCow]);
    setCattleName('');
    setCattleAge('');
    setCattleLastMilk('');
    setShowAddCattleModal(false);
    toast.success('Cattle profiles added to registry');
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    if (!listItem || !listQty || !listPrice) {
      toast.error('All details are required');
      return;
    }

    const newListing = {
      id: Date.now(),
      item: listItem,
      quantity: listQty,
      price: `₹${listPrice}`,
      status: user?.isPremium ? 'Active (Auto-Approved)' : 'Pending Review (5% Comm.)',
      isGold: !!user?.isPremium
    };

    setMarketListings([...marketListings, newListing]);
    setListItem('');
    setListQty('');
    setListPrice('');
    setShowAddListingModal(false);
    toast.success(user?.isPremium ? 'Gold listing posted instantly!' : 'Listing posted. Review takes up to 24 hours.');
  };

  const handleDeleteCattle = (id) => {
    setCattleList(cattleList.filter(c => c.id !== id));
    toast.success('Cattle profile deleted');
  };

  const handleDeleteYield = (id) => {
    setYieldLogs(yieldLogs.filter(y => y.id !== id));
    toast.success('Log entry deleted');
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Yield Stats calculations
  const totalLiters = yieldLogs.reduce((acc, curr) => acc + curr.liters, 0);
  const avgFat = yieldLogs.length ? (yieldLogs.reduce((acc, curr) => acc + curr.fat, 0) / yieldLogs.length).toFixed(2) : 0;
  const estimatedRevenue = (totalLiters * 55).toLocaleString('en-IN'); // assuming average rate of ₹55 per liter

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 relative">
      <ThreeBackground />
      
      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent rounded-[2.5rem] p-8 sm:p-10 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 font-outfit tracking-tight flex items-center gap-3">
              Dairy Hub & cattle Tracker
              {user?.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-black text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/30">
                  <Crown size={14} weight="fill" />
                  Kisan Gold
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Optimize herd yields, health logs, and direct buyer logistics
            </p>
          </div>
          
          {!user?.isPremium && (
            <button 
              onClick={() => setShowPaywall(true)}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <Crown size={18} weight="fill" />
              Get Kisan Gold Member
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
          {[
            { id: 'yield', label: 'Production Log & Yields' },
            { id: 'cattle', label: 'Cattle Registry & Vaccines' },
            { id: 'marketplace', label: 'Direct Dairy Marketplace' },
            { id: 'vet', label: '24/7 Priority Vet Consultation', premium: true }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.premium && !user?.isPremium && (
                <Crown size={14} className="text-amber-500 animate-pulse" weight="fill" />
              )}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: PRODUCTION LOG & YIELDS ================= */}
        {activeTab === 'yield' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input & Stats Column */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Logger Form */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Log Daily Yield</h3>
                  <p className="text-xs text-slate-500">Log liters collected and quality metrics</p>
                </div>

                <form onSubmit={handleAddYield} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity (Liters)</label>
                    <input 
                      type="number" step="0.1" required
                      value={newLiters} onChange={(e) => setNewLiters(e.target.value)}
                      placeholder="e.g. 15.5"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fat Percentage (%)</label>
                    <input 
                      type="number" step="0.1" required
                      value={newFat} onChange={(e) => setNewFat(e.target.value)}
                      placeholder="e.g. 4.2"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date (Optional)</label>
                    <input 
                      type="date"
                      value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={16} weight="bold" />
                    Record Log
                  </button>
                </form>
              </div>

              {/* Stats Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-5 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl shadow-md space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Logged (L)</span>
                  <div className="text-3xl font-black text-slate-850 dark:text-white">{totalLiters}L</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-5 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl shadow-md space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Average Fat %</span>
                  <div className="text-3xl font-black text-emerald-500">{avgFat}%</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-5 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl shadow-md col-span-1 sm:col-span-2 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Est. Market Value (@ ₹55/L)</span>
                  <div className="text-3xl font-black text-slate-850 dark:text-white">₹{estimatedRevenue}</div>
                </div>
              </div>

            </div>

            {/* Charts & Log Table Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Yield Chart */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Yield Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yieldLogs}>
                      <defs>
                        <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e120" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <RechartsTooltip contentStyle={{ borderRadius: '12px', background: '#0f172a', border: 'none', color: '#fff' }} />
                      <Area type="monotone" dataKey="liters" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLiters)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Past Log Records</h3>
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <th className="pb-3 pl-2">Date</th>
                        <th className="pb-3">Yield</th>
                        <th className="pb-3">Fat Content</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold">
                      {yieldLogs.map((log) => (
                        <tr key={log.id} className="text-slate-700 dark:text-slate-300">
                          <td className="py-3 pl-2">{log.date}</td>
                          <td className="py-3 font-bold">{log.liters} Liters</td>
                          <td className="py-3">{log.fat}%</td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleDeleteYield(log.id)}
                              className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CATTLE REGISTRY & VACCINES ================= */}
        {activeTab === 'cattle' && (
          <div className="space-y-6">
            
            {/* Header section with add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">My Cattle Herd</h2>
                <p className="text-xs text-slate-500">Track cattle counts, breeds, and vaccinations schedules</p>
              </div>

              <button 
                onClick={() => setShowAddCattleModal(true)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 self-start"
              >
                <Plus size={16} weight="bold" />
                Register New Cattle
              </button>
            </div>

            {/* Cattle Registry Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cattleList.map((cow) => (
                <div key={cow.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl space-y-5 relative group overflow-hidden">
                  
                  {/* Status Indicator */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800 dark:text-slate-100">{cow.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">{cow.age}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold">{cow.breed}</p>
                    </div>

                    <button 
                      onClick={() => handleDeleteCattle(cow.id)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800/60 py-3.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Daily Milk Yield</span>
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{cow.lastMilk}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Vaccine Status</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{cow.vaccineStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <Calendar size={16} className="text-emerald-500 shrink-0" />
                    <span>Next Vaccine Dose: <span className="text-slate-800 dark:text-slate-200">{cow.nextVaccine}</span></span>
                  </div>

                  {/* Vaccine Notification banner for Free tier restriction mockup */}
                  {!user?.isPremium && (
                    <div className="mt-2 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Warning size={14} weight="fill" />
                        Vaccine notifications locked
                      </span>
                      <button 
                        onClick={() => setShowPaywall(true)}
                        className="text-[9px] font-black text-amber-500 hover:underline uppercase"
                      >
                        Unlock
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Gold Monetization Banner */}
            {!user?.isPremium && (
              <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent rounded-[2rem] p-6 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Crown size={24} weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-800 dark:text-amber-300">Unlock Full Cattle Intelligence & Reminders</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                      Free accounts can registry up to 2 cows/buffaloes. Upgrade to Kisan Gold to list unlimited animals, get SMS vaccine reminders, and unlock AI veterinary diagnosis logs.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPaywall(true)}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-black rounded-xl shadow-md hover:scale-[1.01] transition-all whitespace-nowrap"
                >
                  Upgrade to Gold
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: DIRECT DAIRY MARKETPLACE ================= */}
        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Listing Column */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Sell Dairy Products</h3>
                  <p className="text-xs text-slate-500">Sell Milk and Paneer directly to local buyers with 0% middleman cut.</p>
                </div>

                {/* Commision info banner */}
                {!user?.isPremium ? (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                      <Warning size={16} weight="fill" />
                      5% Standard Transaction Fee
                    </div>
                    <p className="text-slate-500 leading-relaxed font-semibold">
                      Standard listings pay a 5% commission on sales. Upgrade to Kisan Gold to sell with 0% commissions and get highlighted listing badges.
                    </p>
                    <button 
                      onClick={() => setShowPaywall(true)}
                      className="text-xs font-black text-amber-500 hover:underline uppercase block"
                    >
                      Remove commission & upgrade
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={16} weight="fill" />
                      Kisan Gold: 0% Commission Active
                    </div>
                    <p className="text-slate-500 leading-relaxed font-semibold">
                      All your listings are verified and commission-free. Buyers can contact you directly!
                    </p>
                  </div>
                )}

                <form onSubmit={handleCreateListing} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Listing Title / Item</label>
                    <input 
                      type="text" required
                      value={listItem} onChange={(e) => setListItem(e.target.value)}
                      placeholder="e.g. Pure Desi Buffalo Ghee"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity Offered</label>
                    <input 
                      type="text" required
                      value={listQty} onChange={(e) => setListQty(e.target.value)}
                      placeholder="e.g. 50 Liters, 10 Kg"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Price (in ₹)</label>
                    <input 
                      type="number" required
                      value={listPrice} onChange={(e) => setListPrice(e.target.value)}
                      placeholder="e.g. 60 (for milk/L, or paneer/kg)"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={16} weight="bold" />
                    Publish Listing
                  </button>
                </form>
              </div>
            </div>

            {/* List of active marketplace offers */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">My Dairy Listings</h3>
                
                <div className="space-y-4">
                  {marketListings.map((listing) => (
                    <div key={listing.id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-800 dark:text-slate-200">{listing.item}</span>
                          {listing.isGold && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-black text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/20">
                              <Crown size={10} weight="fill" />
                              Gold Ad
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs font-medium text-slate-500">
                          <span>Qty: <span className="font-bold text-slate-700 dark:text-slate-350">{listing.quantity}</span></span>
                          <span>Price: <span className="font-bold text-emerald-600 dark:text-emerald-400">{listing.price}</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          listing.status.includes('Active')
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {listing.status}
                        </span>

                        <button 
                          onClick={() => {
                            setMarketListings(marketListings.filter(l => l.id !== listing.id));
                            toast.success('Listing deleted');
                          }}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: 24/7 VET CONSULTATION ================= */}
        {activeTab === 'vet' && (
          <div className="max-w-3xl mx-auto">
            {!user?.isPremium ? (
              /* Blocked for non-premium users */
              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-xl border border-white/5 space-y-8 text-center relative overflow-hidden">
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative inline-flex">
                  <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg animate-bounce">
                    <VideoCamera size={38} weight="fill" />
                  </div>
                </div>

                <div className="space-y-3 max-w-md mx-auto">
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                    24/7 Live Veterinary Calls
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    Instantly connect with certified veterinary doctors for livestock support, vaccine questions, emergency disease diagnosis, and health certifications.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl max-w-sm mx-auto border border-white/10 text-left space-y-2 text-xs text-slate-300">
                  <div className="flex gap-2.5">
                    <CheckCircle size={16} className="text-amber-400 shrink-0" weight="fill" />
                    <span>Average waiting time &lt; 2 minutes</span>
                  </div>
                  <div className="flex gap-2.5">
                    <CheckCircle size={16} className="text-amber-400 shrink-0" weight="fill" />
                    <span>Video call support with digital prescriptions</span>
                  </div>
                  <div className="flex gap-2.5">
                    <CheckCircle size={16} className="text-amber-400 shrink-0" weight="fill" />
                    <span>Certified experts from state universities</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPaywall(true)}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all inline-flex items-center gap-2 uppercase tracking-wider"
                >
                  <Crown size={16} weight="fill" />
                  Unlock Kisan Gold
                </button>
              </div>
            ) : (
              /* Allowed for Kisan Gold members */
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 border border-slate-200/40 dark:border-slate-800/40 rounded-[2.5rem] shadow-xl text-center space-y-8">
                
                {isCalling ? (
                  /* Call in progress simulator */
                  <div className="space-y-6">
                    <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl shadow-emerald-500/25">
                      <img 
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
                        alt="Vet Dr. Patel" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                        <span className="px-2 py-0.5 bg-red-600 text-[8px] font-black rounded text-white animate-pulse">LIVE</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dr. Rajesh Patel (Vet Surgeon)</h4>
                      <p className="text-xs text-emerald-500 font-semibold flex items-center justify-center gap-1">
                        <Activity size={14} className="animate-spin" />
                        Connected • {formatTime(callTimer)}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                      Discuss your livestock symptoms. Dr. Patel can examine the animal via your camera and share the prescription.
                    </p>

                    <button
                      onClick={() => {
                        setIsCalling(false);
                        toast.success('Consultation Call Ended. Prescription will be generated in your dashboard shortly.');
                      }}
                      className="px-6 py-3.5 bg-red-650 hover:bg-red-700 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      <VideoCamera size={16} weight="bold" />
                      End Consult Call
                    </button>
                  </div>
                ) : (
                  /* Direct call setup */
                  <div className="space-y-6 py-6">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                      <VideoCamera size={36} weight="duotone" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Priority Vet Doctor Consultation</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Your Kisan Gold membership gives you direct access. 3 Doctors are currently online in your region.
                      </p>
                    </div>

                    <div className="p-5 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/30 text-left max-w-md mx-auto space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100" alt="Doctor" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-805 dark:text-slate-200 block">Dr. R. Patel</span>
                            <span className="text-[9px] font-semibold text-slate-400">Veterinary Med Specialist</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Available</span>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-200/30 pt-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100" alt="Doctor" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-805 dark:text-slate-200 block">Dr. Sunita Sharma</span>
                            <span className="text-[9px] font-semibold text-slate-400">Livestock Vaccine Officer</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Available</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsCalling(true);
                        toast.success('Ringing Vet Dr. Patel...');
                      }}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.01] transition-all inline-flex items-center gap-2"
                    >
                      <VideoCamera size={18} weight="fill" />
                      Start Consultation Call (Free)
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>

      {/* Paywall Integration */}
      <GoldPaywall 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        onUnlock={async () => {
          try {
            await updateUser({ isPremium: true });
          } catch (err) {
            toast.error('Failed to sync premium status with database');
          }
        }} 
      />
    </div>
  );
}
