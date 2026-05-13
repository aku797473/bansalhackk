import axios from 'axios';

const AUTH_URL     = import.meta.env.VITE_AUTH_API_URL     || '/api';
const AI_URL       = import.meta.env.VITE_AI_API_URL       || '/api';
const INFO_URL     = import.meta.env.VITE_INFO_API_URL     || 'https://smart-kisan-weather.onrender.com/api';
const MARKET_URL   = import.meta.env.VITE_MARKET_API_URL   || import.meta.env.VITE_INFO_API_URL || 'https://smart-kisan-weather.onrender.com/api';
const BUSINESS_URL = '/api';

// Base instances for each hub
const authApi     = axios.create({ baseURL: AUTH_URL,     timeout: 30000 });
const aiApi       = axios.create({ baseURL: AI_URL,       timeout: 60000 });
const infoApi     = axios.create({ baseURL: INFO_URL,     timeout: 30000 });
const marketApi   = axios.create({ baseURL: MARKET_URL,   timeout: 30000 });
const businessApi = axios.create({ baseURL: BUSINESS_URL, timeout: 30000 });

let tokenProvider = null;
export const setTokenProvider = (fn) => { tokenProvider = fn; };

// Interceptor to attach Clerk token to all hub instances
[authApi, aiApi, infoApi, marketApi, businessApi].forEach(instance => {
  instance.interceptors.request.use(async (config) => {
    // Cache Buster for Info Hub
    if (instance === infoApi) {
      config.params = { ...config.params, _t: Date.now() };
    }
    
    if (tokenProvider) {
      try {
        const token = await tokenProvider();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch (err) { console.error('Token Error', err); }
    }
    return config;
  });
});

// ─── Auth Hub ─────────────────────────────────────
export const authAPI = {
  login:      (email, password) => authApi.post('/auth/login', { email, password }),
  register:   (name, email, password, role) => authApi.post('/auth/register', { name, email, password, role }),
  refresh:    (refreshToken) => authApi.post('/auth/refresh', { refreshToken }),
  logout:     (refreshToken) => authApi.post('/auth/logout', { refreshToken }),
  me:         () => authApi.get('/auth/me'),
};

export const userAPI = {
  getProfile:     () => authApi.get('/users/profile'),
  saveProfile:    (data) => authApi.post('/users/profile', data),
  updateLanguage: (language) => authApi.patch('/users/language', { language }),
  updateLocation: (loc) => authApi.patch('/users/location', loc),
};

// ─── AI Hub ───────────────────────────────────────
export const chatAPI = {
  sendMessage: (message, sessionId, language) =>
    aiApi.post('/chatbot/message', { message, sessionId, language }),
  getHistory:  (sessionId) => aiApi.get(`/chatbot/history/${sessionId}`),
  clearHistory:(sessionId) => aiApi.delete(`/chatbot/history/${sessionId}`),
};

export const cropAPI = {
  recommend: (data) => aiApi.post('/crop/recommend', data),
  calendar:  (crop, state, lang) => aiApi.get(`/crop/calendar?crop=${crop}&state=${state}&lang=${lang}`),
};

export const fertilizerAPI = {
  analyze: (formData) => aiApi.post('/fertilizer/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Info Hub ──────────────────────────────────────
export const weatherAPI = {
  getCurrent: (lat, lon) => infoApi.get(`/weather/current?lat=${lat}&lon=${lon}`),
  getByCity:  (city) => infoApi.get(`/weather/by-city?city=${encodeURIComponent(city)}`),
};

export const marketAPI = {
  getPrices:     (state, commodity, district) => marketApi.get('/market/prices', { params: { state, commodity, district } }),
  getTrends:     (commodity, state, market) => marketApi.get('/market/trends', { params: { commodity, state, market } }),
  getCommodities:() => marketApi.get('/market/commodities'),
  getStates:     () => marketApi.get('/market/states'),
  getDistricts:  (state) => marketApi.get('/market/districts', { params: { state } }),
};

export const newsAPI = {
  getLatest: (lang) => infoApi.get(`/news?lang=${lang}`),
};

export const schemesAPI = {
  getSchemes: () => infoApi.get('/schemes'),
};

// ─── Business Hub ──────────────────────────────────
export const labourAPI = {
  getJobs:    (params) => businessApi.get('/labour/jobs', { params }),
  postJob:    (data) => businessApi.post('/labour/jobs', data),
  getJob:     (id) => businessApi.get(`/labour/jobs/${id}`),
  applyJob:   (id, data) => businessApi.post(`/labour/jobs/${id}/apply`, data),
  myJobs:     () => businessApi.get('/labour/my-jobs'),
};

export const paymentAPI = {
  createOrder: (amount) => businessApi.post('/payment/order', { amount }),
  verifyPayment: (data) => businessApi.post('/payment/verify', data),
};

export const buyerAPI = {
  getBuyers:    (params) => businessApi.get('/buyer/list', { params }),
  registerBuyer: (data) => businessApi.post('/buyer/register', data),
  getBuyer:     (id) => businessApi.get(`/buyer/${id}`),
  getMarkers:   () => businessApi.get('/buyer/map-markers'),
  createOrder:  (data) => businessApi.post('/buyer/orders', data),
  updatePayment: (id, data) => businessApi.patch(`/buyer/orders/${id}/payment`, data),
};

export default authApi; // Default
