import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  ChatCircleText, 
  Users, 
  PaperPlaneRight, 
  House, 
  Plant, 
  Storefront, 
  CloudSun, 
  Sparkle, 
  User, 
  SpinnerGap, 
  CaretRight, 
  ShieldCheck,
  Translate,
  ArrowClockwise,
  ArrowLeft,
  MapPin
} from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

// Rooms list
const ROOMS = [
  { id: 'general', key: 'general', titleEn: 'General Discussion', titleHi: 'कल्याण मंच', descEn: 'General farming chat and greetings', descHi: 'सामान्य खेती बातचीत और बधाई', icon: House, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
  { id: 'crop', key: 'crop', titleEn: 'Crop Advisory', titleHi: 'फसल परामर्श', descEn: 'Discuss soil, seeds, diseases and sowing', descHi: 'मिट्टी, बीज, रोग और बुवाई पर चर्चा', icon: Plant, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
  { id: 'market', key: 'market', titleEn: 'Market Trading', titleHi: 'मंडी व्यापार', descEn: 'Share live prices and trading tips', descHi: 'लाइव मंडी भाव और व्यापार सुझाव साझा करें', icon: Storefront, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
  { id: 'weather', key: 'weather', titleEn: 'Weather & Alerts', titleHi: 'मौसम और आपातकाल', descEn: 'Rain updates, storm alerts and safety', descHi: 'बारिश के अपडेट, तूफान की चेतावनी और सुरक्षा', icon: CloudSun, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30' }
];

const LOCATION_ROOMS = [
  { id: 'punjab', key: 'punjab', titleEn: 'Punjab Wheat Zone', titleHi: 'पंजाब गेहूं क्षेत्र', descEn: 'Wheat and crop rotation chats in Punjab', descHi: 'पंजाब में गेहूं और फसल चक्र चर्चा', icon: Plant, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30', state: 'Punjab' },
  { id: 'up', key: 'up', titleEn: 'UP Cane & Paddy Belt', titleHi: 'यूपी गन्ना और धान बेल्ट', descEn: 'Sugarcane and paddy discussions in UP', descHi: 'यूपी में गन्ना और धान की चर्चा', icon: Plant, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30', state: 'Uttar Pradesh' },
  { id: 'maharashtra', key: 'maharashtra', titleEn: 'Maharashtra Grape & Cotton', titleHi: 'महाराष्ट्र अंगूर और कपास', descEn: 'Horticulture & cash crops in MH', descHi: 'महाराष्ट्र में बागवानी और नकदी फसलें', icon: Plant, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30', state: 'Maharashtra' },
  { id: 'mp', key: 'mp', titleEn: 'MP Soy & Pulse Growers', titleHi: 'एमपी सोया और दाल उत्पादक', descEn: 'Soybean and pulses cultivation in MP', descHi: 'एमपी में सोयाबीन और दलहन की खेती', icon: Plant, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30', state: 'Madhya Pradesh' }
];

// Quick Replies for farmers
const QUICK_REPLIES = {
  hi: [
    'नमस्कार भाइयों 🙏',
    'राम राम जय किसान 🌾',
    '@kisan आज गेहूं का मंडी भाव क्या है?',
    '@kisan टमाटर में पत्ता मरोड़ रोग का क्या इलाज है?',
    '@kisan इस सप्ताह बारिश होने की क्या संभावना है?',
    'खाद की उपलब्धता कैसी है आपके क्षेत्र में?'
  ],
  en: [
    'Hello everyone! 🙏',
    'Ram Ram Jai Kisan 🌾',
    '@kisan What is the market price of wheat today?',
    '@kisan How to treat leaf curl disease in tomatoes?',
    '@kisan What is the rainfall forecast for this week?',
    'How is the fertilizer availability in your region?'
  ]
};

export default function Community() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  
  const [currentRoom, setCurrentRoom] = useState('general');
  const [roomFilter, setRoomFilter] = useState('global'); // 'global' | 'regional'
  const [messages, setMessages] = useState([]);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [mobileView, setMobileView] = useState('channels'); // 'channels' or 'chat'

  const getRegionalRooms = () => {
    const userState = user?.location?.state || 'Madhya Pradesh';
    const userDistrict = user?.location?.district || 'Satna';
    const userLocal = {
      id: `local_${userDistrict.toLowerCase()}`,
      key: `local_${userDistrict.toLowerCase()}`,
      titleEn: `${userDistrict} District Forum`,
      titleHi: `${userDistrict} जिला मंच`,
      descEn: `Local updates in ${userDistrict}, ${userState}`,
      descHi: `${userDistrict}, ${userState} के स्थानीय अपडेट`,
      icon: MapPin,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30',
      state: userState
    };
    return [userLocal, ...LOCATION_ROOMS];
  };

  const getFilteredRooms = () => {
    if (roomFilter === 'global') {
      return ROOMS;
    } else {
      return getRegionalRooms();
    }
  };

  // Construct Socket Server URL
  useEffect(() => {
    let socketUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || '';
    if (socketUrl) {
      socketUrl = socketUrl.replace('/api', '');
    } else {
      if (window.location.port === '5173' || window.location.port === '5174') {
        socketUrl = 'http://localhost:5000';
      } else {
        socketUrl = window.location.origin;
      }
    }

    console.log('🔌 Connecting to socket server at:', socketUrl);
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket community');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket community');
      setConnected(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Room Join and History Fetch Logic
  useEffect(() => {
    if (!socket || !user) return;

    // Join new room
    socket.emit('join-room', {
      room: currentRoom,
      user: {
        id: user.id || user._id,
        name: user.name,
        role: user.role || 'Farmer',
        image: user.image || user.profilePic || null
      }
    });

    // Fetch message history for the room
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const token = localStorage.getItem('sk_token');
        let baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '';
        if (!baseUrl) baseUrl = '/api';
        if (!baseUrl.endsWith('/api')) baseUrl = `${baseUrl}/api`;

        const { data } = await axios.get(`${baseUrl}/community/history/${currentRoom}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (data.success) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();

    // Listen to messages
    const handleReceiveMessage = (msg) => {
      if (msg.room === currentRoom) {
        setMessages(prev => [...prev, msg]);
      }
    };

    // Listen to active users update
    const handleActiveUsers = (users) => {
      setActiveUsersList(users);
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('active-users', handleActiveUsers);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('active-users', handleActiveUsers);
    };
  }, [socket, currentRoom, user]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingHistory]);

  const handleSendMessage = (textToSend = null) => {
    const msgText = textToSend || inputMessage;
    if (!msgText.trim() || !socket || !user) return;

    const messageData = {
      room: currentRoom,
      senderId: user.id || user._id,
      senderName: user.name,
      senderRole: user.role || 'Farmer',
      senderImage: user.image || user.profilePic || null,
      message: msgText
    };

    socket.emit('send-message', messageData);
    if (!textToSend) {
      setInputMessage('');
    }
  };

  const getQuickReplies = () => {
    const lang = i18n.language === 'hi' ? 'hi' : 'en';
    return QUICK_REPLIES[lang];
  };

  const getRoomInfo = () => {
    const allRooms = [...ROOMS, ...getRegionalRooms()];
    return allRooms.find(r => r.id === currentRoom) || ROOMS[0];
  };
  const currentRoomInfo = getRoomInfo();

  return (
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-purple-100 selection:text-purple-900 pt-20 sm:pt-28 pb-4 lg:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 h-[calc(100vh-120px)] lg:h-[calc(100vh-160px)] min-h-0 lg:min-h-[600px]">
          
          {/* LEFT PANEL: Rooms / Channels Selector */}
          <div className={clsx(
            "lg:col-span-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl lg:rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 p-4 lg:p-6 flex flex-col shadow-sm h-full",
            mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
          )}>
            <div className="flex flex-col gap-1.5 mb-6 px-2">
              <div>
                <h2 className="text-xl font-bold text-black dark:text-black leading-tight font-outfit">
                  {i18n.language === 'hi' ? 'किसान समुदाय' : 'Kisan Community'}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={clsx("w-2 h-2 rounded-full", connected ? "bg-emerald-500 animate-ping" : "bg-rose-500")} />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                    {connected ? (i18n.language === 'hi' ? 'कनेक्टेड' : 'Connected') : (i18n.language === 'hi' ? 'डिस्कनेक्टेड' : 'Disconnected')}
                  </span>
                </div>
              </div>
            </div>

            {/* Room List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none mb-6">
              {/* Filter Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-800/40 p-1 rounded-2xl mb-4 text-xs font-bold border border-slate-200/10 dark:border-slate-850">
                <button 
                  onClick={() => setRoomFilter('global')}
                  className={clsx(
                    "flex-1 py-2 rounded-xl transition-all text-center",
                    roomFilter === 'global' 
                      ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800/30" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  {i18n.language === 'hi' ? 'वैश्विक' : 'Global'}
                </button>
                <button 
                  onClick={() => setRoomFilter('regional')}
                  className={clsx(
                    "flex-1 py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1",
                    roomFilter === 'regional' 
                      ? "bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm border border-slate-200/20 dark:border-slate-800/30" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  <MapPin size={12} weight="fill" />
                  {i18n.language === 'hi' ? 'क्षेत्रीय' : 'Regional'}
                </button>
              </div>

              <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-2 mb-2 flex items-center justify-between">
                <span>{roomFilter === 'global' ? (i18n.language === 'hi' ? 'चर्चा कक्ष' : 'CHANNELS') : (i18n.language === 'hi' ? 'स्थानीय धागे' : 'LOCAL THREADS')}</span>
                {roomFilter === 'regional' && (
                  <span className="text-[9px] text-indigo-500 font-extrabold lowercase">({user?.location?.state || 'MP'})</span>
                )}
              </div>
              
              {getFilteredRooms().map((room) => {
                const isSelected = currentRoom === room.id;
                const Icon = room.icon;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setCurrentRoom(room.id);
                      setMobileView('chat');
                    }}
                    className={clsx(
                      "w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group",
                      isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white"
                    )}
                  >
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105", room.color)}>
                      <Icon weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm tracking-tight truncate">
                        {i18n.language === 'hi' ? room.titleHi : room.titleEn}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 font-semibold">
                        {i18n.language === 'hi' ? room.descHi : room.descEn}
                      </div>
                    </div>
                    <CaretRight 
                      size={14} 
                      weight="bold" 
                      className={clsx(
                        "transition-all duration-300",
                        isSelected ? "text-indigo-500 translate-x-0.5" : "text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100"
                      )} 
                    />
                  </button>
                );
              })}
            </div>

            {/* Active Users Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between px-2 mb-4">
                <div className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
                  <Users size={14} weight="bold" />
                  <span>{i18n.language === 'hi' ? 'सक्रिय किसान' : 'ONLINE USERS'}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold">
                  {activeUsersList.length}
                </span>
              </div>

              <div className="flex -space-x-2 overflow-hidden px-2 mb-3">
                {activeUsersList.map((usr) => (
                  <div key={usr.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800" title={`${usr.name} (${usr.role})`}>
                    {usr.image ? (
                      <img src={usr.image} alt={usr.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-bold text-slate-400">
                        {usr.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold px-2">
                {activeUsersList.length > 0 
                  ? (i18n.language === 'hi' ? `${activeUsersList.length} सदस्य अभी जुड़े हैं` : `${activeUsersList.length} members active in this room`)
                  : (i18n.language === 'hi' ? 'कोई अन्य सक्रिय सदस्य नहीं' : 'No active members')}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Chat Area */}
          <div className={clsx(
            "lg:col-span-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl lg:rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 flex flex-col shadow-sm overflow-hidden h-full",
            mobileView === 'channels' ? 'hidden lg:flex' : 'flex'
          )}>
            
            {/* Chat Room Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/40 dark:bg-slate-900/40">
              <div className="flex items-center gap-4">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setMobileView('channels')}
                  className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 shrink-0 transition-colors"
                >
                  <ArrowLeft size={20} weight="bold" />
                </button>

                <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0", currentRoomInfo?.color)}>
                  {currentRoomInfo && (() => {
                    const Icon = currentRoomInfo.icon;
                    return <Icon weight="duotone" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight font-outfit">
                    {currentRoomInfo && (i18n.language === 'hi' ? currentRoomInfo.titleHi : currentRoomInfo.titleEn)}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    {currentRoomInfo && (i18n.language === 'hi' ? currentRoomInfo.descHi : currentRoomInfo.descEn)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Users size={14} className="text-indigo-500" />
                  {activeUsersList.length} {i18n.language === 'hi' ? 'सक्रिय' : 'online'}
                </span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4 lg:space-y-6 bg-slate-50/30 dark:bg-slate-950/10 scrollbar-thin">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <SpinnerGap size={28} className="animate-spin text-indigo-500" />
                  <span className="text-xs font-bold">{i18n.language === 'hi' ? 'इतिहास लोड हो रहा है...' : 'Loading discussion history...'}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400/80 p-8 text-center border-2 border-dashed border-slate-200/40 dark:border-slate-800/40 rounded-[2rem] mx-4 my-8">
                  <ChatCircleText size={52} className="text-slate-300 dark:text-slate-700 mb-4 animate-bounce" weight="duotone" />
                  <h4 className="text-base font-black text-slate-500 dark:text-slate-400 font-outfit mb-2">
                    {i18n.language === 'hi' ? 'नया वार्तालाप प्रारंभ करें' : 'Start the Conversation'}
                  </h4>
                  <p className="text-xs font-bold text-slate-400 max-w-sm leading-relaxed">
                    {i18n.language === 'hi' 
                      ? 'इस कक्ष में अभी तक कोई संदेश नहीं है। पहला संदेश भेजें या खेती का सवाल पूछने के लिए @kisan का उपयोग करें।' 
                      : 'No messages in this channel yet. Send the first greeting or type @kisan to ask agricultural questions.'}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === (user.id || user._id);
                  const isBot = msg.senderId === 'ai-bot';
                  
                  return (
                    <div 
                      key={msg._id || index} 
                      className={clsx(
                        "flex gap-3",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      {/* Sender Image (if not current user) */}
                      {!isMe && (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200 dark:border-slate-850 flex items-center justify-center">
                          {isBot ? (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg">
                              <Sparkle weight="fill" />
                            </div>
                          ) : msg.senderImage ? (
                            <img src={msg.senderImage} alt={msg.senderName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-sm font-bold text-slate-400 uppercase">
                              {msg.senderName.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bubble Wrap */}
                      <div className="max-w-[75%] sm:max-w-[65%]">
                        {/* Name Header for incoming messages */}
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1 ml-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {msg.senderName}
                            </span>
                            <span className={clsx(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider",
                              isBot 
                                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200/30" 
                                : msg.senderRole?.toLowerCase() === 'buyer'
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            )}>
                              {isBot ? 'Bot' : msg.senderRole || 'Farmer'}
                            </span>
                          </div>
                        )}

                        {/* Content Card */}
                        <div
                          className={clsx(
                            "p-4 rounded-2xl text-sm leading-relaxed",
                            isMe
                              ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10 font-medium"
                              : isBot
                                ? "bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/15 dark:to-purple-950/15 border-2 border-indigo-500/20 text-slate-800 dark:text-slate-200 rounded-tl-none relative shadow-sm"
                                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/50 rounded-tl-none shadow-sm"
                          )}
                        >
                          {isBot && (
                            <div className="absolute -top-3.5 -right-2 bg-indigo-600 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase flex items-center gap-1 shadow-md">
                              <Sparkle size={10} weight="fill" className="animate-spin" />
                              <span>AI Answer</span>
                            </div>
                          )}

                          <p className="font-semibold">{msg.message}</p>
                          
                          <div className={clsx(
                            "text-[10px] text-right mt-2 font-bold",
                            isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies chips */}
            <div className="px-4 lg:px-6 py-2.5 lg:py-3 border-t border-slate-100 dark:border-slate-800/60 flex gap-2 overflow-x-auto scrollbar-none bg-white/20 dark:bg-slate-900/20 shrink-0">
              {getQuickReplies().map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(reply)}
                  className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/40 dark:hover:bg-indigo-950/30 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full border border-slate-200/50 dark:border-slate-800/40 whitespace-nowrap transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Chat Input Footer */}
            <div className="p-4 lg:p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 flex flex-col gap-2">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'enter' || e.key === 'Enter') handleSendMessage(); }}
                  placeholder={i18n.language === 'hi' ? "अपने विचार लिखें, या प्रश्न पूछने के लिए @kisan का प्रयोग करें..." : "Write your thoughts, or type @kisan to ask farming questions..."}
                  className="flex-1 h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                />
                
                <button
                  onClick={() => handleSendMessage()}
                  className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
                >
                  <PaperPlaneRight size={20} weight="fill" />
                </button>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold px-2 flex items-center justify-between">
                <span>⚡ {i18n.language === 'hi' ? 'त्वरित सलाह के लिए संदेश में @kisan टैग करें' : 'Mention @kisan in message for instant AI diagnostic advisor'}</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  {i18n.language === 'hi' ? 'सुरक्षित और एन्क्रिप्टेड' : 'Secure and verified'}
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
