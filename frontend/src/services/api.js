import axios from 'axios';

const AUTH_URL     = import.meta.env.VITE_AUTH_API_URL     || '/api';
const AI_URL       = import.meta.env.VITE_AI_API_URL       || '/api';
const INFO_URL     = import.meta.env.VITE_INFO_API_URL     || '/api';
const BUSINESS_URL = import.meta.env.VITE_BUSINESS_API_URL || '/api';

// Base instances for each hub
const authApi     = axios.create({ baseURL: AUTH_URL,     timeout: 30000 });
const aiApi       = axios.create({ baseURL: AI_URL,       timeout: 60000 });
const infoApi     = axios.create({ baseURL: INFO_URL,     timeout: 30000 });
const businessApi = axios.create({ baseURL: BUSINESS_URL, timeout: 30000 });

let tokenProvider = null;
export const setTokenProvider = (fn) => { tokenProvider = fn; };

// Interceptor to attach Clerk token to all 4 hub instances
[authApi, aiApi, infoApi, businessApi].forEach(instance => {
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
  getPrices:     (state, commodity, district) => infoApi.get('/market/prices', { params: { state, commodity, district } }),
  getCommodities:() => infoApi.get('/market/commodities'),
  getStates:     () => infoApi.get('/market/states'),
  getDistricts:  (state) => infoApi.get('/market/districts', { params: { state } }),
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

export default authApi; // Default

