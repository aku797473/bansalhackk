# 🌾 Smart Kisan — किसान का डिजिटल साथी

> AI-powered agricultural platform for Indian farmers — crop recommendations, weather alerts, market prices, fertilizer analysis, labour marketplace, and multilingual chatbot.

[![CI/CD](https://img.shields.io/github/actions/workflow/status/your-org/smart-kisan/deploy.yml?label=CI%2FCD)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

| Feature | Description | Tech |
|---------|-------------|------|
| 🔐 OTP Auth | Firebase Phone OTP + JWT | Firebase Admin, JWT |
| 🌤️ Weather | Real-time alerts & 5-day forecast | OpenWeatherMap + Redis |
| 🌱 Crop AI | Soil/climate-based AI recommendations | Google Gemini Pro |
| 🔬 Fertilizer | Image-based deficiency detection | Gemini Vision + Multer |
| 💰 Market | Live mandi prices + 30-day trends | Recharts, Redis |
| 👷 Labour | Agricultural job board + apply flow | Kafka events |
| 🗺️ Maps | Mandi/weather map markers | Google Maps JS API |
| 🤖 Chatbot | Multilingual AI assistant (5 langs) | Gemini Pro + Redis |

---

## 🏗️ Architecture

```
Frontend (React+Vite)  →  API Gateway (:5000)  →  8 Microservices
                                ↓
                    Kafka │ Redis │ MongoDB
```

**Microservices:**
- Auth (:5001) · User (:5002) · Weather (:5003) · Crop (:5004)
- Fertilizer (:5005) · Market (:5006) · Labour (:5007) · Chatbot (:5008)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/smart-kisan.git
cd smart-kisan
cp .env.example .env
```

### 2. Fill Environment Variables

Edit `.env` with your API keys:

```env
JWT_SECRET=your_super_secret_key
MONGODB_URI=mongodb://localhost:27017/smart-kisan
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
OPENWEATHER_API_KEY=your_key          # free at openweathermap.org
GEMINI_API_KEY=your_key               # free at ai.google.dev
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
```

### 3. Run with Docker (Recommended)

```bash
# Start entire stack (MongoDB, Redis, Kafka + all services)
docker-compose up --build

# Frontend dev server (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at: **http://localhost:3000**
API Gateway: **http://localhost:5000**

### 4. Run Without Docker (Manual)

```bash
# Terminal 1: Start MongoDB, Redis locally (or use cloud)

# Terminal 2: Gateway
cd gateway && npm install && npm run dev

# Terminal 3-10: Each service
cd services/auth-service && npm install && npm run dev
cd services/user-service && npm install && npm run dev
# ... repeat for all 8 services

# Terminal 11: Frontend
cd frontend && npm install && npm run dev
```

---

## 🔑 Demo Mode (No API Keys)

The app works **out of the box** without real API keys:

| Feature | Without Keys |
|---------|-------------|
| Login | Use any phone number → OTP: `000000` |
| Weather | Realistic mock data served |
| Crop AI | Rule-based recommendations |
| Fertilizer | Sample deficiency analysis |
| Market | Realistic mock prices (20 crops) |
| Chatbot | Pre-written responses |
| Maps | Demo overlay with mock markers |

---

## 📁 Project Structure

```
smart-kisan/
├── .github/workflows/deploy.yml    # CI/CD
├── frontend/                       # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/                  # 10 pages (lazy loaded)
│   │   ├── components/             # Navbar, ChatWidget, etc.
│   │   ├── contexts/               # Auth, Language
│   │   ├── services/api.js         # Axios client
│   │   └── i18n/locales/           # en, hi, pa, ta, te
│   ├── vite.config.js              # Code splitting, proxy
│   └── vercel.json                 # Vercel deploy config
├── gateway/                        # Express API Gateway
│   └── src/
│       ├── index.js                # Proxy + rate limiting
│       └── middleware/auth.js      # JWT verification
├── services/
│   ├── auth-service/               # Firebase OTP + JWT
│   ├── user-service/               # Profiles + location
│   ├── weather-service/            # OpenWeatherMap + Kafka
│   ├── crop-service/               # Gemini AI recs
│   ├── fertilizer-service/         # Vision analysis
│   ├── market-service/             # Prices + trends
│   ├── labour-service/             # Job marketplace
│   └── chatbot-service/            # Multilingual AI
├── infra/
│   └── nginx/default.conf          # Gzip + proxy
├── docker-compose.yml              # Full stack
└── .env.example                    # Template
```

---

## 🚢 Deployment

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables.

### Backend → Render

1. Create a new Web Service on [render.com](https://render.com)
2. Connect your GitHub repo
3. For each service set:
   - **Root Directory:** `services/auth-service` (or relevant)
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
4. Add all environment variables

### Docker Production

```bash
# Build all images
docker-compose -f docker-compose.yml up --build -d

# Check logs
docker-compose logs -f gateway

# Scale a service
docker-compose up --scale weather-service=2
```

### CI/CD (GitHub Actions)

Add these secrets to your GitHub repo:

```
VERCEL_TOKEN          → Vercel API token
VERCEL_ORG_ID         → Vercel org ID
VERCEL_PROJECT_ID     → Vercel project ID
DOCKER_USERNAME       → Docker Hub username
DOCKER_PASSWORD       → Docker Hub password
VITE_API_BASE_URL     → https://your-gateway.onrender.com/api
VITE_FIREBASE_API_KEY → Firebase web API key
```

Push to `main` → auto deploys frontend to Vercel + builds Docker images.

---

## 🌐 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| हिंदी (Hindi) | `hi` | ✅ Full |
| English | `en` | ✅ Full |
| ਪੰਜਾਬੀ (Punjabi) | `pa` | ✅ Basic |
| தமிழ் (Tamil) | `ta` | ✅ Basic |
| తెలుగు (Telugu) | `te` | ✅ Basic |

---

## 🔌 API Reference

### Auth
```
POST /api/auth/verify-otp   { idToken, role, name }  → { accessToken, refreshToken, user }
POST /api/auth/refresh       { refreshToken }          → { accessToken, refreshToken }
POST /api/auth/logout        { refreshToken }          → 200
GET  /api/auth/me            (Bearer token)            → { user }
```

### Weather
```
GET /api/weather/current?lat=28.6&lon=77.2  → weather data + 5-day forecast
GET /api/weather/by-city?city=Delhi         → city weather
```

### Crop
```
POST /api/crop/recommend  { soilType, season, state, temperature, ... } → recommendation
GET  /api/crop/calendar?crop=Wheat&state=Punjab → monthly calendar
```

### Fertilizer
```
POST /api/fertilizer/analyze  (multipart/form-data: image) → deficiency analysis
```

### Market
```
GET /api/market/prices?state=Punjab&commodity=Wheat → price list
GET /api/market/trends?commodity=Wheat               → 30-day trend
GET /api/market/commodities                          → list of all commodities
GET /api/market/states                               → list of all states
```

### Labour
```
GET  /api/labour/jobs                  → job listings
POST /api/labour/jobs                  → post a job
POST /api/labour/jobs/:id/apply        → apply for job
GET  /api/labour/my-jobs               → my posted jobs
```

### Chatbot
```
POST /api/chatbot/message  { message, sessionId, language } → { reply, sessionId }
GET  /api/chatbot/history/:sessionId                        → chat history
DELETE /api/chatbot/history/:sessionId                      → clear history
```

---

## ⚡ Performance Optimizations

- ✅ React.lazy + Suspense on all 10 pages
- ✅ Vite code splitting (vendor, firebase, charts, maps, i18n chunks)
- ✅ Redis caching: weather (30min), market (1hr), crop (6hr)
- ✅ Image compression to WebP via Sharp (fertilizer)
- ✅ Gzip + Brotli via Nginx
- ✅ Long-term browser caching for static assets (1 year)
- ✅ JWT auto-refresh interceptor
- ✅ Rate limiting: 200 req/15min global, 20 req/15min auth
- ✅ MongoDB indexes on frequent query fields

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite 5, Tailwind CSS 3, react-router-dom, i18next, recharts, firebase, axios, lucide-react, react-dropzone

**Backend:** Node.js 20, Express 4, Mongoose 8, JWT, Firebase Admin, KafkaJS, ioredis, Multer, Sharp, Helmet

**AI/APIs:** Google Gemini Pro (crop/chatbot/fertilizer), OpenWeatherMap, Google Maps JS API, Firebase Phone Auth

**Infrastructure:** MongoDB, Redis 7, Apache Kafka, Docker, Nginx

**DevOps:** GitHub Actions, Vercel, Render/Railway, Docker Hub

---

## 📝 License

MIT © 2025 Smart Kisan

---

> Built with ❤️ for Indian farmers. किसानों के लिए, किसानों द्वारा।
