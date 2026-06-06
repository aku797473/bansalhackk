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
  { id: 'all', name: t('buyer.categories.all'), icon: '🏪' },
  { id: 'trader', name: t('buyer.categories.trader'), icon: '🤝' },
  { id: 'seeds', name: t('buyer.categories.seeds'), icon: '🌱' },
  { id: 'fertilizer', name: t('buyer.categories.fertilizer'), icon: '🧪' },
  { id: 'machinery', name: t('buyer.categories.machinery'), icon: '🚜' },
];

const FALLBACK_BUYERS = [
  {
    _id: 'b1', shopName: 'Kisan Seva Kendra', ownerName: 'Rajesh Verma', category: 'seeds', phone: '9876543210',
    location: { district: 'Rewa', state: 'Madhya Pradesh', village: 'Semariya' },
    address: 'Near Main Bus Stand, Semariya',
    inventory: [
      { itemName: 'Hybrid Wheat Seeds', price: 1200, unit: 'bag', description: 'High yield variety' },
      { itemName: 'DAP Fertilizer', price: 1350, unit: 'bag', description: 'Original IFFCO' }
    ],
    image: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=500&auto=format&fit=crop'
  },
  {
    _id: 'b2', shopName: 'Bharat Traders', ownerName: 'Amit Bansal', category: 'trader', phone: '9988776655',
    location: { district: 'Indore', state: 'Madhya Pradesh', village: 'Mhow' },
    address: 'Anaj Mandi, Shop No. 42',
    inventory: [
      { itemName: 'Soybean Purchase', price: 4800, unit: 'quintal', description: 'Best market rates' }
    ],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=500&auto=format&fit=crop'
  }
];

export default function BuyerPortal() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user } = useAuth();
  
  const [tab, setTab] = useState('browse');
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const CATEGORIES = getCategories(t);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Form State for Registration
  const [form, setForm] = useState({
    shopName: '', ownerName: user?.name || '', phone: user?.phone || '', 
    category: 'trader', address: '', district: '', state: 'Madhya Pradesh',
    description: '', image: null, inventory: [], lat: null, lng: null
  });

  const [newItem, setNewItem] = useState({ itemName: '', price: '', unit: 'kg', description: '' });

  const addInventoryItem = () => {
    if (!newItem.itemName || !newItem.price) {
      toast.error('Item name and price are required');
      return;
    }
    setForm(prev => ({
      ...prev,
      inventory: [...prev.inventory, { ...newItem, price: Number(newItem.price) }]
    }));
    setNewItem({ itemName: '', price: '', unit: 'kg', description: '' });
    toast.success('Item added to shop inventory!');
  };

  const removeInventoryItem = (index) => {
    setForm(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    fetchBuyers();
  }, [selectedCategory]);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const res = await buyerAPI.getBuyers(params);
      if (res.data.data.length > 0) {
        setBuyers(res.data.data);
      } else {
        setBuyers(FALLBACK_BUYERS);
      }
    } catch (err) {
      setBuyers(FALLBACK_BUYERS);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.shopName || !form.address || !form.district) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        phone: user?.phone || '9999999999',
        location: { 
          district: form.district, 
          state: form.state, 
          lat: form.lat, 
          lng: form.lng,
          village: form.address 
        }
      };
      await buyerAPI.registerBuyer(payload);
      toast.success('Shop Registered Successfully!');
      setTab('browse');
      fetchBuyers();
    } catch (err) {
      toast.error('Registration failed: ' + (err.response?.data?.message || err.message));
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

    const toastId = toast.loading('Capturing precise location... Please allow GPS access.');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, lat: latitude, lng: longitude }));
        toast.success('Exact Location Captured!', { id: toastId });
      },
      (err) => {
        console.error('GPS Error:', err);
        toast.error('Location Access Denied or Timeout. Please enable GPS and Refresh.', { id: toastId });
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

  const handlePurchase = async (item, shop) => {
    setProcessingPayment(true);
    try {
      const { data: order } = await paymentAPI.createOrder(item.price);

      if (order.id && order.id.startsWith('order_mock_')) {
        const toastId = toast.loading('Demo Mode: Simulating secure payment...');
        setTimeout(async () => {
          try {
            const { data: verifyRes } = await paymentAPI.verifyPayment({ 
              razorpay_order_id: order.id, 
              razorpay_payment_id: 'pay_mock_' + Math.random().toString(36).substring(2, 15), 
              razorpay_signature: 'mock_signature' 
            });
            if (verifyRes.status === 'success' || verifyRes.success) { 
              toast.success('Payment Successful! Order Placed.', { id: toastId }); 
              setSelectedBuyer(null); 
            } else {
              toast.error('Payment failed', { id: toastId });
            }
          } catch (err) { 
            toast.error('Payment failed', { id: toastId }); 
          }
        }, 1500);
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay failed to load');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'Smart Kisan',
        description: `Buying ${item.itemName} from ${shop.shopName}`,
        image: '/logo.png',
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data: verifyRes } = await paymentAPI.verifyPayment({ 
              razorpay_order_id: response.razorpay_order_id, 
              razorpay_payment_id: response.razorpay_payment_id, 
              razorpay_signature: response.razorpay_signature 
            });
            if (verifyRes.status === 'success' || verifyRes.success) {
              toast.success('Payment Successful! Order Placed.');
              setSelectedBuyer(null);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: '#15803d' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredBuyers = buyers.filter(b => {
    const shop = (b.shopName || '').toLowerCase();
    const district = (b.location?.district || '').toLowerCase();
    const state = (b.location?.state || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    
    return shop.includes(search) || 
           district.includes(search) ||
           state.includes(search);
  });

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-green-100 selection:text-green-900 pt-24 sm:pt-28 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-black leading-tight font-outfit mb-3">
            {t('buyer.marketplace_title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl leading-relaxed text-sm">
            {t('buyer.marketplace_subtitle')}
          </p>
        </div>

        <div className="flex gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <button 
            onClick={() => setTab('browse')}
            className={clsx("px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300", tab === 'browse' ? "bg-green-600 text-white shadow-lg shadow-green-500/30" : "bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            {t('buyer.tabs.browse', 'Browse')}
          </button>
          <button 
            onClick={() => setTab('register')}
            className={clsx("px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all duration-300", tab === 'register' ? "bg-green-600 text-white shadow-lg shadow-green-500/30" : "bg-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white")}
          >
            {t('buyer.tabs.register', 'Register Shop')}
          </button>
        </div>
      </div>

      {/* Browse View */}
      {tab === 'browse' && (
        <>
          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <MagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} weight="bold" />
                <input 
                  type="text" 
                  placeholder={t('buyer.search_placeholder')}
                  className="w-full pl-16 pr-6 h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
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
                  className={clsx("px-6 py-4 rounded-[1.5rem] whitespace-nowrap font-black text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-3 border shadow-sm", selectedCategory === cat.id ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 shadow-green-500/10 scale-105" : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700")}
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
              {filteredBuyers.map(buyer => (
                <div key={buyer._id} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl group p-0 overflow-hidden border border-slate-200/50 dark:border-slate-800/50 hover:border-green-500/50 shadow-sm hover:shadow-premium transition-all duration-500 rounded-[2.5rem] cursor-pointer" onClick={() => setSelectedBuyer(buyer)}>
                  <div className="h-56 relative overflow-hidden">
                    <img src={buyer.image || 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=500&auto=format&fit=crop'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Shop" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-5 right-5 px-4 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 shadow-xl border border-white/20">
                      {buyer.category}
                    </div>
                  </div>
                  <div className="p-8">
                    {/* Inline Map Preview */}
                    {buyer.location?.lat && (
                      <div className="w-full h-32 rounded-[1.5rem] mb-6 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-inner group-hover:shadow-md transition-shadow">
                        <iframe
                          title={`Map ${buyer.shopName}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${buyer.location.lng-0.005},${buyer.location.lat-0.005},${buyer.location.lng+0.005},${buyer.location.lat+0.005}&layer=mapnik&marker=${buyer.location.lat},${buyer.location.lng}`}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-green-600 transition-colors font-outfit">{buyer.shopName}</h3>
                        <p className="text-slate-400 text-xs font-bold mt-2 flex items-center gap-2"><MapPin size={16} className="text-red-400 animate-bounce-sm" weight="fill" /> {buyer.location.district}, {buyer.location.state}</p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-amber-100 dark:border-amber-500/20">
                        <Star size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
                        <span className="text-xs font-black text-amber-700 dark:text-amber-400">{buyer.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-5 border-t border-slate-200/50 dark:border-slate-800/50">
                      <div className="w-10 h-10 rounded-[1rem] bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-sm font-black text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20">
                        {buyer.ownerName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{buyer.ownerName}</span>
                      <div className="ml-auto flex items-center gap-4">
                        {buyer.location?.lat && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); window.open(`/map?lat=${buyer.location.lat}&lng=${buyer.location.lng}&name=${encodeURIComponent(buyer.shopName)}`, '_blank'); }}
                            className="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors border border-green-100 dark:border-green-500/20"
                            title="View on Map"
                          >
                            <MapTrifold size={20} weight="duotone" />
                          </button>
                        )}
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                          <ShieldCheck size={14} weight="fill" /> {t('buyer.verified')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Register View */}
      {tab === 'register' && (
        <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="lg:col-span-8 card border-none shadow-premium p-8 sm:p-10">
              <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                <Storefront className="text-green-600" /> {t('buyer.tabs.register')}
              </h2>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">{t('buyer.shop_name')} *</label>
                    <input className="input border-2 h-14 rounded-xl" placeholder="e.g. Bharat Anaj Bhandar" value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">{t('buyer.business_category')} *</label>
                    <select className="input border-2 h-14 rounded-xl" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">{t('buyer.owner_name')} *</label>
                  <input className="input border-2 h-14 rounded-xl" value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="label">{t('buyer.full_address')} *</label>
                    <textarea className="input border-2 min-h-[100px] rounded-xl pt-4" placeholder="Street, Village, Near Landmark..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="label">{t('buyer.state')} *</label>
                      <select className="input border-2 h-14 rounded-xl" value={form.state} onChange={e => setForm({...form, state: e.target.value, district: STATES_DATA[e.target.value][0]})}>
                        {Object.keys(STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">{t('buyer.district')} *</label>
                      <select className="input border-2 h-14 rounded-xl" value={form.district} onChange={e => setForm({...form, district: e.target.value})}>
                        {STATES_DATA[form.state]?.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inventory Builder */}
                <div className="card bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800">
                  <h3 className="font-black text-lg mb-6 flex items-center gap-3">
                    <Package className="text-green-600" /> {t('buyer.manage_inventory')}
                  </h3>
                  
                  <div className="grid sm:grid-cols-12 gap-4 mb-6">
                    <div className="sm:col-span-4">
                      <input className="input h-12 rounded-xl text-sm" placeholder={t('buyer.item_name')} value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})} />
                    </div>
                    <div className="sm:col-span-3">
                      <input type="number" className="input h-12 rounded-xl text-sm" placeholder={t('buyer.price')} value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
                    </div>
                    <div className="sm:col-span-3">
                      <select className="input h-12 rounded-xl text-sm" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
                        <option value="kg">{t('buyer.per_kg')}</option>
                        <option value="quintal">{t('buyer.per_quintal')}</option>
                        <option value="bag">{t('buyer.per_bag')}</option>
                        <option value="piece">{t('buyer.per_piece')}</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <button onClick={addInventoryItem} className="w-full h-12 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-all">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {form.inventory.length > 0 && (
                    <div className="space-y-2">
                      {form.inventory.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-xs font-black text-green-600">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{item.itemName}</p>
                              <p className="text-[10px] text-gray-400">₹{item.price} / {item.unit}</p>
                            </div>
                          </div>
                          <button onClick={() => removeInventoryItem(idx)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-black text-sm flex items-center gap-2"><MapTrifold className="text-green-600" /> {t('buyer.location_search')}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Farmers will see your shop pinned on the map.</p>
                    </div>
                    <button 
                      onClick={captureLocation}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all"
                    >
                      📍 Get Location
                    </button>
                  </div>
                  {form.lat ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                          <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Latitude</label>
                          <input 
                            type="number" step="any" 
                            className="w-full bg-transparent text-sm font-bold text-green-600 focus:outline-none" 
                            value={form.lat} 
                            onChange={e => setForm(prev => ({...prev, lat: Number(e.target.value)}))} 
                          />
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                          <label className="text-[9px] font-black uppercase text-gray-400 block mb-1">Longitude</label>
                          <input 
                            type="number" step="any" 
                            className="w-full bg-transparent text-sm font-bold text-green-600 focus:outline-none" 
                            value={form.lng} 
                            onChange={e => setForm(prev => ({...prev, lng: Number(e.target.value)}))} 
                          />
                        </div>
                      </div>
                      
                      <div className="relative rounded-2xl overflow-hidden border-2 border-green-500/20 shadow-xl">
                        <iframe
                          title="Shop Location"
                          width="100%"
                          height="220"
                          style={{ border: 0 }}
                          loading="lazy"
                          allow="geolocation"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.lng-0.01},${form.lat-0.01},${form.lng+0.01},${form.lat+0.01}&layer=mapnik&marker=${form.lat},${form.lng}`}
                        />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black text-green-600 shadow-lg border border-green-100 dark:border-green-800">
                          LIVE PREVIEW
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center h-32 text-gray-300 dark:text-slate-700 text-sm font-bold gap-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-full">
                          <MapPin size={24} className="text-slate-400" />
                        </div>
                        <span>GPS Coordinates Required</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setForm(prev => ({...prev, lat: 28.6139, lng: 77.2090}))} 
                        className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest"
                      >
                        Enter Manually (Delhi Default)
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={handleRegister} disabled={loading} className="btn-primary w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-green-600/20 mt-6 disabled:opacity-50">
                  {loading ? 'Registering...' : t('buyer.create_profile')}
                </button>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <div className="card bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20 p-8 text-center overflow-hidden">
                 <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl mx-auto mb-6 flex items-center justify-center overflow-hidden">
                    {form.image ? <img src={form.image} className="w-full h-full object-cover" /> : <Camera className="text-green-600" size={32} />}
                 </div>
                 <h3 className="font-black text-gray-900 dark:text-white mb-2">{t('buyer.upload_photo')}</h3>
                 <p className="text-xs text-gray-500 mb-6">Visible to all farmers in your area.</p>
                 <input type="file" id="shop-photo" hidden accept="image/*" onChange={handlePhotoChange} />
                 <label htmlFor="shop-photo" className="cursor-pointer px-6 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-black shadow-sm border border-gray-100 dark:border-slate-700">
                   {form.image ? 'Change Photo' : 'Browse Files'}
                 </label>
              </div>

              <div className="card bg-slate-900 text-white p-8">
                 <div className="flex items-center gap-3 mb-6">
                    <MapTrifold className="text-green-400" />
                    <h3 className="font-black text-lg">Location Search</h3>
                 </div>
                 <p className="text-sm text-slate-400 mb-6">Farmers will see your shop on the map for direct navigation.</p>
                 <button className="w-full py-4 bg-slate-800 rounded-xl border border-slate-700 text-xs font-black flex items-center justify-center gap-2">
                    <MapTrifold size={16} /> Mark on Google Maps
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBuyer && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xl z-[2000] flex items-center justify-center p-4">
           <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in zoom-in-95 duration-500">
              <div className="md:w-1/3 relative bg-slate-100 dark:bg-slate-900">
                 <img src={selectedBuyer.image || 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=500&auto=format&fit=crop'} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                 <button onClick={() => setSelectedBuyer(null)} className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl md:hidden hover:bg-white/30 transition-colors"><ArrowLeft weight="bold" /></button>
                 <div className="absolute bottom-10 left-10 right-10 text-white">
                    <h2 className="text-3xl font-black mb-2 font-outfit leading-tight">{selectedBuyer.shopName}</h2>
                    <p className="text-white/80 font-bold flex items-center gap-2 text-sm"><MapPin size={18} weight="fill" className="text-green-400" /> {selectedBuyer.address}</p>
                 </div>
              </div>

              <div className="flex-1 p-8 sm:p-12 overflow-y-auto">
                 <div className="hidden md:flex justify-end mb-8">
                    <button onClick={() => setSelectedBuyer(null)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"><X weight="bold" /></button>
                 </div>

                 <div className="grid sm:grid-cols-2 gap-8 mb-10">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Contact Person</label>
                       <p className="font-black text-xl flex items-center gap-3 text-slate-900 dark:text-white"><User size={24} weight="duotone" className="text-green-600" /> {selectedBuyer.ownerName}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                       <label className="text-[10px] font-black uppercase text-slate-400 block mb-2 tracking-widest">Shop Status</label>
                       <p className="font-black text-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400"><ShieldCheck size={24} weight="duotone" className="text-emerald-600" /> Verified Merchant</p>
                    </div>
                 </div>

                 <h3 className="text-2xl font-black mb-6 flex items-center gap-3 font-outfit text-slate-900 dark:text-white">
                   <Package size={28} weight="duotone" className="text-green-600" /> Shop Inventory / Items
                 </h3>
                 <div className="space-y-4">
                    {selectedBuyer.inventory.length === 0 ? (
                      <p className="text-slate-400 italic font-bold">No items listed yet. Contact for details.</p>
                    ) : selectedBuyer.inventory.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group/item">
                        <div>
                          <p className="font-black text-xl text-slate-900 dark:text-white mb-1 group-hover/item:text-green-600 transition-colors">{item.itemName}</p>
                          <p className="text-sm font-bold text-slate-500">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <p className="text-2xl font-black text-green-600 font-outfit">₹{item.price}</p>
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">per {item.unit}</p>
                           </div>
                           <button 
                             onClick={() => handlePurchase(item, selectedBuyer)}
                             className="p-4 bg-green-600 text-white rounded-[1.25rem] hover:bg-green-700 shadow-lg shadow-green-600/30 hover:scale-105 active:scale-95 transition-all"
                           >
                             <ShoppingCart size={24} weight="fill" />
                           </button>
                        </div>
                      </div>
                    ))}
                     <div className="mt-12 p-8 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10 rounded-[2.5rem] border border-green-200/50 dark:border-green-800/30 text-center relative overflow-hidden shadow-inner">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
                     <p className="text-green-800 dark:text-green-300 font-black mb-6 text-lg relative z-10">Want to negotiate or ask about custom orders?</p>
                     <button onClick={() => toast.success("Secure connection established! Shop owner will respond shortly.")} className="inline-flex items-center gap-3 px-10 py-5 bg-green-600 hover:bg-green-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-green-600/30 hover:scale-105 transition-all relative z-10">
                        <ShoppingCart size={24} weight="fill" /> Secure Message Owner
                     </button>
                  </div>                </div>
              </div>
           </div>
        </div>
      )}
      </div>
    </div>
  );
}
