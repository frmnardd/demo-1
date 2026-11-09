# Design Document: Fixentra Enterprise Production Core v3.0

**Date:** 2026-11-10  
**Status:** In Review  
**Topic:** Fixentra v3.0 Major Update - Industry Standard Production Architecture  
**Target Domain:** `fixentra.my.id`

---

## 1. Intent & The Why
Elevate Fixentra from an interactive prototype into a genuine **Industry Standard Production Platform (v3.0)**. All lingering demo artifacts (auto-fill demo pills, synthetic mock resets, in-memory volatile arrays) are completely purged. In their place, a durable enterprise architecture is introduced: **Prisma ORM database persistence**, **secure password hashing (`bcryptjs`)**, a **Developer API & API Keys Gateway (`fix_live_...`)**, and **Role-Based Access Control (RBAC)**.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- **100% Elimination of Demo Artifacts:**
  - Remove all "Demo Credentials" auto-fill buttons, "demo session" badges, and "demo data reset" buttons across the application.
  - Form inputs behave as authentic enterprise entry points with real password hashing verification (`bcryptjs`).
- **Durable Database Persistence (Prisma ORM):**
  - Schema models: `User`, `Transaction`, `Product`, `ApiKey`, `AuditLog`.
  - Self-healing database initialization: if the database file is empty on first boot, seed clean baseline enterprise records automatically.
  - Real database queries in Next.js Server Actions and Route Handlers. Orders and products added remain permanently persisted on the VPS across restarts.
- **Developer API Gateway & Key Management:**
  - New **"Developers"** section in sidebar navigation.
  - Ability to generate live production API Keys (`fix_live_...`) with custom names and scoped permissions (`read:orders`, `write:orders`, `read:analytics`).
  - Secure one-time display dialog for secret keys with copy-to-clipboard.
  - Public REST API endpoint (`GET /api/v1/orders`, `POST /api/v1/orders`, `GET /api/v1/health`) supporting standard `Authorization: Bearer <API_KEY>`.
- **Team Management & Role-Based Access Control (RBAC):**
  - User roles: `SUPER_ADMIN`, `FINANCE_MANAGER`, `OPERATOR`.
  - Team members management in Settings (invite member, assign role, revoke access).
- **Fixentra AI Copilot v3.0:**
  - Retained and refined as an enterprise executive assistant for live database analytics.
- **Production Grade Security:**
  - Zod validation on all API inputs.
  - Passwords hashed with `bcryptjs`.
  - Cryptographic token generation for API keys.

### Non-Goals
- Multi-region distributed CockroachDB clustering (SQLite/PostgreSQL Prisma setup is optimal for single VPS deployment).
- Third-party SaaS external dependencies that require credit cards or external registrations.

### Anti-Goals
- Any trace of words like "Demo", "Mock", "Dummy", or "Tiruan" in the user interface.
- Data loss on server restarts.

---

## 3. Approaches Considered & Selected

- **Approach 1: Fixentra Enterprise Production Core with Prisma ORM & Developer API (Selected)**
  - *Pros:* Self-contained on the VPS, durable persistence, zero external configuration hurdles, developer API key management, and complete demo artifact eradication.
  - *Decision:* Selected as the industry standard for production-grade Next.js enterprise systems.

- **Approach 2: Multi-Service PostgreSQL + Redis Cluster (Rejected)**
  - *Cons:* Heavy multi-service manual setup on the VPS terminal with higher maintenance risk.

- **Approach 3: Fintech Multi-Tenancy Architecture (Rejected)**
  - *Cons:* Over-engineered for current scope; requires merchant bank legal entity verification.

---

## 4. Technical Architecture

```
[ Incoming Request (Browser / External Developer API) ]
                         │
                         ▼
             [ Next.js 15 App Router ]
           ├── /api/v1/... (Bearer Token Auth via ApiKey)
           └── Server Actions (Session Auth via User Session)
                         │
                         ▼
             [ Input Validation (Zod) ]
                         │
                         ▼
       [ Business Logic & Hashing (bcryptjs) ]
                         │
                         ▼
      [ Prisma ORM Client (Data Persistence) ]
                         │
                         ▼
           [ SQLite Database Engine ]
            (Durable file on VPS disk)
```

---

## 5. Architectural Decisions & Specifications (Post-Review Alignment)

### 1. Fixentra AI Copilot Engine
- **Decision:** High-speed deterministic aggregation engine executing real Prisma queries over the live database.
- **Reasoning:** Zero external LLM token fees, zero rate limits, sub-millisecond response latency, and negligible VPS RAM footprint.

### 2. Team Member Management (RBAC)
- **Decision:** Direct Provisioning inside Settings.
- **Workflow:** Super Admin enters team member's Name, Email, Initial Password, and Role (`SUPER_ADMIN`, `FINANCE_MANAGER`, `OPERATOR`). Password is immediately hashed with `bcryptjs` and stored in the database.
- **Reasoning:** Avoids complex third-party SMTP server dependencies while providing instant multi-user capabilities.

### 3. Developer API Endpoints & Scopes
- **Endpoints:**
  - `GET /api/v1/health`: Public system health check.
  - `GET /api/v1/orders`: Requires `read:orders` scope. Returns paginated live transactions.
  - `POST /api/v1/orders`: Requires `write:orders` scope. Creates and commits order to database.
  - `GET /api/v1/analytics`: Requires `read:analytics` scope. Returns live KPI metrics and revenue time-series.
- **Authentication:** Standard `Authorization: Bearer <API_KEY>`.

### 4. Admin Bootstrapping & Credential Security
- **Decision:** Self-healing baseline seed on database initialization.
- **Behavior:** Automatically establishes the initial `SUPER_ADMIN` (`ardfrmn`) with a securely hashed bcrypt password corresponding to `firman173`.
- **Reasoning:** Ensures immediate access for the owner while adhering to 100% production security (passwords never stored in plaintext).

---

## 6. What's Left to the Builder
- Detailed permission mapping per role.
- UI styling of the Developer API Keys management interface.
- Sample cURL code snippets in the Developer portal.
