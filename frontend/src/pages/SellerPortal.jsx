import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { buyerAPI, paymentAPI } from '../services/api';
import {
  X, MagnifyingGlass, MapPin, Crown, ShieldCheck,
  ArrowLeft, Camera, MapTrifold, User, Plus, Trash,
  Package, Tag, Star, Storefront, HandCoins, Bell,
  ChatCircleText, ShoppingBag, Phone,
  NavigationArrow, Clock, ArrowUp, ArrowDown
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';
import { STATES_DATA } from '../data/regions';
import GoldPaywall from '../components/GoldPaywall';

const CROP_CATEGORIES = [
  { id: 'all', label: 'सभी', icon: '🌾' },
  { id: 'grains', label: 'अनाज', icon: '🌾' },
  { id: 'vegetables', label: 'सब्जियां', icon: '🥕' },
  { id: 'fruits', label: 'फल', icon: '🍎' },
  { id: 'pulses', label: 'दालें', icon: '🫘' },
  { id: 'oilseeds', label: 'तिलहन', icon: '🌻' },
  { id: 'spices', label: 'मसाले', icon: '🌶️' },
];

// Fallback buyer requirements that sellers can see
const FALLBACK_BUYER_REQS = [
  {
    id: 'br1', produceName: 'Wheat / गेहूं', category: 'grains',
    quantityNeeded: 200, unit: 'quintal', maxPrice: 2500,
    contactName: 'Bharat Traders', phone: '9988776655',
    district: 'Indore', state: 'Madhya Pradesh',
    notes: 'Grade A quality required, delivery to Indore Mandi accepted.',
    postedAt: '12/06/2026', status: 'active'
  },
  {
    id: 'br2', produceName: 'Soybean / सोयाबीन', category: 'oilseeds',
    quantityNeeded: 100, unit: 'quintal', maxPrice: 4800,
    contactName: 'Ramesh Oil Mill', phone: '9876543210',
    district: 'Ujjain', state: 'Madhya Pradesh',
    notes: 'Moisture under 12%, immediate purchase, will send truck.',
    postedAt: '11/06/2026', status: 'active'
  },
  {
    id: 'br3', produceName: 'Onion / प्याज', category: 'vegetables',
    quantityNeeded: 50, unit: 'quintal', maxPrice: 1800,
    contactName: 'Delhi Vendor Sanjay', phone: '9871234567',
    district: 'Nashik', state: 'Maharashtra',
    notes: 'Medium size preferred. Can arrange pickup.',
    postedAt: '10/06/2026', status: 'active'
  },
  {
    id: 'br4', produceName: 'Basmati Rice / बासमती', category: 'grains',
    quantityNeeded: 300, unit: 'quintal', maxPrice: 7000,
    contactName: 'Punjab Rice Exports', phone: '9812345678',
    district: 'Amritsar', state: 'Punjab',
    notes: '1121 or 1509 variety needed. Export quality.',
    postedAt: '09/06/2026', status: 'active'
  },
];

const CAT_IMAGES = {
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=500&auto=format&fit=crop',
  vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=500&auto=format&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=500&auto=format&fit=crop',
  pulses: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=500&auto=format&fit=crop',
  oilseeds: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=500&auto=format&fit=crop',
  spices: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=500&auto=format&fit=crop',
  other: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop'
};

// Haversine distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Merge localStorage buyer reqs with fallback
const loadAllBuyerRequirements = () => {
  try {
    const local = JSON.parse(localStorage.getItem('sk_buyer_reqs') || '[]');
    return [...local, ...FALLBACK_BUYER_REQS];
  } catch { return FALLBACK_BUYER_REQS; }
};

export default function SellerPortal() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user, updateUser } = useAuth();

  const [tab, setTab] = useState('browse'); // 'browse' = see buyer demands, 'post' = post crop listing
  const [buyerReqs, setBuyerReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [sortBy, setSortBy] = useState('latest');
  const [userGPS, setUserGPS] = useState(null);

  // Seller listing form
  const [listForm, setListForm] = useState({
    produceName: '', category: 'grains', quantity: '',
    unit: 'quintal', price: '', description: '',
    state: 'Madhya Pradesh', district: '', village: '',
    lat: null, lng: null, image: null,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBuyerReqs(loadAllBuyerRequirements());
      setLoading(false);
    }, 600);
    fetchMyListings();
    // Auto-get GPS for distance sorting
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserGPS({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => {}, { timeout: 8000 }
      );
    }
  }, []);

  const fetchMyListings = async () => {
    try {
      const res = await buyerAPI.getListings({});
      if (res.data.data?.length > 0) {
        const myName = user?.name;
        setMyListings(res.data.data.filter(l => l.farmerName === myName));
      }
    } catch {}
  };

  const handlePostListing = async () => {
    if (!listForm.produceName || !listForm.quantity || !listForm.price || !listForm.district) {
      toast.error('सभी जरूरी फील्ड भरें'); return;
    }
    if (myListings.length >= 2 && !user?.isPremium) {
      setShowPaywall(true);
      toast.error('Free tier: सिर्फ 2 listing। Kisan Gold upgrade करें।');
      return;
    }
    setLoading(true);
    try {
      await buyerAPI.createListing({
        farmerName: user?.name || 'किसान',
        produceName: listForm.produceName, category: listForm.category,
        quantity: Number(listForm.quantity), unit: listForm.unit,
        price: Number(listForm.price), description: listForm.description,
        images: listForm.image ? [listForm.image] : [],
        farmerIsPremium: user?.isPremium || false,
        location: { district: listForm.district, state: listForm.state, village: listForm.village, lat: listForm.lat, lng: listForm.lng }
      });
      toast.success('✅ फसल लिस्ट हो गई! खरीदार देख सकेंगे।');
      setTab('browse');
      fetchMyListings();
      setListForm({ produceName: '', category: 'grains', quantity: '', unit: 'quintal', price: '', description: '', state: 'Madhya Pradesh', district: '', village: '', lat: null, lng: null, image: null });
    } catch (err) {
      toast.error('Listing failed: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS नहीं मिला'); return; }
    const id = toast.loading('GPS location ले रहे हैं...');
    navigator.geolocation.getCurrentPosition(
      p => { setListForm(prev => ({ ...prev, lat: p.coords.latitude, lng: p.coords.longitude })); toast.success('📍 Location मिल गई!', { id }); },
      () => toast.error('Location denied', { id }),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const filteredReqs = buyerReqs
    .filter(r => {
      const s = searchTerm.toLowerCase();
      const catOk = selectedCategory === 'all' || r.category === selectedCategory;
      const searchOk = !s || (r.produceName || '').toLowerCase().includes(s) ||
        (r.district || '').toLowerCase().includes(s) || (r.state || '').toLowerCase().includes(s) ||
        (r.contactName || '').toLowerCase().includes(s);
      return catOk && searchOk;
    })
    .map(r => ({
      ...r,
      _dist: getDistance(userGPS?.lat, userGPS?.lon,
        r.lat || null, r.lng || null) // buyer reqs may not have GPS but try
    }))
    .sort((a, b) => {
      if (sortBy === 'nearest') {
        if (a._dist === null) return 1; if (b._dist === null) return -1;
        return a._dist - b._dist;
      }
      if (sortBy === 'price_asc') return (a.maxPrice || 0) - (b.maxPrice || 0);
      if (sortBy === 'price_desc') return (b.maxPrice || 0) - (a.maxPrice || 0);
      // latest: by id desc
      return (String(b.id) || '').localeCompare(String(a.id) || '');
    });

  const CAT_COLORS = {
    grains: 'amber', vegetables: 'emerald', fruits: 'orange',
    pulses: 'purple', oilseeds: 'yellow', spices: 'red', other: 'slate'
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/50 rounded-full text-xs font-black text-emerald-700 dark:text-emerald-400 mb-3">
              <Storefront size={12} weight="fill" /> विक्रेता पोर्टल
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-outfit">
              किसान बाजार — बेचें 🌾
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold max-w-xl leading-relaxed text-sm mt-2">
              यहाँ देखें कौन-कौन खरीदार फसल खरीदना चाहते हैं। अपनी जरूरत के हिसाब से खरीदार से संपर्क करें या अपनी फसल लिस्ट करें।
            </p>
          </div>

          <div className="flex gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <button onClick={() => setTab('browse')}
              className={clsx("px-6 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300",
                tab === 'browse' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
              🛒 खरीदार की मांगें
            </button>
            <button onClick={() => setTab('post')}
              className={clsx("px-6 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300",
                tab === 'post' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
              📋 फसल बेचें
            </button>
          </div>
        </div>

        {/* ── BROWSE — Buyer Requirements ── */}
        {tab === 'browse' && (
          <>
            {/* Info banner */}
            <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Bell size={18} weight="fill" className="text-emerald-600" />
              </div>
              <div>
                <p className="font-black text-sm text-emerald-800 dark:text-emerald-300">ये खरीदार फसल खरीदना चाहते हैं!</p>
                <p className="text-xs text-slate-500 mt-0.5">जिसकी भी जरूरत आपकी फसल से मिले, उससे सीधे WhatsApp पर संपर्क करें (Gold members के लिए नंबर दिखेगा)</p>
              </div>
            </div>

            {/* Search + Sort + Filter */}
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <MagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} weight="bold" />
                  <input type="text" placeholder="फसल, खरीदार, जिला खोजें..."
                    className="w-full pl-14 pr-5 h-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                {/* Sort buttons */}
                <div className="flex gap-2 shrink-0">
                  {[
                    { id: 'latest', label: 'नया पहले', icon: <Clock size={13} weight="bold" /> },
                    { id: 'nearest', label: 'नजदीक', icon: <NavigationArrow size={13} weight="fill" /> },
                    { id: 'price_asc', label: 'कम दाम', icon: <ArrowUp size={13} weight="bold" /> },
                    { id: 'price_desc', label: 'ज्यादा दाम', icon: <ArrowDown size={13} weight="bold" /> },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setSortBy(opt.id)}
                      className={clsx('flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all whitespace-nowrap',
                        sortBy === opt.id
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-400')}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {CROP_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={clsx("px-4 py-3 rounded-2xl whitespace-nowrap font-black text-xs tracking-wide uppercase transition-all flex items-center gap-2 border shadow-sm",
                      selectedCategory === cat.id
                        ? "bg-emerald-600 text-white border-emerald-500 scale-105 shadow-emerald-500/20"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-400")}>
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer requirements grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] animate-pulse" />)}
              </div>
            ) : filteredReqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-xl font-black text-slate-900 dark:text-white mb-2">कोई मांग नहीं मिली</p>
                <p className="text-slate-500 text-sm">दूसरी श्रेणी आजमाएं</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReqs.map(req => (
                  <div key={req.id} onClick={() => setSelectedReq(req)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-600">
                    {/* Top color strip */}
                    <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400" />
                    <div className="p-6">
                      {/* Category + date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-xl border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-wide flex items-center gap-1.5">
                          {CROP_CATEGORIES.find(c => c.id === req.category)?.icon} {req.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{req.postedAt}</span>
                      </div>

                      {/* Produce name */}
                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors font-outfit mb-1 leading-tight">{req.produceName}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                        <MapPin size={11} weight="fill" className="text-red-400" /> {req.district}, {req.state}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">चाहिए मात्रा</p>
                          <p className="font-black text-sm text-slate-900 dark:text-white">{req.quantityNeeded} {req.unit}</p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">अधिकतम दाम</p>
                          <p className="font-black text-sm text-emerald-700 dark:text-emerald-400">₹{req.maxPrice}/{req.unit}</p>
                        </div>
                      </div>

                      {/* Buyer info */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-xs font-black text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                            {(req.contactName || 'B').charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{req.contactName}</p>
                            <p className="text-[10px] font-semibold text-sky-600">खरीदार 🛒</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg uppercase tracking-wide">सक्रिय</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── POST — Seller Listing ── */}
        {tab === 'post' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* My listings */}
            {myListings.length > 0 && (
              <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5">
                <p className="font-black text-sm text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <Package size={16} /> आपकी {myListings.length} सक्रिय लिस्टिंग
                </p>
                <div className="flex flex-wrap gap-2">
                  {myListings.map(l => (
                    <span key={l._id} className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                      🌾 {l.produceName} — {l.quantity} {l.unit} @ ₹{l.price}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!user?.isPremium && (
              <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Crown size={24} weight="fill" className="text-amber-500" />
                  <div>
                    <p className="font-black text-sm text-amber-800 dark:text-amber-300">0% commission + Unlimited listings</p>
                    <p className="text-xs text-slate-500">Free: 2 listings limit</p>
                  </div>
                </div>
                <button onClick={() => setShowPaywall(true)} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-md">Kisan Gold 👑</button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} weight="fill" className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">अपनी फसल बेचें</h2>
                  <p className="text-xs text-slate-500 mt-0.5">खरीदार आपकी लिस्टिंग देखकर सीधे संपर्क करेंगे</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">फसल का नाम *</label>
                    <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      placeholder="जैसे: गेहूं, सोयाबीन, प्याज" value={listForm.produceName}
                      onChange={e => setListForm({ ...listForm, produceName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">श्रेणी *</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      value={listForm.category} onChange={e => setListForm({ ...listForm, category: e.target.value })}>
                      {CROP_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">उपलब्ध मात्रा *</label>
                    <input type="number" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      placeholder="50" value={listForm.quantity} onChange={e => setListForm({ ...listForm, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">इकाई</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      value={listForm.unit} onChange={e => setListForm({ ...listForm, unit: e.target.value })}>
                      <option value="quintal">क्विंटल</option>
                      <option value="kg">किलोग्राम</option>
                      <option value="ton">टन</option>
                      <option value="bag">बोरी</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">कीमत (₹/इकाई) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input type="number" className="w-full h-12 pl-8 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                        placeholder="2400" value={listForm.price} onChange={e => setListForm({ ...listForm, price: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">राज्य *</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      value={listForm.state} onChange={e => setListForm({ ...listForm, state: e.target.value, district: STATES_DATA[e.target.value]?.[0] || '' })}>
                      {Object.keys(STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">जिला *</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                      value={listForm.district} onChange={e => setListForm({ ...listForm, district: e.target.value })}>
                      {STATES_DATA[listForm.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">गांव / पता</label>
                  <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    placeholder="गांव / मंडी / वेयरहाउस" value={listForm.village} onChange={e => setListForm({ ...listForm, village: e.target.value })} />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">फसल की जानकारी</label>
                  <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500 min-h-[80px] resize-none"
                    placeholder="गुणवत्ता, नमी, ग्रेड, कटाई तिथि आदि..."
                    value={listForm.description} onChange={e => setListForm({ ...listForm, description: e.target.value })} />
                </div>

                {/* GPS */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-sm flex items-center gap-2"><MapTrifold size={16} className="text-emerald-600" /> GPS Tag</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{listForm.lat ? `📍 ${listForm.lat.toFixed(4)}, ${listForm.lng.toFixed(4)}` : 'खरीदार आपका खेत map पर देख सकेंगे'}</p>
                  </div>
                  <button onClick={captureLocation} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
                    📍 {listForm.lat ? 'Update' : 'Tag करें'}
                  </button>
                </div>

                {/* Photo */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    {listForm.image ? <img src={listForm.image} className="w-full h-full object-cover" /> : <Camera size={24} className="text-slate-300" />}
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-700 dark:text-slate-300">फसल की फोटो</p>
                    <p className="text-xs text-slate-400 mb-2">असली फोटो से 3x ज्यादा बुकिंग आती है</p>
                    <input type="file" id="crop-img" hidden accept="image/*" onChange={e => {
                      const f = e.target.files[0]; if (!f) return;
                      const r = new FileReader(); r.onloadend = () => setListForm(prev => ({ ...prev, image: r.result })); r.readAsDataURL(f);
                    }} />
                    <label htmlFor="crop-img" className="cursor-pointer px-4 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-black border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-all">
                      {listForm.image ? 'बदलें' : 'फोटो चुनें'}
                    </label>
                  </div>
                </div>

                <button onClick={handlePostListing} disabled={loading}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                  <ShoppingBag size={18} weight="fill" />
                  {loading ? 'पोस्ट हो रहा है...' : 'फसल बिक्री के लिए पोस्ट करें'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buyer Requirement Detail Modal */}
        {selectedReq && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl z-[2000] flex items-center justify-center p-4" onClick={() => setSelectedReq(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-400"
              onClick={e => e.stopPropagation()}>
              {/* Top strip */}
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-[2.5rem]" />
              <div className="p-7 sm:p-9">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-xl uppercase tracking-wide block w-max mb-2">
                      {CROP_CATEGORIES.find(c => c.id === selectedReq.category)?.icon} {selectedReq.category}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white font-outfit">{selectedReq.produceName}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={11} weight="fill" className="text-red-400" /> {selectedReq.district}, {selectedReq.state}</p>
                  </div>
                  <button onClick={() => setSelectedReq(null)} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"><X weight="bold" size={16} /></button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">चाहिए मात्रा</p>
                    <p className="font-black text-lg text-slate-900 dark:text-white">{selectedReq.quantityNeeded} {selectedReq.unit}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">देने की कीमत</p>
                    <p className="font-black text-lg text-emerald-700 dark:text-emerald-400">₹{selectedReq.maxPrice}/{selectedReq.unit}</p>
                  </div>
                </div>

                {selectedReq.notes && (
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">खरीदार की शर्तें</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedReq.notes}</p>
                  </div>
                )}

                {/* Contact */}
                <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 mb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">खरीदार</p>
                      <p className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <User size={14} className="text-emerald-600" /> {selectedReq.contactName}
                      </p>
                      <p className="font-black text-sm font-mono mt-1 text-slate-700 dark:text-slate-300">
                        {user?.isPremium ? `+91 ${selectedReq.phone}` : '+91 ••••• •••••'}
                      </p>
                    </div>
                    {user?.isPremium ? (
                      <a href={`https://wa.me/91${selectedReq.phone}?text=नमस्ते! मैं Smart Kisan से आपकी ${selectedReq.produceName} की मांग के बारे में बात करना चाहता हूं। मेरे पास ${selectedReq.produceName} उपलब्ध है।`}
                        target="_blank" rel="noreferrer"
                        className="px-5 py-3 bg-[#25D366] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#22c35e] transition-all shadow-lg shadow-green-500/25 shrink-0">
                        <ChatCircleText size={16} weight="fill" /> WhatsApp
                      </a>
                    ) : (
                      <button onClick={() => { setSelectedReq(null); setShowPaywall(true); }}
                        className="px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-xl text-[10px] font-black flex items-center gap-1.5 shrink-0">
                        <Crown size={12} weight="fill" /> नंबर देखें
                      </button>
                    )}
                  </div>
                </div>

                <button onClick={() => { setSelectedReq(null); setTab('post'); }}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <ShoppingBag size={14} weight="fill" /> अपनी फसल लिस्ट करें
                </button>
              </div>
            </div>
          </div>
        )}

        <GoldPaywall isOpen={showPaywall} onClose={() => setShowPaywall(false)} onUnlock={async () => {
          try { await updateUser({ isPremium: true }); } catch { toast.error('Update failed'); }
        }} />
      </div>
    </div>
  );
}
