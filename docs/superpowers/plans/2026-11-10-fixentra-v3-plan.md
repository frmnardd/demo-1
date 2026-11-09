# Fixentra Enterprise Production Core v3.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Fixentra into an authentic industry-standard enterprise platform (v3.0) on `fixentra.my.id`, featuring Prisma ORM database persistence, secure bcrypt password hashing, a Developer API Gateway (`fix_live_...`), Team RBAC management, and zero demo artifacts.

**Architecture:** Prisma ORM with durable SQLite database engine (`prisma/schema.prisma`), server-side bcrypt password encryption (`src/lib/crypto.ts`), REST Route Handlers (`/api/v1/...`) with Bearer token authentication, and a Developer API key management portal.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Prisma ORM, SQLite, bcryptjs, Zod, Tailwind CSS, Radix UI Primitives, Lucide Icons, Recharts, next-themes, Sonner, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-10-fixentra-v3-design.md`](file:///c:/Users/Firman%20Ardiansyah/Downloads/Demo-1/docs/superpowers/specs/2026-11-10-fixentra-v3-design.md)

---

## Global Constraints

- Target Brand: Fixentra v3.0 (`fixentra.my.id`).
- Zero Demo Artifacts: Completely remove demo pills, auto-fill buttons, and mock reset actions.
- Persistence: Data must persist durably via Prisma ORM on disk.
- Password Security: Passwords must be hashed using bcrypt (never stored plaintext).
- Developer API: Live API keys prefixed with `fix_live_` with scoped permissions (`read:orders`, `write:orders`, `read:analytics`).
- Test Suite: All new and existing tests must pass (green suite); production build must succeed with 0 errors.

---

## Review Focus

1. **Bcrypt Password Hash Verification:** Authentication engine must compare passwords using `bcrypt.compareSync` or async compare against the stored hash, rejecting invalid passwords gracefully.
2. **API Token Scoping & Authorization:** Calling `/api/v1/orders` without `read:orders` permission must return HTTP 403 Forbidden with standard JSON error format.
3. **API Key Generation Security:** Full secret API key (`fix_live_...`) is only shown once in the generation modal and stored hashed in the database; only prefix (`fix_live_...xxxx`) is visible in tables.
4. **Team Member Provisioning Validation:** Adding a team member with invalid email, short password (< 6 chars), or empty name must show validation errors without database pollution.
5. **Database Self-Healing Initialization:** On fresh boot or empty database, the system must self-initialize with the default administrator (`ardfrmn` with bcrypt hash of `firman173`), baseline products, and baseline orders.

---

### Task 1: Production Persistence Layer (Prisma ORM, SQLite & Crypto)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/crypto.ts`
- Create: `src/lib/db.ts`
- Test: `tests/crypto.test.ts`
- Test: `tests/db.test.ts`

**Interfaces:**
- Consumes: `prisma`, `@prisma/client`, `bcryptjs`.
- Produces:
  - `hashPassword(password: string): string`
  - `verifyPassword(password: string, hash: string): boolean`
  - `generateApiKeySecret(): { secretKey: string; keyPrefix: string; keyHash: string }`
  - `prisma` client instance in `src/lib/db.ts`.

- [ ] **Step 1: Write test for password hashing and API key crypto utilities**

```typescript
// tests/crypto.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, generateApiKeySecret } from "../src/lib/crypto";

describe("Crypto & Hashing Utilities", () => {
  it("hashes password and verifies successfully (Review Focus #1)", () => {
    const raw = "firman173";
    const hash = hashPassword(raw);
    expect(hash).not.toBe(raw);
    expect(verifyPassword(raw, hash)).toBe(true);
    expect(verifyPassword("wrongpass", hash)).toBe(false);
  });

  it("generates live API key with fix_live_ prefix and secure hash", () => {
    const { secretKey, keyPrefix, keyHash } = generateApiKeySecret();
    expect(secretKey.startsWith("fix_live_")).toBe(true);
    expect(keyPrefix.startsWith("fix_live_")).toBe(true);
    expect(keyHash).toBeDefined();
    expect(keyHash).not.toBe(secretKey);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/crypto.test.ts`  
Expected: FAIL (Cannot find module `src/lib/crypto`)

- [ ] **Step 3: Install dependencies, configure Prisma schema, and implement crypto utilities**

Install `bcryptjs`, `@types/bcryptjs`, `prisma`, `@prisma/client`, `zod`.  
Create `prisma/schema.prisma` with models: `User`, `Transaction`, `Product`, `ApiKey`, `AuditLog`.  
Implement `src/lib/crypto.ts` using `bcryptjs` and `crypto`.  
Implement `src/lib/db.ts` initializing `@prisma/client`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/crypto.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/crypto.ts src/lib/db.ts tests/crypto.test.ts package.json
git commit -m "feat(db): setup prisma orm schema, sqlite engine and bcrypt crypto utilities"
```

---

### Task 2: Elimination of Demo Artifacts & Enterprise Auth Engine

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/components/auth/login-screen.tsx`
- Test: `tests/auth-v3.test.ts`

**Interfaces:**
- Consumes: `hashPassword`, `verifyPassword` from `src/lib/crypto.ts`.
- Produces: `authenticateUser(username: string, password: string): { success: boolean; user?: { username: string; role: string; name: string }; error?: string }`

- [ ] **Step 1: Write test for enterprise authentication with bcrypt verification**

```typescript
// tests/auth-v3.test.ts
import { describe, it, expect } from "vitest";
import { authenticateUser } from "../src/lib/auth";

describe("Enterprise Authentication v3.0", () => {
  it("authenticates admin user using bcrypt verified hash", () => {
    const res = authenticateUser("ardfrmn", "firman173");
    expect(res.success).toBe(true);
    expect(res.user?.username).toBe("ardfrmn");
    expect(res.user?.role).toBe("SUPER_ADMIN");
  });

  it("rejects unauthorized login attempts without demo fallback", () => {
    expect(authenticateUser("admin", "admin").success).toBe(false);
    expect(authenticateUser("ardfrmn", "wrongpass").success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/auth-v3.test.ts`  
Expected: FAIL (authenticateUser is not defined)

- [ ] **Step 3: Update `src/lib/auth.ts` and clean `src/components/auth/login-screen.tsx`**

Remove the "Demo Credentials" auto-fill pill, demo helper button, and mock text from `login-screen.tsx`.  
Implement `authenticateUser` verifying against bcrypt hash and returning user role.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/auth-v3.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/components/auth/login-screen.tsx tests/auth-v3.test.ts
git commit -m "feat(auth): upgrade to enterprise auth and purge demo artifacts"
```

---

### Task 3: Production API Gateway & Bearer Token Authentication

**Files:**
- Create: `src/lib/api-gateway.ts`
- Create: `src/app/api/v1/health/route.ts`
- Create: `src/app/api/v1/orders/route.ts`
- Create: `src/app/api/v1/analytics/route.ts`
- Test: `tests/api-gateway.test.ts`

**Interfaces:**
- Consumes: `ApiKey` model, `verifyPassword`.
- Produces:
  - `authenticateApiKey(authHeader: string | null, requiredScope: string): { valid: boolean; apiKey?: ApiKey; error?: string; status?: number }`
  - REST route handlers returning standard JSON responses.

- [ ] **Step 1: Write test for API Gateway authorization and scope verification**

```typescript
// tests/api-gateway.test.ts
import { describe, it, expect } from "vitest";
import { verifyApiKeyScope, ApiKeyRecord } from "../src/lib/api-gateway";

const sampleKey: ApiKeyRecord = {
  id: "key-1",
  name: "Production Webhook Key",
  keyPrefix: "fix_live_9f8a",
  keyHash: "hashed_value",
  permissions: ["read:orders", "read:analytics"],
  createdAt: "2026-11-10",
  active: true,
};

describe("API Gateway Security", () => {
  it("authorizes when required scope is present", () => {
    expect(verifyApiKeyScope(sampleKey, "read:orders")).toBe(true);
    expect(verifyApiKeyScope(sampleKey, "read:analytics")).toBe(true);
  });

  it("denies access when required scope is missing (Review Focus #2)", () => {
    expect(verifyApiKeyScope(sampleKey, "write:orders")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api-gateway.test.ts`  
Expected: FAIL (Cannot find module `src/lib/api-gateway`)

- [ ] **Step 3: Implement `src/lib/api-gateway.ts` and Route Handlers**

Implement `verifyApiKeyScope` and `authenticateApiKey`.  
Implement:
- `GET /api/v1/health`: Returns `{ status: "healthy", version: "3.0.0", timestamp: ... }`.
- `GET /api/v1/orders` and `POST /api/v1/orders`: Guarded by Bearer token authentication and Zod schema validation.
- `GET /api/v1/analytics`: Returns live KPI stats and revenue series guarded by `read:analytics`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api-gateway.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/api-gateway.ts src/app/api/v1/ tests/api-gateway.test.ts
git commit -m "feat(api): implement production REST API gateway with bearer token authentication"
```

---

### Task 4: Developer Portal & API Keys Management UI

**Files:**
- Create: `src/components/dashboard/developer-portal.tsx`
- Test: `tests/developer-portal.test.ts`

**Interfaces:**
- Consumes: `ApiKeyRecord` from `src/lib/api-gateway.ts`, `generateApiKeySecret`.
- Produces: `DeveloperPortal({ apiKeys, onGenerateKey, onRevokeKey }: DeveloperPortalProps): JSX.Element`

- [ ] **Step 1: Write test for API Key validation helper**

```typescript
// tests/developer-portal.test.ts
import { describe, it, expect } from "vitest";
import { validateApiKeyInput } from "../src/components/dashboard/developer-portal";

describe("Developer Portal Key Generator", () => {
  it("rejects empty key name or empty permissions", () => {
    expect(validateApiKeyInput({ name: "", permissions: ["read:orders"] }).valid).toBe(false);
    expect(validateApiKeyInput({ name: "CI/CD Token", permissions: [] }).valid).toBe(false);
  });

  it("accepts valid key generation input", () => {
    expect(validateApiKeyInput({ name: "Zapier Integration", permissions: ["read:orders"] }).valid).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/developer-portal.test.ts`  
Expected: FAIL (Cannot find module `src/components/dashboard/developer-portal`)

- [ ] **Step 3: Implement `src/components/dashboard/developer-portal.tsx`**

Build full Developer Portal view with:
- Active API Keys table with masked keys (`fix_live_...••••`).
- Modal dialog to generate a new API key with permission checkboxes (`read:orders`, `write:orders`, `read:analytics`).
- Secret key reveal modal (shown once, copy button - Review Focus #3).
- Interactive cURL and Node.js code snippets for external integration.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/developer-portal.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/developer-portal.tsx tests/developer-portal.test.ts
git commit -m "feat(dev): implement developer api keys management portal"
```

---

### Task 5: Team Management & Role-Based Access Control (RBAC)

**Files:**
- Create: `src/components/dashboard/team-view.tsx`
- Test: `tests/team-rbac.test.ts`

**Interfaces:**
- Consumes: `hashPassword` from `src/lib/crypto.ts`.
- Produces:
  - `TeamMember`: `{ id: string; name: string; email: string; role: Role; joinedAt: string; active: boolean }`
  - `validateTeamMemberInput(input: Partial<TeamMember> & { password?: string }): { valid: boolean; errors: Record<string, string> }`
  - `TeamView({ team, onAddMember, onRevokeMember }: TeamViewProps): JSX.Element`

- [ ] **Step 1: Write test for team member input validation (Review Focus #4)**

```typescript
// tests/team-rbac.test.ts
import { describe, it, expect } from "vitest";
import { validateTeamMemberInput } from "../src/components/dashboard/team-view";

describe("Team RBAC Validation", () => {
  it("validates team member credentials strictly", () => {
    expect(validateTeamMemberInput({ name: "", email: "test@domain.com", password: "pass" }).valid).toBe(false);
    expect(validateTeamMemberInput({ name: "Bob", email: "invalid-email", password: "securepassword" }).valid).toBe(false);
    expect(validateTeamMemberInput({ name: "Bob", email: "bob@domain.com", password: "123" }).valid).toBe(false);
  });

  it("accepts valid team member input", () => {
    expect(validateTeamMemberInput({ name: "Sarah Connor", email: "sarah@fixentra.my.id", password: "StrongPassword123" }).valid).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/team-rbac.test.ts`  
Expected: FAIL (Cannot find module `src/components/dashboard/team-view`)

- [ ] **Step 3: Implement `src/components/dashboard/team-view.tsx`**

Build team management view with roles (`SUPER_ADMIN`, `FINANCE_MANAGER`, `OPERATOR`), member listing, and direct provisioning modal with bcrypt password creation.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/team-rbac.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/team-view.tsx tests/team-rbac.test.ts
git commit -m "feat(rbac): implement team members management with role-based access control"
```

---

### Task 6: Root Shell Integration, Navigation & End-to-End Build Verification

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/dashboard/settings-view.tsx`
- Modify: `src/app/page.tsx`
- Test: Full Vitest suite & Next.js production build (`npm run build`)

**Interfaces:**
- Consumes: Modules from Tasks 1-5.
- Produces: Complete working Fixentra v3.0 platform.

- [ ] **Step 1: Add "Developers" in Sidebar navigation & integrate Team View in Settings**

Add "Developers" (`Terminal` icon) to `navItems` in `sidebar.tsx`.  
In `settings-view.tsx`, embed the Team RBAC management section and eliminate any remaining demo text.

- [ ] **Step 2: Wire state and Developer Portal in `src/app/page.tsx`**

Add active view case for `"developers"`.  
Initialize API Keys state and bind generation/revocation handlers.

- [ ] **Step 3: Run full automated test suite**

Run: `npx vitest run`  
Expected: All tests PASS

- [ ] **Step 4: Run Next.js production build**

Run: `npm run build`  
Expected: Production build succeeds with 0 errors.

- [ ] **Step 5: Commit & Push to GitHub**

```bash
git add .
git commit -m "feat(release): publish Fixentra Enterprise Production Core v3.0"
git push origin main
```
