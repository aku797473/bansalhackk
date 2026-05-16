import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Phone, 
  Siren, 
  MapPin, 
  ShieldWarning, 
  
  Heartbeat,
  Fire,
  Drop,
  CaretRight,
  WarningCircle,
  Lightning,
  Sparkle,
  ArrowCounterClockwise,
  FirstAid,
  HandPalm
} from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import { usePageAnimation } from '../hooks/usePageAnimation';
import clsx from 'clsx';

const EMERGENCIES = [
  {
    id: 'snake',
    icon: Activity,
    color: 'bg-emerald-500',
    shadow: 'shadow-emerald-500/20',
    instructions: {
      en: [
        'Do NOT panic and keep the patient completely still to slow venom spread.',
        'Keep the bitten limb below the heart level.',
        'Remove any tight clothing, rings, or watches near the bite.',
        'Do NOT cut the wound, attempt to suck the venom, or apply ice.',
        'Rush to the nearest hospital IMMEDIATELY. Do not wait for symptoms.'
      ],
      hi: [
        'शांत रहें और मरीज को पूरी तरह स्थिर रखें ताकि जहर न फैले।',
        'काटे हुए अंग को दिल के स्तर से नीचे रखें।',
        'काटे हुए स्थान के पास से तंग कपड़े, अंगूठी या घड़ी हटा दें।',
        'घाव को काटें नहीं, जहर चूसने की कोशिश न करें, या बर्फ न लगाएं।',
        'तुरंत निकटतम अस्पताल ले जाएं। लक्षणों का इंतजार न करें।'
      ]
    }
  },
  {
    id: 'poison',
    icon: Drop,
    color: 'bg-purple-500',
    shadow: 'shadow-purple-500/20',
    instructions: {
      en: [
        'Move the person away from the chemical area to fresh air.',
        'Remove contaminated clothing and wash skin with plenty of soap and water.',
        'If swallowed, do NOT induce vomiting unless instructed by a doctor.',
        'Keep the pesticide container/label to show the doctor.',
        'Call emergency medical services immediately.'
      ],
      hi: [
        'मरीज को केमिकल वाले क्षेत्र से दूर ताजी हवा में ले जाएं।',
        'खराब कपड़े हटा दें और त्वचा को भरपूर साबुन और पानी से धोएं।',
        'अगर निगल लिया है, तो डॉक्टर के कहे बिना उल्टी न कराएं।',
        'कीटनाशक का डिब्बा/लेबल डॉक्टर को दिखाने के लिए साथ रखें।',
        'तुरंत आपातकालीन चिकित्सा सेवाओं को कॉल करें।'
      ]
    }
  },
  {
    id: 'machinery',
    icon: ShieldWarning,
    color: 'bg-orange-500',
    shadow: 'shadow-orange-500/20',
    instructions: {
      en: [
        'Turn OFF the machine immediately.',
        'Apply firm, direct pressure on the bleeding wound with a clean cloth.',
        'Elevate the injured area above the heart if possible.',
        'Do NOT remove any object deeply stuck in the wound.',
        'Seek medical help immediately.'
      ],
      hi: [
        'मशीन को तुरंत बंद कर दें।',
        'साफ कपड़े से बहते हुए घाव पर सीधा और मजबूत दबाव डालें।',
        'यदि संभव हो तो घायल क्षेत्र को दिल से ऊपर उठाएं।',
        'घाव में गहराई से फंसी किसी भी वस्तु को न निकालें।',
        'तुरंत चिकित्सा सहायता लें।'
      ]
    }
  },
  {
    id: 'heat',
    icon: Fire,
    color: 'bg-amber-500',
    shadow: 'shadow-amber-500/20',
    instructions: {
      en: [
        'Move the person to a cool, shaded area immediately.',
        'Remove excess clothing and fan the person.',
        'Apply cool, wet cloths to the skin or use cool water.',
        'If conscious, give small sips of cool water or ORS.',
        'If vomiting or unconscious, get medical help fast.'
      ],
      hi: [
        'मरीज को तुरंत ठंडी, छायादार जगह पर ले जाएं।',
        'अतिरिक्त कपड़े हटा दें और मरीज को हवा दें।',
        'त्वचा पर ठंडे, गीले कपड़े लगाएं या ठंडा पानी इस्तेमाल करें।',
        'यदि होश में है, तो ठंडे पानी या ORS के छोटे घूंट दें।',
        'यदि उल्टी हो या बेहोश हो, तो तुरंत चिकित्सा सहायता लें।'
      ]
    }
  }
];

export default function SOS() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'hi' ? 'hi' : 'en';
  const ref = usePageAnimation();
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleNearbyHospitals = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLoadingLocation(false);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          window.open(`https://www.google.com/maps/search/Hospitals+near+me/@${lat},${lng},14z`, '_blank');
        },
        (error) => {
          setLoadingLocation(false);
          toast.error(lang === 'hi' ? "स्थान एक्सेस अस्वीकार कर दिया गया।" : "Location access denied.");
          window.open(`https://www.google.com/maps/search/Hospitals+near+me`, '_blank');
        }
      );
    } else {
      setLoadingLocation(false);
      window.open(`https://www.google.com/maps/search/Hospitals`, '_blank');
    }
  };

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-red-100 selection:text-red-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-500/30 border border-red-400/20 flex items-center gap-2">
                <Siren size={14} weight="fill" className="animate-pulse" />
                {t('sos.title')}
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Lightning size={14} weight="fill" className="text-amber-500" />
                {t('sos.version')}
              </div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-400 dark:to-rose-400 bg-clip-text text-transparent">
                {t('sos.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 max-w-lg leading-relaxed">
              {t('sos.subtitle')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={handleNearbyHospitals} disabled={loadingLocation} className="h-14 px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3">
                <MapPin size={18} weight="bold" className={clsx("text-blue-500", loadingLocation && "animate-bounce")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  {loadingLocation ? t('sos.locating') : t('sos.find_hospitals')}
                </span>
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Helplines */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden group">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
               <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                 <Phone size={18} weight="fill" className="text-red-500" />
                 {t('sos.helplines')}
               </h2>

               <div className="space-y-4">
                 {[
                   { label: t('sos.ambulance'), sub: t('sos.medical_emergency'), num: '108', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-100 dark:border-red-500/20' },
                   { label: t('sos.kisan_call_center'), sub: t('sos.agri_emergency'), num: '1551', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
                   { label: t('sos.police'), sub: t('sos.security_emergency'), num: '100', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' }
                 ].map((h, i) => (
                   <a key={i} href={`tel:${h.num}`} className={clsx("flex items-center justify-between p-5 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95 group/call", h.bg, h.border)}>
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm group-hover/call:scale-110 transition-transform">
                         <Phone size={20} weight="fill" className={h.color} />
                       </div>
                       <div>
                         <p className="font-black text-slate-900 dark:text-white text-sm leading-tight uppercase">{h.label}</p>
                         <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">{h.sub}</p>
                       </div>
                     </div>
                     <span className={clsx("text-2xl font-black tracking-tighter", h.color)}>{h.num}</span>
                   </a>
                 ))}
               </div>
            </div>

            {/* Locate Help Bento */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer" onClick={handleNearbyHospitals}>
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                   <MapPin size={24} weight="fill" />
                 </div>
                 <h3 className="text-xl font-black tracking-tight">{t('sos.locate_help')}</h3>
              </div>
              <p className="text-xs font-bold text-blue-100/80 leading-relaxed mb-6">
                {t('sos.locate_desc')}
              </p>
              <div className="flex items-center justify-between mt-auto">
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Tap to start routing</span>
                 <CaretRight size={20} weight="bold" className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>

          {/* Right Column: First Aid */}
          <div className="lg:col-span-8 space-y-8">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 sm:p-12 shadow-sm relative group">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                       <FirstAid size={24} weight="duotone" className="text-red-600 dark:text-red-400" />
                     </div>
                     {t('sos.first_aid')}
                   </h3>
                   <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl">
                      <Sparkle size={14} weight="fill" /> 
                      Smart Advice Engine
                   </div>
                </div>

                {/* Emergency Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                  {EMERGENCIES.map(em => {
                    const Icon = em.icon;
                    const isSelected = selectedEmergency?.id === em.id;
                    return (
                      <button
                        key={em.id}
                        onClick={() => setSelectedEmergency(em)}
                        className={clsx(
                          "relative p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group/em",
                          isSelected 
                            ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-2xl scale-105" 
                            : "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/30"
                        )}
                      >
                        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/em:scale-110", em.color, em.shadow, isSelected && "scale-110")}>
                          <Icon size={28} weight="fill" className="text-white" />
                        </div>
                        <span className={clsx("text-[10px] font-black uppercase tracking-widest text-center leading-tight", isSelected ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400")}>
                          {t(`sos.emergencies.${em.id}`)}
                        </span>
                        {isSelected && <div className="absolute -bottom-2 w-2 h-2 bg-slate-900 dark:bg-white rotate-45" />}
                      </button>
                    )
                  })}
                </div>

                {/* Instructions Area */}
                {selectedEmergency ? (
                  <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 rounded-[2.5rem] p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                       <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", selectedEmergency.color)}>
                         <selectedEmergency.icon size={24} weight="fill" className="text-white" />
                       </div>
                       <h4 className="text-2xl font-black text-red-900 dark:text-red-400 tracking-tighter uppercase">
                         {t('sos.immediate_actions', { type: t(`sos.emergencies.${selectedEmergency.id}`) })}
                       </h4>
                    </div>

                    <div className="space-y-6">
                      {selectedEmergency.instructions[lang].map((inst, i) => (
                        <div key={i} className="flex gap-6 group/inst">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-black flex items-center justify-center shrink-0 shadow-sm group-hover/inst:scale-110 transition-transform">
                            {i + 1}
                          </div>
                          <p className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 leading-relaxed pt-1.5">
                            {inst}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/30 flex gap-5 items-start">
                       <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                         <WarningCircle size={24} weight="fill" className="text-amber-500" />
                       </div>
                       <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                         {t('sos.disclaimer')}
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-slate-100 dark:border-slate-800/50 rounded-[3rem] group hover:border-red-200 transition-all duration-500">
                     <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <HandPalm size={40} weight="duotone" className="text-slate-300 dark:text-slate-600 group-hover:text-red-400 transition-colors" />
                     </div>
                     <h4 className="text-xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('sos.first_aid')}</h4>
                     <p className="text-sm text-slate-400 dark:text-slate-700 mt-4 max-w-xs font-bold leading-relaxed italic">
                       Select an emergency category above to see scientific first-aid steps.
                     </p>
                  </div>
                )}
             </div>

             {/* Bottom Quick Help Card */}
             <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group hover:border-emerald-200 transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-800 group-hover:scale-110 transition-transform">
                        <Heartbeat size={24} weight="fill" className="text-emerald-500" />
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Kisan Mitra AI</h4>
                   </div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                     Ask our AI assistant for specialized agricultural safety advice or crop-related emergencies.
                   </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group hover:border-red-200 transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-800 group-hover:scale-110 transition-transform">
                        <ShieldWarning size={24} weight="fill" className="text-red-500" />
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('sos.rapid_response')}</h4>
                   </div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                     Our network of local volunteers and community workers can be alerted in case of mass emergencies.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
