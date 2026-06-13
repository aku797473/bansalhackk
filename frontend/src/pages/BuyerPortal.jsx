import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { buyerAPI, paymentAPI } from '../services/api';
import {
  X, MagnifyingGlass, MapPin, ShoppingCart, Crown, ShieldCheck,
  ArrowLeft, Camera, MapTrifold, User, Plus, Trash, Phone,
  Package, Tag, Star, Storefront, HandCoins, Bell, ChatCircleText
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

const FALLBACK_SELLERS = [
  {
    _id: 's1', farmerName: 'Ramesh Patel', produceName: 'Premium Sharbati Wheat',
    category: 'grains', quantity: 120, unit: 'quintal', price: 2450,
    description: 'High-quality Sharbati wheat, organic farming, dry and clean stock ready for transport.',
    location: { district: 'Satna', state: 'Madhya Pradesh', village: 'Rampur' },
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=500&auto=format&fit=crop'],
    status: 'available', phone: '9876543210'
  },
  {
    _id: 's2', farmerName: 'Suresh Kumar', produceName: 'Organic Red Potatoes',
    category: 'vegetables', quantity: 80, unit: 'quintal', price: 1200,
    description: 'Medium size red potatoes, harvested last week, stored in optimal temperature.',
    location: { district: 'Indore', state: 'Madhya Pradesh', village: 'Mhow' },
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=500&auto=format&fit=crop'],
    status: 'available', phone: '9988776655'
  },
  {
    _id: 's3', farmerName: 'Harpreet Singh', produceName: 'Basmati Rice (1121)',
    category: 'grains', quantity: 250, unit: 'quintal', price: 6800,
    description: 'Extra long grain Basmati rice, premium aroma and milling quality.',
    location: { district: 'Amritsar', state: 'Punjab', village: 'Rayya' },
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500&auto=format&fit=crop'],
    status: 'available', phone: '9871234567'
  },
  {
    _id: 's4', farmerName: 'Meena Devi', produceName: 'Fresh Turmeric',
    category: 'spices', quantity: 30, unit: 'quintal', price: 9500,
    description: 'Freshly harvested turmeric with high curcumin content, no pesticides used.',
    location: { district: 'Erode', state: 'Tamil Nadu', village: 'Bhavani' },
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=500&auto=format&fit=crop'],
    status: 'available', phone: '9443216789'
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

// Local buyer requirements (stored in localStorage)
const loadBuyerRequirements = () => {
  try { return JSON.parse(localStorage.getItem('sk_buyer_reqs') || '[]'); } catch { return []; }
};
const saveBuyerRequirements = (reqs) => {
  localStorage.setItem('sk_buyer_reqs', JSON.stringify(reqs));
};

export default function BuyerPortal() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user, updateUser } = useAuth();

  const [tab, setTab] = useState('browse'); // 'browse' = see sellers, 'post' = post buying requirement
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [myRequirements, setMyRequirements] = useState(loadBuyerRequirements);

  // Buyer requirement form
  const [reqForm, setReqForm] = useState({
    produceName: '', category: 'grains', quantityNeeded: '',
    unit: 'quintal', maxPrice: '', state: 'Madhya Pradesh',
    district: '', contactName: user?.name || '', phone: user?.phone || '',
    notes: ''
  });

  useEffect(() => { fetchSellers(); }, [selectedCategory]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const res = await buyerAPI.getListings(params);
      if (res.data.data?.length > 0) setSellers(res.data.data);
      else setSellers(FALLBACK_SELLERS);
    } catch {
      setSellers(FALLBACK_SELLERS);
    } finally { setLoading(false); }
  };

  const handlePostRequirement = () => {
    if (!reqForm.produceName || !reqForm.quantityNeeded || !reqForm.maxPrice || !reqForm.district || !reqForm.contactName) {
      toast.error('सभी जरूरी फील्ड भरें'); return;
    }
    const newReq = {
      id: Date.now(), ...reqForm,
      postedAt: new Date().toLocaleDateString('hi-IN'),
      status: 'active'
    };
    const updated = [newReq, ...myRequirements];
    setMyRequirements(updated);
    saveBuyerRequirements(updated);
    toast.success('✅ खरीद मांग पोस्ट हो गई! किसान देख सकेंगे।');
    setReqForm({
      produceName: '', category: 'grains', quantityNeeded: '', unit: 'quintal',
      maxPrice: '', state: 'Madhya Pradesh', district: '', contactName: user?.name || '',
      phone: user?.phone || '', notes: ''
    });
    setTab('browse');
  };

  const deleteRequirement = (id) => {
    const updated = myRequirements.filter(r => r.id !== id);
    setMyRequirements(updated);
    saveBuyerRequirements(updated);
    toast.success('मांग हटा दी गई');
  };

  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const handleBuyCrop = async (listing) => {
    setProcessingPayment(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) { toast.error('Payment gateway failed to load'); return; }
      const totalCost = listing.price * listing.quantity;
      const depositRate = user?.isPremium ? 0.05 : 0.1;
      const depositAmount = Math.round(totalCost * depositRate);
      const { data: order } = await paymentAPI.createOrder(depositAmount);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount, currency: order.currency,
        name: 'Smart Kisan', description: `${listing.produceName} booking deposit`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data: v } = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (v.status !== 'success' && !v.success) { toast.error('Payment verification failed'); return; }
            await buyerAPI.createOrder({ listingId: listing._id, quantity: listing.quantity, totalAmount: totalCost, razorpayOrderId: order.id, razorpayPaymentId: response.razorpay_payment_id });
            toast.success('✅ Booking Confirmed!'); setSelectedSeller(null); fetchSellers();
          } catch (err) { toast.error('Verification failed: ' + (err.response?.data?.message || err.message)); }
        },
        prefill: { name: user?.name, contact: user?.phone }, theme: { color: '#0ea5e9' }
      };
      if (order.isMock) {
        if (window.confirm(`[DEMO] Simulate ₹${(order.amount / 100).toFixed(0)} payment?`)) {
          await options.handler({ razorpay_order_id: order.id, razorpay_payment_id: 'pay_mock_' + Date.now(), razorpay_signature: 'mock' });
        }
        return;
      }
      new window.Razorpay(options).open();
    } catch { toast.error('Payment failed'); } finally { setProcessingPayment(false); }
  };

  const filteredSellers = sellers.filter(l => {
    const s = searchTerm.toLowerCase();
    return (l.produceName || '').toLowerCase().includes(s) ||
      (l.farmerName || '').toLowerCase().includes(s) ||
      (l.location?.district || '').toLowerCase().includes(s) ||
      (l.location?.state || '').toLowerCase().includes(s);
  });

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-800/50 rounded-full text-xs font-black text-sky-700 dark:text-sky-400 mb-3">
              <ShoppingCart size={12} weight="fill" /> खरीदार पोर्टल
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight font-outfit">
              किसान बाजार — खरीदें 🛒
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-semibold max-w-xl leading-relaxed text-sm mt-2">
              यहाँ देखें कौन-कौन किसान अपनी फसल बेच रहे हैं। पसंद की फसल बुक करें या अपनी खरीद मांग पोस्ट करें।
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <button onClick={() => setTab('browse')}
              className={clsx("px-6 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300",
                tab === 'browse' ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
              🌾 बिकने वाली फसलें
            </button>
            <button onClick={() => setTab('post')}
              className={clsx("px-6 py-3.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300",
                tab === 'post' ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
              📋 मेरी मांग पोस्ट करें
            </button>
          </div>
        </div>

        {/* ── BROWSE — Seller Listings ── */}
        {tab === 'browse' && (
          <>
            {/* Search + Category filter */}
            <div className="flex flex-col lg:flex-row gap-4 mb-10">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} weight="bold" />
                <input
                  type="text" placeholder="फसल, किसान, जिला खोजें..."
                  className="w-full pl-14 pr-5 h-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {CROP_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={clsx("px-4 py-3 rounded-2xl whitespace-nowrap font-black text-xs tracking-wide uppercase transition-all flex items-center gap-2 border shadow-sm",
                      selectedCategory === cat.id
                        ? "bg-sky-600 text-white border-sky-500 shadow-sky-500/20 scale-105"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-sky-400")}>
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* My active requirements banner */}
            {myRequirements.length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Bell size={20} weight="fill" className="text-emerald-600" />
                  <div>
                    <p className="font-black text-sm text-emerald-800 dark:text-emerald-300">आपकी {myRequirements.length} सक्रिय खरीद मांगें हैं</p>
                    <p className="text-xs text-slate-500">किसान आपकी मांगें देख सकते हैं और संपर्क कर सकते हैं</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {myRequirements.slice(0, 2).map(r => (
                    <span key={r.id} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-1.5">
                      🌾 {r.produceName} — {r.quantityNeeded} {r.unit}
                      <button onClick={() => deleteRequirement(r.id)} className="text-red-400 hover:text-red-600 ml-1"><X size={10} weight="bold" /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sellers Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] animate-pulse" />)}
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🌾</div>
                <p className="text-xl font-black text-slate-900 dark:text-white mb-2">कोई फसल नहीं मिली</p>
                <p className="text-slate-500 text-sm">दूसरी श्रेणी आजमाएं या खोज बदलें</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSellers.map(listing => {
                  const img = listing.images?.[0] || CAT_IMAGES[listing.category] || CAT_IMAGES.other;
                  const isPremium = listing.farmerIsPremium;
                  return (
                    <div key={listing._id} onClick={() => setSelectedSeller(listing)}
                      className={clsx("rounded-[2rem] overflow-hidden shadow-sm cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                        isPremium
                          ? "border-2 border-amber-400 dark:border-amber-500/60 bg-gradient-to-b from-amber-50 to-white dark:from-amber-500/5 dark:to-slate-900"
                          : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900")}>
                      <div className="h-44 relative overflow-hidden">
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={listing.produceName} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {isPremium && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500 text-slate-950 rounded-full text-[9px] font-black flex items-center gap-1">
                            <Crown size={10} weight="fill" /> Gold किसान
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 rounded-full text-[10px] font-black text-sky-600">{listing.category}</div>
                        <div className="absolute bottom-3 left-3 text-white">
                          <p className="font-black text-lg leading-tight">{listing.produceName}</p>
                          <p className="text-xs text-white/70 flex items-center gap-1"><MapPin size={10} weight="fill" /> {listing.location?.district}, {listing.location?.state}</p>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-xs font-black text-sky-600 border border-sky-100 dark:border-sky-500/20">
                              {(listing.farmerName || 'F').charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-700 dark:text-slate-300">{listing.farmerName}</p>
                              <p className="text-[10px] font-semibold text-emerald-600">किसान ✓</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-sky-600 dark:text-sky-400">₹{listing.price}<span className="text-xs text-slate-400">/{listing.unit}</span></p>
                            <p className="text-[10px] text-slate-400">{listing.quantity} {listing.unit} उपलब्ध</p>
                          </div>
                        </div>
                        <button className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
                          <ShoppingCart size={14} weight="fill" /> विवरण देखें & बुक करें
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── POST — Buyer Requirement ── */}
        {tab === 'post' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center">
                  <HandCoins size={24} weight="fill" className="text-sky-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">खरीद मांग पोस्ट करें</h2>
                  <p className="text-xs text-slate-500 mt-0.5">किसान आपकी जरूरत देखकर सीधे संपर्क करेंगे</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">फसल का नाम *</label>
                    <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      placeholder="जैसे: गेहूं, सोयाबीन, प्याज" value={reqForm.produceName}
                      onChange={e => setReqForm({ ...reqForm, produceName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">श्रेणी *</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      value={reqForm.category} onChange={e => setReqForm({ ...reqForm, category: e.target.value })}>
                      {CROP_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">चाहिए मात्रा *</label>
                    <input type="number" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      placeholder="50" value={reqForm.quantityNeeded}
                      onChange={e => setReqForm({ ...reqForm, quantityNeeded: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">इकाई</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      value={reqForm.unit} onChange={e => setReqForm({ ...reqForm, unit: e.target.value })}>
                      <option value="quintal">क्विंटल</option>
                      <option value="kg">किलोग्राम</option>
                      <option value="ton">टन</option>
                      <option value="bag">बोरी</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">अधिकतम कीमत (₹/इकाई) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input type="number" className="w-full h-12 pl-8 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                        placeholder="2500" value={reqForm.maxPrice}
                        onChange={e => setReqForm({ ...reqForm, maxPrice: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">राज्य *</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      value={reqForm.state} onChange={e => setReqForm({ ...reqForm, state: e.target.value, district: STATES_DATA[e.target.value]?.[0] || '' })}>
                      {Object.keys(STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">जिला *</label>
                    <select className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      value={reqForm.district} onChange={e => setReqForm({ ...reqForm, district: e.target.value })}>
                      {STATES_DATA[reqForm.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">संपर्क नाम *</label>
                    <input className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      placeholder="आपका नाम" value={reqForm.contactName}
                      onChange={e => setReqForm({ ...reqForm, contactName: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">मोबाइल नंबर</label>
                    <input type="tel" className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500"
                      placeholder="9876543210" value={reqForm.phone}
                      onChange={e => setReqForm({ ...reqForm, phone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-500 mb-1.5 block uppercase tracking-wide">अतिरिक्त जानकारी</label>
                  <textarea className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-sky-500 min-h-[80px] resize-none"
                    placeholder="गुणवत्ता, ग्रेड, डिलीवरी की जरूरत, आदि..."
                    value={reqForm.notes} onChange={e => setReqForm({ ...reqForm, notes: e.target.value })} />
                </div>

                <button onClick={handlePostRequirement}
                  className="w-full h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black text-sm uppercase tracking-wide shadow-xl shadow-sky-500/25 transition-all active:scale-95 flex items-center justify-center gap-3">
                  <Bell size={18} weight="fill" /> खरीद मांग पोस्ट करें
                </button>
              </div>
            </div>

            {/* My active requirements */}
            {myRequirements.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                  <Package size={16} className="text-sky-600" /> मेरी सक्रिय मांगें
                </h3>
                <div className="space-y-3">
                  {myRequirements.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-50 dark:bg-sky-500/10 rounded-xl flex items-center justify-center text-lg">🌾</div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{r.produceName}</p>
                          <p className="text-xs text-slate-500">{r.quantityNeeded} {r.unit} • ₹{r.maxPrice}/unit • {r.district}, {r.state}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-100 dark:border-emerald-500/20 uppercase">सक्रिय</span>
                        <button onClick={() => deleteRequirement(r.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Trash size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seller Detail Modal */}
        {selectedSeller && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl z-[2000] flex items-center justify-center p-4" onClick={() => setSelectedSeller(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-400"
              onClick={e => e.stopPropagation()}>
              {/* Image panel */}
              <div className="md:w-2/5 relative bg-slate-100 dark:bg-slate-800 min-h-[220px] md:min-h-0">
                <img src={selectedSeller.images?.[0] || CAT_IMAGES[selectedSeller.category] || CAT_IMAGES.other}
                  className="w-full h-full object-cover absolute inset-0" alt={selectedSeller.produceName} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button onClick={() => setSelectedSeller(null)} className="absolute top-4 left-4 md:hidden p-2.5 bg-white/20 backdrop-blur text-white rounded-xl"><ArrowLeft weight="bold" /></button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="px-2.5 py-1 bg-sky-600 rounded-full text-[10px] font-black uppercase block w-max mb-2">{selectedSeller.category}</span>
                  <h2 className="text-2xl font-black font-outfit leading-tight mb-1">{selectedSeller.produceName}</h2>
                  <p className="text-sm text-white/70 flex items-center gap-1.5"><MapPin size={12} weight="fill" className="text-sky-400" />
                    {selectedSeller.location?.village && `${selectedSeller.location.village}, `}{selectedSeller.location?.district}, {selectedSeller.location?.state}</p>
                </div>
              </div>

              {/* Content panel */}
              <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
                <div className="flex justify-end mb-4 hidden md:flex">
                  <button onClick={() => setSelectedSeller(null)} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"><X weight="bold" /></button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'किसान', val: selectedSeller.farmerName, icon: <User size={14} className="text-sky-600" /> },
                    { label: 'उपलब्ध', val: `${selectedSeller.quantity} ${selectedSeller.unit}`, icon: <Package size={14} className="text-emerald-600" /> },
                    { label: 'कीमत', val: `₹${selectedSeller.price}/${selectedSeller.unit}`, icon: <Tag size={14} className="text-amber-600" /> },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-1 mb-1">{item.icon}<span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{item.label}</span></div>
                      <p className="font-black text-sm text-slate-900 dark:text-white leading-tight">{item.val}</p>
                    </div>
                  ))}
                </div>

                {selectedSeller.description && (
                  <div className="mb-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wide mb-2">किसान की जानकारी</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 leading-relaxed">{selectedSeller.description}</p>
                  </div>
                )}

                {/* Contact (WhatsApp) */}
                <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-0.5">किसान से सीधे बात करें</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {user?.isPremium ? `+91 ${selectedSeller.phone || '9876543210'}` : '+91 ••••• •••••'}
                    </p>
                  </div>
                  {user?.isPremium ? (
                    <a href={`https://wa.me/91${selectedSeller.phone || '9876543210'}?text=नमस्ते! मैं Smart Kisan से ${selectedSeller.produceName} के बारे में पूछना चाहता हूं।`}
                      target="_blank" rel="noreferrer"
                      className="px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#22c35e] transition-all shadow-lg">
                      <ChatCircleText size={16} weight="fill" /> WhatsApp
                    </a>
                  ) : (
                    <button onClick={() => setShowPaywall(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-xl text-[10px] font-black flex items-center gap-1.5">
                      <Crown size={12} weight="fill" /> Gold Unlock
                    </button>
                  )}
                </div>

                {/* Book & Pay */}
                <div className="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-500/10 dark:to-indigo-500/10 rounded-2xl p-5 border border-sky-100 dark:border-sky-800/50">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">सुरक्षा जमा ({user?.isPremium ? '5%' : '10%'})</p>
                      <p className="text-3xl font-black text-sky-600 font-outfit">
                        ₹{Math.round(selectedSeller.price * selectedSeller.quantity * (user?.isPremium ? 0.05 : 0.1)).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">कुल: ₹{(selectedSeller.price * selectedSeller.quantity).toLocaleString()}</p>
                    </div>
                    {user?.isPremium && (
                      <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-black rounded-xl border border-amber-100 dark:border-amber-800/50 flex items-center gap-1">
                        <Crown size={10} weight="fill" /> Gold: सिर्फ 5% जमा
                      </span>
                    )}
                  </div>
                  <button onClick={() => handleBuyCrop(selectedSeller)} disabled={processingPayment}
                    className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-lg shadow-sky-500/25 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    <ShoppingCart size={16} weight="fill" />
                    {processingPayment ? 'प्रोसेसिंग...' : `${user?.isPremium ? '5%' : '10%'} जमा करें & बुक करें`}
                  </button>
                </div>
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
