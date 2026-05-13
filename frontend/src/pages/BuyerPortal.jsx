import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { buyerAPI, paymentAPI } from '../services/api';
import { 
  ShoppingBag, Search, Filter, MapPin, Tag, 
  ChevronRight, Star, Clock, ShieldCheck, 
  ShoppingCart, Package, ArrowLeft, CheckCircle2,
  X, Banknote, IndianRupee, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

const CATEGORIES = [
  { id: 'all', name: 'All Produce', icon: '🧺' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'grains', name: 'Grains', icon: '🌾' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'pulses', name: 'Pulses', icon: '🫘' },
];

const FALLBACK_LISTINGS = [
  {
    _id: 'l1', produceName: 'Organic Wheat', category: 'grains', price: 2400, unit: 'quintal', quantity: 50,
    farmerName: 'Ram Singh', location: { district: 'Ludhiana', state: 'Punjab' },
    description: 'High quality Sharbati wheat, grown without synthetic pesticides.',
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=500&auto=format&fit=crop']
  },
  {
    _id: 'l2', produceName: 'Desi Tomatoes', category: 'vegetables', price: 40, unit: 'kg', quantity: 200,
    farmerName: 'Suresh Kumar', location: { district: 'Nashik', state: 'Maharashtra' },
    description: 'Fresh farm-picked tomatoes, ready for dispatch.',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=500&auto=format&fit=crop']
  },
  {
    _id: 'l3', produceName: 'Basmati Rice', category: 'grains', price: 6500, unit: 'quintal', quantity: 20,
    farmerName: 'Jagdish Prasad', location: { district: 'Karnal', state: 'Haryana' },
    description: 'Long grain aromatic Basmati rice, aged for 1 year.',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=500&auto=format&fit=crop']
  }
];

export default function BuyerPortal() {
  const { t } = useTranslation();
  const ref = usePageAnimation();
  const { user } = useAuth();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [orderQty, setOrderQty] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const res = await buyerAPI.getListings(params);
      if (res.data.data.length > 0) {
        setListings(res.data.data);
      } else {
        setListings(FALLBACK_LISTINGS);
      }
    } catch (err) {
      setListings(FALLBACK_LISTINGS);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (listing) => {
    if (orderQty <= 0 || orderQty > listing.quantity) {
      toast.error('Invalid quantity');
      return;
    }

    setProcessingPayment(true);
    try {
      const totalAmount = listing.price * orderQty;
      
      // 1. Load Razorpay
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay failed to load');
        return;
      }

      // 2. Create Razorpay Order
      const { data: rzpOrder } = await paymentAPI.createOrder(totalAmount);

      // 3. Create Local Order (Pending)
      const { data: localOrder } = await buyerAPI.createOrder({
        listingId: listing._id,
        quantity: orderQty,
        totalAmount,
        razorpayOrderId: rzpOrder.id
      });

      // 4. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Smart Kisan Marketplace',
        description: `Buying ${orderQty} ${listing.unit} of ${listing.produceName}`,
        image: '/logo.png',
        order_id: rzpOrder.id,
        handler: async (response) => {
          try {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Update local order status
            await buyerAPI.updatePayment(localOrder.data._id, {
              paymentStatus: 'paid',
              razorpayPaymentId: response.razorpay_payment_id
            });

            toast.success('Payment Successful! Order Placed.');
            setSelectedListing(null);
            fetchListings();
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: '#15803d' }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate purchase');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredListings = listings.filter(l => 
    l.produceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={ref} className="page-wrapper max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-3xl shadow-inner">
              <ShoppingBag className="text-green-600 dark:text-green-400" size={32} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
              {t('buyer.title', 'Buyer Portal')}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-3 font-medium text-lg">
            {t('buyer.subtitle', 'Buy fresh produce directly from farmers at the best prices.')}
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-premium">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-black uppercase tracking-widest text-green-600 dark:text-green-400">
            {listings.length} {t('buyer.active_listings', 'Live Listings')}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-20 z-40 mb-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t('buyer.search_placeholder', 'Search produce or farmers...')}
            className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={clsx(
                "px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all border-2",
                selectedCategory === cat.id 
                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20" 
                  : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-green-500/50"
              )}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-[450px] rounded-[2.5rem]" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20 card border-dashed border-2">
          <Package size={64} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-xl font-black text-gray-400">No produce found matching your search.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.map(listing => (
            <div 
              key={listing._id} 
              className="group card overflow-hidden border-none shadow-premium hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-white dark:bg-slate-900"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={listing.images?.[0] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=500&auto=format&fit=crop'} 
                  alt={listing.produceName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="px-4 py-1.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 shadow-lg border border-white/20">
                    {listing.category}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                   <div className="flex items-center gap-2 text-white">
                      <MapPin size={16} className="text-red-400" />
                      <span className="text-sm font-bold truncate">{listing.location?.district}, {listing.location?.state}</span>
                   </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                      {listing.produceName}
                    </h3>
                    <p className="text-gray-400 text-sm font-bold flex items-center gap-1.5 mt-1">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      4.9 (24 Reviews) • by {listing.farmerName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-green-600 dark:text-green-400 leading-none">
                      ₹{listing.price}
                    </p>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                      per {listing.unit}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 font-medium italic">
                  "{listing.description}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Stock</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{listing.quantity} {listing.unit}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedListing(listing)}
                    className="p-4 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white rounded-2xl transition-all duration-300 group/btn shadow-sm"
                  >
                    <ShoppingCart size={24} className="transition-transform group-hover/btn:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-[2000] p-4">
          <div className="bg-white dark:bg-slate-950 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 animate-scale-up">
            
            {/* Left: Product Info */}
            <div className="md:w-1/2 relative bg-gray-100 dark:bg-slate-900 overflow-hidden min-h-[300px]">
              <img 
                src={selectedListing.images?.[0] || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=500&auto=format&fit=crop'} 
                className="w-full h-full object-cover" 
                alt="Product" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button 
                onClick={() => setSelectedListing(null)}
                className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white/20 transition-all md:hidden"
              >
                <ArrowLeft size={24} />
              </button>
              
              <div className="absolute bottom-10 left-10 right-10 text-white">
                <div className="px-4 py-1.5 bg-green-600 w-max rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg">
                  {selectedListing.category}
                </div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">{selectedListing.produceName}</h2>
                <div className="flex items-center gap-3 text-white/70 font-bold">
                   <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Star size={18} className="text-amber-400 fill-amber-400" />
                   </div>
                   <span>Verified Farmer Stock • Fresh Quality</span>
                </div>
              </div>
            </div>

            {/* Right: Checkout Info */}
            <div className="md:w-1/2 p-8 sm:p-12 overflow-y-auto">
               <div className="hidden md:flex justify-end mb-8">
                  <button 
                    onClick={() => setSelectedListing(null)}
                    className="p-3 bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-red-500 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
               </div>

               <div className="space-y-8">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Select Quantity</label>
                     <div className="flex items-center gap-6">
                        <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-3xl p-2 border-2 border-transparent focus-within:border-green-500 transition-all">
                           <button 
                             onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                             className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center font-black text-xl hover:bg-green-600 hover:text-white transition-all"
                           >
                             -
                           </button>
                           <input 
                              type="number" 
                              className="w-20 bg-transparent text-center font-black text-2xl border-none focus:ring-0" 
                              value={orderQty}
                              onChange={(e) => setOrderQty(Math.min(selectedListing.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                           />
                           <button 
                             onClick={() => setOrderQty(Math.min(selectedListing.quantity, orderQty + 1))}
                             className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center font-black text-xl hover:bg-green-600 hover:text-white transition-all"
                           >
                             +
                           </button>
                        </div>
                        <span className="text-gray-400 font-bold">{selectedListing.unit}</span>
                     </div>
                     <p className="mt-3 text-[10px] text-gray-400 font-bold">Max available: {selectedListing.quantity} {selectedListing.unit}</p>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-[2rem] p-8 space-y-4 border border-gray-100 dark:border-white/5">
                     <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>Unit Price</span>
                        <span>₹{selectedListing.price} / {selectedListing.unit}</span>
                     </div>
                     <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>Quantity</span>
                        <span>{orderQty} {selectedListing.unit}</span>
                     </div>
                     <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-end">
                        <span className="text-lg font-black text-gray-900 dark:text-white">Total Amount</span>
                        <div className="text-right">
                           <span className="text-4xl font-black text-green-600 dark:text-green-400">₹{selectedListing.price * orderQty}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-4">
                     <button 
                        onClick={() => handlePurchase(selectedListing)}
                        disabled={processingPayment}
                        className="w-full h-20 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-[1.5rem] flex items-center justify-center gap-4 text-xl font-black shadow-2xl shadow-green-600/30 transition-all hover:scale-[1.02] active:scale-95"
                     >
                        <Banknote size={24} />
                        {processingPayment ? 'Processing...' : 'Secure Checkout'}
                     </button>
                     <div className="flex items-center justify-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck size={16} className="text-green-500" />
                        Razorpay Secured Transaction
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
