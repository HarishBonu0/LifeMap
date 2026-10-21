# LifeMap 🛡️

> **Smart Insurance Navigator & Financial Literacy Engine**  
> Helping families discover verified insurance schemes, calculate true protection needs, and master financial security in English, తెలుగు (Telugu), and हिंदी (Hindi).

[![CI & Build Verification](https://github.com/HarishBonu0/LifeMap/actions/workflows/ci.yml/badge.svg)](https://github.com/HarishBonu0/LifeMap/actions/workflows/ci.yml)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✨ Features

- **Personalized Life Insurance Gap Calculator**: Computes exact protection need using actuarial human life value methodologies, factoring in income replacement, liabilities, education goals, and inflation.
- **Interactive "Design Your Dream Life" Module**: Visual sliders, timeline milestones, emergency fund planning, and voice-assisted goal prompts.
- **Verified Government & Private Scheme Explorer**: Real IRDAI-aligned scheme data (PMJJBY, PMSBY, LIC Tech Term, ICICI iProtect Smart, HDFC Click 2 Protect, etc.) with multi-attribute filtering and side-by-side comparison.
- **Gamified Financial Literacy**: Interactive bite-sized modules, scenario simulations, quizzes, badges, and progress tracking.
- **Multilingual Support**: Fully localized in English, Telugu, and Hindi with on-the-fly switching.
- **Dual Engine Architecture**: Works seamlessly out-of-the-box with a high-fidelity local sandbox or connects directly to production Supabase PostgreSQL with Row Level Security (RLS).

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/HarishBonu0/LifeMap.git
cd LifeMap
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 📦 Deployment

LifeMap is pre-configured for instant zero-configuration deployment on **Vercel**, **Netlify**, and **Cloudflare Pages**.

👉 **Read the complete [Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md)** for 1-click deployment instructions, environment variables, and optional Supabase database setup.

---

## 🔒 Security & Privacy

- Client-side authentication hashes passwords before storage.
- When Supabase is connected, Row Level Security (RLS) ensures users can strictly read and write only their own records.
- LLM API keys are kept server-side in proxy endpoints, never bundled into public client JS.
