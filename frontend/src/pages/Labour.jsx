import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { labourAPI, paymentAPI } from '../services/api';

import { Users, Plus, MapPin, Calendar, Banknote, X, ChevronRight, Briefcase, Phone, User, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const CATEGORIES = ['harvesting','sowing','irrigation','pesticide','transport','storage','other'];
const STATES = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka'];

const CATEGORY_EMOJI = { harvesting:'🌾', sowing:'🌱', irrigation:'💧', pesticide:'🧪', transport:'🚛', storage:'🏪', other:'💼' };

export default function Labour() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab]       = useState('browse');
  const [jobs, setJobs]     = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [applying, setApplying]   = useState(false);
  const [applyMsg, setApplyMsg]   = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  
  const [form, setForm] = useState({
    title:'', description:'', category:'harvesting', wage: 500, wageUnit:'per day',
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

  const fetchJobs = () => {
    setLoading(true);
    labourAPI.getJobs()
      .then(r => setJobs(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
    if (!form.title || !form.district || !form.contactNumber) { 
      toast.error('Title, District and Mobile Number are required'); 
      return; 
    }
    try {
      await labourAPI.postJob({ 
        ...form, 
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) 
      });
      toast.success(t('common.success', 'Work Posted Successfully!'));
      setTab('browse');
      setForm({ title:'', description:'', category:'harvesting', wage:500, wageUnit:'per day', workersNeeded:1, district:'', state:'Punjab', startDate:'', duration:'', skills:'', contactNumber: '', image: null });
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
        key: 'rzp_test_placeholder', // Should match backend key_id
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
              toast.success('Payment Successful! Worker Booked.');
              setShowModal(null);
              fetchJobs();
            }
          } catch (err) {
            toast.error('Payment verification failed.');
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
      toast.error('Failed to initiate payment.');
    } finally {
      setProcessingPayment(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto px-4 py-6 page-enter animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2 tracking-tighter">
            <Users className="text-purple-500" size={24} />
            <span>{t('labour.title')}</span>
          </h1>
          <p className="page-subtitle text-gray-500 font-medium">{t('labour.subtitle', 'Find agricultural workers or post your requirements')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-100 dark:border-slate-800">
        {[
          {id:'browse', label: t('labour.tabs.browse', 'Find Work')},
          {id:'post', label: t('labour.tabs.post', 'Post Work')},
          {id:'my-jobs', label: t('labour.tabs.my_posts', 'My Posts')}
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={clsx('px-6 py-4 text-sm font-black border-b-4 -mb-px transition-all uppercase tracking-widest',
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
            <p className="text-gray-500 dark:text-slate-400 font-bold">{t('common.no_data', 'No work available at the moment.')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {jobs.map(job => (
              <div key={job._id} className="card hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden bg-white dark:bg-slate-900 border-none shadow-lg"
                onClick={() => setShowModal(job)}>
                
                {job.image && (
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md overflow-hidden z-10">
                     <img src={job.image} alt="Poster" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-3xl shrink-0 shadow-sm border border-purple-100 dark:border-purple-900/30">
                    {CATEGORY_EMOJI[job.category] || '💼'}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white leading-tight text-lg group-hover:text-primary transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-900/30">{job.category}</span>
                       <span className="text-[10px] text-gray-400 font-bold">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-5 bg-gray-50 dark:bg-black/20 p-3 rounded-2xl border border-gray-100 dark:border-white/5 font-medium leading-relaxed italic">"{job.description}"</p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-slate-400 font-bold bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-white/5">
                    <MapPin size={16} className="text-red-400" />
                    <span>{job.location?.district}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-green-600 dark:text-green-400 font-black bg-green-50 dark:bg-green-900/10 p-2.5 rounded-xl border border-green-100 dark:border-green-900/20">
                    <Banknote size={16} />
                    <span>₹{job.wage} / {job.wageUnit}</span>
                  </div>
                </div>
                
                <div className="mt-5 pt-5 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-black">
                    <Phone size={14} /> <span>{job.contactNumber}</span>
                  </div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={12} /> <span>{job.workersNeeded} Needed</span>
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
          <div className="lg:col-span-8 card shadow-2xl border-none bg-white dark:bg-slate-900">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
              <Plus className="bg-primary text-white rounded-xl p-1.5 shadow-lg shadow-primary/30" size={28} /> 
              <span>{t('labour.tabs.post', 'Post New Work')}</span>
            </h2>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                 <div>
                    <label className="label">{t('common.title', 'Work Title')} *</label>
                    <input className="input dark:bg-slate-800 border-2" placeholder="e.g. Need team for harvesting"
                      value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
                 </div>
                 <div>
                    <label className="label">{t('auth.phone', 'Contact Number')} *</label>
                    <div className="relative">
                       <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                       <input className="input pl-10 dark:bg-slate-800 border-2" placeholder="10-digit mobile number"
                        value={form.contactNumber} onChange={e => setForm(f => ({...f, contactNumber: e.target.value}))} />
                    </div>
                 </div>
              </div>

              <div>
                <label className="label">{t('common.description', 'Work Description')}</label>
                <textarea className="input min-h-[120px] dark:bg-slate-800 border-2" placeholder="Describe the work in detail..."
                  value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div className="sm:col-span-2">
                  <label className="label">Category</label>
                  <select className="input dark:bg-slate-800 border-2" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Wage (₹)</label>
                  <input type="number" className="input dark:bg-slate-800 border-2" value={form.wage}
                    onChange={e => setForm(f => ({...f, wage: Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select className="input dark:bg-slate-800 border-2" value={form.wageUnit} onChange={e => setForm(f => ({...f, wageUnit: e.target.value}))}>
                    {['per day','fixed'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="label">District *</label>
                  <input className="input dark:bg-slate-800 border-2" placeholder="Enter district" value={form.district}
                    onChange={e => setForm(f => ({...f, district: e.target.value}))} />
                </div>
                <div>
                  <label className="label">State</label>
                  <select className="input dark:bg-slate-800 border-2" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <button onClick={postJob} className="btn-primary w-full h-16 rounded-2xl justify-center mt-10 text-lg font-black shadow-xl shadow-primary/20 active:scale-[0.98]">
              {t('common.submit', 'Submit Post')}
            </button>
          </div>

          <div className="lg:col-span-4 space-y-8">
             <div className="card text-center bg-gray-50 dark:bg-slate-900/50 border-dashed border-2 border-gray-200 dark:border-slate-800 p-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 block">Identity Photo</label>
                <div className="relative w-36 h-36 mx-auto mb-6 group">
                   <div className="w-full h-full rounded-[2.5rem] bg-gray-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl transition-transform group-hover:scale-105">
                      {form.image ? <img src={form.image} alt="Profile" className="w-full h-full object-cover" /> : <User size={48} className="text-gray-400" />}
                   </div>
                   <label className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                      <Camera size={20} />
                      <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                   </label>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed px-4">Upload a photo to build trust with workers</p>
             </div>

             <div className="card bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-100 dark:border-amber-900/30">
                <h3 className="font-black text-amber-800 dark:text-amber-400 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Important Tips</span>
                </h3>
                <ul className="text-xs text-amber-700 dark:text-slate-400 space-y-3 leading-relaxed font-medium">
                   <li className="flex gap-2"><span>•</span> <span>Provide correct mobile number for direct calls.</span></li>
                   <li className="flex gap-2"><span>•</span> <span>Keep description clear for better understanding.</span></li>
                   <li className="flex gap-2"><span>•</span> <span>Adding a photo increases response rate by 2x.</span></li>
                </ul>
             </div>
          </div>
        </div>
      )}

      {/* My Jobs List */}
      {tab === 'my-jobs' && (
        <div className="max-w-2xl mx-auto space-y-5">
          {myJobs.length === 0
            ? <div className="card text-center py-24 text-gray-400 dark:text-slate-600 italic font-bold border-dashed border-2">No posts yet. Start by posting a new work requirement.</div>
            : myJobs.map(job => (
              <div key={job._id} className="card flex items-center justify-between hover:border-primary transition-all bg-white dark:bg-slate-900 border-none shadow-lg py-5 px-6 group">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{CATEGORY_EMOJI[job.category]}</div>
                   <div>
                      <p className="font-black text-gray-900 dark:text-white text-base">{job.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{job.location?.district} • {job.applications?.length || 0} Applications</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className={clsx('px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700')}>{job.status}</span>
                   <button className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"><X size={18} /></button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[2000] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up border border-white/10">
            <div className="relative h-56 bg-purple-600 dark:bg-purple-900/50 p-10 flex items-end">
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
               <button onClick={() => setShowModal(null)} className="absolute top-6 right-6 p-2.5 bg-white/20 text-white hover:bg-white/40 rounded-2xl transition-all active:scale-95"><X size={24} /></button>
               
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700">
                     {showModal.image ? <img src={showModal.image} alt="Identity" className="w-full h-full object-cover" /> : <span className="text-5xl">{CATEGORY_EMOJI[showModal.category]}</span>}
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{showModal.title}</h3>
                     <p className="text-white/70 font-bold uppercase tracking-widest text-[10px]">{showModal.location?.district}, {showModal.location?.state}</p>
                  </div>
               </div>
            </div>

            <div className="p-10">
               <div className="flex gap-5 mb-8">
                  <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-[1.5rem] flex-1 text-center border border-green-100 dark:border-green-900/20">
                     <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest mb-1">Wage</p>
                     <p className="text-2xl font-black text-green-700 dark:text-green-300">₹{showModal.wage}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-[1.5rem] flex-1 text-center border border-blue-100 dark:border-blue-900/20">
                     <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-1">Workers</p>
                     <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{showModal.workersNeeded}</p>
                  </div>
               </div>

               <div className="mb-8">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-3 tracking-widest">Job Description</p>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-white/5 font-medium italic">"{showModal.description}"</p>
               </div>

               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => handlePayment(showModal)}
                    disabled={processingPayment}
                    className="btn-primary w-full justify-center h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/30 group active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Banknote size={20} className="mr-2" /> 
                    <span>{processingPayment ? 'Processing...' : `Pay ₹${showModal.wage} & Book Now`}</span>
                  </button>
                  <a href={`tel:${showModal.contactNumber}`} className="flex items-center justify-center h-12 rounded-xl text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">
                     <Phone size={16} className="mr-2" /> <span>Call for details</span>
                  </a>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
