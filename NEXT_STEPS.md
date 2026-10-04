# EduSelect — Next Steps Guide

This document outlines everything you need to know and the exact step-by-step actions to test locally, configure your database, and deploy EduSelect to production.

---

## 🟢 Current System Status

* **Branch:** `feature/career-explorer`
* **Git Status:** Clean working tree, all 7 phases committed with atomic history.
* **Pre-Deploy Verification:** **Passed (0 failures)** across all 6 test suites (`npm run verify:all`).
* **Static Pages Compiled:** **216 routes** (including all 196 career detail pages pre-rendered via Next.js SSG).
* **Datasets Active:**
  * **455 Real Engineering Colleges** across all 28 Indian states with NIRF 2025 rankings.
  * **100 Education Pathways** (Class 10, 12th PCM/PCB/Commerce/Arts).
  * **80 Entrance Exams** (JEE, NEET, KCET, COMEDK, GATE, CAT, UPSC, etc.).
  * **29 Engineering Branches** with syllabus, fresher packages, and PSU recruitment via GATE.
  * **28 Graduate Careers** & **39 Government Jobs** (7th Pay Commission pay matrix).
  * **Gemini AI Career Counsellor** with 20s serverless timeout and sliding-window rate limiting.

---

## 🏃 Step 1: Run & Test Locally (Zero Setup Needed)

Colleges and Career Explorer run **100% offline from bundled static datasets** without needing any database or API keys.

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and test these key pages:
   - **Homepage:** [http://localhost:3000](http://localhost:3000)
     - See the new hero tagline: *"Find the right college — and the career it leads to"*.
     - Browse the *"Not sure what to study?"* section with 8 qualification cards.
     - Click **"Ask AI Career Counsellor"** to test the slide-out drawer.
   - **Engineering Colleges (455 institutes):** [http://localhost:3000/colleges](http://localhost:3000/colleges)
     - Sorted by official NIRF 2025 rank by default (IIT Madras #1, IIT Delhi #2, etc.).
     - Filter by State (e.g. Karnataka, Maharashtra, or North-Eastern states like Nagaland).
     - Filter by Branch (e.g. CSE) → observe the top banner linking directly to careers after CSE.
     - Note the transparent *"Est."* badge on estimated tuition fees.
   - **College Profile:** [http://localhost:3000/colleges/col-151](http://localhost:3000/colleges/col-151) (RV College of Engineering)
     - See *"Careers after this branch ->"* under each course card.
     - Review the *"Jobs & Placements After These Branches"* panel.
   - **Career Explorer:** [http://localhost:3000/careers](http://localhost:3000/careers)
     - Test the 3 qualification steps (Class 10, Class 12, Degree/B.Tech).
     - Filter by Class 12 PCM or Engineering Graduate.
     - Filter by RIASEC personality type or subject interest.
   - **Career Detail Pages:**
     - Engineering Branch: [http://localhost:3000/careers/branch/cse](http://localhost:3000/careers/branch/cse)
     - Pathway: [http://localhost:3000/careers/pathway/pcm-aerospace-engineering](http://localhost:3000/careers/pathway/pcm-aerospace-engineering)
     - Government Job: [http://localhost:3000/careers/govt/isro-scientist-engineer](http://localhost:3000/careers/govt/isro-scientist-engineer)
   - **KCET 2026 Predictor:** [http://localhost:3000/kcet-2026-predictor](http://localhost:3000/kcet-2026-predictor)
     - Live 50:50 KEA normalization rank calculator with post-engineering careers banner.
   - **28 States Directory:** [http://localhost:3000/states](http://localhost:3000/states)
   - **Data Sources & Methodology:** [http://localhost:3000/about-data](http://localhost:3000/about-data)

---

## 🗄️ Step 2: (Optional) Set up Neon PostgreSQL for Student Accounts & Bookmarks

If you wish to test user signup, student bookmarks, and saved comparisons:

1. Sign up for a free PostgreSQL database at [neon.tech](https://neon.tech).
2. Create a `.env.local` file in the project root:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<neon-pooled-host>/neondb?sslmode=require"
   DIRECT_URL="postgresql://<user>:<password>@<neon-direct-host>/neondb?sslmode=require"
   NEXTAUTH_SECRET="your-32-character-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   SEED_ADMIN_PASSWORD="MySecureAdminPassword123"
   SEED_DEMO_PASSWORD="MyDemoStudentPassword123"
   ```
3. Run migrations and seed default test accounts:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
4. Test login at [http://localhost:3000/login](http://localhost:3000/login) with:
   - **Student:** `aarav.sharma@example.com` / `MyDemoStudentPassword123`
   - **Admin:** `admin@collegediscovery.com` / `MySecureAdminPassword123`

---

## 🤖 Step 3: (Optional) Add Google Gemini API Key for AI Counsellor

> **Security & Zero-Leak Guarantee:**
> * All API keys are kept strictly in your local `.env.local` or Netlify server-side dashboard.
> * Keys are **never** prefixed with `NEXT_PUBLIC_` and are **never sent to or visible in the frontend/browser**.
> * The frontend drawer talks exclusively through your backend Next.js API routes (`/api/careers/ai`), which enforce rate limits and prompt sanitization.

### Lowest-Cost & Free-Tier Model Configuration:
We configured **`gemini-1.5-flash-8b`** as the default model:
* **100% Free Tier on Google AI Studio:** 15 requests per minute (RPM) and 1,500 requests per day (RPD) at **$0 cost**.
* **Ultra-Low Paid Pricing:** Even if you ever exceed the free tier, it costs only **$0.0375 per million input tokens** (Google's cheapest model across its entire AI lineup; 33× cheaper than Pro).
* **Token Capping:** Output tokens are capped at 800 tokens to ensure minimal token consumption per consultation.

To enable live Gemini AI responses:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com).
2. Add it to your `.env.local` (kept private, ignored by Git):
   ```env
   GEMINI_API_KEY="AIzaSyYourPrivateApiKeyHere"
   GEMINI_MODEL="gemini-1.5-flash-8b"
   GEMINI_TIMEOUT_MS="20000"
   ```
3. Open the AI Counsellor drawer on [http://localhost:3000](http://localhost:3000), enter any prompt (e.g. *"I love mathematics and problem solving, what branches should I look into?"*), and receive tailored recommendations and custom roadmaps.
4. *(Note: If no API key is provided, the platform automatically activates the deterministic rule-based counsellor with zero crashes).*

---

## 🔀 Step 4: Merge Safety Branch to Main

When you are satisfied with local testing, merge `feature/career-explorer` into your `main` branch:

```bash
git checkout main
git merge feature/career-explorer
git push origin main
```

---

## ☁️ Step 5: Deploy to Netlify

EduSelect is 100% Netlify-ready (read-only filesystem safe, AWS Lambda RHEL binary targets, `@netlify/plugin-nextjs`).

1. Log in to [Netlify](https://app.netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select your repository. Netlify will auto-detect settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Plugin:** `@netlify/plugin-nextjs`
3. In **Site Settings > Environment Variables**, add:
   - `DATABASE_URL` (Neon pooled string)
   - `DIRECT_URL` (Neon direct string)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (e.g. `https://eduselect.netlify.app`)
   - `GEMINI_API_KEY` (Google Gemini key)
   - `NODE_VERSION` = `20`
4. Deploy the site.
5. Apply database migrations to Neon:
   ```bash
   npx prisma migrate deploy
   ```

---

## 🛠 Useful Commands Cheat Sheet

| Command | Purpose |
|---|---|
| `npm run verify:all` | Runs full 6-suite verification test (data + security + config + build) |
| `npm run lint` | Runs Next.js ESLint checks (0 errors) |
| `npm run data:check` | Validates relational integrity across all 7 career datasets |
| `npm run data:colleges` | Rebuilds 455 colleges dataset from raw source files |
| `npm run dev` | Starts local Next.js dev server at localhost:3000 |
| `npm run build` | Builds production bundle and generates all 216 static routes |
