# Modern SaaS Analytics & Operations Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, responsive, and interactive SaaS Analytics & Operations Dashboard demo website showcasing shadcn/ui components with realistic mock data, charts, data table filtering, slide-over detail sheets, creation modal dialogs, command palette (`Cmd+K`), and dark mode.

**Architecture:** Next.js App Router application with modular shadcn/ui primitives (`src/components/ui/`), a domain dashboard layer (`src/components/dashboard/`), and a layout shell (`src/components/layout/`). State is managed through React hooks with an in-memory mutable mock dataset in `src/lib/mock-data.ts` to allow dynamic additions, filtering, sorting, and status updates with real-time UI feedback.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Radix UI Primitives, Lucide Icons, Recharts, next-themes, Sonner, Vitest / Node test runner.

**Spec:** [`docs/superpowers/specs/2026-11-10-saas-dashboard-design.md`](file:///c:/Users/Firman%20Ardiansyah/Downloads/Demo-1/docs/superpowers/specs/2026-11-10-saas-dashboard-design.md)

---

## Global Constraints

- Platform: Windows environment with Node.js v24.22.1 and npm 11.19.1.
- Framework: Next.js with TypeScript and App Router (`src/app/`).
- Styling: Tailwind CSS with CSS Variables for theme tokens (light and dark mode HSL variables).
- Design system: Strictly adhere to shadcn/ui component anatomy, Radix UI accessibility standards, and Lucide React icons.
- Feedback: Every primary user action (create order, filter, search, change status, toggle theme) must provide visible UI feedback (state update or Sonner toast).

---

## Review Focus

1. **Empty Search Result State:** Searching for a non-existent customer or order ID should display a clean, friendly empty state ("No orders found matching your search") rather than a blank or broken table.
2. **Keyboard Shortcut Conflict & Accessibility:** `Cmd+K` / `Ctrl+K` must trigger the command dialog without browser default address bar conflicts, and `Escape` must reliably dismiss any open modal, sheet, or command menu.
3. **Form Validation on Order Creation:** Submitting the "New Order" dialog with empty customer name or non-numeric/negative amount must show inline validation errors without crashing or polluting state.
4. **Theme Flash / Hydration Mismatch:** Dark/light mode switching via `next-themes` must suppress hydration mismatch warnings on `html`/`body` tags using `suppressHydrationWarning`.
5. **Mobile / Narrow Viewport Responsiveness:** Sidebar must collapse into a mobile sheet/hamburger menu on small screens without table overflow breaking page container width.

---

### Task 1: Project Scaffolding & Theme/Tailwind Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `src/components/theme-provider.tsx`
- Create: `src/components/mode-toggle.tsx`
- Test: `tests/utils.test.ts`

**Interfaces:**
- Consumes: Standard npm packages (`next`, `react`, `react-dom`, `clsx`, `tailwind-merge`, `next-themes`, `lucide-react`, `class-variance-authority`).
- Produces: `cn(...inputs: ClassValue[]): string` in `src/lib/utils.ts`, `ThemeProvider` in `src/components/theme-provider.tsx`, `ModeToggle` in `src/components/mode-toggle.tsx`.

- [ ] **Step 1: Write test for `cn` utility**

```typescript
// tests/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "../src/lib/utils";

describe("cn utility", () => {
  it("merges standard class names and handles conditional classes", () => {
    expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
    expect(cn("px-2", false && "hidden", "text-sm")).toBe("px-2 text-sm");
  });

  it("resolves conflicting tailwind classes cleanly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils.test.ts`  
Expected: FAIL (Cannot find module `../src/lib/utils` or vitest not installed)

- [ ] **Step 3: Setup project configurations, dependencies, `globals.css`, and implement `cn`**

Configure `package.json` with scripts (`dev`, `build`, `start`, `test`), install dependencies (`next`, `react`, `react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `next-themes`, `vitest`).  
Implement `cn` in `src/lib/utils.ts`.  
Configure `tailwind.config.ts` and `src/app/globals.css` with shadcn CSS variables (`--background`, `--foreground`, `--primary`, `--card`, `--border`, etc.).  
Implement `ThemeProvider` wrapping `next-themes` and `ModeToggle` button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/utils.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold next.js project with tailwind, theme provider and cn utility"
```

---

### Task 2: Core Primitive UI Components (`Button`, `Card`, `Badge`, `Tabs`, `Input`, `Avatar`)

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/avatar.tsx`
- Test: `tests/ui-primitives.test.tsx`

**Interfaces:**
- Consumes: `cn` from `src/lib/utils.ts`, `@radix-ui/react-tabs`, `@radix-ui/react-avatar`, `class-variance-authority`.
- Produces: `Button`, `buttonVariants`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Badge`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Input`, `Avatar`, `AvatarImage`, `AvatarFallback`.

- [ ] **Step 1: Write test for Button and Badge variants**

```typescript
// tests/ui-primitives.test.tsx
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";

describe("UI Primitives", () => {
  it("renders Button with default variant and custom class", () => {
    const html = renderToString(<Button className="custom-class">Click</Button>);
    expect(html).toContain("custom-class");
    expect(html).toContain("Click");
  });

  it("renders Badge with destructive variant", () => {
    const html = renderToString(<Badge variant="destructive">Failed</Badge>);
    expect(html).toContain("Failed");
    expect(html).toContain("bg-destructive");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui-primitives.test.tsx`  
Expected: FAIL (Cannot find modules `src/components/ui/button` or `src/components/ui/badge`)

- [ ] **Step 3: Implement UI primitives**

Create `src/components/ui/button.tsx` with CVA variants (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `sm`, `lg`, `icon`).  
Create `src/components/ui/card.tsx` with `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`.  
Create `src/components/ui/badge.tsx` with variants (`default`, `secondary`, `destructive`, `outline`, `success`).  
Create `src/components/ui/tabs.tsx` using `@radix-ui/react-tabs`.  
Create `src/components/ui/input.tsx`.  
Create `src/components/ui/avatar.tsx` using `@radix-ui/react-avatar`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui-primitives.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ tests/ui-primitives.test.tsx
git commit -m "feat: implement core shadcn ui primitive components"
```

---

### Task 3: Mock Domain Data & State Management

**Files:**
- Create: `src/lib/mock-data.ts`
- Test: `tests/mock-data.test.ts`

**Interfaces:**
- Consumes: None (pure TypeScript domain model).
- Produces:
  - Types: `Transaction`, `Customer`, `KpiMetric`, `RevenueDataPoint`, `CategorySalesDataPoint`.
  - Data: `INITIAL_KPIS: KpiMetric[]`, `INITIAL_TRANSACTIONS: Transaction[]`, `REVENUE_ANALYTICS: Record<string, RevenueDataPoint[]>`, `CATEGORY_SALES: CategorySalesDataPoint[]`.
  - Helpers: `filterTransactions(transactions: Transaction[], query: string, status: string): Transaction[]`, `sortTransactions(transactions: Transaction[], field: keyof Transaction, direction: "asc" | "desc"): Transaction[]`.

- [ ] **Step 1: Write test for filtering and sorting transactions**

```typescript
// tests/mock-data.test.ts
import { describe, it, expect } from "vitest";
import { filterTransactions, sortTransactions, Transaction } from "../src/lib/mock-data";

const sampleData: Transaction[] = [
  { id: "ORD-001", customer: { name: "Alice Smith", email: "alice@example.com", avatar: "" }, amount: 250, status: "paid", date: "2026-11-01", itemsCount: 2, method: "Credit Card" },
  { id: "ORD-002", customer: { name: "Bob Jones", email: "bob@example.com", avatar: "" }, amount: 120, status: "pending", date: "2026-11-03", itemsCount: 1, method: "PayPal" },
  { id: "ORD-003", customer: { name: "Charlie Brown", email: "charlie@example.com", avatar: "" }, amount: 480, status: "refunded", date: "2026-11-02", itemsCount: 4, method: "Bank Transfer" },
];

describe("Mock Data Helpers", () => {
  it("filters transactions by search query (case-insensitive)", () => {
    const result = filterTransactions(sampleData, "alice", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ORD-001");
  });

  it("filters transactions by status", () => {
    const result = filterTransactions(sampleData, "", "pending");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("ORD-002");
  });

  it("returns empty array when search query matches nothing (Review Focus #1)", () => {
    const result = filterTransactions(sampleData, "nonexistent person", "all");
    expect(result).toEqual([]);
  });

  it("sorts transactions by amount ascending and descending", () => {
    const asc = sortTransactions(sampleData, "amount", "asc");
    expect(asc[0].amount).toBe(120);
    const desc = sortTransactions(sampleData, "amount", "desc");
    expect(desc[0].amount).toBe(480);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/mock-data.test.ts`  
Expected: FAIL (Cannot find module `src/lib/mock-data`)

- [ ] **Step 3: Implement `src/lib/mock-data.ts`**

Define models, seed datasets (15+ rich transactions, KPI metrics with trend percentages, multi-timeframe revenue data for 7D/30D/12M, category distribution), and implement `filterTransactions` and `sortTransactions`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/mock-data.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock-data.ts tests/mock-data.test.ts
git commit -m "feat: implement domain mock data and filtering/sorting utilities"
```

---

### Task 4: KPI Metric Cards & Interactive Analytics Charts

**Files:**
- Create: `src/components/dashboard/kpi-cards.tsx`
- Create: `src/components/dashboard/charts-section.tsx`
- Test: `tests/dashboard-metrics.test.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Tabs`, `INITIAL_KPIS`, `REVENUE_ANALYTICS`, `CATEGORY_SALES`, `recharts`, `lucide-react`.
- Produces:
  - `KpiCards({ kpis }: { kpis: KpiMetric[] }): JSX.Element`
  - `ChartsSection(): JSX.Element` (with interactive timeframe tab state: "7d" | "30d" | "12m").

- [ ] **Step 1: Write test for KPI cards rendering**

```typescript
// tests/dashboard-metrics.test.tsx
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { KpiCards } from "../src/components/dashboard/kpi-cards";
import { INITIAL_KPIS } from "../src/lib/mock-data";

describe("KPI Cards Component", () => {
  it("renders 4 metric cards with formatted values and trend labels", () => {
    const html = renderToString(<KpiCards kpis={INITIAL_KPIS} />);
    expect(html).toContain(INITIAL_KPIS[0].title);
    expect(html).toContain(INITIAL_KPIS[0].value);
    expect(html).toContain(INITIAL_KPIS[1].title);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dashboard-metrics.test.tsx`  
Expected: FAIL (Cannot find module `src/components/dashboard/kpi-cards`)

- [ ] **Step 3: Implement KPI Cards and Charts Section**

Install `recharts`.  
Create `src/components/dashboard/kpi-cards.tsx` with clean card layouts, Lucide icons (DollarSign, Users, CreditCard, Activity), and badge trends.  
Create `src/components/dashboard/charts-section.tsx` with:
- An AreaChart for Revenue Trend with soft gradients and custom tooltip.
- A BarChart for Category Revenue Breakdown.
- Timeframe tabs (`7D`, `30D`, `12M`) updating chart data dynamically.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/dashboard-metrics.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ tests/dashboard-metrics.test.tsx package.json
git commit -m "feat: implement kpi metric cards and interactive analytics charts"
```

---

### Task 5: Orders Data Table with Search, Filter Tabs & Pagination

**Files:**
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/dashboard/orders-table.tsx`
- Test: `tests/orders-table.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-dropdown-menu`, `Table`, `Badge`, `Button`, `Input`, `Transaction`, `filterTransactions`, `sortTransactions`.
- Produces:
  - `OrdersTable({ transactions, onSelectTransaction, onStatusChange }: OrdersTableProps): JSX.Element`

- [ ] **Step 1: Write test for OrdersTable filtering & empty state**

```typescript
// tests/orders-table.test.tsx
import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { OrdersTable } from "../src/components/dashboard/orders-table";
import { INITIAL_TRANSACTIONS } from "../src/lib/mock-data";

describe("OrdersTable Component", () => {
  it("renders transaction rows and headers", () => {
    const html = renderToString(
      <OrdersTable transactions={INITIAL_TRANSACTIONS} onSelectTransaction={() => {}} onStatusChange={() => {}} />
    );
    expect(html).toContain("Customer");
    expect(html).toContain("Amount");
    expect(html).toContain("Status");
    expect(html).toContain(INITIAL_TRANSACTIONS[0].customer.name);
  });

  it("renders empty state message when transaction list is empty (Review Focus #1)", () => {
    const html = renderToString(
      <OrdersTable transactions={[]} onSelectTransaction={() => {}} onStatusChange={() => {}} />
    );
    expect(html).toContain("No orders found");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/orders-table.test.tsx`  
Expected: FAIL (Cannot find modules `src/components/ui/table` or `src/components/dashboard/orders-table`)

- [ ] **Step 3: Implement Table, DropdownMenu, and OrdersTable**

Create `src/components/ui/table.tsx` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`).  
Create `src/components/ui/dropdown-menu.tsx` using `@radix-ui/react-dropdown-menu`.  
Create `src/components/dashboard/orders-table.tsx` with:
- Search input with clear button.
- Status filter tabs: `All`, `Paid`, `Pending`, `Refunded`.
- Sortable headers for Date and Amount.
- Action dropdown per row (`View Details`, `Mark as Paid`, `Refund`).
- Pagination footer with "Showing X of Y orders", Previous/Next page buttons.
- Friendly empty state when no items match search query.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/orders-table.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/table.tsx src/components/ui/dropdown-menu.tsx src/components/dashboard/orders-table.tsx tests/orders-table.test.tsx
git commit -m "feat: implement orders table with search, filters, pagination and action menus"
```

---

### Task 6: Overlays (`Sheet`, `Dialog`, `Command`, `Sonner`) & Interactive Flows

**Files:**
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/command.tsx`
- Create: `src/components/dashboard/order-detail-sheet.tsx`
- Create: `src/components/dashboard/create-order-dialog.tsx`
- Create: `src/components/dashboard/command-palette.tsx`
- Test: `tests/order-validation.test.ts`

**Interfaces:**
- Consumes: `@radix-ui/react-dialog`, `cmdk`, `sonner`, `Transaction`.
- Produces:
  - `OrderDetailSheet({ transaction, open, onOpenChange, onStatusUpdate }: OrderDetailSheetProps): JSX.Element`
  - `CreateOrderDialog({ open, onOpenChange, onCreateOrder }: CreateOrderDialogProps): JSX.Element`
  - `CommandPalette({ open, onOpenChange, onNavigate }: CommandPaletteProps): JSX.Element`
  - Validation helper: `validateOrderInput(input: Partial<Transaction>): { valid: boolean; errors: Record<string, string> }`

- [ ] **Step 1: Write test for Order Creation validation (Review Focus #3)**

```typescript
// tests/order-validation.test.ts
import { describe, it, expect } from "vitest";
import { validateOrderInput } from "../src/components/dashboard/create-order-dialog";

describe("validateOrderInput", () => {
  it("rejects empty customer name and invalid amount", () => {
    const result = validateOrderInput({ customer: { name: "", email: "test@example.com", avatar: "" }, amount: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.amount).toBeDefined();
  });

  it("accepts valid order input with positive amount", () => {
    const result = validateOrderInput({ customer: { name: "John Doe", email: "john@example.com", avatar: "" }, amount: 150 });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/order-validation.test.ts`  
Expected: FAIL (Cannot find module `src/components/dashboard/create-order-dialog`)

- [ ] **Step 3: Implement Dialog, Sheet, Command, and interactive modals**

Install `cmdk`, `sonner`.  
Create `src/components/ui/dialog.tsx` and `src/components/ui/sheet.tsx` using `@radix-ui/react-dialog`.  
Create `src/components/ui/command.tsx` using `cmdk`.  
Implement `CreateOrderDialog` with `validateOrderInput` function, form inputs, error messages, and Sonner toast trigger on submission.  
Implement `OrderDetailSheet` showing complete customer timeline, items summary, and status mutation buttons.  
Implement `CommandPalette` bound to `Cmd+K` / `Ctrl+K` with search items for Dashboard, Analytics, Orders, New Order trigger, and Dark Mode toggle.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/order-validation.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/dialog.tsx src/components/ui/sheet.tsx src/components/ui/command.tsx src/components/dashboard/ tests/order-validation.test.ts
git commit -m "feat: implement detail sheet, validated order creation dialog and command palette"
```

---

### Task 7: Shell Layout Assembly, Navigation & End-to-End Build Verification

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Test: Build verification (`npm run build`)

**Interfaces:**
- Consumes: All UI components, mock data, `next-themes`, `sonner`.
- Produces: Complete working application in `src/app/page.tsx`.

- [ ] **Step 1: Implement Sidebar navigation component**

Create `src/components/layout/sidebar.tsx` with logo, navigational items (Dashboard, Analytics, Orders, Customers, Settings), active highlight, and collapsed icon mode for smaller screens.

- [ ] **Step 2: Implement Header component**

Create `src/components/layout/header.tsx` with mobile sidebar trigger button, global search input (`Cmd+K` trigger), notification popover with badge indicator, theme toggle (`ModeToggle`), and user avatar profile menu.

- [ ] **Step 3: Assemble root layout and main dashboard page**

In `src/app/layout.tsx`, wrap the app in `ThemeProvider` with `suppressHydrationWarning` (Review Focus #4) and include the `<Toaster />` from Sonner.  
In `src/app/page.tsx`, assemble the stateful dashboard integrating:
- Metric cards (`KpiCards`)
- Chart section (`ChartsSection`)
- Orders table (`OrdersTable`)
- New Order dialog (`CreateOrderDialog`)
- Detail sheet (`OrderDetailSheet`)
- Command palette (`CommandPalette`)

- [ ] **Step 4: Execute test suite and Next.js production build**

Run: `npx vitest run`  
Expected: All tests PASS  
Run: `npm run build`  
Expected: Next.js builds successfully with zero TypeScript or linting errors.

- [ ] **Step 5: Commit**

```bash
git add src/ app/
git commit -m "feat: assemble application shell, complete dashboard page and verify build"
```
