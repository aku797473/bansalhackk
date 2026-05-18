import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import { 
  Camera, 
  User, 
  IdentificationCard, 
  Briefcase, 
  Handshake, 
  UserCircle, 
  Sparkle, 
  ArrowRight, 
  ShieldCheck, 
  Calendar, 
  MapPin 
} from '@phosphor-icons/react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'farmer',
    bio: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      let locStr = '';
      if (user.location && typeof user.location === 'object') {
        const parts = [];
        if (user.location.village) parts.push(user.location.village);
        if (user.location.district && user.location.district !== user.location.village) parts.push(user.location.district);
        if (user.location.state) parts.push(user.location.state);
        locStr = parts.join(', ');
      } else {
        locStr = user.location || '';
      }

      setFormData({
        name: user.name || '',
        role: user.role || 'farmer',
        bio: user.bio || '',
        phone: user.phone || '',
        location: locStr
      });
    }
  }, [user]);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ image: reader.result, profilePic: reader.result });
        toast.success('Profile picture updated locally');
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.name) score += 20;
    if (formData.phone) score += 20;
    if (formData.role) score += 20;
    if (formData.location) score += 20;
    if (user?.image || user?.profilePic) score += 20;
    return score;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const parts = formData.location.split(',').map(p => p.trim());
      const village = parts[0] || '';
      const district = parts[1] || parts[0] || '';
      const state = parts[2] || parts[1] || 'Madhya Pradesh';

      const payload = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio,
        phone: formData.phone,
        location: {
          village,
          district,
          state,
          lat: user?.location?.lat,
          lng: user?.location?.lng
        }
      };

      await updateUser(payload);
      toast.success('Profile secured and updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 relative">
      <ThreeBackground />
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Cover Banner Header */}
        <div className="relative h-56 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/20 via-green-600/10 to-amber-500/20 border border-emerald-500/10 overflow-visible mb-20 shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent)]" />
          <div className="absolute right-10 bottom-6 opacity-30">
            <Sparkle size={120} className="text-emerald-600/20" weight="duotone" />
          </div>

          {/* Avatar overlapping cover banner */}
          <div className="absolute -bottom-14 left-8 right-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            <div 
              className="w-36 h-36 rounded-[2.5rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-xl relative overflow-hidden group cursor-pointer transition-all hover:scale-102"
              onClick={handleImageClick}
            >
              {user?.image || user?.profilePic ? (
                <img src={user.image || user.profilePic} alt="profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <User size={54} className="text-slate-300 dark:text-slate-700 absolute inset-0 m-auto animate-pulse" weight="bold" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera size={28} weight="bold" />
              </div>
            </div>
            <div className="mb-4 space-y-1">
              <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">MEMBER ACCOUNT</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{formData.name || user?.name || 'Smart Farmer'}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
                  Role: {user?.role || 'farmer'}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin size={14} className="text-emerald-500" />
                  {formData.location || 'India'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Meta & Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Strengths Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-200/40 dark:border-slate-800/40 shadow-2xl space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-600 dark:text-slate-400">Profile Strengths</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{calculateCompletion()}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${calculateCompletion()}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6 space-y-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formData.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓</div>
                  <span className="uppercase tracking-wide">Display Name</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formData.phone ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓</div>
                  <span className="uppercase tracking-wide">Phone Number</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formData.location ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓</div>
                  <span className="uppercase tracking-wide">Operational Location</span>
                </div>
              </div>
            </div>

            {/* Verification Info Card */}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck size={28} className="text-emerald-400" weight="duotone" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">IDENTITY LEVEL</div>
                  <div className="text-sm font-black uppercase tracking-wider mt-0.5">VERIFIED PORTAL</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed uppercase font-bold tracking-wider">
                Your profile information is verified and secured within the decentralized Smart Kisan architecture.
              </p>

              <div className="border-t border-white/10 pt-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Calendar size={18} className="text-emerald-500" />
                ACCOUNT ACTIVE
              </div>
            </div>
          </div>

          {/* Right Column - Editor Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-slate-200/40 dark:border-slate-800/40 shadow-2xl space-y-10">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-6">
                <UserCircle size={32} className="text-emerald-600 dark:text-emerald-400" weight="duotone" />
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Personal Information</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Configure your farmer portal details</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100/50 dark:border-slate-900/50 rounded-2xl px-6 py-4.5 text-sm font-bold uppercase tracking-widest focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100/50 dark:border-slate-900/50 rounded-2xl px-6 py-4.5 text-sm font-bold uppercase tracking-widest focus:border-emerald-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2">Operational Role</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'farmer', icon: IdentificationCard, label: 'Farmer' },
                      { id: 'buyer',  icon: Handshake, label: 'Seller' },
                      { id: 'labour', icon: Briefcase, label: 'Labor' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({...formData, role: role.id})}
                        className={clsx(
                          "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 hover:scale-102",
                          formData.role === role.id 
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" 
                            : "border-slate-100 dark:border-slate-900 text-slate-400 hover:border-emerald-500/30"
                        )}
                      >
                        <role.icon size={28} weight="duotone" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-2">Geographic Location</label>
                  <input 
                    type="text" 
                    placeholder="E.G. SATNA, MADHYA PRADESH"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100/50 dark:border-slate-900/50 rounded-2xl px-6 py-4.5 text-sm font-bold uppercase tracking-widest focus:border-emerald-500 outline-none transition-all dark:text-white"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-black uppercase tracking-[0.4em] rounded-2xl shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'SAVING CHANGES...' : 'SAVE PROFILE'}
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}
