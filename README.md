# 🌾 Smart Kisan (स्मार्ट किसान) — Intelligent Agri-Tech Platform

[![CI/CD](https://img.shields.io/github/actions/workflow/status/aku797473/bansalhackk/deploy.yml?label=CI%2FCD)](https://github.com/aku797473/bansalhackk/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: Production-Grade](https://img.shields.io/badge/Status-Production--Grade-blue.svg)](#)

**Smart Kisan** is a next-generation, cloud-native agricultural ecosystem designed to empower Indian farmers, buyers, and agricultural laborers. By combining modern UI/UX principles with cutting-edge Microservices and AI, Smart Kisan provides real-time market intelligence, localized weather forecasting, AI-driven crop advisory, and a unified marketplace.

---

## ✨ Key Features & Innovations

1. **State-of-the-art Authentication & Security**
   - Implements robust **JWT-based Authentication** with long-lived Refresh Tokens.
   - Enforces **SaaS-Standard Password Policies** (Min 8 chars, Uppercase, Lowercase, Number, Special Character).
   - Seamless **Google OAuth Integration** using Firebase Auth.
   - Free **Simulated OTP Flow** for Account Recovery & Password Resets.

2. **Premium Floating UI & UX Design**
   - Features a clean, **Glassmorphism-inspired Dashboard** with a floating right-aligned header.
   - Intelligent **Throttled Feedback System**: A beautiful `Rate Your Experience` modal pops up upon logout, smartly throttled to once every 7 days to maintain a frictionless user experience.
   - Dynamic Dark/Light mode support with smooth tailwind transitions.

3. **Microservices-Driven Architecture**
   - **Market Service:** Fetches real-time Mandi prices using Government APIs (data.gov.in) with Upstash Redis caching.
   - **AI Chatbot Service:** A multilingual smart assistant built on Gemini Pro to answer farming queries instantly.
   - **Crop & Fertilizer Service:** Soil analysis and data-driven recommendations.
   - **Labour Service:** Geospatial job matching for farm laborers.

---

## 🏗️ Technical Architecture

Smart Kisan follows a **Cloud-Native Microservices Architecture** designed for high availability and geospatial scalability.

```mermaid
graph TD
    A[React Web App] -->|HTTPS| B(API Gateway)
    B -->|JWT Auth Validation| C{Auth Service}
    C -->|Verified| D[Internal Proxy]
    
    D --> E[Market Service]
    D --> F[Buyer Service]
    D --> G[Crop Service]
    D --> H[Weather Service]
    D --> I[Labour Service]
    D --> X[User & Feedback Service]
    
    E -->|Real Data| J[(Redis Cache)]
    E -->|Government API| K[data.gov.in]
    F -->|Persistence| L[(MongoDB Atlas)]
    G -->|AI Hub| M[Google Gemini Pro]
    H -->|Forecasting| N[OpenWeatherMap]
```

---

## 🛠️ Getting Started (Developer Guide)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas & Redis (Upstash recommended)

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/aku797473/bansalhackk.git
   cd smart-kisan
   ```
2. Create a root `.env` based on `.env.example`.
3. Spin up the entire ecosystem via Docker:
   ```bash
   docker-compose up --build
   ```
   *Alternatively, run `npm run dev` in the root directory to spin up all microservices and the frontend concurrently.*
4. Access the frontend at `http://localhost:5173` and the Unified Gateway at `http://localhost:5000`.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed with ❤️ for the Indian Farming Community — Smart Kisan v2.0*
