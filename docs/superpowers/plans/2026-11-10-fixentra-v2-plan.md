# Fixentra Enterprise Suite v2.0 & Authentication Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the application into Fixentra Enterprise Suite v2.0 for `fixentra.my.id`, featuring a public Login screen entrance gate (username: `ardfrmn`, password: `firman173`), Fixentra AI Copilot (`Cmd+J`), Product Catalog Management, Live Activity Audit Feed, and multi-format exports (CSV/JSON).

**Architecture:** Client-side authentication layer guarding `src/app/page.tsx` with session persistence, modular domain views (`src/components/dashboard/products-view.tsx`, `ai-copilot.tsx`, `login-screen.tsx`), and a centralized activity audit bus (`src/lib/audit-log.ts`).

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS, Radix UI Primitives, Lucide Icons, Recharts, next-themes, Sonner, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-10-fixentra-v2-design.md`](file:///c:/Users/Firman%20Ardiansyah/Downloads/Demo-1/docs/superpowers/specs/2026-11-10-fixentra-v2-design.md)

---

## Global Constraints

- Target Brand: Fixentra (`fixentra.my.id`).
- Credentials: Username `ardfrmn`, Password `firman173`.
- Gatekeeping: Unauthenticated users MUST only see the Login screen; zero access to dashboard without successful authentication.
- Shortcut: `Cmd+J` / `Ctrl+J` triggers Fixentra AI Copilot.
- Quality: All existing 16 tests must remain green alongside new tests; production build must pass with 0 errors.

---

## Review Focus

1. **Login Credentials Validation & Empty Inputs:** Whitespace trimming, invalid password or username shows friendly error alert without page refresh or crash.
2. **Session Hydration Flash:** Unauthenticated users must not see a 1-second flash of protected dashboard content before redirecting to login; initial auth check must resolve cleanly.
3. **Keyboard Shortcut Accessibility (`Cmd+J` / `Ctrl+J`):** AI Copilot keyboard listener must prevent default browser behavior and toggle drawer cleanly without stuck state.
4. **Catalog Form Validation:** Adding a new product tier with negative price or empty title must be blocked with validation feedback.
5. **Audit Feed Event Ingestion:** Adding new orders or changing status must append audit log entries with ISO timestamp without state desynchronization.

---

### Task 1: Authentication Engine & Session Storage (`src/lib/auth.ts`)

**Files:**
- Create: `src/lib/auth.ts`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Consumes: None (pure TypeScript).
- Produces:
  - `validateCredentials(username: string, password: string): { success: boolean; error?: string }`
  - `getStoredSession(): { authenticated: boolean; username: string | null }`
  - `setStoredSession(username: string, remember: boolean): void`
  - `clearStoredSession(): void`

- [ ] **Step 1: Write failing test for credentials validation and session handling**

```typescript
// tests/auth.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { validateCredentials } from "../src/lib/auth";

describe("Authentication Engine", () => {
  it("authenticates valid username and password (ardfrmn : firman173)", () => {
    const result = validateCredentials("ardfrmn", "firman173");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("authenticates when username has leading/trailing whitespace", () => {
    const result = validateCredentials("  ardfrmn  ", "firman173");
    expect(result.success).toBe(true);
  });

  it("rejects invalid username or password (Review Focus #1)", () => {
    expect(validateCredentials("wronguser", "firman173").success).toBe(false);
    expect(validateCredentials("ardfrmn", "wrongpass").success).toBe(false);
    expect(validateCredentials("", "").success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/auth.test.ts`  
Expected: FAIL (Cannot find module `src/lib/auth`)

- [ ] **Step 3: Implement `src/lib/auth.ts`**

Define valid credentials constants (`ardfrmn` / `firman173`), implement `validateCredentials`, and `localStorage` session persistence helpers.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/auth.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts tests/auth.test.ts
git commit -m "feat(auth): implement authentication validation and session management"
```

---

### Task 2: Fixentra Login Portal Screen (`src/components/auth/login-screen.tsx`)

**Files:**
- Create: `src/components/auth/login-screen.tsx`
- Test: `tests/login-screen.test.tsx`

**Interfaces:**
- Consumes: `validateCredentials`, `setStoredSession` from `src/lib/auth.ts`, `Button`, `Input`, `Card`.
- Produces: `LoginScreen({ onLoginSuccess }: { onLoginSuccess: (username: string) => void }): JSX.Element`

- [ ] **Step 1: Write test for LoginScreen rendering and credential autofill**

```typescript
// tests/login-screen.test.tsx
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LoginScreen } from "../src/components/auth/login-screen";

describe("LoginScreen Component", () => {
  it("renders Fixentra branding and login inputs", () => {
    const html = renderToString(<LoginScreen onLoginSuccess={() => {}} />);
    expect(html).toContain("Fixentra");
    expect(html).toContain("Sign In");
    expect(html).toContain("Demo Credentials");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/login-screen.test.tsx`  
Expected: FAIL (Cannot find module `src/components/auth/login-screen`)

- [ ] **Step 3: Implement `src/components/auth/login-screen.tsx`**

Build high-polish login screen with Fixentra branding, username & password input, password eye toggle, "Auto-fill Demo Credentials" button, remember-me checkbox, error display alert, and submit handler.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/login-screen.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/ tests/login-screen.test.tsx
git commit -m "feat(auth): implement Fixentra public login screen portal"
```

---

### Task 3: Full Fixentra Rebranding & Brand Assets

**Files:**
- Create: `src/components/brand/fixentra-logo.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: None.
- Produces: `FixentraLogo({ className }: { className?: string }): JSX.Element`

- [ ] **Step 1: Implement `FixentraLogo` component**

Create modern SVG logo with hexagonal cyber/enterprise aesthetic for Fixentra.

- [ ] **Step 2: Update Sidebar, Header, and Metadata to Fixentra v2.0**

Replace old logos/names in `sidebar.tsx` and `header.tsx` with `FixentraLogo` and "Fixentra OS v2.0".  
Update `src/app/layout.tsx` metadata with `Fixentra - Enterprise Operations Suite (fixentra.my.id)`.

- [ ] **Step 3: Run existing tests to verify zero regressions**

Run: `npx vitest run`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/brand/ src/components/layout/ src/app/layout.tsx
git commit -m "feat(brand): apply official Fixentra v2.0 branding and logo assets"
```

---

### Task 4: Product Catalog Management View (`src/components/dashboard/products-view.tsx`)

**Files:**
- Modify: `src/lib/mock-data.ts`
- Create: `src/components/dashboard/products-view.tsx`
- Test: `tests/products-catalog.test.ts`

**Interfaces:**
- Consumes: `ProductTier` model in `src/lib/mock-data.ts`.
- Produces: `ProductsView({ products, onAddProduct, onToggleStatus }: ProductsViewProps): JSX.Element`

- [ ] **Step 1: Write test for product validation helper**

```typescript
// tests/products-catalog.test.ts
import { describe, it, expect } from "vitest";
import { validateProductInput } from "../src/components/dashboard/products-view";

describe("Product Catalog Validation", () => {
  it("rejects product with empty title or negative price (Review Focus #4)", () => {
    expect(validateProductInput({ title: "", price: 99, sku: "SKU-01" }).valid).toBe(false);
    expect(validateProductInput({ title: "Enterprise", price: -10, sku: "SKU-01" }).valid).toBe(false);
  });

  it("accepts valid product tier", () => {
    expect(validateProductInput({ title: "Enterprise Pro", price: 499, sku: "FIX-ENT" }).valid).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/products-catalog.test.ts`  
Expected: FAIL (Cannot find module `src/components/dashboard/products-view`)

- [ ] **Step 3: Implement `ProductTier` models and `ProductsView` component**

Add initial products in `src/lib/mock-data.ts` (Fixentra Starter, Fixentra Pro, Fixentra Enterprise, Fixentra Developer API).  
Create `src/components/dashboard/products-view.tsx` with product cards grid, active/inactive badges, price indicators, and a "+ Add Product" modal dialog.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/products-catalog.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock-data.ts src/components/dashboard/products-view.tsx tests/products-catalog.test.ts
git commit -m "feat(products): implement Fixentra product and subscription tier catalog"
```

---

### Task 5: Fixentra AI Copilot Drawer (`src/components/dashboard/ai-copilot.tsx`)

**Files:**
- Create: `src/components/dashboard/ai-copilot.tsx`
- Test: `tests/ai-copilot.test.ts`

**Interfaces:**
- Consumes: `Transaction`, `KpiMetric`.
- Produces:
  - `processCopilotQuery(prompt: string, context: { kpis: KpiMetric[]; transactions: Transaction[] }): string`
  - `AiCopilotDrawer({ open, onOpenChange, kpis, transactions, onQuickCreateOrder }: AiCopilotProps): JSX.Element`

- [ ] **Step 1: Write test for Copilot query processor**

```typescript
// tests/ai-copilot.test.ts
import { describe, it, expect } from "vitest";
import { processCopilotQuery } from "../src/components/dashboard/ai-copilot";
import { INITIAL_KPIS, INITIAL_TRANSACTIONS } from "../src/lib/mock-data";

describe("Fixentra AI Copilot Engine", () => {
  it("answers revenue questions using live KPI context", () => {
    const answer = processCopilotQuery("berapa revenue saat ini?", {
      kpis: INITIAL_KPIS,
      transactions: INITIAL_TRANSACTIONS,
    });
    expect(answer).toContain(INITIAL_KPIS[0].value);
  });

  it("summarizes pending orders", () => {
    const answer = processCopilotQuery("pesanan pending", {
      kpis: INITIAL_KPIS,
      transactions: INITIAL_TRANSACTIONS,
    });
    expect(answer.toLowerCase()).toContain("pending");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ai-copilot.test.ts`  
Expected: FAIL (Cannot find module `src/components/dashboard/ai-copilot`)

- [ ] **Step 3: Implement `AiCopilotDrawer` and `processCopilotQuery`**

Build interactive slide-over drawer with chat message history, suggested prompt pills, text input, and contextual answers based on live dashboard state. Listen for `Cmd+J` / `Ctrl+J` shortcut (Review Focus #3).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ai-copilot.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ai-copilot.tsx tests/ai-copilot.test.ts
git commit -m "feat(ai): implement Fixentra AI Copilot contextual assistant drawer"
```

---

### Task 6: Activity Audit Feed & Multi-Format JSON Export

**Files:**
- Create: `src/lib/audit-log.ts`
- Modify: `src/lib/export-utils.ts`
- Test: `tests/audit-log.test.ts`

**Interfaces:**
- Consumes: None.
- Produces:
  - `AuditLogEvent`: `{ id: string; type: string; description: string; timestamp: string; actor: string }`
  - `createAuditEntry(...)`, `INITIAL_AUDIT_LOGS`
  - `triggerJSONDownload(filename: string, data: unknown): void`

- [ ] **Step 1: Write test for audit log creation and JSON formatting**

```typescript
// tests/audit-log.test.ts
import { describe, it, expect } from "vitest";
import { createAuditEntry } from "../src/lib/audit-log";
import { formatDataAsJSON } from "../src/lib/export-utils";

describe("Audit Log & JSON Export", () => {
  it("creates formatted audit log entry (Review Focus #5)", () => {
    const entry = createAuditEntry("ORDER_CREATED", "Order ORD-999 created", "ardfrmn");
    expect(entry.type).toBe("ORDER_CREATED");
    expect(entry.actor).toBe("ardfrmn");
    expect(entry.timestamp).toBeDefined();
  });

  it("formats dataset into valid JSON string", () => {
    const json = formatDataAsJSON({ test: true });
    expect(JSON.parse(json)).toEqual({ test: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/audit-log.test.ts`  
Expected: FAIL (Cannot find module `src/lib/audit-log`)

- [ ] **Step 3: Implement `src/lib/audit-log.ts` and JSON export in `src/lib/export-utils.ts`**

Define `createAuditEntry`, seed initial events, and add `formatDataAsJSON` and `triggerJSONDownload`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/audit-log.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/audit-log.ts src/lib/export-utils.ts tests/audit-log.test.ts
git commit -m "feat(audit): implement live audit logging and json export utilities"
```

---

### Task 7: Root Shell Integration, Authentication Gate & Build Verification

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/header.tsx`
- Test: Full Vitest suite & Next.js production build (`npm run build`)

**Interfaces:**
- Consumes: All modules from Tasks 1-6.
- Produces: Complete working Fixentra v2.0 application.

- [ ] **Step 1: Integrate Authentication Gate into `src/app/page.tsx` (Review Focus #2)**

Add `isAuthenticated` state initialized from `getStoredSession()`. If not authenticated, render `<LoginScreen onLoginSuccess={...} />`.  
If authenticated, render Fixentra v2.0 Suite.

- [ ] **Step 2: Add Products tab and AI Copilot trigger into Sidebar & Header**

Add "Products" in `sidebar.tsx` navigation items.  
Add "Fixentra AI (`⌘J`)" button in `header.tsx`.  
Add Log Out handler in Header profile dropdown calling `clearStoredSession()`.

- [ ] **Step 3: Execute full automated test suite**

Run: `npx vitest run`  
Expected: All tests PASS

- [ ] **Step 4: Execute Next.js production build**

Run: `npm run build`  
Expected: Next.js builds successfully with 0 errors.

- [ ] **Step 5: Commit & Push to GitHub**

```bash
git add .
git commit -m "feat: complete Fixentra Enterprise Suite v2.0 with login gate, ai copilot and catalog"
git push origin main
```
