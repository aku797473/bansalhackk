import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { buyerAPI, paymentAPI } from '../services/api';
import { 
  X, Bank, CurrencyInr, Info, Storefront, Plus, 
  Trash, ArrowRight, CheckCircle, Package, 
  MapPin, Phone, Truck, Calendar, ShoppingCart,
  ShoppingBag, MagnifyingGlass, Tag, CaretRight, 
  Star, Clock, ShieldCheck, ArrowLeft, Camera, Briefcase, MapTrifold, User
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';
import { STATES_DATA } from '../data/regions';

const getCategories = (t) => [
  { id: 'all', name: t('buyer_portal.categories.all', 'All Produce'), icon: '🌾' },
  { id: 'grains', name: t('buyer_portal.categories.grains', 'Grains'), icon: '🌾' },
  { id: 'vegetables', name: t('buyer_portal.categories.vegetables', 'Vegetables'), icon: '🥕' },
  { id: 'fruits', name: t('buyer_portal.categories.fruits', 'Fruits'), icon: '🍎' },
  { id: 'pulses', name: t('buyer_portal.categories.pulses', 'Pulses'), icon: '🫘' },
  { id: 'oilseeds', name: t('buyer_portal.categories.oilseeds', 'Oilseeds'), icon: '🌻' },
  { id: 'spices', name: t('buyer_portal.categories.spices', 'Spices'), icon: '🌶️' },
];

const FALLBACK_LISTINGS = [
  {
    _id: 'l1',
    farmerName: 'Ramesh Patel',
    produceName: 'Premium Sharbati Wheat',
    category: 'grains',
    quantity: 120,
    unit: 'quintal',
    price: 2450,
    description: 'High-quality Sharbati wheat, organic farming, dry and clean stock ready for transport.',
    location: { district: 'Satna', state: 'Madhya Pradesh', village: 'Rampur' },
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=500&auto=format&fit=crop'],
    status: 'available'
  },
  {
    _id: 'l2',
    farmerName: 'Suresh Kumar',
    produceName: 'Organic Red Potatoes',
    category: 'vegetables',
    quantity: 80,
    unit: 'quintal',
    price: 1200,
    description: 'Medium size red potatoes, harvested last week, stored in optimal temperature.',
    location: { district: 'Indore', state: 'Madhya Pradesh', village: 'Mhow' },
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=500&auto=format&fit=crop'],
    status: 'available'
  },
  {
    _id: 'l3',
    farmerName: 'Harpreet Singh',
    produceName: 'Basmati Rice (1121)',
    category: 'grains',
    quantity: 250,
    unit: 'quintal',
    price: 6800,
    description: 'Extra long grain Basmati rice, premium aroma and milling quality. Moisture content under 12%.',
    location: { district: 'Amritsar', state: 'Punjab', village: 'Rayya' },
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500&auto=format&fit=crop'],
    status: 'available'
  }
];

const UNSPLASH_IMAGES = {
  grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=500&auto=format&fit=crop',
  vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=500&auto=format&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?q=80&w=500&auto=format&fit=crop',
  pulses: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=500&auto=format&fit=crop',
  oilseeds: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=500&auto=format&fit=crop',
  spices: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=500&auto=format&fit=crop',
  other: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=500&auto=format&fit=crop'
};

export default function BuyerPortal() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user } = useAuth();
  
  const [tab, setTab] = useState('browse');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const CATEGORIES = getCategories(t);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Form State for Listing Creation
  const [form, setForm] = useState({
    produceName: '',
    category: 'grains',
    quantity: '',
    unit: 'quintal',
    price: '',
    description: '',
    image: null,
    district: '',
    state: 'Madhya Pradesh',
    village: '',
    lat: null,
    lng: null
  });

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const res = await buyerAPI.getListings(params);
      if (res.data.data && res.data.data.length > 0) {
        setListings(res.data.data);
      } else {
        setListings(FALLBACK_LISTINGS);
      }
    } catch (err) {
      setListings(FALLBACK_LISTINGS);
    } finally {
      setLoading(false);
    }
  };

  const handlePostListing = async () => {
    if (!form.produceName || !form.quantity || !form.price || !form.district || !form.village) {
      toast.error(t('buyer_portal.fields_required', 'Please fill all required fields'));
      return;
    }
    setLoading(true);
    try {
      const payload = {
        farmerName: user?.name || 'Anonymous Farmer',
        produceName: form.produceName,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        price: Number(form.price),
        description: form.description,
        images: form.image ? [form.image] : [],
        location: {
          district: form.district,
          state: form.state,
          village: form.village,
          lat: form.lat,
          lng: form.lng
        }
      };
      await buyerAPI.createListing(payload);
      toast.success('Crop Listed Successfully!');
      setTab('browse');
      fetchListings();
      // Reset form
      setForm({
        produceName: '', category: 'grains', quantity: '', unit: 'quintal',
        price: '', description: '', image: null, district: '', state: 'Madhya Pradesh',
        village: '', lat: null, lng: null
      });
    } catch (err) {
      toast.error('Listing creation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const toastId = toast.loading('Capturing precise GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
        toast.success('GPS Location Captured!', { id: toastId });
      },
      (err) => {
        console.error('GPS Error:', err);
        toast.error('Location Access Denied or Timeout.', { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyCrop = async (listing) => {
    setProcessingPayment(true);
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay failed to load');
        return;
      }

      // Calculate total amount
      const totalCost = listing.price * listing.quantity;
      // We take a 10% advance/booking deposit for security
      const depositAmount = Math.round(totalCost * 0.1);

      const { data: order } = await paymentAPI.createOrder(depositAmount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'Smart Kisan',
        description: `10% Deposit for ${listing.produceName} (${listing.quantity} ${listing.unit})`,
        image: '/logo.png',
        order_id: order.id,
        handler: async (response) => {
          try {
            await buyerAPI.createOrder({
              listingId: listing._id,
              quantity: listing.quantity,
              totalAmount: totalCost,
              razorpayOrderId: order.id
            });
            toast.success('Payment Successful! Crop Booking Confirmed.');
            setSelectedListing(null);
            fetchListings();
          } catch (err) {
            toast.error('Order creation failed on server');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#0ea5e9' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredListings = listings.filter(l => 
    l.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.location.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-sky-100 selection:text-sky-900 pt-24 sm:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-lg shadow-sky-500/20 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <ShoppingBag className="text-white" size={24} weight="duotone" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 font-outfit">
              {t('buyer_portal.title', 'Buyer Portal')}
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl leading-relaxed text-sm">
            {t('buyer_portal.subtitle', 'Browse premium crop listings posted by local farmers or sell your own harvests directly.')}
          </p>
        </div>

        <div className="flex gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <button 
            onClick={() => setTab('browse')}
            className={clsx("px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300", tab === 'browse' ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30" : "bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            {t('buyer_portal.tabs.browse', 'Browse Crops')}
          </button>
          <button 
            onClick={() => setTab('post')}
            className={clsx("px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300", tab === 'post' ? "bg-sky-600 text-white shadow-lg shadow-sky-500/30" : "bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            {t('buyer_portal.tabs.post', 'Sell Your Yield')}
          </button>
        </div>
      </div>

      {/* Browse View */}
      {tab === 'browse' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-indigo-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <MagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} weight="bold" />
                <input 
                  type="text" 
                  placeholder={t('buyer_portal.search_placeholder', 'Search crops, districts, or farmers...')}
                  className="w-full pl-16 pr-6 h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 lg:pb-0 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={clsx("px-6 py-4 rounded-[1.5rem] whitespace-nowrap font-black text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-3 border shadow-sm", selectedCategory === cat.id ? "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800/50 text-sky-700 dark:text-sky-400 shadow-sky-500/10 scale-105" : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700")}
                >
                  <span className="text-xl">{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-80 rounded-[2.5rem]" />)}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredListings.map(listing => {
                const imageUrl = listing.images?.[0] || UNSPLASH_IMAGES[listing.category] || UNSPLASH_IMAGES.other;
                return (
                  <div 
                    key={listing._id} 
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl group p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:border-sky-500/50 shadow-sm hover:shadow-premium transition-all duration-500 rounded-[2.5rem] cursor-pointer" 
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="h-52 relative overflow-hidden">
                      <img src={imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={listing.produceName} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-5 right-5 px-4 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-sky-600 shadow-xl border border-white/20">
                        {listing.category}
                      </div>
                    </div>
                    
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors font-outfit">{listing.produceName}</h3>
                          <p className="text-slate-400 text-xs font-bold mt-2 flex items-center gap-2">
                            <MapPin size={16} className="text-red-400 animate-bounce-sm" weight="fill" /> 
                            {listing.location?.district}, {listing.location?.state}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 px-5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 mb-6">
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Quantity</span>
                          <span className="text-lg font-black text-slate-800 dark:text-white font-outfit">{listing.quantity} {listing.unit}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Expected Price</span>
                          <span className="text-lg font-black text-sky-600 dark:text-sky-400 font-outfit">₹{listing.price}/{listing.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="w-10 h-10 rounded-[1rem] bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sm font-black text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
                          {listing.farmerName.charAt(0)}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 block">{listing.farmerName}</span>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Farmer</span>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {listing.location?.lat && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); window.open(`/map?lat=${listing.location.lat}&lng=${listing.location.lng}&name=${encodeURIComponent(listing.produceName)}`, '_blank'); }}
                              className="p-2.5 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors border border-sky-100 dark:border-sky-500/20"
                              title="View Location on Map"
                            >
                              <MapTrifold size={20} weight="duotone" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Post Yield View */}
      {tab === 'post' && (
        <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-8 card border-none shadow-premium p-8 sm:p-10">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <ShoppingBag className="text-sky-600" /> {t('buyer_portal.post_title', 'List Your Crop Yield for Sale')}
              </h2>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">{t('buyer_portal.produce_name', 'Produce/Crop Name')} *</label>
                    <input className="input border-2 h-14 rounded-xl" placeholder="e.g. Sharbati Wheat, Red Onions" value={form.produceName} onChange={e => setForm({...form, produceName: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">{t('buyer_portal.category', 'Category')} *</label>
                    <select className="input border-2 h-14 rounded-xl" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="label">{t('buyer_portal.quantity', 'Available Quantity')} *</label>
                    <input type="number" className="input border-2 h-14 rounded-xl" placeholder="e.g. 50" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">{t('buyer_portal.unit', 'Unit')} *</label>
                    <select className="input border-2 h-14 rounded-xl" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                      <option value="quintal">quintal</option>
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="bag">bag</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('buyer_portal.price_per_unit', 'Expected Price (per unit)')} *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" className="input border-2 h-14 pl-10 rounded-xl" placeholder="e.g. 2400" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">{t('buyer_portal.village', 'Village / Area Address')} *</label>
                    <textarea className="input border-2 min-h-[100px] rounded-xl pt-4" placeholder="Enter village or warehouse address..." value={form.village} onChange={e => setForm({...form, village: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="label">{t('buyer_portal.state', 'State')} *</label>
                      <select className="input border-2 h-14 rounded-xl" value={form.state} onChange={e => setForm({...form, state: e.target.value, district: STATES_DATA[e.target.value][0]})}>
                        {Object.keys(STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">{t('buyer_portal.district', 'District')} *</label>
                      <select className="input border-2 h-14 rounded-xl" value={form.district} onChange={e => setForm({...form, district: e.target.value})}>
                        {STATES_DATA[form.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label">{t('buyer_portal.description', 'Crop Quality & Details')}</label>
                  <textarea className="input border-2 min-h-[120px] rounded-xl pt-4" placeholder="Explain the crop quality, moisture content, organic status, or dispatch times..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                {/* GPS Location Capture */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-black text-sm flex items-center gap-2"><MapTrifold className="text-sky-600" /> GPS Tagging</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Embed physical GPS mapping to allow direct farm navigation.</p>
                    </div>
                    <button 
                      onClick={captureLocation}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-600/20 hover:bg-sky-700 transition-all"
                    >
                      📍 Tag Coordinates
                    </button>
                  </div>
                  {form.lat ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-sky-100 dark:border-sky-900/30">
                          <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Latitude</label>
                          <input type="number" className="w-full bg-transparent text-sm font-bold text-sky-600 focus:outline-none" value={form.lat} readOnly />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-sky-100 dark:border-sky-900/30">
                          <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Longitude</label>
                          <input type="number" className="w-full bg-transparent text-sm font-bold text-sky-600 focus:outline-none" value={form.lng} readOnly />
                        </div>
                      </div>
                      <div className="relative rounded-2xl overflow-hidden border-2 border-sky-500/20 shadow-xl">
                        <iframe
                          title="Crop Farm Location Map"
                          width="100%"
                          height="220"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.lng-0.01},${form.lat-0.01},${form.lng+0.01},${form.lat+0.01}&layer=mapnik&marker=${form.lat},${form.lng}`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-gray-300 dark:text-slate-700 text-sm font-bold gap-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <MapPin size={24} className="text-slate-400" />
                      <span>GPS Tag optional, but increases booking rate by 3x</span>
                    </div>
                  )}
                </div>

                <button onClick={handlePostListing} disabled={loading} className="btn-primary bg-sky-600 hover:bg-sky-700 w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-sky-600/20 mt-6 disabled:opacity-50">
                  {loading ? 'Posting...' : t('buyer_portal.create_listing', 'List Produce for Sale')}
                </button>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="card bg-sky-50 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/20 p-8 text-center overflow-hidden">
                 <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl mx-auto mb-6 flex items-center justify-center overflow-hidden">
                    {form.image ? <img src={form.image} className="w-full h-full object-cover" /> : <Camera className="text-sky-600" size={32} />}
                 </div>
                 <h3 className="font-black text-gray-900 dark:text-white mb-2">Upload Crop Image</h3>
                 <p className="text-xs text-gray-500 mb-6">Real images build high trust with buyers.</p>
                 <input type="file" id="crop-photo" hidden accept="image/*" onChange={handlePhotoChange} />
                 <label htmlFor="crop-photo" className="cursor-pointer px-6 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-black shadow-sm border border-gray-100 dark:border-slate-700">
                   {form.image ? 'Change Photo' : 'Browse Files'}
                 </label>
              </div>

              <div className="card bg-slate-900 text-white p-8">
                 <h3 className="font-black text-lg mb-4 flex items-center gap-3">
                   <ShieldCheck className="text-sky-400" /> Escrow Security
                 </h3>
                 <p className="text-xs text-slate-400 leading-relaxed mb-4">
                   Smart Kisan guarantees escrow security for crop bookings. Buyers pay a 10% safety deposit which is held in escrow until the produce is successfully picked up or delivered.
                 </p>
                 <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                   <ShieldCheck size={18} /> Verified Trader Network Active
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xl z-[2000] flex items-center justify-center p-4">
           <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in zoom-in-95 duration-500">
              <div className="md:w-1/3 relative bg-slate-100 dark:bg-slate-900">
                 <img src={selectedListing.images?.[0] || UNSPLASH_IMAGES[selectedListing.category] || UNSPLASH_IMAGES.other} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                 <button onClick={() => setSelectedListing(null)} className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl md:hidden hover:bg-white/30 transition-colors"><ArrowLeft weight="bold" /></button>
                 <div className="absolute bottom-10 left-10 right-10 text-white">
                    <span className="px-3 py-1 bg-sky-600 rounded-full text-[10px] font-black uppercase tracking-wider block w-max mb-3">
                      {selectedListing.category}
                    </span>
                    <h2 className="text-3xl font-black mb-2 font-outfit leading-tight">{selectedListing.produceName}</h2>
                    <p className="text-white/80 font-bold flex items-center gap-2 text-sm">
                      <MapPin size={18} weight="fill" className="text-sky-400 animate-bounce" /> 
                      {selectedListing.location?.village}, {selectedListing.location?.district}
                    </p>
                 </div>
              </div>

              <div className="flex-1 p-8 sm:p-12 overflow-y-auto">
                 <div className="hidden md:flex justify-end mb-8">
                    <button onClick={() => setSelectedListing(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"><X weight="bold" /></button>
                 </div>

                 <div className="grid sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest">Farmer Name</label>
                       <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><User size={16} className="text-sky-600" /> {selectedListing.farmerName}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest">Stock Available</label>
                       <p className="font-bold text-slate-900 dark:text-white font-outfit">{selectedListing.quantity} {selectedListing.unit}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-1 tracking-widest">Expected Price</label>
                       <p className="font-bold text-sky-600 dark:text-sky-400 font-outfit">₹{selectedListing.price} / {selectedListing.unit}</p>
                    </div>
                 </div>

                 {selectedListing.description && (
                   <div className="mb-8">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Farmer's Quality Notes</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60">{selectedListing.description}</p>
                   </div>
                 )}

                 {/* Map Preview */}
                 {selectedListing.location?.lat && (
                   <div className="mb-8">
                     <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Farm Location (GPS Embed)</h4>
                     <div className="h-44 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                       <iframe
                         title="Listing Map"
                         width="100%"
                         height="100%"
                         style={{ border: 0 }}
                         loading="lazy"
                         src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedListing.location.lng-0.005},${selectedListing.location.lat-0.005},${selectedListing.location.lng+0.005},${selectedListing.location.lat+0.005}&layer=mapnik&marker=${selectedListing.location.lat},${selectedListing.location.lng}`}
                       />
                     </div>
                   </div>
                 )}

                 <div className="p-6 bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/20 dark:to-indigo-950/10 rounded-2xl border border-sky-100 dark:border-sky-900/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div>
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Safety Booking Deposit (10%)</span>
                     <p className="text-3xl font-black text-sky-600 font-outfit">₹{Math.round(selectedListing.price * selectedListing.quantity * 0.1).toLocaleString()}</p>
                     <span className="text-[10px] text-slate-400">Total Price: ₹{(selectedListing.price * selectedListing.quantity).toLocaleString()}</span>
                   </div>
                   
                   <button 
                     onClick={() => handleBuyCrop(selectedListing)}
                     disabled={processingPayment}
                     className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black uppercase tracking-wider text-xs shadow-lg shadow-sky-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                   >
                     {processingPayment ? 'Processing...' : 'Pay 10% & Book Now'}
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      </div>
    </div>
  );
}
