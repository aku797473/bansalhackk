import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import ThreeBackground from '../components/ThreeBackground';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Eye, EyeOff, ShieldCheck, UserPlus, Fingerprint, Lock, Phone, User, ArrowRight, Quote } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth as firebaseAuth } from '../config/firebase';

export default function Login() {
  const { t } = useTranslation();
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); 
  const [otpStep, setOtpStep] = useState(false);
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    otp: ''
  });

  const handleGoogleLogin = async () => {
    setLoading(true);
    const id = toast.loading('Connecting Google Account...');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      
      await loginWithGoogle(user.email, user.displayName, user.uid);
      toast.success('Google Access Verified', { id });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      const msg = error.response?.data?.message || error.message || 'Google Auth Cancelled';
      toast.error(msg, { id });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const id = toast.loading(mode === 'login' ? 'Validating Identity...' : mode === 'register' ? 'Initializing Identity...' : 'Processing Request...');
    
    try {
      if (mode === 'login') {
        await login(formData.phone, formData.password);
        toast.success('Identity Verified', { id });
        navigate('/dashboard');
      } else if (mode === 'register') {
        if (!formData.name) throw new Error("Full Name is required");
        await register(formData.name, formData.phone, formData.password, role);
        toast.success('Identity Verified', { id });
        navigate('/dashboard');
      } else if (mode === 'forgot-password') {
        if (!otpStep) {
          const res = await authAPI.requestPasswordReset(formData.phone);
          toast.success(`Demo Mode: Your OTP is ${res.data.mockOtp}`, { id, duration: 8000 });
          setOtpStep(true);
        } else {
          await authAPI.resetPassword(formData.phone, formData.otp, formData.password);
          toast.success('Password Reset Successfully. Please Login.', { id });
          setMode('login');
          setOtpStep(false);
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Operation failed';
      toast.error(msg, { id });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 font-sans selection:bg-emerald-500/30">
      
      {/* Left Pane - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-950 overflow-hidden flex-col justify-between p-12 xl:p-16 border-r border-slate-800/50">
        <ThreeBackground key="login-secure-v3" />
        
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none" />

        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Fingerprint size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tight font-outfit uppercase">
            {t('login_page.title')}
          </span>
        </div>

        {/* Content Area */}
        <div className="relative z-10 max-w-lg mt-auto pb-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <Quote className="text-emerald-500/40 w-12 h-12 mb-6" />
          <h2 className="text-3xl xl:text-4xl font-light text-white leading-snug mb-8">
            Empowering modern agriculture with <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">precision AI</span> and real-time market insights.
          </h2>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-max">
            <div className="w-12 h-12 rounded-full border-2 border-slate-700 overflow-hidden bg-slate-800">
              <img src="https://i.pravatar.cc/150?img=11" alt="Farmer" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Rajesh Kumar</p>
              <p className="text-xs text-slate-400">Wheat Farmer, Punjab</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 xl:p-24 relative bg-white dark:bg-slate-950 overflow-y-auto">
        
        {/* Mobile Header elements */}
        <div className="absolute lg:hidden top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Fingerprint size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-outfit uppercase">
              {t('login_page.title')}
            </span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-black dark:text-black tracking-tight mb-2 font-outfit">
              {mode === 'login' ? t('login_page.sign_in') : mode === 'register' ? t('login_page.create_account') : t('login_page.auth_recovery')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login' ? t('login_page.auth_next_gen') : mode === 'register' ? t('login_page.auth_new_identity') : "Follow the steps to recover your account securely."}
            </p>
          </div>

          {/* Tab Selection */}
          {mode !== 'forgot-password' && (
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-8 border border-slate-200 dark:border-slate-800">
              <button 
                type="button"
                onClick={() => setMode('login')}
                className={clsx(
                  "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                  mode === 'login' 
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                )}
              >
                {t('login_page.sign_in')}
              </button>
              <button 
                type="button"
                onClick={() => setMode('register')}
                className={clsx(
                  "flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                  mode === 'register' 
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700/50" 
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                )}
              >
                {t('login_page.create_account')}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            
            {/* Full Name (For Register Only) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{t('login_page.full_name')}</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    placeholder={t('login_page.full_name_placeholder')}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 text-[15px] font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  />
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}
            
            {/* Phone Number */}
            {(!otpStep || mode !== 'forgot-password') && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{t('login_page.phone_number')}</label>
                <div className="relative">
                  <input 
                    required
                    type="tel" 
                    pattern="[0-9]{10}"
                    title="10 digit phone number"
                    placeholder={t('login_page.phone_placeholder')}
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 text-[15px] font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  />
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            {/* OTP Field for Forgot Password */}
            {mode === 'forgot-password' && otpStep && (
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{t('login_page.otp_code')}</label>
                <div className="relative">
                  <input 
                    required
                    type="text" 
                    pattern="[0-9]{6}"
                    title="6 digit OTP"
                    placeholder="123456"
                    value={formData.otp}
                    onChange={e => setFormData({...formData, otp: e.target.value})}
                    className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 text-[15px] font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none tracking-[0.5em] font-mono"
                  />
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}

            {/* Password */}
            {((mode !== 'forgot-password') || (mode === 'forgot-password' && otpStep)) && (
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    {mode === 'forgot-password' ? t('login_page.new_password') : t('login_page.password')}
                  </label>
                  {mode === 'login' && (
                    <button type="button" onClick={() => { setMode('forgot-password'); setOtpStep(false); setFormData({...formData, otp: '', password: ''}); }} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors">
                      {t('login_page.forgot_password')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    required
                    type={showPassword ? "text" : "password"} 
                    pattern={mode === 'register' || mode === 'forgot-password' ? "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$" : undefined}
                    title={mode === 'register' || mode === 'forgot-password' ? "Must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character" : undefined}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-11 text-[15px] font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  />
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Account Role Card Grid (For Register Only) */}
            {mode === 'register' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{t('login_page.account_role')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {val:'farmer', label: t('login_page.farmer')},
                    {val:'buyer', label: t('login_page.buyer')},
                    {val:'labour', label: t('login_page.labour')}
                  ].map(r => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setRole(r.val)}
                      className={clsx(
                        "py-2.5 rounded-xl border text-[13px] font-semibold capitalize transition-all duration-200",
                        role === r.val 
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 mt-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-[14px] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>
                {loading 
                  ? t('login_page.processing') 
                  : mode === 'login' 
                    ? t('login_page.access_portal') 
                    : mode === 'register' 
                      ? t('login_page.register_identity') 
                      : !otpStep ? t('login_page.send_otp') : t('login_page.reset_password')}
              </span>
              {!loading && <ArrowRight size={16} />}
            </button>
            
            {mode === 'forgot-password' && (
              <div className="text-center mt-4">
                <button type="button" onClick={() => { setMode('login'); setOtpStep(false); }} className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {t('login_page.back_to_login')}
                </button>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center mb-6">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500">{t('login_page.or_continue_with')}</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Google Authentication Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-[14px] font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.63 14.97 1 12 1 7.35 1 3.39 3.65 1.41 7.54l3.86 3C6.2 7.74 8.89 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.91 3.41-8.6z" />
              <path fill="#FBBC05" d="M5.27 14.26c-.25-.74-.39-1.53-.39-2.36s.14-1.62.39-2.36l-3.86-3C.61 8.08 0 9.96 0 12s.61 3.92 1.41 5.46l3.86-3z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.08.72-2.47 1.15-4.26 1.15-3.11 0-5.8-2.7-6.73-5.5l-3.86 3C3.39 20.35 7.35 23 12 23z" />
            </svg>
            {t('login_page.google_account')}
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {t('login_page.secured_vault')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
