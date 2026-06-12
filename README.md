<p align="center">
  <img src="public/logo.png" alt="E-Sell Logo" width="80" height="80" />
</p>

<h1 align="center">E-Sell</h1>

<p align="center">
  <strong>AI-First E-Commerce for the Next Billion</strong><br/>
  Enabling Nigerian & African traders to create online stores, accept fiat + crypto payments, and leverage AI — with zero code and zero gatekeepers.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-blue?logo=prisma" alt="Prisma v7" />
  <img src="https://img.shields.io/badge/BSC-BNB%20%2B%20USDT-F0B90B?logo=binance" alt="BSC" />
  <img src="https://img.shields.io/badge/AI-Aethex%20%2B%20Groq-00CC66" alt="AI" />
  <img src="https://img.shields.io/badge/Languages-8-FFB800" alt="8 Languages" />
</p>

<p align="center">
  <a href="https://e-sell-application.vercel.app" target="_blank"><strong>Live Demo</strong></a> ·
  <a href="#-the-problem">The Problem</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-ai-component">AI Component</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-roadmap">Roadmap</a> ·
  <a href="#-getting-started">Getting Started</a>
</p>

---

## 🌍 The Problem

Nigeria ranks **#1 on Chainalysis' 2024 Global Crypto Adoption Index** — yet the traders driving this adoption are locked out of the digital economy. No merchant accounts. No card terminals. No online storefronts. Customers want to pay in USDT, but traders can't accept it. Language barriers exclude hundreds of millions of non-English speakers from every existing platform.

### The Crypto Accessibility Index (CAI)

```
CAI = (Digital_Literacy × Financial_Infrastructure × Language_Access × Payment_Rail_Availability)
     ─────────────────────────────────────────────────────────────────────────────────────────
                       (Regulatory_Friction + Setup_Complexity)
```

For the average Nigerian market trader, **CAI approaches zero**. E-Sell systematically raises every numerator factor while driving down denominator barriers — creating a replicable model for emerging markets worldwide.

### Meet Amina

Amina is a fabric trader in Balogun Market, Lagos. She sells Ankara and Aso Oke via WhatsApp, hears about USDT from customers, but can't accept crypto — no Paystack account without business registration, no online presence, no way to convert prices. **With E-Sell, Amina speaks in Yoruba for 5 minutes and has a complete online store accepting both Naira and crypto, with AI customer service running 24/7.**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎙️ **Voice-Powered Store Builder** | Speak in any of 8 languages — the AI parses your description into a complete storefront with products, pricing, and Aethex chatbot configuration. Zero code, zero forms. |
| 🤖 **Aethex AI Customer Service** | Every store gets a configurable AI chatbot (Aethex AI + Groq fallback) that answers questions, suggests products, handles FAQs, and escalates to humans — in 8 languages with voice input. |
| 💳 **Dual Payment Rails** | Paystack (fiat/Naira) + BSC crypto (BNB/USDT) with QR codes, real-time NGN-to-crypto conversion, and 30-minute payment windows. No business registration required. |
| 🌐 **8-Language Platform** | English, French, Swahili, Spanish, Yoruba, Igbo, Hausa, Arabic (with RTL). Aethex chatbot, voice navigation, and all UI elements are localized. |
| 🎓 **Education Hub** | Blockchain education with AI-powered term explanations (click any highlighted term for a Groq-generated explanation), live crypto price ticker, video tutorials, and multilingual AI translation. |
| 🛡️ **Trust Badge System** | Verified merchant badges (Red/Blue/Green tiers) based on trade history and satisfaction scores — building trust where online fraud is a major concern. |
| 📰 **News & Market Intelligence** | AI-powered news aggregation with a financial news chatbot for traders to ask about market trends and crypto developments. |
| 🗣️ **Voice Navigation** | Voice command bars throughout the platform with fuzzy matching (Levenshtein distance) for accessibility, supporting all 8 languages via Web Speech API. |
| 💰 **Multi-Currency Storefronts** | NGN, USD, EUR, GBP, GHS, KES, ZAR with live conversion rates. Products display both fiat and crypto pricing simultaneously. |
| 🤝 **AI Dashboard Assistants** | Groq-powered AI assistants in both merchant and customer dashboards providing contextual commerce guidance. |

---

## 🤖 AI Component

AI is not bolted on — **it's the reason the platform can serve its users at all.**

### 1. Aethex AI — The Merchant's 24/7 Employee
Every storefront is powered by [Aethex AI](https://aethex.ai) (the hackathon sponsor's API). Small traders cannot afford human customer service — their stores would be dead zones after business hours. Aethex handles product inquiries, multilingual conversations, voice input, FAQ responses, and intelligent escalation. Every interaction is logged and rated. **A 24/7 employee that costs nothing and speaks 8 languages.**

### 2. Voice Store Builder — Zero-Setup Commerce
Uses **Groq's LLaMA 3.3 70B** to parse natural language descriptions (spoken or typed in 8 languages) into structured e-commerce data: store configuration, product listings, pricing, crypto conversion, and Aethex chatbot setup. Speak for 30 seconds in Yoruba → complete online store. Without AI, this requires 15+ form fields — an impossible barrier.

### 3. AI Assistants — Commerce Intelligence for All
Groq-powered assistants in merchant and customer dashboards provide contextual guidance. The Education Hub's AI term explainer lets users click any blockchain term for an instant explanation in their language. Without AI, dual payment rails and crypto conversion would be overwhelming for first-time digital wallet users.

### Aethex Integration Points
- **Storefront Chat Widget** — 24/7 customer-facing chatbot on every store
- **Configuration Dashboard** — Merchants customize greetings, FAQs, instructions, language, and escalation triggers
- **Interaction Analytics** — Chat count, satisfaction %, escalation rate, thumbs up/down ratings
- **Voice Input** — Customers speak in Yoruba, Igbo, Hausa instead of typing
- **Groq Fallback** — Auto-fallback to LLaMA 3.3 70B if Aethex API is unavailable
- **Store Builder Integration** — Auto-generates Aethex config when a store is created via Voice Builder

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 + shadcn/ui v4 |
| **Database** | PostgreSQL (Supabase) + Prisma v7 |
| **Auth** | NextAuth.js (Credentials + Google + GitHub OAuth) |
| **AI** | Aethex AI, Groq (LLaMA 3.3 70B), OpenRouter, HuggingFace |
| **Payments — Fiat** | Paystack (NGN) |
| **Payments — Crypto** | BSC — BNB + USDT via Alchemy |
| **Media** | Cloudinary |
| **i18n** | next-intl (8 languages with RTL) |
| **Voice** | Web Speech API |
| **Animations** | Framer Motion |
| **Deployment** | Vercel |

---

## 🗺 Roadmap

### Now (Live)
- Voice Store Builder, Aethex AI, dual Paystack + BSC payments
- 8-language platform, Education Hub, Trust Badges
- Cloudinary image uploads, AI dashboard assistants

### Q3 2026 — CBDC Rails & Token Infrastructure
- **eNaira (Nigeria)** integration for instant zero-fee Naira settlements
- Real on-chain **BEP-20 token deployment** (currently simulated)
- Merchant token creation wizard, OpenRouter + HuggingFace AI integration

### Q1 2027 — Pan-African & Asian Expansion
- **Sand Dollar (Bahamas)**, **e-CNY (China)**, **Digital Rupee (India)**, **Bakong (Cambodia)** CBDC support
- Multi-chain DeFi (Polygon, Arbitrum, Base)
- Regional AI models tuned for local languages and commerce patterns
- WebSocket real-time order infrastructure

### Q4 2027 — Full Ecosystem
- Cross-border CBDC settlements
- On-chain merchant credit scoring
- AI-driven supply chain optimization
- DAO governance model

> CBDCs complement crypto — it's both-and, not either-or. E-Sell bridges centralized and decentralized payment infrastructure.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Cloudinary account
- Paystack account
- Alchemy account (for BSC)

### 1. Clone the repository

```bash
git clone https://github.com/b3panda3/E-Sell-Application.git
cd E-Sell-Application
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database (Supabase session pooler for CLI, transaction pooler for runtime)
DATABASE_URL="postgresql://user:pass@host:5432/postgres"
DATABASE_POOLER_URL="postgresql://user:pass@host:6543/postgres"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""

# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# AI
GROQ_API_KEY=""
OPENROUTER_API_KEY=""
AETHX_API_KEY=""
HUGGINGFACE_API_KEY=""
ZAI_API_KEY=""

# Payments
PAYSTACK_SECRET_KEY=""
PAYSTACK_PUBLIC_KEY=""

# Crypto
ALCHEMY_BSC_MAINNET_URL=""
ALCHEMY_API_KEY=""
BSCSCAN_API_KEY=""

# Currency APIs
LIVECOINWATCH_API_KEY=""
EXCHANGERATE_API_KEY=""
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Seed education content
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 6. Create an admin user

After signing up through the app, promote your account to admin:

```bash
# Using Prisma Studio
npx prisma studio
# Navigate to AdminUser table and add an entry with your userId
```

Or via the API:

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id"}'
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login & Register pages
│   ├── browse/              # Public store browse page
│   ├── store/[esellCode]/   # Public storefront pages
│   ├── education/           # Education Hub
│   ├── news/                # News & Market Intelligence
│   ├── dashboard/
│   │   ├── admin/           # Admin dashboard (education content management)
│   │   ├── merchant/        # Merchant dashboard (storefront, products, orders, wallets, Aethex, AI assistant)
│   │   └── customer/        # Customer dashboard (browse, cart, purchases, AI assistant)
│   └── api/                 # API routes
│       ├── auth/            # NextAuth + signup + role redirect
│       ├── upload/          # Cloudinary image upload
│       ├── storefront/      # Storefront CRUD + browse
│       ├── products/        # Product CRUD
│       ├── services/        # Service CRUD
│       ├── orders/          # Order management
│       ├── payments/        # Paystack + Crypto payment flows
│       ├── aethex/          # Aethex chat + config + interactions
│       ├── education/       # Education videos + AI term explainer
│       ├── admin/           # Admin check + setup
│       ├── notifications/   # Notification system
│       ├── messages/        # Messaging system
│       ├── staff/           # Staff management
│       ├── themes/          # Store themes
│       ├── wallets/         # Crypto wallet management
│       ├── currency/        # Fiat-crypto conversion
│       ├── news/            # News aggregation
│       └── cart/            # Shopping cart
├── components/
│   ├── ui/                  # shadcn/ui components (Button, Card, Dialog, etc.)
│   ├── layout/              # Header & Footer
│   ├── AethexChatWidget.tsx # Storefront AI chatbot
│   ├── PaystackCheckout.tsx # Paystack payment component
│   ├── CryptoCheckout.tsx   # BSC crypto checkout component
│   ├── VoiceCommandBar.tsx  # Voice navigation
│   ├── TrustBadge.tsx       # Trust badge display
│   ├── NotificationBell.tsx # Notification indicator
│   ├── education/           # Education chatbot
│   └── news/                # News chatbox
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Prisma client (transaction pooler)
│   ├── i18n.tsx             # Internationalization
│   ├── theme.tsx            # Theme management
│   ├── notifications.ts     # Notification helpers
│   ├── chat-utils.tsx       # Chat utility functions
│   └── utils.ts             # General utilities
├── locales/                 # Translation files (en, fr, sw, es, yo, ig, ha, ar)
├── types/                   # TypeScript type definitions
└── middleware.ts            # Auth + routing middleware
```

---

## 🏆 Hackathon

Built for **The Artificial Future Hackathon** — **Economic & Financial Access** track.

**Key integrations:**
- **Aethex AI** — Sponsor API deeply integrated across 6 touchpoints
- **Groq** — LLaMA 3.3 70B for Voice Store Builder, AI Assistants, and term explanations
- **OpenRouter + HuggingFace** — Secondary AI model support
- **Paystack** — Nigerian Naira fiat payments
- **BSC (BNB Chain)** — Decentralized BNB + USDT crypto payments via Alchemy

---

## 📄 License

MIT

---

<p align="center">
  <strong>E-Sell</strong> — From invisible informal trader to globally accessible digital merchant.<br/>
  Zero code. Zero gatekeepers. AI-first commerce for the next billion.
</p>
