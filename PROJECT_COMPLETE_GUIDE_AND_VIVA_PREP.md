# 🎓 EduSelect — Complete Project Guide & Technical Defense Manual
> **Live Production URL:** [careers.vtuadda.com](https://careers.vtuadda.com)  
> **Platform Name:** EduSelect (Career Discovery & Counselling Platform)  
> **Target Audience:** Indian students (Class 10, Class 12, ITI, Diploma, Graduates) & Parents  

---

## 📌 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [What's on the Website? (Complete Feature Tour)](#2-whats-on-the-website-complete-feature-tour)
3. [Technology Stack (Explained in Simple English)](#3-technology-stack-explained-in-simple-english)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Datasets & Information Structure](#5-datasets--information-structure)
6. [Hard Technical & Logical Questions (Evaluator / "Sir" Q&A)](#6-hard-technical--logical-questions-evaluator--sir-qa)
7. [Demo Accounts & Quick Testing Checklist](#7-demo-accounts--quick-testing-checklist)

---

## 1. Executive Summary & Problem Statement

### The Problem in India:
Every year, over **2.5 crore students** in India pass Class 10 and Class 12. Most students make life-altering career decisions based on peer pressure, aggressive private college advertisements, or incomplete advice from relatives. 
- Students who want to be doctors often don't understand that **Biology is legally mandatory (NMC rules)**.
- Engineering aspirants are confused between CSE, AI/DS, and Electronics.
- Rural and Tier-2/3 students lack access to professional career counsellors (which charge ₹2,000–₹10,000 per session).

### The Solution — EduSelect:
**EduSelect** is a free, centralized career-guidance and college-discovery portal built specifically for Indian students. It delivers:
- **Verified college data**: 455+ institutions across all 28 Indian states with official NIRF 2025 rankings, fee ranges, and entrance exam cutoffs.
- **Rule-calibrated AI Counsellor**: Powered by Google Gemini 2.5 Flash to recommend verified pathways strictly adhering to Indian regulatory bodies (NMC, AICTE, DTE).
- **Interactive Decision Tools**: KCET 2026 Cutoff Predictor, Multi-College Comparison Matrix, and 4-Phase Career Milestones.
- **Telegram AI Bot**: Allows students without high-speed laptops to receive instant career guidance on their phones via Telegram.

---

## 2. What's on the Website? (Complete Feature Tour)

| Page / Feature | Route | What It Does & Key Highlights |
| :--- | :--- | :--- |
| **Home Dashboard** | `/` | Premium Phase 8 design system with 18 localized WebP images, Fraunces serif typography, quick category navigation (10th, 12th, ITI, Diploma, B.Tech, Graduate), and floating AI Counselor drawer. |
| **College Directory** | `/colleges` | Searchable catalog of 455+ verified engineering colleges. Filterable by state (28 states), NIRF rank range, fee affordability, branches offered, and entrance exam (KCET, COMEDK, JEE). |
| **College Detail View** | `/colleges/[id]` | Deep-dive page for every college: NIRF 2025 ranking badge, accreditation (NAAC/NBA), cutoffs across categories (GM, OBC, SC/ST), annual fees, campus photos, and direct placement stats. |
| **Colleges by State** | `/states` | Interactive directory covering **all 28 Indian States**. Click any state (Karnataka, Maharashtra, Tamil Nadu, Uttar Pradesh, etc.) to view regional counseling bodies, local universities, and cutoffs. |
| **Career Pathways** | `/pathways` | Step-by-step 4-phase milestone roadmaps from Class 10 up to senior industry roles. Covers Science (PCM, PCB, PCMB), Commerce, Arts, ITI Trades, and Polytechnic Diplomas. |
| **Career Detail View** | `/careers/[kind]/[id]` | Complete syllabus, eligibility, fee estimates, top entrance exams (NEET, JEE, IAT, CUET), average starting CTC, and government job options for every career. |
| **KCET 2026 Predictor** | `/kcet-2026-predictor` | Deterministic cutoff calculator. Enter target rank, reservation category (1G, 2A, 2B, 3A, 3B, GM, SC, ST), and preferred branch to see high, medium, and safe college chances based on official KEA data. |
| **College Compare** | `/compare` | Side-by-side comparative matrix. Compare up to 4 colleges simultaneously across 12 criteria (NIRF, fees, cutoffs, placements, NAAC grade, campus facilities). |
| **AI Counsellor** | `/ai-counsellor` | In-depth AI consultation powered by Google Gemini 2.5 Flash. Students specify marks, category, liked subjects, and doubts to receive tailored, hallucination-free advice. |
| **Telegram Bot Hub** | `/telegram` | Student gateway with official QR code, direct `@EDUSELECTADVISOR_BOT` link, and instant mobile access to the AI advisor. |
| **Student Dashboard** | `/saved` | Personalized bookmarking dashboard where logged-in students save dream colleges, compare shortlisted choices, and track application deadlines. |
| **Admin Portal** | `/admin` | Real-time platform management console: active user counter, state dataset sync tools, college management, and live activity metrics. |
| **Authentication** | `/login` & `/signup` | Secure JWT-based NextAuth authentication with 1-click pre-filled demo student (`aarav.sharma@example.com`) and admin credentials. |

---

## 3. Technology Stack (Explained in Simple English)

### A. Frontend (The User Interface)
- **Next.js 14 (App Router)**: The industry-standard React framework. We use the App Router architecture (`src/app/`) for hybrid Server-Side Rendering (SSR) and Client Components (`'use client'`). This guarantees instant initial page loads for students on 4G networks while keeping dynamic interactivity fast.
- **React 18**: Component-based UI library with hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) for clean state management.
- **Tailwind CSS**: A utility-first CSS framework customized with a bespoke design system: deep midnight blues (`#0F172A`, `#1E2A78`), vibrant sapphire accents (`#2563EB`), warm amber highlights, and Fraunces serif headings for an editorial feel.
- **SWR (Stale-While-Revalidate)**: Developed by Vercel. Keeps data fresh on the screen (like active users on the admin page) without freezing the UI or requiring full page reloads.

### B. Backend & API Services
- **Next.js API Route Handlers (`src/app/api/`)**: Serverless endpoints written in TypeScript. Each route runs in a Node.js runtime environment with zero overhead.
- **Zod**: TypeScript-first schema declaration and validation library. Validates incoming requests on all API endpoints (e.g. validating question lengths, marks, and categories) to prevent malformed payloads.
- **In-Memory Sliding-Window Rate Limiter (`src/lib/rateLimit.ts`)**: Protects the AI and search APIs from DDoS and bot abuse by restricting anonymous IPs to 10 requests/min and logged-in users to 30 requests/min.

### C. Artificial Intelligence & LLM Layer
- **Google Gemini 2.5 Flash (`@google/genai` v1beta SDK)**: State-of-the-art multimodal lightweight model from Google DeepMind. Chosen for sub-second latency, low token cost, and native adherence to structured JSON output schemas.
- **Hallucination Guard Engine**: The API passes a filtered candidate catalog of verified pathways to Gemini. A secondary verification step checks the returned `itemId` against allowed IDs; if an unverified ID is returned, the system falls back to a deterministic rule-based engine.
- **NMC / AICTE Domain Rules**: Strict prompt guardrails enforce statutory guidelines (e.g., prohibiting PCM alone from being recommended for MBBS/Doctor careers).

### D. Authentication & Security
- **NextAuth.js (v4)**: Complete authentication suite using the **JWT (JSON Web Token)** strategy. Sessions are encrypted client-side in HTTP-only, SameSite cookies, making them immune to XSS attacks.
- **bcryptjs**: One-way cryptographic salting and hashing algorithm (10 rounds) used for passwords. Plaintext passwords are never stored anywhere in the database or logs.
- **Dual-Tier Role-Based Access Control (RBAC)**: Distinguishes between `USER` (students) and `ADMIN` (platform managers), with route protection preventing unauthorized access to `/admin`.

### E. Database & Fallback Storage
- **Prisma ORM (v5)**: Modern, type-safe database toolkit connected to PostgreSQL.
- **Zero-Downtime Data Architecture**: In addition to PostgreSQL, the repository integrates static curated JSON stores (`pathways.json`, `colleges.json`, `exams.json`). If the external SQL database is asleep or disconnected, the application transparently serves authoritative data with zero user-facing errors.

---

## 4. Architecture & Data Flow

```mermaid
flowchart TD
    User([Student / Parent / User]) -->|Browser Request| NextServer[Next.js 14 App Router]
    
    subgraph Frontend [Client Layer]
        NextServer --> HomeUI[Phase 8 Home Page]
        NextServer --> StatesUI[28 Indian States Explorer]
        NextServer --> PredictorUI[KCET Cutoff Predictor]
        NextServer --> CompareUI[4-Way College Compare]
        NextServer --> CounsellorUI[AI Counsellor Drawer / Page]
        NextServer --> AdminUI[Admin Portal]
    end

    subgraph Backend [Serverless API Layer]
        CounsellorUI -->|POST /api/careers/ai| AiRoute[AI Routing & Rate Limiting]
        AiRoute -->|Extract Intent & Filter| Repo[Careers Repository]
        Repo --> JSONData[(Authoritative JSON Datasets)]
        Repo -.-> DB[(PostgreSQL Database via Prisma)]
        
        AiRoute -->|Compact Candidate Catalog| Gemini[Google Gemini 2.5 Flash API]
        Gemini -->|Validated JSON Response| AiRoute
        AiRoute -->|Verified Recommendations| CounsellorUI
        
        AdminUI -->|JWT Auth Check| AuthGuard[NextAuth Credentials Provider]
        AuthGuard --> UserStore[User Store & bcrypt]
    end

    subgraph External [External Services]
        TelegramUser([Mobile Student]) -->|Message /start| TelegramBot[EduSelect Telegram Bot]
        TelegramBot -->|Webhook POST| WebhookAPI[/api/telegram/webhook]
        WebhookAPI --> Repo
    end
```

---

## 5. Datasets & Information Structure

The platform incorporates verified datasets compiled from official Indian regulatory portals:
1. **Colleges Dataset (`src/data/colleges.json`)**:
   - 455+ institutions across all 28 Indian states.
   - Verified fields: NIRF 2025 ranking, state counseling codes, tuition fees (Govt / Private quotas), approved intake, NAAC grade, placement averages, and official website URLs.
2. **Career Pathways (`src/data/careers/pathways.json`)**:
   - Streams after Class 10 (Science PCM, Science PCB, Science PCMB, Commerce, Arts, ITI Trades, Polytechnic Diplomas).
   - Undergraduate & Professional courses (MBBS, BDS, AYUSH, B.Tech 29 branches, B.Sc, B.Com, LLB).
   - Outcomes, NCrF credit levels (Level 3 to Level 7), entrance exam IDs, and 4-phase timelines.
3. **Entrance Exams (`src/data/careers/exams.json`)**:
   - 80+ national and state entrance exams (JEE Main, JEE Advanced, NEET-UG, KCET, COMEDK, MHT-CET, WBJEE, CUET, NDA).
4. **State Highlights & Cities (`src/lib/stateConfig.ts`)**:
   - Covers all 28 states with custom WebP imagery, capital tech hubs, and regional counseling boards.

---

## 6. Hard Technical & Logical Questions (Evaluator / "Sir" Q&A)

Here are the exact hard-hitting questions external examiners and professors frequently ask, along with the precise technical answers you should deliver:

### Q1. Why did you choose Next.js 14 App Router instead of a traditional React + Express.js setup?
**Answer:**  
*"In a traditional SPA (React + Express), the client must download a large JavaScript bundle before rendering anything, resulting in a blank white screen on slower mobile connections. Next.js 14 App Router provides **Server-Side Rendering (SSR)** and **React Server Components (RSC)**. The initial HTML for colleges and state catalogs is pre-rendered on the server and delivered instantly. Furthermore, having backend API routes within the same codebase eliminates CORS configuration issues, simplifies deployment to Vercel, and provides end-to-end TypeScript type sharing between frontend and backend."*

---

### Q2. LLMs are known to hallucinate. How do you ensure your AI Counsellor doesn't invent fake colleges, cutoffs, or degrees?
**Answer:**  
*"We implemented a **Strict Retrieval-Augmented Retrieval & Hallucination Guard Pattern**:*
1. *The AI is **never** asked an open-ended question in isolation. When a student asks a query, our `searchCareers` repository first filters verified candidates matching the student's qualification level and query intent.*
2. *We format these verified candidates into a strict, compact JSON catalog containing exact `itemId`s, verified fee ranges, and official entrance exams.*
3. *The system prompt explicitly commands Gemini: `'Recommend ONLY items from the CATALOGUE and always return their exact itemId. Never invent fees or dates.'`*
4. *After the model responds, our server runs a **validation filter**: `allowedIds.has(r.itemId)`. If the model invents an item not in the catalog, it is discarded immediately. If fewer than 2 valid items pass, the system automatically falls back to our deterministic rule-based engine."*

---

### Q3. A student asks: "I want to become a doctor." If they took PCM, can they? How does your system enforce this?
**Answer:**  
*"Under National Medical Commission (NMC) regulations in India, Biology (or Biotechnology) is legally mandatory alongside Physics and Chemistry to appear for NEET-UG and gain admission to MBBS, BDS, or AYUSH degrees. A student with only Science - PCM cannot write NEET-UG.*  
*In our system:*
1. *In `src/app/api/careers/ai/route.ts`, our intent classifier detects medical keywords (`doctor`, `mbbs`, `neet`, `biology`).*
2. *It sets the stream to `PCB` and explicitly **filters out `a-pcm`** from the candidate pool.*
3. *It prioritizes **Science - PCB (Physics, Chemistry, Biology)** as the direct route and **Science - PCMB** for students wanting to keep engineering open.*
4. *The system instruction explicitly warns the AI that recommending PCM for becoming a doctor is legally invalid under Indian educational regulations."*

---

### Q4. How does your KCET Cutoff Predictor work? Is it Machine Learning or deterministic?
**Answer:**  
*"It uses a **deterministic percentile & historical bracket matching algorithm** rather than black-box machine learning. For entrance counselling, students and parents need mathematically reliable historical bounds, not probabilistic guesses.*  
*The predictor matches the student's entered rank against official KEA Round 1, Round 2, and Extended Round closing cutoffs across specific reservation categories (GM, 2A, 2B, 3A, 3B, SC, ST). We classify admissions into three statistical zones:*
- **High Chance / Safe:** Closing rank is at least 15% higher than the student's rank.
- **Moderate / Competitive:** Closing rank is within ±15% of the student's rank.
- **Low Chance / Dream:** Closing rank is below the student's rank.*  
*This gives students actionable, realistic counselling advice."*

---

### Q5. How does your authentication work without database downtime?
**Answer:**  
*"We use **NextAuth.js with JWT session strategy** and a dual-layer user store (`src/lib/userStore.ts`):*
1. *When a user logs in, NextAuth checks Prisma for the user in PostgreSQL.*
2. *If the remote database is asleep, unseeded, or temporarily unreachable, our repository seamlessly falls back to our persistent in-memory and JSON user store.*
3. *Passwords are verified using **bcryptjs cryptographic hashes**.*
4. *Session tokens are signed with `NEXTAUTH_SECRET` using AES-GCM-256 and stored in an HTTP-only, SameSite cookie. The browser never exposes the raw token to client scripts, protecting against XSS and CSRF attacks."*

---

### Q6. How is rate limiting implemented without Redis?
**Answer:**  
*"We implemented an in-memory **Sliding-Window Token Bucket rate limiter** in `src/lib/rateLimit.ts`.*  
*Every incoming request extracts the client identifier (either `session.user.id` or the client IP from the `x-forwarded-for` header). The limiter tracks request timestamps within a 60-second window in a clean LRU map. If an unauthenticated user exceeds 10 requests/minute, the server responds immediately with HTTP `429 Too Many Requests` and a `Retry-After` header, protecting our Gemini API quota and preventing denial-of-service spikes."*

---

### Q7. How does the Telegram Bot work with Next.js?
**Answer:**  
*"Our Telegram bot supports both **Serverless Webhook mode** and **Local Polling mode**:*
- *In production (`careers.vtuadda.com`), Telegram communicates with our Next.js API route via an HTTPS webhook at `/api/telegram/webhook`.*
- *When a student sends a message on Telegram, Telegram's servers make a `POST` request with the JSON update to our Next.js endpoint.*
- *The endpoint processes the message, queries our internal `searchCareers` repository, formats a response with Telegram Markdown and inline navigation buttons, and replies within milliseconds.*
- *This eliminates the need to run an expensive 24/7 dedicated background virtual machine."*

---

### Q8. What is SWR and why did you use it on the Admin Dashboard?
**Answer:**  
*"SWR stands for **Stale-While-Revalidate**, an HTTP cache invalidation strategy popularized by HTTP RFC 5861 and built by Vercel.*  
*On the Admin Dashboard (`/admin`), we use SWR with `{ refreshInterval: 3000 }` to poll `/api/admin/users`. SWR displays the cached (stale) user count immediately so the UI never flickers, while simultaneously revalidating in the background. As soon as a new student registers, the counter updates in real time without refreshing the browser."*

---

### Q9. How do you handle database migrations and schema consistency?
**Answer:**  
*"We use **Prisma ORM** with a centralized schema file (`prisma/schema.prisma`). Models for `User`, `Account`, `Session`, `College`, `CareerPathway`, `SavedCollege`, and `AuditLog` are defined declaratively. Prisma generates type-safe TypeScript client bindings (`@prisma/client`), ensuring that any mismatch between database columns and application code is caught at compile-time by `npx tsc --noEmit` before deployment."*

---

## 7. Demo Accounts & Quick Testing Checklist

For the presentation, both portals are pre-configured to log in with a single click:

### 👤 Student Demo Login:
- **URL:** [careers.vtuadda.com/login](https://careers.vtuadda.com/login)
- **Email:** `aarav.sharma@example.com` *(Pre-filled)*
- **Password:** `password123` *(Pre-filled)*
- **Action:** Simply click **"Log In →"** (or click **"Auto-fill Student"** if cleared).
- **Destination:** Redirects directly to `/saved` (Student Dashboard with saved colleges and personalized bookmarks).

---

### 🛡️ Administrator Demo Login:
- **URL:** [careers.vtuadda.com/admin](https://careers.vtuadda.com/admin)
- **Admin Email:** `admin@collegediscovery.com` *(Pre-filled)*
- **Password:** `Admin@123456` *(Pre-filled)*
- **Action:** Click **"Sign In to Admin Dashboard →"**.
- **Destination:** Loads the live administrative console with real-time user statistics, state synchronization data, and audit tools.

---

### 📱 Telegram Bot Demo:
- **URL:** [careers.vtuadda.com/telegram](https://careers.vtuadda.com/telegram)
- **Bot Handle:** `@EDUSELECTADVISOR_BOT`
- **Action:** Scan the displayed QR code with your phone or click the direct button to launch the bot and type `/start`.

---

*Compiled for EduSelect defense & technical evaluation (2026).*
