# System Architecture & Technical Decisions

This document details the architectural choices, engineering trade-offs, and rationale behind the **College Discovery Platform** full-stack web application.

---

## 1. Monolith Architecture (Next.js API Routes)

* **Decision:** Next.js App Router API Routes serve as the application backend instead of maintaining a separate Node.js / NestJS backend service.
* **Reasoning:** 
  * Single deployable unit on Vercel, streamlining CI/CD and hosting.
  * Eliminates Cross-Origin Resource Sharing (CORS) complexity entirely.
  * Enables seamless sharing of TypeScript types and data transfer objects (DTOs) between frontend components and backend handlers without published packages or codegen.
  * Accelerates iteration speed for MVP development.
* **Trade-off:** Less separation of concerns than a dedicated backend microservice/service layer. High request volumes would eventually require decoupled horizontal scaling, which is an acceptable compromise for this MVP scale.

---

## 2. Prisma ORM with PostgreSQL

* **Decision:** Prisma ORM paired with PostgreSQL (hosted on serverless Neon DB) over raw SQL queries or lightweight query builders.
* **Reasoning:**
  * End-to-end type safety from database query return types directly into React components.
  * Declarative database schema (`prisma/schema.prisma`) with git-versioned schema migrations (`prisma migrate`).
  * Built-in protection against SQL Injection through automated parameterized queries.
* **Trade-off:** Marginally less direct control over hyper-optimized native SQL queries or complex JOIN logic.

---

## 3. Authentication Strategy

* **Decision:** NextAuth.js (Auth.js v5) using Credentials Provider, `bcrypt` password hashing, and stateless JWT session management.
* **Reasoning:**
  * Avoids reinventing security-critical session, cookie, and token signing mechanisms.
  * Fully auditable in the codebase without opaque third-party black-box auth dependencies.
  * JWT session strategy avoids database lookups on every incoming request, ensuring low latency.
* **Trade-off:** Credentials-only authentication without social OAuth providers (e.g. Google, GitHub) for MVP scope. Stateless JWT sessions cannot be invalidated instantly server-side without a token blacklist.

---

## 4. REST API Design

* **Decision:** Standardized RESTful APIs hosted under `/api/*` endpoints rather than GraphQL.
* **Reasoning:**
  * Matches the project brief's explicit requirement for "REST API quality."
  * Simpler implementation, debugging, and client caching without requiring GraphQL client runtimes.
* **Trade-off:** Lacks the client-side query field selection flexibility provided by GraphQL; endpoints return standard payloads defined by server schemas.

---

## 5. Offset-Based Pagination

* **Decision:** Offset-based pagination using `page` and `limit` query parameters (`GET /api/colleges?page=1&limit=12`).
* **Reasoning:**
  * Simple to implement, test, and reason about.
  * Negligible performance overhead for initial dataset size (~30-40 colleges).
* **Trade-off:** At production scale (100,000+ records), offset queries (`OFFSET N`) degrade in DB performance. In production, migration to cursor-based pagination (using keyset pagination on `createdAt` or `id`) would be required.

---

## 6. Data Fetching Strategy

* **Decision:** React Server Components (RSC) for initial page loads and static data fetching, combined with Client Components + SWR / `fetch` for interactive filtering, search, and dynamic forms.
* **Reasoning:**
  * RSC improves initial load time, SEO, and minimizes JavaScript bundle sent to the client.
  * Client components handle stateful interactions like instant search debouncing, side-by-side comparison management, and form submissions.
* **Trade-off:** Adds minor complexity in architecting clear boundaries between Server Components and Client Components.

---

## 7. Unified Validation Strategy

* **Decision:** Single source of truth for validation using Zod schemas defined in `src/lib/validation/`.
* **Reasoning:**
  * Shared schemas validate request bodies on API route handlers (server-side enforcement) and form inputs in React (client-side UX).
  * Prevents schema drift and ensures strict input limits and type sanity.
* **Trade-off:** Requires Zod runtime dependency and schema setup.
