import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThreeBackground from '../components/ThreeBackground';
import GoldPaywall from '../components/GoldPaywall';
import toast from 'react-hot-toast';
import { 
  Crown, Calendar, Info, ShieldCheck, SteeringWheel, Timer, CheckCircle, 
  MapPin, PlusCircle, Trash, CurrencyInr, Star, X
} from '@phosphor-icons/react';

export default function AutomobileRental() {
  const { user, updateUser } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-listings' | 'my-bookings'

  // --- Machinery Catalog ---
  const [machineryCatalog, setMachineryCatalog] = useState([
    {
      id: 1,
      name: 'Mahindra Arjun Novo 605',
      type: 'Tractor',
      hp: '57 HP',
      price: 450, // per hour
      image: 'https://images.unsplash.com/photo-1594143491757-55097f48ca9c?auto=format&fit=crop&q=80&w=400',
      owner: 'Rajesh Kumar (Verified)',
      rating: 4.8,
      specs: 'Perfect for deep ploughing & heavy haulage. Comes with rotavator attachment.'
    },
    {
      id: 2,
      name: 'John Deere W70 Grain Harvester',
      type: 'Harvester',
      hp: '100 HP',
      price: 1200, // per hour
      image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=400',
      owner: 'Satnam Farms (Verified)',
      rating: 4.9,
      specs: 'High throughput, low grain loss harvester. Highly recommended for wheat and paddy.'
    },
    {
      id: 3,
      name: 'Fieldking Disc Harrow (Heavy Duty)',
      type: 'Cultivator',
      hp: '35-50 HP req.',
      price: 200, // per hour
      image: 'https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?auto=format&fit=crop&q=80&w=400',
      owner: 'Manoj Patel (Verified)',
      rating: 4.6,
      specs: '16 Discs Harrow attachment for primary soil cultivation and breaking clods.'
    }
  ]);

  // --- Booking States ---
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [bookingHours, setBookingHours] = useState(4);
  const [bookingDate, setBookingDate] = useState('');
  const [hireOperator, setHireOperator] = useState(true);
  const [myBookings, setMyBookings] = useState(() => {
    const saved = localStorage.getItem('sk_automobile_bookings');
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        machineName: 'Mahindra Arjun Novo 605',
        date: 'Jun 15, 2026',
        hours: 6,
        totalPrice: 2700,
        status: 'Scheduled',
        operator: true,
        delivery: 'Kisan Gold Free Delivery'
      }
    ];
  });

  // --- Partner Listing States (Gated for Gold Members) ---
  const [myListings, setMyListings] = useState(() => {
    const saved = localStorage.getItem('sk_my_automobile_listings');
    return saved ? JSON.parse(saved) : [];
  });
  const [listName, setListName] = useState('');
  const [listType, setListType] = useState('Tractor');
  const [listPrice, setListPrice] = useState('');
  const [listHp, setListHp] = useState('');
  const [listSpecs, setListSpecs] = useState('');

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('sk_automobile_bookings', JSON.stringify(myBookings));
  }, [myBookings]);

  useEffect(() => {
    localStorage.setItem('sk_my_automobile_listings', JSON.stringify(myListings));
  }, [myListings]);

  // --- Handlers ---
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please select a booking date');
      return;
    }

    const pricePerHour = selectedMachine.price;
    const operatorCost = hireOperator ? 150 * bookingHours : 0;
    const deliveryFee = user?.isPremium ? 0 : 499;
    const baseCost = pricePerHour * bookingHours;
    const total = baseCost + operatorCost + deliveryFee;

    const newBooking = {
      id: Date.now(),
      machineName: selectedMachine.name,
      date: new Date(bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      hours: bookingHours,
      totalPrice: total,
      status: 'Confirmed',
      operator: hireOperator,
      delivery: user?.isPremium ? 'Kisan Gold Free Delivery' : 'Standard Delivery (₹499 Paid)'
    };

    setMyBookings([newBooking, ...myBookings]);
    setSelectedMachine(null);
    setBookingDate('');
    toast.success('Machinery booked successfully! Order tracked in Bookings tab.');
  };

  const handleCreateListing = (e) => {
    e.preventDefault();
    
    // Monetization check: Only Kisan Gold members can rent out their own machinery
    if (!user?.isPremium) {
      setShowPaywall(true);
      toast.error('Earn from machinery feature is locked. Upgrade to Kisan Gold to list your tractor/harvester!');
      return;
    }

    if (!listName || !listPrice || !listHp) {
      toast.error('All fields are required');
      return;
    }

    const newMachinery = {
      id: Date.now(),
      name: listName,
      type: listType,
      hp: `${listHp} HP`,
      price: parseInt(listPrice),
      image: 'https://images.unsplash.com/photo-1594143491757-55097f48ca9c?auto=format&fit=crop&q=80&w=400', // default mock tractor image
      owner: `${user.name || 'You'} (Gold Seller)`,
      rating: 5.0,
      specs: listSpecs || 'Well maintained machinery, ready for rentals.'
    };

    setMyListings([newMachinery, ...myListings]);
    // Also add it to catalog for interactive browsing during demo
    setMachineryCatalog([...machineryCatalog, newMachinery]);

    setListName('');
    setListPrice('');
    setListHp('');
    setListSpecs('');
    toast.success('Your machinery is listed for rentals! Start earning.');
  };

  const handleDeleteListing = (id) => {
    setMyListings(myListings.filter(l => l.id !== id));
    setMachineryCatalog(machineryCatalog.filter(c => c.id !== id));
    toast.success('Listing removed');
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 relative">
      <ThreeBackground />
      
      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        
        {/* Banner Title */}
        <div className="bg-gradient-to-r from-emerald-600/10 via-emerald-500/5 to-transparent rounded-[2.5rem] p-8 sm:p-10 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 font-outfit tracking-tight flex items-center gap-3">
              Agro-Automobile Rental Hub
              {user?.isPremium && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-black text-amber-500 bg-amber-500/10 rounded-full border border-amber-500/30">
                  <Crown size={14} weight="fill" />
                  Kisan Gold
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Rent tractors, harvesters, cultivators or list your own machinery to earn income
            </p>
          </div>
          
          {!user?.isPremium && (
            <button 
              onClick={() => setShowPaywall(true)}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] transition-all flex items-center gap-2"
            >
              <Crown size={18} weight="fill" />
              Get Kisan Gold Member
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
          {[
            { id: 'browse', label: 'Rent Machinery' },
            { id: 'my-listings', label: 'List Machinery & Earn', premium: true },
            { id: 'my-bookings', label: 'My Bookings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.premium && !user?.isPremium && (
                <Crown size={14} className="text-amber-500 animate-pulse" weight="fill" />
              )}
            </button>
          ))}
        </div>

        {/* ================= TAB 1: RENT MACHINERY (BROWSE) ================= */}
        {activeTab === 'browse' && (
          <div className="space-y-8">
            {/* Promotion banner for Gold user delivery */}
            {!user?.isPremium && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold">
                  <Crown size={18} weight="fill" />
                  Kisan Gold Member Reward: Free Machinery Delivery (Save ₹499)
                </div>
                <button 
                  onClick={() => setShowPaywall(true)}
                  className="text-xs font-black text-amber-500 hover:underline uppercase"
                >
                  Unlock Free Delivery
                </button>
              </div>
            )}

            {/* Machinery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {machineryCatalog.map((machine) => (
                <div key={machine.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/40 dark:border-slate-800/40 rounded-[2.25rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full group">
                  {/* Image wrapper */}
                  <div className="h-52 w-full overflow-hidden relative">
                    <img src={machine.image} alt={machine.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                      {machine.type}
                    </div>
                    
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-extrabold shadow">
                      <Star size={10} weight="fill" />
                      {machine.rating}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-black text-slate-850 dark:text-white tracking-tight leading-tight">{machine.name}</h3>
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{machine.price}</span>
                          <span className="text-slate-400 text-[10px] block">/ hour</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-xs font-bold text-slate-500">
                        <span>Power: <span className="text-slate-700 dark:text-slate-350">{machine.hp}</span></span>
                        <span>Owner: <span className="text-slate-700 dark:text-slate-355">{machine.owner}</span></span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        {machine.specs}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedMachine(machine)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      <Calendar size={16} weight="bold" />
                      Book Rental Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 2: LIST MACHINERY & EARN ================= */}
        {activeTab === 'my-listings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List Machine form (Gated for Gold Members) */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Host Your Machinery</h3>
                  <p className="text-xs text-slate-500">Rent out your idle tractors or cultivators and secure extra income</p>
                </div>

                {!user?.isPremium ? (
                  /* Lock Screen banner for free users */
                  <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/20 text-white rounded-xl space-y-4 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                      <Crown size={20} weight="fill" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-400">Kisan Gold Gated Feature</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                        Hosting and renting out farm equipment to earn income is a premium service. Upgrade to list your fleet with 0% gateway cuts.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowPaywall(true)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black rounded-lg shadow-md hover:scale-[1.01] transition-all"
                    >
                      Upgrade & List Now
                    </button>
                  </div>
                ) : (
                  /* Form enabled for Kisan Gold members */
                  <form onSubmit={handleCreateListing} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Machinery Name / Model</label>
                      <input 
                        type="text" required
                        value={listName} onChange={(e) => setListName(e.target.value)}
                        placeholder="e.g. Swaraj 744 XT"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Machinery Category</label>
                      <select 
                        value={listType} onChange={(e) => setListType(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                      >
                        <option>Tractor</option>
                        <option>Harvester</option>
                        <option>Cultivator</option>
                        <option>Irrigation Pump</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Power Details (HP)</label>
                      <input 
                        type="number" required
                        value={listHp} onChange={(e) => setListHp(e.target.value)}
                        placeholder="e.g. 48"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rental Price (₹ / Hour)</label>
                      <input 
                        type="number" required
                        value={listPrice} onChange={(e) => setListPrice(e.target.value)}
                        placeholder="e.g. 350"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specifications / Attachments</label>
                      <textarea
                        value={listSpecs} onChange={(e) => setListSpecs(e.target.value)}
                        placeholder="e.g. Well maintained Swaraj, includes double clutch, loader attachment..."
                        rows="3"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all dark:text-white"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle size={16} weight="bold" />
                      Publish Machine Listing
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* List of active hosted machinery ads */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">My Hosted Fleet</h3>
                
                {myListings.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-slate-400">
                    <Info size={32} className="mx-auto" />
                    <p className="text-sm font-bold">No hosted machinery listed yet.</p>
                    <p className="text-xs">Once you publish listings, they will show up here to monitor rentals.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-800 dark:text-slate-200">{listing.name}</span>
                            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                              Gold Verified
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs font-medium text-slate-500">
                            <span>Type: <span className="font-bold text-slate-700 dark:text-slate-350">{listing.type}</span></span>
                            <span>Price: <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{listing.price}/Hr</span></span>
                            <span>Specs: <span className="font-semibold">{listing.hp}</span></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600">
                            Listed (Earning)
                          </span>

                          <button 
                            onClick={() => handleDeleteListing(listing.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: MY BOOKINGS ================= */}
        {activeTab === 'my-bookings' && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 border border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Rental Orders</h3>
            
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div key={booking.id} className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200/30 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-lg font-black text-slate-850 dark:text-white tracking-tight">{booking.machineName}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold mt-1">
                        <span className="flex items-center gap-1"><Calendar size={14} /> Date: {booking.date}</span>
                        <span className="flex items-center gap-1"><Timer size={14} /> Duration: {booking.hours} Hours</span>
                        <span className="flex items-center gap-1"><SteeringWheel size={14} /> Driver: {booking.operator ? 'Hired' : 'Self-Drive'}</span>
                      </div>
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                      <Crown size={12} weight="fill" />
                      {booking.delivery}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-200/50 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 font-semibold block">Total Price Paid</span>
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{booking.totalPrice}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 flex items-center gap-1">
                        <CheckCircle size={14} weight="fill" />
                        {booking.status}
                      </span>

                      <button 
                        onClick={() => {
                          setMyBookings(myBookings.filter(b => b.id !== booking.id));
                          toast.success('Rental booking cancelled. Refund processed.');
                        }}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Booking Form Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 text-white shadow-2xl relative">
            <button 
              onClick={() => setSelectedMachine(null)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X size={20} weight="bold" />
            </button>

            <h3 className="text-2xl font-black tracking-tight text-white mb-2">Book Machine</h3>
            <p className="text-xs text-slate-400 mb-6">Confirm dates and hire options for {selectedMachine.name}</p>

            <form onSubmit={handleBookingSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Choose Date</label>
                <input 
                  type="date" required
                  value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Hours Needed ({bookingHours} hrs)</label>
                <input 
                  type="range" min="2" max="24" step="1"
                  value={bookingHours} onChange={(e) => setBookingHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Min: 2 Hrs</span>
                  <span>Max: 24 Hrs</span>
                </div>
              </div>

              {/* Operator Hire Option */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Hire Verified Operator</span>
                  <span className="text-[10px] text-slate-500">+₹150/hr for professional operator</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={hireOperator} 
                  onChange={(e) => setHireOperator(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-800 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                />
              </div>

              {/* Cost breakdown */}
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2 text-xs font-semibold text-slate-400">
                <div className="flex justify-between">
                  <span>Base Machine Charge:</span>
                  <span className="text-white">₹{selectedMachine.price} × {bookingHours} hrs = ₹{selectedMachine.price * bookingHours}</span>
                </div>
                {hireOperator && (
                  <div className="flex justify-between">
                    <span>Operator Cost:</span>
                    <span className="text-white">₹150 × {bookingHours} hrs = +₹{150 * bookingHours}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  {user?.isPremium ? (
                    <span className="text-amber-500 flex items-center gap-0.5"><Crown size={12} weight="fill" /> Gold Free Delivery</span>
                  ) : (
                    <span className="text-white">+₹499</span>
                  )}
                </div>
                <div className="h-px bg-slate-800 my-1" />
                <div className="flex justify-between text-sm font-bold text-white">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400">
                    ₹{(selectedMachine.price * bookingHours) + (hireOperator ? 150 * bookingHours : 0) + (user?.isPremium ? 0 : 499)}
                  </span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all"
              >
                Confirm Booking & Pay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <GoldPaywall 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        onUnlock={async () => {
          try {
            await updateUser({ isPremium: true });
          } catch (err) {
            toast.error('Failed to sync premium status with database');
          }
        }} 
      />
    </div>
  );
}
