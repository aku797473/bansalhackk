import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { labourAPI, paymentAPI } from '../services/api';

import { Users, Plus, MapPin, Banknote, X, Briefcase, Phone, User, Camera, WifiOff, ShieldCheck, Star, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// ─── Fallback seed data shown when API is unreachable ─────────────────────────
const FALLBACK_JOBS = [
  {
    _id: 'seed-1', key: 'wheat', category: 'harvesting', wage: 500, wageUnit: 'per_day', workersNeeded: 10, contactNumber: '9876543210', status: 'open',
    location: { district: 'Rewa', state: 'Madhya Pradesh' }, createdAt: new Date().toISOString()
  },
  {
    _id: 'seed-2', key: 'soybean', category: 'sowing', wage: 450, wageUnit: 'per_day', workersNeeded: 5, contactNumber: '9988776655', status: 'open',
    location: { district: 'Indore', state: 'Madhya Pradesh' }, createdAt: new Date().toISOString()
  },
  {
    _id: 'seed-3', key: 'sugarcane', category: 'harvesting', wage: 600, wageUnit: 'per_day', workersNeeded: 20, contactNumber: '8877665544', status: 'open',
    location: { district: 'Pune', state: 'Maharashtra' }, createdAt: new Date().toISOString()
  },
  {
    _id: 'seed-4', key: 'irrigation', category: 'irrigation', wage: 550, wageUnit: 'per_day', workersNeeded: 3, contactNumber: '7766554433', status: 'open',
    location: { district: 'Ambala', state: 'Haryana' }, createdAt: new Date().toISOString()
  },
  {
    _id: 'seed-5', key: 'potato', category: 'storage', wage: 400, wageUnit: 'per_day', workersNeeded: 15, contactNumber: '6655443322', status: 'open',
    location: { district: 'Jalandhar', state: 'Punjab' }, createdAt: new Date().toISOString()
  },
  {
    _id: 'seed-6', key: 'pesticide', category: 'pesticide', wage: 480, wageUnit: 'per_day', workersNeeded: 8, contactNumber: '9911223344', status: 'open',
    location: { district: 'Nagpur', state: 'Maharashtra' }, createdAt: new Date().toISOString()
  },
];

const CATEGORIES = ['harvesting','sowing','irrigation','pesticide','transport','storage','other'];
const STATES = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka'];

const CATEGORY_EMOJI = { harvesting:'🌾', sowing:'🌱', irrigation:'💧', pesticide:'🧪', transport:'🚛', storage:'🏪', other:'💼' };
const CATEGORY_COLORS = {
  harvesting: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
  sowing: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
  irrigation: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
  pesticide: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
  transport: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/30',
  storage: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-900/30',
  other: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/30'
};
const CATEGORY_GRADIENTS = {
  harvesting: 'from-amber-400 to-orange-500',
  sowing: 'from-emerald-400 to-green-600',
  irrigation: 'from-blue-400 to-indigo-500',
  pesticide: 'from-rose-400 to-red-600',
  transport: 'from-sky-400 to-blue-600',
  storage: 'from-slate-400 to-gray-600',
  other: 'from-purple-400 to-indigo-600'
};

export default function Labour() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab]       = useState('browse');
  const [jobs, setJobs]       = useState(FALLBACK_JOBS);
  const [myJobs, setMyJobs]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiDown, setApiDown] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [applying, setApplying]   = useState(false);
  const [applyMsg, setApplyMsg]   = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  
  const [form, setForm] = useState({
    title:'', description:'', category:'harvesting', wage: 500, wageUnit:'per_day',
    workersNeeded:1, district:'', state:'Punjab', startDate:'', duration:'', skills:'',
    contactNumber: '', image: null
  });

  // Load from localStorage
  useEffect(() => {
    const f = localStorage.getItem('sk_labour_form');
    if (f) setForm(JSON.parse(f));
  }, []);

  // Save to localStorage
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
        if (data.length > 0) {
          setJobs(data);
        } else {
          setJobs(FALLBACK_JOBS); // Ensure it's never empty
        }
      })
      .catch(() => {
        // API unreachable — keep fallback & inform user silently or via toast
        setApiDown(true);
      })
      .finally(() => {
        if (showLoading) setLoading(false);
      });
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
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const postJob = async () => {
    if (!form.title || !form.description || !form.district || !form.contactNumber) { 
      toast.error(t('common.error_required', 'Title, Description, District and Mobile Number are required')); 
      return; 
    }
    try {
      await labourAPI.postJob({ 
        ...form, 
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) 
      });
      toast.success(t('common.success', 'Work Posted Successfully!'));
      setTab('browse');
      setForm({ title:'', description:'', category:'harvesting', wage:500, wageUnit:'per_day', workersNeeded:1, district:'', state:'Punjab', startDate:'', duration:'', skills:'', contactNumber: '', image: null });
      fetchJobs();
    } catch (err) { 
      toast.error(t('common.error', 'Failed to post. Check all fields.')); 
    }
  };

  const applyJob = async () => {
    if (!showModal) return;
    setApplying(true);
    try {
      await labourAPI.applyJob(showModal._id, { name: user?.name, phone: user?.phone, message: applyMsg });
      toast.success(t('common.success', 'Application sent!'));
      setShowModal(null);
      setApplyMsg('');
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', 'Apply failed'));
    } finally { setApplying(false); }
  };

  // ─── Razorpay Logic ─────────────────────────────────
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
      // 1. Load Razorpay Script
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 2. Create Order in Backend
      const { data: order } = await paymentAPI.createOrder(job.wage);

      // 3. Configure Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', 

        amount: order.amount,
        currency: order.currency,
        name: 'Smart Kisan',
        description: `Booking for ${job.title}`,
        image: '/logo.png',
        order_id: order.id,
        handler: async (response) => {
          // 4. Verify Payment in Backend
          try {
            const { data: verifyRes } = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.status === 'success') {
              toast.success(t('common.success', 'Payment Successful! Worker Booked.'));
              setShowModal(null);
              fetchJobs();
            }
          } catch (err) {
            toast.error(t('common.error', 'Payment verification failed.'));
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || job.contactNumber,
        },
        theme: { color: '#6366f1' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error(t('common.error', 'Failed to initiate payment.'));
    } finally {
      setProcessingPayment(false);
    }
  };


  return (
    <div className="page-wrapper px-2 sm:px-4">
      <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div>
          <h1 className="page-title flex items-center gap-3 tracking-tighter">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl shadow-inner">
               <Users className="text-purple-600 animate-pulse" size={28} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              {t('labour.title')}
            </span>
          </h1>
          <p className="page-subtitle mt-2">{t('labour.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl shadow-sm">
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
           <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">{t('labour.verified_post')}</span>
        </div>
      </div>

      {apiDown && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3 text-amber-800 dark:text-amber-300">
          <WifiOff size={20} className="shrink-0" />
          <div className="text-sm">
            <span className="font-bold">{t('labour.service_unavailable')}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-10 border-b border-gray-100 dark:border-slate-800 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          {id:'browse', label: t('labour.tabs.browse')},
          {id:'post', label: t('labour.tabs.post')},
          {id:'my-jobs', label: t('labour.tabs.my_posts')}
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={clsx('px-6 py-4 text-sm font-black border-b-4 -mb-px transition-all uppercase tracking-widest whitespace-nowrap',
              tab === tb.id ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'
            )}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Browse Section */}
      {tab === 'browse' && (
        loading ? (
          <div className="grid sm:grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-56 rounded-3xl" />)}</div>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-24 bg-gray-50 dark:bg-slate-900/50 border-dashed border-2">
            <Briefcase size={48} className="mx-auto text-gray-200 dark:text-slate-800 mb-4" />
            <p className="text-gray-500 dark:text-slate-400 font-bold">{t('common.no_data')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {jobs.map(job => (
              <div key={job._id} className="card cursor-pointer group relative p-5 sm:p-7"
                onClick={() => setShowModal(job)}>
                
                {job.image && (
                  <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-white dark:border-slate-800 shadow-md overflow-hidden z-10">
                     <img src={job.image} alt="Poster" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-start gap-4 mb-4 sm:mb-5">
                  <div className={clsx("w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-lg border transition-transform group-hover:scale-110 duration-500", CATEGORY_COLORS[job.category] || CATEGORY_COLORS.other)}>
                    {CATEGORY_EMOJI[job.category] || '💼'}
                  </div>
                  <div className="pr-2 xs:pr-0 overflow-hidden">
                    <h3 className="font-black text-gray-900 dark:text-white leading-tight text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                      {job.key ? t(`labour.fallback.${job.key}.title`) : job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                       <div className={clsx("badge py-0.5 px-2 border font-black uppercase tracking-widest text-[8px] sm:text-[9px]", CATEGORY_COLORS[job.category] || CATEGORY_COLORS.other)}>
                          {t(`labour.categories.${job.category}`)}
                       </div>
                       <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold flex items-center gap-1"><Clock size={10} /> {new Date(job.createdAt).toLocaleDateString(t('common.locale'))}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gray-50 dark:bg-black/20 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-white/5">
                   <p className="text-[11px] sm:text-xs text-gray-600 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed italic">
                      "{job.key ? t(`labour.fallback.${job.key}.desc`) : job.description}"
                    </p>
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-400 font-bold bg-gray-50 dark:bg-slate-800/50 p-2 sm:p-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                    <MapPin size={14} className="text-red-400 shrink-0" />
                    <span className="truncate">{job.location?.district}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-green-600 dark:text-green-400 font-black bg-green-50 dark:bg-green-900/10 p-2 sm:p-2.5 rounded-xl border border-green-100 dark:border-green-900/20">
                    <Banknote size={14} className="shrink-0" />
                    <span className="truncate">₹{job.wage} / {t(`labour.wage_units.${job.wageUnit}`)}</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-gray-50 dark:border-white/5 flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-primary font-black text-xs sm:text-sm">
                    <Phone size={14} /> <span>{job.contactNumber}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12} /> <span>{job.workersNeeded} {t('labour.needed')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Post Form */}
      {tab === 'post' && (
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 card border-none shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3 relative z-10">
              <Plus className="bg-primary text-white rounded-xl p-1.5 shadow-lg shadow-primary/30" size={28} /> 
              <span>{t('labour.tabs.post')}</span>
            </h2>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                 <div>
                    <label className="label">{t('labour.job_title')} *</label>
                    <input className="input dark:bg-slate-800 border-2" placeholder={t('labour.placeholders.title')}
                      value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
                 </div>
                 <div>
                    <label className="label">{t('auth.phone')} *</label>
                    <div className="relative">
                       <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input className="input pl-10 dark:bg-slate-800 border-2" placeholder={t('labour.placeholders.phone')}
                        value={form.contactNumber} onChange={e => setForm(f => ({...f, contactNumber: e.target.value}))} />
                    </div>
                 </div>
              </div>

              <div>
                <label className="label">{t('labour.description')} *</label>
                <textarea className="input min-h-[120px] dark:bg-slate-800 border-2" placeholder={t('labour.placeholders.description')}
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div className="sm:col-span-2">
                  <label className="label">{t('labour.category')}</label>
                  <select className="input dark:bg-slate-800 border-2" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {t(`labour.categories.${c}`)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('labour.wage')} (₹)</label>
                  <input type="number" className="input dark:bg-slate-800 border-2" value={form.wage}
                    onChange={e => setForm(f => ({...f, wage: Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="label">{t('labour.wage_unit', 'Unit')}</label>
                  <select className="input dark:bg-slate-800 border-2" value={form.wageUnit} onChange={e => setForm(f => ({...f, wageUnit: e.target.value}))}>
                    {['per_day', 'per_week', 'per_month', 'fixed'].map(u => <option key={u} value={u}>{t(`labour.wage_units.${u}`)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="label">{t('labour.district')} *</label>
                  <input className="input dark:bg-slate-800 border-2" placeholder={t('labour.placeholders.district')} value={form.district}
                    onChange={e => setForm(f => ({...f, district: e.target.value}))} />
                </div>
                <div>
                  <label className="label">{t('labour.state')}</label>
                  <select className="input dark:bg-slate-800 border-2" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                    {STATES.map(s => <option key={s} value={s}>{t(`crop.states.${s}`, s)}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <button onClick={postJob} className="btn-primary w-full h-16 rounded-2xl justify-center mt-10 text-lg font-black shadow-xl shadow-primary/20 active:scale-[0.98]">
              {t('common.submit')}
            </button>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="card text-center bg-gray-50 dark:bg-slate-900/50 border-dashed border-2 border-gray-200 dark:border-slate-800 p-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 block">{t('labour.identity_photo')}</label>
                <div className="relative w-36 h-36 mx-auto mb-6 group">
                   <div className="w-full h-full rounded-[2.5rem] bg-gray-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl transition-transform group-hover:scale-105">
                      {form.image ? <img src={form.image} alt="Profile" className="w-full h-full object-cover" /> : <User size={48} className="text-gray-400" />}
                   </div>
                   <label className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                   </label>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed px-4">{t('labour.upload_trust')}</p>
             </div>

             <div className="card bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-100 dark:border-amber-900/30">
                <h3 className="font-black text-amber-800 dark:text-amber-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{t('labour.important_tips')}</span>
                </h3>
                <ul className="text-xs text-amber-700 dark:text-slate-400 space-y-3 leading-relaxed font-medium">
                   <li className="flex gap-2"><span>•</span> <span>{t('labour.tips_list.phone')}</span></li>
                   <li className="flex gap-2"><span>•</span> <span>{t('labour.tips_list.description')}</span></li>
                   <li className="flex gap-2"><span>•</span> <span>{t('labour.tips_list.photo')}</span></li>
                </ul>
             </div>
          </div>
        </div>
      )}

      {/* My Jobs List */}
      {tab === 'my-jobs' && (
        <div ref={ref} className="page-wrapper">
          {myJobs.length === 0
            ? <div className="card text-center py-24 text-gray-400 dark:text-slate-600 italic font-bold border-dashed border-2">{t('common.no_data')}</div>
            : myJobs.map(job => (
              <div key={job._id} className="card flex items-center justify-between group py-5 px-6">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{CATEGORY_EMOJI[job.category]}</div>
                   <div>
                      <p className="font-black text-gray-900 dark:text-white text-base">{job.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{job.location?.district} • {job.applications?.length || 0} Applications</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className={clsx('px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>
                      {t(`labour.status.${job.status}`, job.status)}
                   </span>
                   <button className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"><X size={18} /></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[2000] p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="relative h-40 sm:h-56 bg-purple-600 dark:bg-purple-900/50 p-6 sm:p-10 flex items-end">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
               <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 p-2.5 bg-white/20 text-white hover:bg-white/40 rounded-2xl transition-all active:scale-95"><X size={24} /></button>
               
               <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center overflow-hidden border-2 sm:border-4 border-white dark:border-slate-700">
                     {showModal.image ? <img src={showModal.image} alt="Identity" className="w-full h-full object-cover" /> : <span className="text-5xl">{CATEGORY_EMOJI[showModal.category]}</span>}
                  </div>
                  <div>
                     <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-1 sm:mb-2">
                        {showModal.key ? t(`labour.fallback.${showModal.key}.title`) : showModal.title}
                     </h3>
                     <p className="text-white/70 font-bold uppercase tracking-widest text-[8px] sm:text-[10px]">{showModal.location?.district}, {t(`crop.states.${showModal.location?.state}`, showModal.location?.state)}</p>
                  </div>
               </div>
            </div>

            <div className="p-5 sm:p-10">
               <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-6 sm:mb-8">
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] flex-1 text-center border border-emerald-100 dark:border-emerald-900/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-1.5 bg-emerald-500 text-white rounded-bl-xl shadow-md">
                        <CheckCircle2 size={12} />
                     </div>
                     <p className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-1">{t('labour.guaranteed_wage')}</p>
                     <p className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300">₹{showModal.wage}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] flex-1 text-center border border-blue-100 dark:border-blue-900/20">
                     <p className="text-[9px] sm:text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-1">{t('labour.open_positions')}</p>
                     <p className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300">{showModal.workersNeeded}</p>
                  </div>
               </div>

               <div className="mb-6 sm:mb-8">
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">{t('labour.job_description')}</p>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-black/20 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-white/5 font-medium italic">
                    "{showModal.key ? t(`labour.fallback.${showModal.key}.desc`) : showModal.description}"
                  </p>
               </div>

               <div className="flex flex-col gap-3 sm:gap-4">
                  <button 
                    onClick={() => handlePayment(showModal)}
                    disabled={processingPayment}
                    className="btn-primary w-full justify-center h-14 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black shadow-xl shadow-primary/30 group active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Banknote size={18} className="mr-2" /> 
                    <span>{processingPayment ? t('labour.processing') : t('labour.pay_book', { amount: showModal.wage })}</span>
                  </button>
                  <a href={`tel:${showModal.contactNumber}`} className="flex items-center justify-center h-10 sm:h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-xs sm:text-sm">
                     <Phone size={14} className="mr-2" /> <span>{t('labour.call_details')}</span>
                  </a>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
