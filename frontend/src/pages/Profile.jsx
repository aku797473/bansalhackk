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
        <div className="relative h-56 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/10 via-green-600/5 to-amber-500/10 border border-emerald-500/10 overflow-visible mb-20 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent)]" />
          <div className="absolute right-10 bottom-6 opacity-20">
            <Sparkle size={120} className="text-emerald-600/15" weight="duotone" />
          </div>

          {/* Avatar overlapping cover banner */}
          <div className="absolute -bottom-14 left-8 right-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
            <div 
              className="w-36 h-36 rounded-[2rem] bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 shadow-lg relative overflow-hidden group cursor-pointer transition-all hover:scale-102"
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
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            <div className="mb-4 space-y-1">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{formData.name || user?.name || 'Smart Farmer'}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm capitalize">
                  {user?.role || 'farmer'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
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
            {/* Completion Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-6 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Profile Completion</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{calculateCompletion()}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${calculateCompletion()}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${formData.name ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓</div>
                  <span>Display Name</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${formData.phone ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓</div>
                  <span>Phone Number</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${formData.location ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>✓</div>
                  <span>Operational Location</span>
                </div>
              </div>
            </div>

            {/* Verification Info Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] p-6 text-white shadow-xl border border-white/5 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck size={24} className="text-emerald-400" weight="duotone" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">Verified Profile</h4>
                  <p className="text-xs text-emerald-400 font-medium">Smart Kisan Secure</p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Your credentials are secured inside the Smart Kisan system. No passwords or private tokens are shared.
              </p>

              <div className="border-t border-white/10 pt-4 flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={16} className="text-emerald-500" />
                Active Account
              </div>
            </div>
          </div>

          {/* Right Column - Editor Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] p-8 border border-slate-200/40 dark:border-slate-800/40 shadow-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <UserCircle size={28} className="text-emerald-600 dark:text-emerald-400" weight="duotone" />
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Profile</h3>
                  <p className="text-xs text-slate-500">Update your public details and farming role below</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Operational Role</label>
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
                          "flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 hover:scale-[1.01]",
                          formData.role === role.id 
                            ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" 
                            : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-emerald-500/30"
                        )}
                      >
                        <role.icon size={24} weight="duotone" />
                        <span className="text-xs font-bold capitalize">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Geographic Location</label>
                  <input 
                    type="text" 
                    placeholder="E.G. SATNA, MADHYA PRADESH"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all dark:text-white font-medium"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-semibold rounded-2xl shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.005] active:scale-[0.995] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Saving Changes...' : 'Save Profile'}
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
