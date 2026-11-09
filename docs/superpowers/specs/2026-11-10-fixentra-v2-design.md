# Design Document: Fixentra Enterprise Suite v2.0 & Authentication Portal

**Date:** 2026-11-10  
**Status:** In Review  
**Topic:** Fixentra v2.0 Major Update with Login Gate, AI Copilot, and Catalog Management  
**Target Domain:** `fixentra.my.id`

---

## 1. Intent & The Why
Transform the application into the official **Fixentra v2.0** production release for `fixentra.my.id`. Because `fixentra.my.id` is a public live website, the initial entrance must be guarded by a modern, high-polish **Authentication Portal** requiring credentials (`username: ardfrmn`, `password: firman173`). Once authenticated, users unlock the full **Fixentra Enterprise Suite v2.0**, featuring a built-in **AI Copilot**, **Product & Subscription Catalog Management**, and a **Realtime Activity Audit Feed**.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- **Initial Authentication Gate:** 
  - Unauthenticated visitors landing on `fixentra.my.id` are greeted by a sleek Fixentra login screen.
  - Hardcoded authentication validation:
    - Username: `ardfrmn`
    - Password: `firman173`
  - Features: Error message on invalid credentials, quick "Fill Demo Credentials" helper pill, "Remember Me" toggle, and password visibility toggle.
  - Session persistence across browser reloads (via `localStorage` and client state).
  - "Log out" button in the user profile menu clears session and immediately redirects to login.
- **Full Brand Identity:** Rebrand all instances from generic names to **Fixentra** (`fixentra.my.id`), including branding logo, metadata title, and favicon.
- **Fixentra AI Copilot:** 
  - Interactive AI Assistant slide-over drawer accessible via header button or `Cmd+J` / `Ctrl+J`.
  - Can answer conversational questions about store data (*"Berapa total revenue saat ini?"*, *"Ringkas pesanan yang pending"*, *"Siapa pelanggan VIP teratas?"*), suggest quick action pills, and clear conversation history.
- **Product Catalog Management:**
  - Dedicated "Products" tab in the sidebar navigation.
  - Interactive product catalog listing digital tiers (e.g. Starter, Pro, Enterprise, Developer API).
  - Modal dialog to add/edit products (Title, SKU, Price, Billing interval, Active/Inactive toggle).
- **Live Activity Audit Feed:**
  - Drawer or widget showcasing realtime system events (Order Created, Status Changed, CSV Exported, User Login).
- **Multi-Format Export:**
  - Support both CSV and JSON data export formats.

### Non-Goals
- Production OAuth / OpenID Connect server integration (Google/GitHub single-sign-on) at this stage. Credentials `ardfrmn` / `firman173` satisfy the requirement.
- Real LLM API key requirement (the AI Copilot operates with deterministic contextual NLP heuristics over live dashboard data).

### Anti-Goals
- Flashing unauthenticated dashboard content before redirection: Authentication check must resolve cleanly without layout shifts.
- Bypassing login on URL parameter tricks: All protected dashboard views require a valid authenticated session.

---

## 3. Approaches Considered & Selected

- **Approach 1: Fixentra AI & Automated Operations Suite with Login Gate (Selected)**
  - *Pros:* Direct fulfillment of public website requirements (login barrier) while delivering an impressive v2.0 experience (AI Copilot, Product Catalog, Audit Feed).
  - *Trade-offs:* Adds auth state management across client sessions.
  - *Decision:* Chosen per user request.

- **Approach 2: Merchant & Payment Gateway Portal (Rejected)**
  - *Focus:* Specifically payment settlement; less aligned with the desired v2.0 feature set.

- **Approach 3: CRM & Sales Pipeline (Rejected)**
  - *Focus:* B2B sales kanban; deviates from the unified operations scope.

---

## 4. Architecture & User Flows

```
[ Visitor enters fixentra.my.id ]
              │
              ▼
    [ Authenticated? ]
      ├── No  ──► [ Fixentra Login Screen ]
      │                 │ (Validate ardfrmn : firman173)
      │                 ▼ (Success)
      └── Yes ──► [ Fixentra Enterprise Dashboard v2.0 ]
                        ├── Overview (KPIs, Charts, Orders)
                        ├── Products (Catalog Management)
                        ├── Analytics (Financial Audit)
                        ├── Customers (Directory)
                        ├── Settings (Profile & Reset)
                        ├── AI Copilot (Cmd+J Drawer)
                        └── Log Out ──► (Clears Session -> Login)
```

---

## 5. What's Left to the Builder
- Animation timings and transition effects between Login and Dashboard states.
- Pre-seeded products in the Product Catalog (e.g., 4 commercial plans).
- Heuristic response templates for the AI Copilot.
