# EduSelect — Higher Education & Career Exploration Platform

[![Netlify Ready](https://img.shields.io/badge/Deployment-Netlify_Serverless-00C7B7?style=flat-square&logo=netlify)](https://www.netlify.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL Neon](https://img.shields.io/badge/Database-Neon_Serverless_PostgreSQL-00e599?style=flat-square&logo=postgresql)](https://neon.tech)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![NIRF 2025](https://img.shields.io/badge/NIRF-2025_Rankings-orange?style=flat-square)](https://www.nirfindia.org)

**EduSelect** is a production-grade higher education and career guidance portal for students and parents across India. It connects **455 real engineering colleges across all 28 Indian states** with a comprehensive **Career Explorer** (100 education pathways, 80 entrance exams, 29 engineering branches, 28 graduate careers, and 39 government jobs) and an integrated **Gemini AI Career Counsellor**.

---

## ⚡ Key Highlights & Architecture

* **455 Real Engineering Colleges across 28 States:** Complete representation of all 28 Indian states, covering state government colleges, central institutes (IITs, NITs, IIITs), deemed universities, and top private institutions. Includes special coverage for all 8 North-Eastern states.
* **NIRF 2025 Rankings & Data Honesty:** Sorted by official NIRF 2025 engineering ranks by default. Colleges unranked in NIRF 2025 are cleanly labeled as "Unranked" with null ratings safely handled (no `NaN.toFixed()` errors). All estimated tuition and salary figures carry transparent "Est." badges.
* **Comprehensive Career Explorer (`/careers`):** 
  * 3-step qualification filter (Class 10, Class 12 PCM/PCB/Commerce/Arts, Undergraduate B.Tech / Degrees).
  * RIASEC personality typology and subject-interest matching.
  * 196 static detail pages (`/careers/[kind]/[id]`) pre-rendered via Next.js Static Site Generation (SSG).
  * Direct cross-referencing between engineering colleges and post-graduation career roadmaps.
* **Gemini AI Career Counsellor:**
  * Powered by Google Gemini 2.5 Flash via `@google/genai`.
  * Strict server-side isolation with zero client-side secret leakage (`server-only`).
  * Structured JSON schema generation, prompt-injection guards, 20s serverless timeout, and graceful client fallbacks.
  * In-memory sliding-window rate limiting per IP address.
* **Serverless-Native & Netlify-Ready:**
  * **Read-Only Filesystem Safe:** No runtime `fs` file writes; admin overrides persist cleanly to Neon PostgreSQL (`CollegeOverride` model).
  * **Prisma Connection Pooling:** Multi-target engine binaries (`native`, `rhel-openssl-1.0.x`, `rhel-openssl-3.0.x`) and `directUrl` for seamless Neon pooled connection management.
  * Edge middleware and 60-second serverless execution limits.

---

## 🚀 Unified Verification Suite

Run our comprehensive 6-suite verification test in a single command:

```bash
# Run all data checks, security scans, config audits, AND Next.js production build
npm run verify:all

# Or run the fast check without full Next.js rebuild:
node scripts/verify-all.cjs --skip-build
```

### What `verify:all` Validates:
1. **Colleges Dataset:** 455 valid institutes, 28 states, NIRF 2025 ranks, fee estimate badges, valid schema.
2. **Career Explorer Integrity:** 7 datasets, 0 broken foreign keys, 196 dynamic career detail routes.
3. **Serverless Architecture:** `netlify.toml` with `@netlify/plugin-nextjs`, Prisma RHEL binary targets, Neon `directUrl`.
4. **Zero-Secret Leaks:** Scans source code for API key leaks (`AIza...`), hardcoded database URLs, and ensures client components do not import `@google/genai`.
5. **Environment Configuration:** Verifies all 9 production variables exist in `.env.example`.
6. **Production Build:** Prisma client generation and Next.js static compilation of all 216 static routes.

---

## 🛠 Local Setup & Development

### 1. Prerequisites
* Node.js v18 or v20 LTS
* npm v9+
* A free serverless PostgreSQL database from [Neon](https://neon.tech) (optional for local browsing; colleges and careers work 100% offline from bundled JSON data)

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd edu-select
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials in `.env.local`:
```env
# Neon PostgreSQL Connection Strings
DATABASE_URL="postgresql://<user>:<password>@<neon-pooled-host>/neondb?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<neon-direct-host>/neondb?sslmode=require"

# NextAuth Authentication
NEXTAUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini AI Career Counsellor
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GEMINI_MODEL="gemini-2.5-flash"
GEMINI_TIMEOUT_MS="20000"

# Initial Seed Credentials (for npm run db:seed)
SEED_ADMIN_PASSWORD="MySecureAdminPassword123"
SEED_DEMO_PASSWORD="MyDemoStudentPassword123"
```

### 4. Database Setup (Neon PostgreSQL)
```bash
# Apply migrations to create User, SavedCollege, SavedComparison, and CollegeOverride tables
npm run db:migrate

# Seed default admin and demo student accounts
npm run db:seed
```

> **Note:** Colleges and career datasets are compiled into static application bundles (`src/data/colleges.json` and `src/data/careers/*.json`) and do not require writing to PostgreSQL. Only user accounts, saved bookmarks, and admin edits are stored in Neon.

### 5. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 📋 Environment Variables Reference

| Variable | Required in Production | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | Neon pooled PostgreSQL connection string (`pgbouncer=true`) | `postgresql://user:pass@ep-pool.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | **Yes** | Neon direct unpooled connection string for migrations | `postgresql://user:pass@ep-direct.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | **Yes** | 32+ character random secret for JWT signing & session cookies | Run `openssl rand -base64 32` |
| `NEXTAUTH_URL` | **Yes** | Canonical production URL of your deployment | `https://your-site.netlify.app` |
| `GEMINI_API_KEY` | Optional | Google AI Gemini API key for AI Career Counsellor | Obtain from [Google AI Studio](https://aistudio.google.com) |
| `GEMINI_MODEL` | No | Model name for AI career counselor calls | `gemini-2.5-flash` |
| `GEMINI_TIMEOUT_MS` | No | Serverless timeout guard in milliseconds | `20000` (20 seconds) |
| `SEED_ADMIN_PASSWORD` | No | Password used when executing `npm run db:seed` | `AdminPassword123!` |
| `SEED_DEMO_PASSWORD` | No | Password used for demo student when running seed | `StudentPassword123!` |

---

## 🌐 Netlify Deployment Guide

Deploying EduSelect to Netlify is fully automated via `@netlify/plugin-nextjs`.

### Step 1: Push Code to GitHub / GitLab
Make sure your latest commits on `main` pass verification:
```bash
npm run verify:all
git push origin main
```

### Step 2: Import Site in Netlify
1. Log in to [Netlify](https://app.netlify.com).
2. Click **"Add new site"** > **"Import an existing project"**.
3. Select your GitHub repository.
4. Netlify will auto-detect settings from `netlify.toml`:
   * **Build command:** `npm run build`
   * **Publish directory:** `.next`
   * **Plugins:** `@netlify/plugin-nextjs`

### Step 3: Configure Environment Variables in Netlify
Go to **Site Settings > Environment Variables** and add:
1. `DATABASE_URL`
2. `DIRECT_URL`
3. `NEXTAUTH_SECRET`
4. `NEXTAUTH_URL` (set to your Netlify domain, e.g. `https://your-app.netlify.app`)
5. `GEMINI_API_KEY` (optional, for AI counsellor)
6. `NODE_VERSION` = `20`

### Step 4: Apply Database Migrations
Before the first deployment or after schema updates, execute migrations against your production Neon DB:
```bash
# From your local terminal pointing to production Neon DIRECT_URL
npx prisma migrate deploy
```

### Step 5: Trigger Deploy
Click **"Deploy site"** in Netlify. Your application will build, pre-render all 216 static routes, and deploy to AWS Lambda serverless functions.

---

## 🔄 Data Update Workflow

All data pipelines in EduSelect are deterministic and validated:

```bash
# 1. Rebuild 455 engineering colleges from raw datasets
npm run data:colleges

# 2. Validate career relational datasets (0 broken foreign keys)
npm run data:check

# 3. Run complete verification and build test
npm run verify:all
```

For complete documentation on the 8 underlying datasets, government gazette citations, 7th Pay Commission pay bands, and NIRF methodology, visit [`/about-data`](http://localhost:3000/about-data).

---

## 🔒 Security Best Practices

* **Zero Secret Exposure:** Google Gemini API keys and database credentials are strictly guarded server-side using Next.js `server-only` imports. No `NEXT_PUBLIC_` variables contain secrets.
* **Rate Limiting:** `/api/careers/ai` routes are protected by sliding-window IP rate limiting (10 requests / 5 minutes).
* **AI Hallucination Guard:** The Gemini prompt injects an authoritative catalog of career clusters and validates the model's output against known entity IDs. If an invalid or unverified ID is returned, the backend falls back to deterministic recommendations.
* **Data Transparency:** All estimated figures (fees, starting packages) display an "Est." badge to maintain student trust.

---

## 📄 License & Attribution

Designed and maintained for Indian students and educators. All college data is sourced from public institutional disclosures, AICTE, KEA, and NIRF 2025.
