# Testing Strategy & Verification Plan

This document details the test coverage, automated test suite setup, manual verification checklists, and future testing recommendations for the **College Discovery Platform**.

---

## 1. Automated Test Suite Overview

Automated tests focus on critical business logic, security algorithms, and input validation schemas:

* **Zod Input Validation (`src/lib/validation/college.ts` & Auth schemas):**
  * Verifies valid search, pagination, fee ranges, and rating filter parameters pass cleanly.
  * Verifies invalid parameters (e.g. `minRating > 5`, `limit > 50`, invalid email formats, short passwords) throw validation errors with HTTP 400 responses.
* **Authentication & Hashing Security (`src/lib/auth.ts` & `bcryptjs`):**
  * Verifies password hashing (`bcrypt.hash`) with 10 salt rounds generates secure hashes.
  * Verifies `bcrypt.compare` returns `true` for correct passwords and `false` for incorrect credentials.
* **API Handler logic (`GET /api/colleges`):**
  * Verifies query parameter parsing, dynamic SQL query construction, offset pagination math (`skip/take`), and JSON response shape formatting `{ data: College[], pagination: { page, limit, total, totalPages } }`.

---

## 2. Manual Verification Checklist

The following manual verification checklist was executed across each phase of development:

- [x] **Project Setup & Architecture:** `src/lib/db.ts` uses Next.js hot-reload safe singleton pattern to prevent DB connection exhaustion in dev mode.
- [x] **Database Schema & Migrations:** All 6 Prisma models (`User`, `College`, `Course`, `Placement`, `Review`, `SavedCollege`, `SavedComparison`) defined with `onDelete: Cascade` on foreign keys and indexed query fields (`city`, `fees`, `rating`).
- [x] **Seeding Verification:** Database seeded with 35 realistic colleges, courses, 3 years of placements (2022-2024), reviews, and dummy users (test password: `password123`).
- [x] **Listing & Filtering API:** `GET /api/colleges` tested with parameters (`?city=Bengaluru`, `?minFees=100000`, `?search=tech`). Invalid parameter `?minRating=abc` returns 400 Bad Request.
- [x] **College Detail API:** `GET /api/colleges/[id]` returns full relations (courses, placements ordered by year desc, reviews with author names). Non-existent ID returns 404 Not Found.
- [x] **Authentication:** Signup API hashes passwords, prevents duplicate email registration (409 Conflict). NextAuth credentials login issues valid JWT sessions. Protected `/saved` route redirects to `/login` if unauthenticated.
- [x] **Frontend Interactivity:** Debounced search input (400ms), URL-driven shareable filters, persistent compare bar (capped at 3 colleges), and saved items management.

---

## 3. What I Would Add With More Time (Future Scope)

1. **End-to-End (E2E) Testing with Playwright:**
   * Full browser automation testing the complete user journey: Landing page → Search with filters → Open detail page → Add to compare → Sign up new account → Save college & comparison → Verify item in `/saved` dashboard.
2. **Database Integration Testing with Test Container / Mock DB:**
   * Spinning up an isolated PostgreSQL instance in Docker during CI pipelines to test exact raw SQL/Prisma migration behavior against live database engines.
