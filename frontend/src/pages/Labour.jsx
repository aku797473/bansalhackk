import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { labourAPI, paymentAPI } from '../services/api';
import { Users, Plus, MapPin, Bank, X, Briefcase, Phone, User, Camera, WifiSlash, ShieldCheck, Star, Clock, CheckCircle, Plant, Drop, Flask, Truck, Warehouse, SpinnerGap, CaretRight, Sparkle, Lightning, Info, Handshake, ArrowCounterClockwise, FileText } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

const FALLBACK_JOBS = [
  { _id: 'seed-1', key: 'wheat', category: 'harvesting', wage: 500, wageUnit: 'per_day', workersNeeded: 10, contactNumber: '9876543210', status: 'open', location: { district: 'Rewa', state: 'Madhya Pradesh' }, createdAt: new Date().toISOString() },
  { _id: 'seed-2', key: 'soybean', category: 'sowing', wage: 450, wageUnit: 'per_day', workersNeeded: 5, contactNumber: '9988776655', status: 'open', location: { district: 'Indore', state: 'Madhya Pradesh' }, createdAt: new Date().toISOString() },
  { _id: 'seed-3', key: 'sugarcane', category: 'harvesting', wage: 600, wageUnit: 'per_day', workersNeeded: 20, contactNumber: '8877665544', status: 'open', location: { district: 'Pune', state: 'Maharashtra' }, createdAt: new Date().toISOString() },
  { _id: 'seed-4', key: 'irrigation', category: 'irrigation', wage: 550, wageUnit: 'per_day', workersNeeded: 3, contactNumber: '7766554433', status: 'open', location: { district: 'Ambala', state: 'Haryana' }, createdAt: new Date().toISOString() },
  { _id: 'seed-5', key: 'potato', category: 'storage', wage: 400, wageUnit: 'per_day', workersNeeded: 15, contactNumber: '6655443322', status: 'open', location: { district: 'Jalandhar', state: 'Punjab' }, createdAt: new Date().toISOString() },
  { _id: 'seed-6', key: 'pesticide', category: 'pesticide', wage: 480, wageUnit: 'per_day', workersNeeded: 8, contactNumber: '9911223344', status: 'open', location: { district: 'Nagpur', state: 'Maharashtra' }, createdAt: new Date().toISOString() }
];

const CATEGORIES = ['harvesting','sowing','irrigation','pesticide','transport','storage','other'];
const STATES = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka'];

const CATEGORY_ICON = { harvesting: Plant, sowing: Plant, irrigation: Drop, pesticide: Flask, transport: Truck, storage: Warehouse, other: Briefcase };
const CATEGORY_COLORS = {
  harvesting: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
  sowing: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
  irrigation: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
  pesticide: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
  transport: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/30',
  storage: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-900/30',
  other: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/30'
};

export default function Labour() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user } = useAuth();
  const [tab, setTab]       = useState('browse');
  const [jobs, setJobs]       = useState(FALLBACK_JOBS);
  const [myJobs, setMyJobs]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiDown, setApiDown] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  const [form, setForm] = useState({
    title:'', description:'', category:'harvesting', wage: 500, wageUnit:'per_day',
    workersNeeded:1, district:'', state:'Madhya Pradesh', startDate:'', duration:'', skills:'',
    contactNumber: '', image: null
  });

  useEffect(() => {
    const f = localStorage.getItem('sk_labour_form');
    if (f) setForm(JSON.parse(f));
  }, []);

  useEffect(() => {
    localStorage.setItem('sk_labour_form', JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = (showLoading = false) => {
    if (showLoading) setLoading(true);
    setApiDown(false);
    labourAPI.getJobs()
      .then(r => {
        const data = r.data?.data || [];
        setJobs(data.length > 0 ? data : FALLBACK_JOBS);
      })
      .catch(() => setApiDown(true))
      .finally(() => { if (showLoading) setLoading(false); });
  };

  useEffect(() => {
    if (tab === 'my-jobs') {
      labourAPI.myJobs().then(r => setMyJobs(r.data.data || [])).catch(() => {});
    }
  }, [tab]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const postJob = async () => {
    if (!form.title || !form.description || !form.district) { 
      toast.error(t('common.error_required')); 
      return; 
    }
    setLoading(true);
    try {
      await labourAPI.postJob({ 
        ...form, 
        contactNumber: user?.phone || '9999999999',
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) 
      });
      toast.success(t('common.success'));
      setTab('browse');
      setForm({ title:'', description:'', category:'harvesting', wage:500, wageUnit:'per_day', workersNeeded:1, district:'', state:'Madhya Pradesh', startDate:'', duration:'', skills:'', contactNumber: '', image: null });
      fetchJobs();
    } catch (err) { toast.error(t('common.error')); } 
    finally { setLoading(false); }
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

  const handlePayment = async (job) => {
    setProcessingPayment(true);
    try {
      const res = await loadRazorpay();
      if (!res) { toast.error('Razorpay SDK failed to load'); return; }
      const { data: order } = await paymentAPI.createOrder(job.wage);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 
        amount: order.amount, currency: order.currency, name: 'Smart Kisan',
        description: `Booking for ${job.title}`, order_id: order.id,
        handler: async (response) => {
          try {
            const { data: verifyRes } = await paymentAPI.verifyPayment({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
            if (verifyRes.status === 'success') { toast.success(t('common.success')); setShowModal(null); fetchJobs(); }
          } catch (err) { toast.error(t('common.error')); }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || job.contactNumber },
        theme: { color: '#6366f1' },
      };
      new window.Razorpay(options).open();
    } catch (err) { toast.error(t('common.error')); } 
    finally { setProcessingPayment(false); }
  };

  const translateOption = (opt, ns = 'labour') => {
     if (ns === 'state') return t(`crop.states.${opt}`, opt);
     return t(`labour.categories.${opt}`, opt);
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-purple-100 selection:text-purple-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="px-4 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-semibold rounded-full border border-purple-200/50 dark:border-purple-800/35 flex items-center gap-2">
                <Users size={14} weight="fill" className="animate-pulse" />
                Verified Posts
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs font-medium text-slate-500">
                <Handshake size={14} weight="fill" className="text-indigo-500" />
                Active Contracts
              </div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none font-outfit">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {t('labour.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 max-w-lg leading-relaxed">
              {t('labour.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={() => fetchJobs(true)} className="h-14 px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3">
                <ArrowCounterClockwise size={18} weight="bold" className={clsx("text-purple-600", loading && "animate-spin")} />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Refresh List</span>
             </button>
          </div>
        </div>

        {/* Status Alerts */}
        {apiDown && (
          <div className="mb-10 p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-5 duration-500">
             <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <WifiSlash size={24} weight="bold" />
             </div>
             <p className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('labour.service_unavailable')}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-14 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: 'browse', label: t('labour.tabs.browse'), icon: Briefcase },
            { id: 'post', label: t('labour.tabs.post'), icon: Plus },
            { id: 'my-jobs', label: t('labour.tabs.my_posts'), icon: Users }
          ].map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} className={clsx("px-8 py-5 flex items-center gap-3 text-sm font-bold border-b-4 transition-all whitespace-nowrap -mb-px", tab === tb.id ? "border-purple-600 text-purple-600" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
              <tb.icon size={18} weight={tab === tb.id ? 'fill' : 'bold'} />
              {tb.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
          {tab === 'browse' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {jobs.map(job => (
                 <div key={job._id} onClick={() => setShowModal(job)} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm hover:shadow-premium hover:-translate-y-2 hover:border-purple-500/50 transition-all duration-500 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-900/20 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 blur-xl opacity-0 group-hover:opacity-100 duration-500" />
                    
                    <div className="flex items-start justify-between mb-8 relative z-10">
                       <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:rotate-12 duration-500", CATEGORY_COLORS[job.category] || CATEGORY_COLORS.other)}>
                          {(() => { const Icon = CATEGORY_ICON[job.category] || CATEGORY_ICON.other; return <Icon weight="duotone" />; })()}
                       </div>
                       <div className="text-right">
                          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1">{t('labour.wage')}</p>
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">₹{job.wage}<span className="text-[10px] font-bold text-slate-400 ml-1">/{t(`labour.wage_units.${job.wageUnit}`)}</span></p>
                       </div>
                    </div>

                    <div className="mb-8">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-purple-600 transition-colors font-outfit">
                          {job.key ? t(`labour.fallback.${job.key}.title`) : job.title}
                       </h3>
                       <div className="flex items-center gap-2.5 mb-4">
                          <div className={clsx("px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", CATEGORY_COLORS[job.category] || CATEGORY_COLORS.other)}>
                             {t(`labour.categories.${job.category}`)}
                          </div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5"><Clock size={14} weight="bold" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-xs font-bold text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                          "{job.key ? t(`labour.fallback.${job.key}.desc`) : job.description}"
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <MapPin size={16} weight="fill" className="text-red-500" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{job.location?.district}</span>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                          <Users size={16} weight="fill" className="text-blue-500" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{job.workersNeeded} {t('labour.needed')}</span>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-100/10">
                          <ShieldCheck size={16} weight="fill" />
                          <span>Verified Contact</span>
                       </div>
                       <CaretRight size={18} weight="bold" className="text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                    </div>
                 </div>
               ))}
            </div>
          )}

          {tab === 'post' && (
            <div className="grid lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] p-10 sm:p-14 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-premium transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 flex items-center gap-4 font-outfit">
                     <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Plus size={24} weight="bold" />
                     </div>
                     {t('labour.tabs.post')}
                  </h2>

                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.job_title')} *</label>
                        <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none" placeholder={t('labour.placeholders.title')} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
                     </div>

                     <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.description')} *</label>
                        <textarea className="w-full min-h-[140px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none resize-none" placeholder={t('labour.placeholders.description')} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                     </div>

                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <div className="col-span-2 space-y-3">
                           <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.category')}</label>
                           <div className="relative">
                              <select className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none appearance-none cursor-pointer" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                                 {CATEGORIES.map(c => <option key={c} value={c}>{t(`labour.categories.${c}`)}</option>)}
                              </select>
                              <CaretRight size={14} weight="bold" className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.wage')} (₹)</label>
                           <input type="number" className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none" value={form.wage} onChange={e => setForm(f => ({...f, wage: Number(e.target.value)}))} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.wage_unit')}</label>
                           <div className="relative">
                              <select className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none appearance-none cursor-pointer" value={form.wageUnit} onChange={e => setForm(f => ({...f, wageUnit: e.target.value}))}>
                                 {['per_day', 'per_week', 'per_month', 'fixed'].map(u => <option key={u} value={u}>{t(`labour.wage_units.${u}`)}</option>)}
                              </select>
                              <CaretRight size={14} weight="bold" className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.district')} *</label>
                           <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none" placeholder={t('labour.placeholders.district')} value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} />
                        </div>
                        <div className="space-y-3">
                           <label className="text-xs font-semibold text-slate-500 ml-2">{t('labour.state')}</label>
                           <div className="relative">
                              <select className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/20 transition-all outline-none appearance-none cursor-pointer" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                                 {STATES.map(s => <option key={s} value={s}>{translateOption(s, 'state')}</option>)}
                              </select>
                              <CaretRight size={14} weight="bold" className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <button onClick={postJob} disabled={loading} className="w-full h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-4 mt-14 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
                     {loading ? <SpinnerGap className="animate-spin" size={28} /> : <Handshake size={28} weight="fill" />}
                     {loading ? t('labour.posting') : t('common.submit')}
                  </button>
               </div>

               <div className="lg:col-span-4 space-y-10">
                  <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                     <p className="text-xs font-semibold text-slate-500 mb-10">{t('labour.identity_photo')}</p>
                     <div className="relative w-44 h-44 mx-auto mb-10 group">
                        <div className="w-full h-full rounded-[3rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                           {form.image ? <img src={form.image} alt="Profile" className="w-full h-full object-cover" /> : <User size={64} className="text-slate-200" weight="fill" />}
                        </div>
                        <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                           <Camera size={24} weight="fill" />
                           <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                        </label>
                     </div>
                     <p className="text-xs font-semibold text-slate-400 leading-relaxed">{t('labour.upload_trust')}</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                     <h3 className="font-bold text-white text-xs mb-8 flex items-center gap-3">
                        <Lightning size={20} weight="fill" className="text-amber-400" />
                        {t('labour.important_tips')}
                     </h3>
                     <div className="space-y-6">
                        {[
                          { icon: Phone, text: t('labour.tips_list.phone') },
                          { icon: FileText, text: t('labour.tips_list.description') },
                          { icon: Camera, text: t('labour.tips_list.photo') }
                        ].map((tip, i) => (
                          <div key={i} className="flex gap-4 group/tip">
                             <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 group-hover/tip:bg-white group-hover/tip:text-indigo-600 transition-all shrink-0">
                                <tip.icon size={18} weight="bold" />
                             </div>
                             <p className="text-xs font-bold text-indigo-100/70 leading-relaxed group-hover/tip:text-white transition-colors">{tip.text}</p>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {tab === 'my-jobs' && (
            <div className="space-y-6">
               {myJobs.length === 0 ? (
                 <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] p-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Briefcase size={64} className="mx-auto text-slate-200 mb-6" weight="duotone" />
                    <p className="text-xl font-black text-slate-400 italic">{t('common.no_data')}</p>
                 </div>
               ) : (
                 myJobs.map(job => (
                   <div key={job._id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:px-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8 border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:border-purple-500/30 transition-all duration-500">
                      <div className="flex items-center gap-8">
                         <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500", CATEGORY_COLORS[job.category] || CATEGORY_COLORS.other)}>
                            {(() => { const Icon = CATEGORY_ICON[job.category] || CATEGORY_ICON.other; return <Icon weight="duotone" />; })()}
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{job.title}</h3>
                            <p className="text-xs font-semibold text-slate-400 mt-2">{job.location?.district} • <span className="text-purple-600">{job.applications?.length || 0} Applications</span></p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className={clsx("px-5 py-2 rounded-xl text-xs font-bold shadow-sm", job.status === 'open' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600")}>
                            {t(`labour.status.${job.status}`, job.status)}
                         </div>
                         <button className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl flex items-center justify-center transition-all">
                            <X size={24} weight="bold" />
                         </button>
                      </div>
                   </div>
                 ))
               )}
            </div>
          )}
        </div>
      </div>

      {/* Modern Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[2000] p-4 sm:p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10 relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col">
              
              <div className="relative h-64 sm:h-80 shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-900" />
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                 <button onClick={() => setShowModal(null)} className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center hover:bg-white/40 transition-all z-20">
                    <X size={24} weight="bold" />
                 </button>
                 
                 <div className="absolute bottom-0 left-0 w-full p-10 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-8">
                       <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shrink-0">
                          {showModal.image ? <img src={showModal.image} alt="Poster" className="w-full h-full object-cover" /> : (
                            <div className="text-5xl text-purple-600">
                               {(() => { const Icon = CATEGORY_ICON[showModal.category] || CATEGORY_ICON.other; return <Icon weight="duotone" />; })()}
                            </div>
                          )}
                       </div>
                       <div>
                          <div className={clsx("inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-3", CATEGORY_COLORS[showModal.category] || CATEGORY_COLORS.other)}>
                             {t(`labour.categories.${showModal.category}`)}
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-none mb-2">
                             {showModal.key ? t(`labour.fallback.${showModal.key}.title`) : showModal.title}
                          </h3>
                          <div className="flex items-center gap-4 text-white/60 font-black text-[10px] uppercase tracking-widest">
                             <span className="flex items-center gap-2"><MapPin size={14} weight="fill" className="text-red-400" /> {showModal.location?.district}, {translateOption(showModal.location?.state, 'state')}</span>
                             <span className="flex items-center gap-2"><Clock size={14} weight="fill" className="text-blue-400" /> {new Date(showModal.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 sm:p-14 overflow-y-auto scrollbar-none flex-1">
                 <div className="grid sm:grid-cols-2 gap-8 mb-12">
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 text-center relative group overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                       <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">{t('labour.guaranteed_wage')}</p>
                       <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 tracking-tighter">₹{showModal.wage}<span className="text-xs font-bold text-slate-400 ml-2">/{t(`labour.wage_units.${showModal.wageUnit}`)}</span></p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 text-center relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                       <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">{t('labour.open_positions')}</p>
                       <p className="text-4xl font-black text-blue-700 dark:text-blue-300 tracking-tighter">{showModal.workersNeeded}<span className="text-xs font-bold text-slate-400 ml-2">{t('labour.needed')}</span></p>
                    </div>
                 </div>

                 <div className="mb-12">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                       <Info size={16} weight="fill" className="text-slate-300" />
                       {t('labour.job_description')}
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 relative group">
                       <div className="absolute -top-4 -left-4 w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-4xl text-slate-200">“</div>
                       <p className="text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic relative z-10">
                          {showModal.key ? t(`labour.fallback.${showModal.key}.desc`) : showModal.description}
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-5">
                    <button onClick={() => handlePayment(showModal)} disabled={processingPayment} className="flex-[2] h-20 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-4 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
                       <Bank size={28} weight="fill" />
                       {processingPayment ? t('labour.processing') : t('labour.pay_book', { amount: showModal.wage })}
                    </button>
                    <button onClick={() => toast.success("Secure connection established! Kisan Mitra will notify you.")} className="flex-1 h-20 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                       <Handshake size={24} weight="fill" />
                       Secure Connect
                    </button>
                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}
