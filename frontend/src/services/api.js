import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let tokenProvider = null;
export const setTokenProvider = (fn) => { tokenProvider = fn; };

// Attach JWT from Clerk
api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    try {
      const token = await tokenProvider();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      console.error('Failed to get auth token', err);
    }
  }
  return config;
});

// Auto refresh logic is handled by Clerk SDK automatically


// ─── Auth ─────────────────────────────────────────
export const authAPI = {
  login:      (email, password) => api.post('/auth/login', { email, password }),
  register:   (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
  refresh:    (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout:     (refreshToken) => api.post('/auth/logout', { refreshToken }),
  me:         () => api.get('/auth/me'),
};

// ─── User ──────────────────────────────────────────
export const userAPI = {
  getProfile:     () => api.get('/users/profile'),
  saveProfile:    (data) => api.post('/users/profile', data),
  updateLanguage: (language) => api.patch('/users/language', { language }),
  updateLocation: (loc) => api.patch('/users/location', loc),
};

// ─── Weather ───────────────────────────────────────
export const weatherAPI = {
  getCurrent: (lat, lon) => api.get(`/weather/current?lat=${lat}&lon=${lon}`),
  getByCity:  (city) => api.get(`/weather/by-city?city=${encodeURIComponent(city)}`),
  getMarkers: () => api.get('/weather/map-markers'),
};

// ─── Crop ──────────────────────────────────────────
export const cropAPI = {
  recommend: (data) => api.post('/crop/recommend', data),
  calendar:  (crop, state, lang) => api.get(`/crop/calendar?crop=${crop}&state=${state}&lang=${lang}`),
};

// ─── Fertilizer ────────────────────────────────────
export const fertilizerAPI = {
  analyze: (formData) => api.post('/fertilizer/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  }),
  getMarkers: () => api.get('/fertilizer/soil/map-markers'),
};

// ─── Market ────────────────────────────────────────
export const marketAPI = {
  getPrices:     (state, commodity) => api.get('/market/prices', { params: { state, commodity } }),
  getCommodities:() => api.get('/market/commodities'),
  getStates:     () => api.get('/market/states'),
  getDistricts:  (state) => api.get('/market/districts', { params: { state } }),
  getTrends:     (commodity, state, market) => api.get('/market/trends', { params: { commodity, state, market } }),
  getMarkers:    () => api.get('/market/map-markers'),
};

// ─── Labour ────────────────────────────────────────
export const labourAPI = {
  getJobs:    (params) => api.get('/labour/jobs', { params }),
  postJob:    (data) => api.post('/labour/jobs', data),
  getJob:     (id) => api.get(`/labour/jobs/${id}`),
  applyJob:   (id, data) => api.post(`/labour/jobs/${id}/apply`, data),
  myJobs:     () => api.get('/labour/my-jobs'),
  updateStatus:(id, status) => api.patch(`/labour/jobs/${id}/status`, { status }),
  getMarkers: () => api.get('/labour/map-markers'),
};

// ─── Chatbot ───────────────────────────────────────
export const chatAPI = {
  sendMessage: (message, sessionId, language) =>
    api.post('/chatbot/message', { message, sessionId, language }),
  getHistory:  (sessionId) => api.get(`/chatbot/history/${sessionId}`),
  clearHistory:(sessionId) => api.delete(`/chatbot/history/${sessionId}`),
};

// ─── News ──────────────────────────────────────────
export const newsAPI = {
  getLatest: (lang) => api.get(`/news/latest?lang=${lang}`),
};

// ─── Payment ───────────────────────────────────────
export const paymentAPI = {
  createOrder: (amount) => api.post('/payment/order', { amount }),
  verifyPayment: (data) => api.post('/payment/verify', data),
};

// ─── Schemes ───────────────────────────────────────
export const schemesAPI = {
  getSchemes: () => api.get('/schemes'),
};

export default api;

