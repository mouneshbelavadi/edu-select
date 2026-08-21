# Edu Select Platform

**Edu Select Platform** is a full-stack web application designed to help students discover, filter, compare, and bookmark higher education institutions across India. Built with Next.js 14 App Router, TypeScript, TailwindCSS, PostgreSQL, and Prisma ORM, it delivers clean RESTful search APIs, URL-driven filtering, side-by-side college comparisons, and secure user authentication.

---

## 🚀 Tech Stack

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
* **Backend:** Next.js API Routes (Monolith architecture)
* **Database & ORM:** PostgreSQL (Neon serverless) + Prisma ORM
* **Authentication:** NextAuth.js (Auth.js v5), Credentials Provider, `bcryptjs` password hashing, JWT session strategy
* **State Management & Data Fetching:** SWR, Zustand (Comparison drawer)
* **Validation:** Zod schemas shared across client forms and server routes

For deep technical rationale, tradeoffs, and database decisions, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## ✨ Features Implemented

1. **Listing + Search API & Page (`/colleges`):**
   * Instant debounced search (400ms) by college name or city.
   * Multi-criteria filter sidebar: City dropdown, College type (GOVERNMENT, PRIVATE, DEEMED), Fee range inputs, Minimum rating filter.
   * URL query parameters as the single source of truth for shareable, bookmarkable search results.
   * Server-enforced offset pagination (`page`, `limit`) and sorting (rating, fees, name).
2. **College Profile & Detail Page (`/colleges/[id]`):**
   * Server-side rendered profile with direct Prisma query optimization.
   * Tabbed interface covering Institution Overview, Offered Courses & Fee Table, 3-Year Placement History (Average/Highest package, placement %), and Student Reviews with ratings.
   * Interactive "Add to Compare" and "Save College" actions.
3. **Side-by-Side Comparison Tool (`/compare`):**
   * Persistent bottom comparison bar capped at 3 colleges.
   * Structured side-by-side comparison table analyzing fees, locations, ratings, placement metrics, and course options.
   * Linkable comparison URLs (`/compare?ids=col1,col2`) and custom comparison saving.
4. **Authentication & Saved Items Dashboard (`/login`, `/signup`, `/saved`):**
   * Secure signup with bcrypt password hashing and inline field validation.
   * Credentials login with JWT session strategy and protected route middleware (`/saved`, `/dashboard`).
   * User dashboard managing saved colleges and bookmarked comparisons.

---

## 🛠 Local Setup Instructions

### Prerequisites
* Node.js v18+ and npm installed
* PostgreSQL instance or Neon DB connection string

### 1. Clone & Install Dependencies
```bash
git clone <your-repository-url>
cd college-discovery
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env` and fill in your PostgreSQL `DATABASE_URL` and `NEXTAUTH_SECRET`:
```bash
cp .env.example .env
```

### 3. Database Migration & Seeding
Run Prisma migrations and populate 35 realistic colleges, courses, placements, and dummy users:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials

For testing authentication and saved dashboard features, use these pre-seeded credentials:

* **Email:** `aarav.sharma@example.com`
* **Password:** `password123`

---

## 🌐 Live Deployment

* **Live URL:** [https://college-discovery-demo.vercel.app](https://college-discovery-demo.vercel.app)

---

## 📌 Known Limitations & What I'd Do With More Time

* **Offset → Cursor Pagination at Scale:** Current offset pagination (`OFFSET N`) works cleanly for small datasets, but cursor-based pagination (keyset pagination on `createdAt` or `id`) would be implemented for 100,000+ records.
* **OAuth Providers:** Extend NextAuth configuration to support Google and GitHub social logins alongside Credentials provider.
* **In-Memory Rate Limiting:** Replace in-memory sliding window rate limiter (`src/lib/rateLimit.ts`) with Upstash Redis for distributed horizontal server instances.
* **Image Uploads:** Integrate AWS S3 or Cloudinary for dynamic college image uploads rather than static URLs.
* **Review Moderation & Automated E2E Tests:** Implement admin review moderation workflows and full Playwright E2E test suites covering the end-to-end user journey.
