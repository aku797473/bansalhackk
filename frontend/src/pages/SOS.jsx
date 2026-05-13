import { useState, useEffect } from 'react';
import { 
  Phone, 
  Siren, 
  MapPin, 
  ShieldAlert, 
  Activity,
  HeartPulse,
  Flame,
  Droplet
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EMERGENCIES = [
  {
    id: 'snake',
    title: 'Snake Bite (सांप का काटना)',
    icon: Activity,
    color: 'bg-emerald-500',
    instructions: [
      'Do NOT panic and keep the patient completely still to slow venom spread. (शांत रहें, मरीज को हिलने न दें)',
      'Keep the bitten limb below the heart level. (काटे हुए अंग को दिल के स्तर से नीचे रखें)',
      'Remove any tight clothing, rings, or watches near the bite. (काटे हुए स्थान के पास से तंग कपड़े या गहने हटा दें)',
      'Do NOT cut the wound, attempt to suck the venom, or apply ice. (घाव को काटें नहीं, खून चूसने की कोशिश न करें)',
      'Rush to the nearest hospital IMMEDIATELY. Do not wait for symptoms. (तुरंत पास के अस्पताल जाएं)'
    ]
  },
  {
    id: 'poison',
    title: 'Pesticide/Chemical Poisoning (जहर/केमिकल)',
    icon: Droplet,
    color: 'bg-purple-500',
    instructions: [
      'Move the person away from the chemical area to fresh air. (मरीज को खुली हवा में ले जाएं)',
      'Remove contaminated clothing and wash skin with plenty of soap and water. (खराब कपड़े हटा दें और त्वचा को पानी से धो लें)',
      'If swallowed, do NOT induce vomiting unless instructed by a doctor. (अगर निगल लिया है, तो उल्टी कराने की कोशिश न करें)',
      'Keep the pesticide container/label to show the doctor. (दवा का डब्बा डॉक्टर को दिखाने के लिए साथ रखें)',
      'Call emergency medical services immediately. (तुरंत एम्बुलेंस बुलाएं)'
    ]
  },
  {
    id: 'machinery',
    title: 'Machinery Accident/Cut (मशीन से दुर्घटना/कट)',
    icon: ShieldAlert,
    color: 'bg-orange-500',
    instructions: [
      'Turn OFF the machine immediately. (मशीन को तुरंत बंद कर दें)',
      'Apply firm, direct pressure on the bleeding wound with a clean cloth. (साफ कपड़े से घाव को जोर से दबाएं)',
      'Elevate the injured area above the heart if possible. (घायल अंग को दिल से ऊपर उठाएं)',
      'Do NOT remove any object deeply stuck in the wound. (घाव में फंसी कोई भी चीज खुद न निकालें)',
      'Seek medical help immediately. (तुरंत डॉक्टर के पास जाएं)'
    ]
  },
  {
    id: 'heat',
    title: 'Heat Stroke/Dehydration (लू लगना)',
    icon: Flame,
    color: 'bg-amber-500',
    instructions: [
      'Move the person to a cool, shaded area immediately. (मरीज को तुरंत ठंडी या छायादार जगह पर ले जाएं)',
      'Remove excess clothing and fan the person. (अतिरिक्त कपड़े हटा दें और हवा करें)',
      'Apply cool, wet cloths to the skin or use cool water. (त्वचा पर ठंडा गीला कपड़ा रखें)',
      'If conscious, give small sips of cool water or ORS. (अगर होश में है, तो थोड़ा-थोड़ा पानी या ORS पिलाएं)',
      'If vomiting or unconscious, get medical help fast. (अगर बेहोश है, तो तुरंत अस्पताल ले जाएं)'
    ]
  }
];

export default function SOS() {
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [locationObj, setLocationObj] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    // Try to get location silently on mount for faster map routing
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocationObj({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silent fail
      );
    }
  }, []);

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
          toast.error("Location access denied. Opening general map.");
          window.open(`https://www.google.com/maps/search/Hospitals+near+me`, '_blank');
        }
      );
    } else {
      setLoadingLocation(false);
      window.open(`https://www.google.com/maps/search/Hospitals`, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="bg-red-600 rounded-3xl p-8 text-white shadow-2xl shadow-red-600/30 mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10">
          <HeartPulse size={250} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Siren size={40} className="animate-pulse text-white" />
            <h1 className="text-4xl font-black">Kisan SOS Emergency</h1>
          </div>
          <p className="text-red-100 font-medium text-lg max-w-xl">
            Aapatkalin Seva (आपातकालीन सेवा) - Get instant medical instructions and locate nearby help.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        
        {/* Quick Call Buttons */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-white/5">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 dark:text-white">
            <Phone className="text-red-500" /> Direct Call Helplines
          </h2>
          <div className="space-y-3">
            <a href="tel:108" className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl hover:scale-[1.02] transition-transform">
              <div>
                <div className="font-bold text-red-700 dark:text-red-400">Ambulance (एम्बुलेंस)</div>
                <div className="text-sm text-red-600/80 dark:text-red-400/80">Medical Emergency</div>
              </div>
              <div className="bg-red-600 text-white font-black text-xl px-4 py-2 rounded-xl">108</div>
            </a>
            
            <a href="tel:1551" className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl hover:scale-[1.02] transition-transform">
              <div>
                <div className="font-bold text-green-700 dark:text-green-400">Kisan Call Center</div>
                <div className="text-sm text-green-600/80 dark:text-green-400/80">Agri Emergency</div>
              </div>
              <div className="bg-green-600 text-white font-black text-xl px-4 py-2 rounded-xl">1551</div>
            </a>

            <a href="tel:100" className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl hover:scale-[1.02] transition-transform">
              <div>
                <div className="font-bold text-blue-700 dark:text-blue-400">Police (पुलिस)</div>
                <div className="text-sm text-blue-600/80 dark:text-blue-400/80">Security Emergency</div>
              </div>
              <div className="bg-blue-600 text-white font-black text-xl px-4 py-2 rounded-xl">100</div>
            </a>
          </div>
        </div>

        {/* Nearby Help */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col justify-center text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-black mb-2 dark:text-white">Locate Medical Help</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Find the nearest hospitals, clinics, and ambulance services using your GPS location.
          </p>
          <button 
            onClick={handleNearbyHospitals}
            disabled={loadingLocation}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {loadingLocation ? "Locating..." : "Find Nearby Hospitals"} <MapPin size={20} />
          </button>
        </div>

      </div>

      {/* Instant First Aid Section */}
      <div>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
          <HeartPulse className="text-red-500" /> Instant First Aid Instructions
        </h2>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {EMERGENCIES.map(em => {
            const Icon = em.icon;
            const isSelected = selectedEmergency?.id === em.id;
            return (
              <button
                key={em.id}
                onClick={() => setSelectedEmergency(em)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col items-start gap-3 ${isSelected ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-red-200'}`}
              >
                <div className={`w-12 h-12 rounded-full ${em.color} text-white flex items-center justify-center shadow-lg`}>
                  <Icon size={24} />
                </div>
                <div className="font-bold text-sm text-gray-800 dark:text-gray-200">{em.title}</div>
              </button>
            )
          })}
        </div>

        {selectedEmergency && (
          <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900/30 rounded-3xl p-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-xl font-black text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
              <selectedEmergency.icon /> Immediate Actions for {selectedEmergency.title.split(' (')[0]}
            </h3>
            <ul className="space-y-4">
              {selectedEmergency.instructions.map((inst, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-bold flex items-center justify-center shrink-0 text-sm mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {inst.split(' (')[0]} <br/>
                    <span className="text-red-600/70 dark:text-red-400/70 text-sm">({inst.split('(')[1]}</span>
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800/50 flex gap-3">
              <Siren className="text-red-600 shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300 font-bold">
                These are first-aid instructions only. Please seek professional medical help immediately after taking these steps.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
