# Loom Video Presentation Script & Mobile Talking Points 🎙️📱

Use this guide to record your **5–10 minute Loom presentation video**. Open this file on your mobile phone or screen to read along while sharing your browser screen!

---

## ⏱️ Video Time Breakdown (Total: ~6 to 8 Minutes)

| Section | Topic | Screen View | Duration |
|---|---|---|---|
| **0:00 - 1:00** | **1. Introduction & Overview** | Homepage (`/`) | ~1 min |
| **1:00 - 2:00** | **2. Mandatory Tech Stack** | Code Editor / `README.md` | ~1 min |
| **2:00 - 4:30** | **3. Student Experience & Features** | Live Site (`https://edu-select-coral.vercel.app`) | ~2.5 mins |
| **4:30 - 5:45** | **4. Super Admin Console** | Admin Portal (`/admin`) | ~1.25 mins |
| **5:45 - 7:00** | **5. Architecture, Database & Security** | VS Code (`schema.prisma`, `auth.ts`, `db.ts`) | ~1.25 mins |
| **7:00 - 8:00** | **6. Deployment & Conclusion** | GitHub Repo & Vercel Dashboard | ~1 min |

---

## 📱 Mobile Teleprompter Script (Word-for-Word Reading)

### 🎙️ Part 1: Introduction & Project Overview (0:00 - 1:00)
*(Screen: Show the Live Website Homepage at `https://edu-select-coral.vercel.app`)*

> **"Hello everyone! Welcome to this presentation of **EduSelect** — a comprehensive, authoritative Engineering College Discovery & Counseling Platform.**
>
> **The goal of EduSelect is to help prospective engineering students across India discover verified colleges, explore cutoff ranks, compare institutions side-by-side, and predict their ideal college and branch.**
>
> **Our platform covers all 28 Indian States with over 580+ verified engineering institutions and structured placement data."**

---

### 🎙️ Part 2: Mandatory Tech Stack (1:00 - 2:00)
*(Screen: Show `README.md` or your code editor)*

> **"Before diving into the features, let's look at the tech stack used to build this application:**
>
> - **Frontend:** Next.js 14 App Router, React 18, TypeScript, and TailwindCSS for a modern, responsive user experience.
> - **Backend:** Node.js with Next.js Server API Routes.
> - **Database & ORM:** PostgreSQL managed via **Prisma ORM**, along with a resilient dataset fallback architecture.
> - **Authentication & Security:** NextAuth.js with JWT session strategy and **bcrypt** password hashing with 10 salt rounds.
> - **Deployment:** Version-controlled on GitHub and deployed live on **Vercel** with 100% build pass rate."**

---

### 🎙️ Part 3: Live Student Platform Walkthrough (2:00 - 4:30)
*(Screen: Interact with the Live Website)*

> **"Now, let's walk through the core features of the platform:**
>
> 1. **Hero Search Engine:** On the homepage, students can perform multi-parameter searches by state, branch (like B.Tech CSE, ECE, Mechanical), or keyword. For example, selecting **Andhra Pradesh** and **B.Tech CSE** instantly filters matching institutions.
>
> 2. **Explore by 28 States Carousel:** We have authentic, high-resolution landmark imagery for all **28 Indian states**. Students can scroll horizontally using smooth navigation arrows `‹` and `›` to explore colleges state by state.
>
> 3. **Popular Colleges Carousel:** Displays top engineering institutions with university crest badges, star ratings (`★★★★★`), location tags, tuition fees, and direct profile links.
>
> 4. **KCET 2026 Rank & College Predictor:** Students can input their state rank and category (GM, 2A, 3B, SC, ST) to calculate their admission probability across engineering branches with target recommendations.
>
> 5. **Side-by-Side College Comparison:** Students can compare up to 3 colleges side by side across tuition fees, ratings, accreditation, and top placement recruiters.
>
> 6. **Student Saved Dashboard:** By clicking the user profile badge in the top navbar, students can access their personalized Saved Dashboard to manage bookmarked colleges and saved comparison tables."**

---

### 🎙️ Part 4: Super Admin Portal (4:30 - 5:45)
*(Screen: Open `https://edu-select-coral.vercel.app/admin`)*

> **"Now let's look at the private **Super Admin Console**:
>
> - The admin portal is isolated at `/admin` with a dedicated clean Light Theme login.
> - Once authenticated with admin credentials (`admin@collegediscovery.com`), the admin gains access to:
>   - **Live User Activity:** Monitor all registered accounts and real-time activity timestamps.
>   - **28 States Explorer & Live College Editor:** Search any state dataset and edit college details, fees, or overviews live with platform-wide synchronization."**

---

### 🎙️ Part 5: Architecture, Database & Security (5:45 - 7:00)
*(Screen: Show VS Code code files: `prisma/schema.prisma`, `src/lib/userStore.ts`, `src/lib/auth.ts`)*

> **"Behind the scenes, the architecture is engineered for high performance and zero downtime:**
>
> - In `prisma/schema.prisma`, we define strict PostgreSQL models for `User`, `College`, `Course`, `Placement`, `SavedCollege`, and `SavedComparison`.
> - In `src/lib/userStore.ts`, user passwords are encrypted using **bcrypt** algorithm with 10 salt rounds.
> - Authentication is powered by NextAuth.js Credentials Provider with encrypted JWT tokens stored in `httpOnly` secure cookies.
> - To ensure 100% uptime on serverless platforms, our API routes feature a resilient hybrid fallback that reads from authoritative datasets if database connectivity is offline."**

---

### 🎙️ Part 6: Live Deployment & Conclusion (7:00 - 8:00)
*(Screen: Show GitHub Repo `https://github.com/mouneshbelavadi/edu-select` and Vercel Dashboard)*

> **"Finally, for deployment:**
>
> - The entire codebase is version-controlled and pushed to GitHub at `https://github.com/mouneshbelavadi/edu-select`.
> - Production deployment is hosted live on **Vercel** at `https://edu-select-coral.vercel.app` with zero build or lint warnings.
>
> **Thank you for watching this presentation of EduSelect!"**

---

## 💡 Quick Tips for Your Loom Recording
1. Keep your browser open to **`https://edu-select-coral.vercel.app`** before starting.
2. Keep VS Code open with `prisma/schema.prisma` in another tab so you can switch cleanly.
3. Speak clearly at a natural pace.
