import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User, MapPin, Globe, Plant, FloppyDisk, CheckCircle, Camera, Trash, SignOut, ShieldCheck, Bell, CaretRight, IdentificationCard, Star, PencilSimple } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

const STATES = ['Punjab','Haryana','Uttar Pradesh','Bihar','Madhya Pradesh','Maharashtra','Gujarat','Rajasthan','Karnataka','Andhra Pradesh','Telangana','West Bengal','Tamil Nadu','Assam','Odisha'];
const SOIL_TYPES = ['loamy','clay','sandy','silty','peaty','chalky','other'];
const IRRIGATION = ['rain-fed','canal','borewell','drip','other'];
const ROLES_INFO = { 
  farmer: { icon: Plant, labelKey: 'auth.farmer', color: 'text-emerald-500' }, 
  buyer:  { icon: User, labelKey: 'auth.buyer', color: 'text-blue-500' }, 
  labour: { icon: User, labelKey: 'auth.labour', color: 'text-amber-500' }, 
  admin:  { icon: ShieldCheck, labelKey: 'auth.admin', color: 'text-purple-500' } 
};

export default function Profile() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: '', email: '', language: 'en',
    profilePic: '',
    location: { village: '', district: '', state: '', pincode: '' },
    farmDetails: { landArea: '', soilType: 'loamy', irrigation: 'canal' },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setFloppyDiskd]   = useState(false);

  useEffect(() => {
    userAPI.getProfile()
      .then(({ data }) => {
        const p = data.data;
        if (p) {
          setForm({
            name:        p.name || user?.name || '',
            email:       p.email || '',
            language:    p.language || 'en',
            profilePic:  p.profilePic || '',
            location:    p.location || { village: '', district: '', state: '', pincode: '' },
            farmDetails: p.farmDetails || { landArea: '', soilType: 'loamy', irrigation: 'canal' },
          });
        }
      })
      .catch(() => {
        setForm(f => ({ ...f, name: user?.name || '', language: i18n.language || 'en' }));
      });
  }, [user, i18n.language]);

  const set  = (k, v)    => setForm(f => ({ ...f, [k]: v }));
  const setL = (k, v)    => setForm(f => ({ ...f, location:    { ...f.location,    [k]: v } }));
  const setF = (k, v)    => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, [k]: v } }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { 
        toast.error('Image is too large. Please choose an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => set('profilePic', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await userAPI.saveProfile(form);
      updateUser({ name: form.name, profilePic: form.profilePic });
      
      if (form.language !== i18n.language) {
        i18n.changeLanguage(form.language);
        await userAPI.updateLanguage(form.language);
      }
      setFloppyDiskd(true);
      toast.success(t('profile.saveSuccess'));
      setTimeout(() => setFloppyDiskd(false), 3000);
    } catch { toast.error('FloppyDisk failed'); }
    finally { setSaving(false); }
  };

  const roleInfo = ROLES_INFO[user?.role] || ROLES_INFO.farmer;

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-indigo-100 selection:text-indigo-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/30 border border-indigo-400/20 flex items-center gap-2">
                <User size={14} weight="fill" className="animate-pulse" />
                {t('profile.verified_farmer')}
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Star size={14} weight="fill" className="text-amber-500" />
                Premium Member
              </div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('nav.profile')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 max-w-lg leading-relaxed">
              {t('profile.update_desc')}
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => { if (window.confirm('Do you want to logout?')) logout(); }} className="h-14 px-8 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 rounded-2xl shadow-xl shadow-red-200/20 dark:shadow-none hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest">
                <SignOut size={18} weight="bold" />
                {t('nav.logout')}
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
           
           {/* Left Column: Stats & Identity */}
           <div className="lg:col-span-4 space-y-10">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">{t('profile.identity')}</p>
                 
                 <div className="relative w-44 h-44 mx-auto mb-10 group/avatar">
                    <div className="w-full h-full rounded-[3rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover/avatar:scale-105 group-hover/avatar:rotate-2 duration-500">
                       {form.profilePic ? (
                         <img src={form.profilePic} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <User size={64} className="text-slate-200" weight="fill" />
                       )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all">
                       <Camera size={24} weight="fill" />
                       <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                    {form.profilePic && (
                      <button onClick={() => set('profilePic', '')} className="absolute -top-2 -left-2 w-10 h-10 bg-white dark:bg-slate-800 text-red-500 rounded-xl shadow-lg flex items-center justify-center hover:bg-red-50 transition-all">
                         <Trash size={18} weight="bold" />
                      </button>
                    )}
                 </div>

                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{form.name || t('profile.farmer_default')}</h2>
                 <p className="text-xs font-bold text-slate-400 mb-8">{user?.email || user?.phone}</p>
                 
                 <div className="flex flex-wrap justify-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                       {t(`auth.${user?.role || 'farmer'}`)}
                    </div>
                    <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                       {t('profile.verified')}
                    </div>
                 </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                 <h3 className="font-black text-white uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
                    <ShieldCheck size={20} weight="fill" className="text-amber-400" />
                    {t('profile.security')} & {t('profile.notifications')}
                 </h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between group/item">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 group-hover/item:bg-white group-hover/item:text-indigo-600 transition-all">
                             <Bell size={18} weight="bold" />
                          </div>
                          <div>
                             <p className="text-xs font-black text-white">{t('profile.notifications')}</p>
                             <p className="text-[10px] font-bold text-white/50">{t('profile.enabled_sms_push')}</p>
                          </div>
                       </div>
                       <CaretRight size={14} weight="bold" className="text-white/30" />
                    </div>
                    <div className="flex items-center justify-between group/item">
                       <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 group-hover/item:bg-white group-hover/item:text-indigo-600 transition-all">
                             <IdentificationCard size={18} weight="bold" />
                          </div>
                          <div>
                             <p className="text-xs font-black text-white">{t('profile.kyc_verification')}</p>
                             <p className="text-[10px] font-bold text-white/50">{t('profile.completed_aadhar')}</p>
                          </div>
                       </div>
                       <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Form Fields */}
           <div className="lg:col-span-8 space-y-10">
              
              {/* Personal Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-14 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                       <User size={24} weight="fill" />
                    </div>
                    {t('profile.personal_info')}
                 </h3>

                 <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('auth.name_label')}</label>
                       <div className="relative group">
                          <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('auth.name_placeholder')} />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('auth.email_label')}</label>
                       <div className="relative group">
                          <Globe size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                          <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-14 pr-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" value={form.email} onChange={e => set('email', e.target.value)} placeholder={t('auth.email_placeholder')} />
                       </div>
                    </div>
                 </div>

                 <div className="mt-10 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('profile.preferred_lang')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                       {LANGUAGES.map(l => (
                         <button key={l.code} onClick={() => set('language', l.code)} className={clsx("h-14 rounded-2xl border-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all", form.language === l.code ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-200")}>
                            <span className="text-base">{l.flag}</span>
                            {l.label}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Farm Section */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-14 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                       <Plant size={24} weight="fill" />
                    </div>
                    {t('profile.farm_settings')}
                 </h3>

                 <div className="grid sm:grid-cols-2 gap-10">
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('profile.village_town')}</label>
                          <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" value={form.location.village} onChange={e => setL('village', e.target.value)} placeholder={t('profile.village_placeholder')} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('profile.district')}</label>
                             <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" value={form.location.district} onChange={e => setL('district', e.target.value)} />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('profile.pincode')}</label>
                             <input className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" value={form.location.pincode} onChange={e => setL('pincode', e.target.value)} />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('labour.state')}</label>
                          <div className="relative">
                             <select className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none appearance-none cursor-pointer" value={form.location.state} onChange={e => setL('state', e.target.value)}>
                                <option value="">{t('market.filter_state')}</option>
                                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <CaretRight size={14} weight="bold" className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('profile.land_area')}</label>
                          <input type="number" className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" value={form.farmDetails.landArea} onChange={e => setF('landArea', e.target.value)} placeholder={t('profile.land_area_placeholder')} />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('crop.soil_type')}</label>
                          <div className="relative">
                             <select className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none appearance-none cursor-pointer" value={form.farmDetails.soilType} onChange={e => setF('soilType', e.target.value)}>
                                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <CaretRight size={14} weight="bold" className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('profile.irrigation_system')}</label>
                          <div className="relative">
                             <select className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none appearance-none cursor-pointer" value={form.farmDetails.irrigation} onChange={e => setF('irrigation', e.target.value)}>
                                {IRRIGATION.map(i => <option key={i} value={i}>{i}</option>)}
                             </select>
                             <CaretRight size={14} weight="bold" className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Footer */}
              <div className="flex gap-4">
                 <button onClick={save} disabled={saving} className="flex-[2] h-20 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-4 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
                    {saved ? <CheckCircle size={28} weight="fill" /> : <FloppyDisk size={28} weight="fill" />}
                    {saved ? t('profile.saved') : saving ? t('profile.saving') : t('common.save')}
                 </button>
                 <button onClick={() => setForm({ name: '', email: '', language: 'en', profilePic: '', location: { village: '', district: '', state: '', pincode: '' }, farmDetails: { landArea: '', soilType: 'loamy', irrigation: 'canal' }})} className="flex-1 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    Reset
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
