import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import { Camera, User, IdentificationCard, Briefcase, Handshake } from '@phosphor-icons/react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'farmer',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        role: user.role || 'farmer',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user]);

  const handleImageClick = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUser({ image: reader.result });
        toast.success('Profile picture updated locally');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(formData);
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
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-4">SECURITY PROTOCOL</div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">User Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Avatar Section */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/20 shadow-2xl text-center">
              <div 
                className="w-40 h-40 mx-auto rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white/50 dark:border-slate-700 relative overflow-hidden group cursor-pointer"
                onClick={handleImageClick}
              >
                {user?.image ? (
                  <img src={user.image} alt="profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <User size={64} className="text-slate-300 absolute inset-0 m-auto" weight="bold" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={32} weight="bold" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              
              <div className="mt-8">
                <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.name}</div>
                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">{user?.role}</div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/10">
               <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">IDENTITY STATUS</div>
               <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  VERIFIED PROTOCOL ACTIVE
               </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[3.5rem] p-12 sm:p-16 border border-white/20 shadow-2xl">
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Operational Role</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'farmer', icon: IdentificationCard, label: 'Farmer' },
                      { id: 'seller', icon: Handshake, label: 'Seller' },
                      { id: 'labor',  icon: Briefcase, label: 'Labor' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setFormData({...formData, role: role.id})}
                        className={clsx(
                          "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                          formData.role === role.id 
                            ? "border-indigo-600 bg-indigo-600/5 text-indigo-600" 
                            : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-600/30"
                        )}
                      >
                        <role.icon size={24} weight="bold" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-2">Geographic Location</label>
                  <input 
                    type="text" 
                    placeholder="E.G. SATNA, MADHYA PRADESH"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest focus:border-indigo-600 outline-none transition-all"
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-6 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.5em] rounded-2xl shadow-xl hover:scale-102 active:scale-98 transition-all disabled:opacity-50"
                >
                  {loading ? 'SECURING DATA...' : 'SAVE ENCRYPTED PROFILE'}
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
