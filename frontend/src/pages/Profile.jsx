import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import { User, MapPin, Globe, Tractor, Save, CheckCircle, Camera, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

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
  farmer: { emoji: '👨‍🌾', labelKey: 'auth.farmer' }, 
  buyer:  { emoji: '🏪', labelKey: 'auth.buyer' }, 
  labour: { emoji: '👷', labelKey: 'auth.labour' }, 
  admin:  { emoji: '🔑', labelKey: 'auth.admin' } 
};

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: '', email: '', language: 'en',
    profilePic: '',
    location: { village: '', district: '', state: '', pincode: '' },
    farmDetails: { landArea: '', soilType: 'loamy', irrigation: 'canal' },
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

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
  }, []);

  const set  = (k, v)    => setForm(f => ({ ...f, [k]: v }));
  const setL = (k, v)    => setForm(f => ({ ...f, location:    { ...f.location,    [k]: v } }));
  const setF = (k, v)    => setForm(f => ({ ...f, farmDetails: { ...f.farmDetails, [k]: v } }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) { // 3MB limit
        toast.error('Image is too large. Please choose an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        set('profilePic', reader.result);
      };
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
      setSaved(true);
      toast.success(t('profile.saveSuccess', 'Profile saved successfully!'));
      setTimeout(() => setSaved(false), 3000);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const roleInfo = ROLES_INFO[user?.role] || ROLES_INFO.farmer;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in transition-colors">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="text-primary" size={24} />
          {t('nav.profile')}
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('profile.update_desc', 'Update your personal and farming information')}</p>
      </div>

      {/* Profile header card */}
      <div className="card mb-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-slate-800/50 dark:to-slate-800/80 border-primary/20 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6 p-8 transition-colors">
        
        {/* Avatar with Upload */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 border-2 border-primary/30 dark:border-slate-700 flex items-center justify-center text-4xl shrink-0 overflow-hidden shadow-card relative">
            {form.profilePic ? (
              <img src={form.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="group-hover:scale-110 transition-transform">{roleInfo.emoji}</span>
            )}
            
            {/* Overlay */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
              <Camera size={20} />
              <span className="text-[10px] font-bold">{t('profile.change', 'CHANGE')}</span>
            </button>
          </div>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {form.profilePic && (
            <button 
              onClick={() => set('profilePic', '')}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors"
              title="Remove Photo">
              <Trash2 size={12} />
            </button>
          )}
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{form.name || user?.name || 'Farmer'}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{user?.email || user?.phone}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
            <span className="badge badge-green text-xs font-bold py-1 px-3">{t(roleInfo.labelKey)}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 tracking-wider uppercase">{t('profile.verified', 'Verified')}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card transition-colors">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5 text-sm uppercase tracking-wider">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <User size={16} />
            </div>
            <span>{t('profile.personal_info', 'Personal Information')}</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">{t('auth.name_label')}</label>
              <input className="input" placeholder={t('auth.name_placeholder')} value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">{t('auth.email_label')}</label>
              <input className="input" type="email" placeholder={t('auth.email_placeholder')} value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="card transition-colors">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5 text-sm uppercase tracking-wider">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <Globe size={16} />
            </div>
            <span>{t('profile.preferred_lang', 'Preferred Language')}</span>
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => set('language', l.code)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all text-left',
                  form.language === l.code 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary' 
                    : 'border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-gray-200 dark:hover:border-slate-700'
                )}>
                <span className="text-xl">{l.flag}</span>
                <span>{l.label}</span>
                {form.language === l.code && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Location Info */}
        <div className="card transition-colors">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5 text-sm uppercase tracking-wider">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <MapPin size={16} />
            </div>
            <span>{t('profile.address_details', 'Address Details')}</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">{t('profile.village_town', 'Village / Town')}</label>
              <input className="input" placeholder={t('profile.village_placeholder', 'Enter village name')} value={form.location.village} onChange={e => setL('village', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t('profile.district', 'District')}</label>
                <input className="input" placeholder={t('profile.district', 'District')} value={form.location.district} onChange={e => setL('district', e.target.value)} />
              </div>
              <div>
                <label className="label">{t('profile.pincode', 'Pincode')}</label>
                <input className="input" placeholder={t('profile.pincode_placeholder', '000000')} value={form.location.pincode} onChange={e => setL('pincode', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">{t('labour.state')}</label>
              <select className="input" value={form.location.state} onChange={e => setL('state', e.target.value)}>
                <option value="">{t('market.filter_state')}</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Farm Specifics */}
        <div className="card transition-colors">
          <h2 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2.5 text-sm uppercase tracking-wider">
            <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <Tractor size={16} />
            </div>
            <span>{t('profile.farm_info', 'Farm Information')}</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">{t('profile.land_area', 'Land Area (Acres)')}</label>
              <input className="input" type="number" min={0} placeholder={t('profile.land_area_placeholder', 'e.g. 5')} value={form.farmDetails.landArea} onChange={e => setF('landArea', e.target.value)} />
            </div>
            <div>
              <label className="label">{t('crop.soil_type')}</label>
              <select className="input" value={form.farmDetails.soilType} onChange={e => setF('soilType', e.target.value)}>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('profile.irrigation_system', 'Irrigation System')}</label>
              <select className="input" value={form.farmDetails.irrigation} onChange={e => setF('irrigation', e.target.value)}>
                {IRRIGATION.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <button 
          onClick={save} 
          disabled={saving} 
          className="btn-primary flex-1 justify-center py-4 rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all">
          {saved ? (
            <span className="flex items-center gap-2 animate-bounce-sm"><CheckCircle size={20} /> {t('profile.saved', 'SAVED!')}</span>
          ) : saving ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('profile.saving', 'SAVING...')}
            </span>
          ) : (
            <span className="flex items-center gap-2 font-bold"><Save size={20} /> {t('common.save')}</span>
          )}
        </button>
        <button 
          onClick={() => { if (window.confirm('Do you want to logout?')) logout(); }}
          className="btn-secondary px-8 py-4 rounded-2xl border-2 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/40 transition-colors">
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
}
